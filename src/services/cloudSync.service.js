import { db } from './db';
import pako from 'pako';

const SYNC_REPO_NAME = 'freefoot-pes-cloud-sync';
const DATA_FILENAME = 'data.json.gz';
const IMAGE_PREFIX = 'images_part_';
const MAX_CHUNK_SIZE = 20 * 1024 * 1024; // 20MB por fragmento (limite seguro da API)

export const cloudSyncService = {
    /**
     * Valida o token e retorna os dados do usuário do GitHub
     */
    async authenticate(token) {
        if (!token) throw new Error("Token não fornecido.");
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error("Token Inválido ou sem permissão de acesso repo/user.");
        }
        return await response.json();
    },

    /**
     * Tenta encontrar ou criar o repositório de sincronização
     */
    async getOrCreateRepo(token) {
        const user = await this.authenticate(token);
        const repoUrl = `https://api.github.com/repos/${user.login}/${SYNC_REPO_NAME}`;

        const checkRes = await fetch(repoUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (checkRes.ok) return await checkRes.json();

        // Se não existe, cria um privado
        const createRes = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: SYNC_REPO_NAME,
                description: '[FREeFOOT PES] Sincronização em Nuvem do Banco de Dados',
                private: true,
                auto_init: true
            })
        });

        if (!createRes.ok) {
            throw new Error("Não foi possível criar o repositório de sincronização. Verifique se o seu Token tem a permissão 'repo'.");
        }

        return await createRes.json();
    },

    /**
     * Faz upload dos dados fragmentados para o Repositório (Suporta GBs)
     */
    async uploadData(token) {
        if (!token) throw new Error("Você precisa configurar seu Token do GitHub com permissão 'repo'.");

        console.log("[CloudSync] Iniciando exportação do banco de dados...");
        const repo = await this.getOrCreateRepo(token);
        const exportData = await db.exportDatabase();

        // 1. Separar dados de texto das imagens
        const storeData = exportData.store || {};
        const imagesData = exportData.images || {};

        console.log(`[CloudSync] Store: ${Object.keys(storeData).length} chaves, Imagens: ${Object.keys(imagesData).length} arquivos`);

        const treeEntries = [];

        // 2. Preparar e fragmentar blob de dados de texto (Store)
        console.log("[CloudSync] Comprimindo dados principais (nível 9)...");
        const dataJson = JSON.stringify({ store: storeData });
        const dataCompressed = pako.gzip(dataJson, { level: 9 });
        const totalDataSizeMB = (dataCompressed.length / (1024 * 1024)).toFixed(2);
        console.log(`[CloudSync] Dados principais comprimidos: ${totalDataSizeMB}MB`);

        // Dividir os dados em pedaços se excederem o limite
        for (let i = 0, part = 1; i < dataCompressed.length; i += MAX_CHUNK_SIZE, part++) {
            const chunk = dataCompressed.slice(i, i + MAX_CHUNK_SIZE);
            treeEntries.push({
                path: `data_part_${part}.json.gz`,
                mode: '100644',
                type: 'blob',
                contentBase64: arrayBufferToBase64(chunk)
            });
        }

        // 3. Dividir imagens em fragmentos (chunks)
        const imageEntries = Object.entries(imagesData);
        let currentImgChunk = {};
        let currentChunkSize = 0;
        let imgChunkIndex = 1;

        const finalizeImgChunk = (chunk, index) => {
            const chunkJson = JSON.stringify(chunk);
            const chunkCompressed = pako.gzip(chunkJson, { level: 9 });
            return {
                path: `${IMAGE_PREFIX}${index}.json.gz`,
                mode: '100644',
                type: 'blob',
                contentBase64: arrayBufferToBase64(chunkCompressed)
            };
        };

        for (const [id, base64] of imageEntries) {
            const entryStr = JSON.stringify({ [id]: base64 });
            if (currentChunkSize + entryStr.length > MAX_CHUNK_SIZE && currentChunkSize > 0) {
                treeEntries.push(finalizeImgChunk(currentImgChunk, imgChunkIndex++));
                currentImgChunk = {};
                currentChunkSize = 0;
            }
            currentImgChunk[id] = base64;
            currentChunkSize += entryStr.length;
        }

        if (Object.keys(currentImgChunk).length > 0) {
            treeEntries.push(finalizeImgChunk(currentImgChunk, imgChunkIndex++));
        }

        console.log(`[CloudSync] Total de arquivos para upload: ${treeEntries.length}`);

        // 4. Criar BLOBS no GitHub para cada arquivo
        for (let i = 0; i < treeEntries.length; i++) {
            const entry = treeEntries[i];
            console.log(`[CloudSync] Enviando arquivo ${i + 1}/${treeEntries.length}: ${entry.path}...`);

            const blobRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/blobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: entry.contentBase64,
                    encoding: 'base64'
                })
            });

            if (!blobRes.ok) {
                const errorDetail = await blobRes.json().catch(() => ({ message: "Erro desconhecido" }));
                console.error(`[CloudSync] Falha no blob ${entry.path}:`, errorDetail);
                throw new Error(`Falha no Upload: Erro ao criar blob para ${entry.path}. Detalhe: ${errorDetail.message}`);
            }

            const bData = await blobRes.json();
            entry.sha = bData.sha;
            delete entry.contentBase64;
        }

        // 5. Fluxo Git Data: Tree -> Commit -> Ref
        console.log("[CloudSync] Finalizando commit no GitHub...");
        const branchRes = await fetch(`https://api.github.com/repos/${repo.full_name}/branches/main`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!branchRes.ok) throw new Error("Erro ao localizar branch principal (main).");
        const branchData = await branchRes.json();
        const lastCommitSha = branchData.commit.sha;

        const treeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/trees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tree: treeEntries
            })
        });
        if (!treeRes.ok) throw new Error("Erro ao criar árvore de arquivos no Git.");
        const treeData = await treeRes.json();

        const commitRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/commits`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `FF Sync: ${imageEntries.length} imagens em ${treeEntries.length} arquivos totais`,
                tree: treeData.sha,
                parents: [lastCommitSha]
            })
        });
        const commitData = await commitRes.json();

        await fetch(`https://api.github.com/repos/${repo.full_name}/git/refs/heads/main`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sha: commitData.sha })
        });

        console.log("[CloudSync] Sincronização concluída com sucesso!");
        return true;
    },

    /**
     * Baixa os dados fragmentados e reconstrói o banco
     */
    async downloadData(token) {
        if (!token) throw new Error("Token não configurado.");
        console.log("[CloudSync] Iniciando download do backup...");
        const user = await this.authenticate(token);
        const repoFull = `${user.login}/${SYNC_REPO_NAME}`;

        // 1. Obter a Tree mais recente
        const branchRes = await fetch(`https://api.github.com/repos/${repoFull}/branches/main`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!branchRes.ok) throw new Error("Backup não encontrado na nuvem.");
        const branchData = await branchRes.json();
        const treeSha = branchData.commit.commit.tree.sha;

        const treeRes = await fetch(`https://api.github.com/repos/${repoFull}/git/trees/${treeSha}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const treeData = await treeRes.json();

        const combinedData = { store: {}, images: {} };
        const dataParts = [];

        // 2. Baixar fragmentos em paralelo
        console.log(`[CloudSync] Baixando ${treeData.tree.length} arquivos de backup...`);
        const downloadPromises = treeData.tree.map(async (file) => {
            const isStorePart = file.path.startsWith('data_part_') || file.path === DATA_FILENAME;
            const isImagePart = file.path.startsWith(IMAGE_PREFIX);

            if (isStorePart || isImagePart) {
                const blobRes = await fetch(`https://api.github.com/repos/${repoFull}/git/blobs/${file.sha}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                const arrayBuffer = await blobRes.arrayBuffer();

                if (isStorePart) {
                    // Se for parte do store (texto), guardamos para concatenar depois
                    // Extrair índice do nome do arquivo para ordenar (ex: data_part_1.json.gz -> 1)
                    let index = 0;
                    const match = file.path.match(/data_part_(\d+)/);
                    if (match) index = parseInt(match[1]);

                    dataParts.push({ index, buffer: new Uint8Array(arrayBuffer) });
                } else {
                    // Se for imagem, descompacta direto e adiciona ao combinedData
                    const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
                    const json = JSON.parse(decompressed);
                    Object.assign(combinedData.images, json);
                }
            }
        });

        await Promise.all(downloadPromises);

        // 3. Reconstruir Store (Dados de Texto)
        if (dataParts.length > 0) {
            console.log("[CloudSync] Reconstruindo banco de dados principal...");
            // Ordenar partes pelo índice
            dataParts.sort((a, b) => a.index - b.index);

            // Calcular tamanho total para concatenar
            const totalLength = dataParts.reduce((acc, part) => acc + part.buffer.length, 0);
            const concatenatedBuffer = new Uint8Array(totalLength);

            let offset = 0;
            for (const part of dataParts) {
                concatenatedBuffer.set(part.buffer, offset);
                offset += part.buffer.length;
            }

            try {
                const decompressed = pako.ungzip(concatenatedBuffer, { to: 'string' });
                const json = JSON.parse(decompressed);
                combinedData.store = json.store || {};
            } catch (e) {
                console.error("[CloudSync] Erro ao descompactar dados do store:", e);
                throw new Error("Falha ao reconstruir banco de dados principal.");
            }
        }

        console.log("[CloudSync] Importando dados para o banco local...");
        await db.importDatabaseFromJSON(combinedData);
        console.log("[CloudSync] Download e restauração concluídos!");
        return true;
    }
};

// Função auxiliar para converter array buffer em base64 com performance
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    const CHUNK_SIZE = 0x8000; // 32KB por vez para evitar estouro de pilha (stack overflow)
    for (let i = 0; i < len; i += CHUNK_SIZE) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK_SIZE, len)));
    }
    return window.btoa(binary);
}
