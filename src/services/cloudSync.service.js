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

        const repo = await this.getOrCreateRepo(token);
        const exportData = await db.exportDatabase();

        // 1. Separar dados de texto das imagens
        const storeData = exportData.store || {};
        const imagesData = exportData.images || {};

        // 2. Preparar blob de dados de texto
        const dataJson = JSON.stringify({ store: storeData });
        const dataCompressed = pako.gzip(dataJson);
        const dataBase64 = arrayBufferToBase64(dataCompressed);

        const treeEntries = [
            {
                path: DATA_FILENAME,
                mode: '100644',
                type: 'blob',
                contentBase64: dataBase64
            }
        ];

        // 3. Dividir imagens em fragmentos (chunks)
        const imageEntries = Object.entries(imagesData);
        let currentChunk = {};
        let currentChunkSize = 0;
        let chunkIndex = 1;

        const finalizeChunk = (chunk, index) => {
            const chunkJson = JSON.stringify(chunk);
            const chunkCompressed = pako.gzip(chunkJson);
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
                treeEntries.push(finalizeChunk(currentChunk, chunkIndex++));
                currentChunk = {};
                currentChunkSize = 0;
            }
            currentChunk[id] = base64;
            currentChunkSize += entryStr.length;
        }

        if (Object.keys(currentChunk).length > 0) {
            treeEntries.push(finalizeChunk(currentChunk, chunkIndex++));
        }

        // 4. Criar BLOBS no GitHub para cada arquivo
        for (const entry of treeEntries) {
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
            if (!blobRes.ok) throw new Error(`Erro ao criar blob para ${entry.path}`);
            const bData = await blobRes.json();
            entry.sha = bData.sha;
            delete entry.contentBase64;
        }

        // 5. Fluxo Git Data: Tree -> Commit -> Ref
        const branchRes = await fetch(`https://api.github.com/repos/${repo.full_name}/branches/main`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!branchRes.ok) throw new Error("Erro ao localizar branch principal.");
        const branchData = await branchRes.json();
        const lastCommitSha = branchData.commit.sha;

        const treeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/trees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tree: treeEntries // Sem base_tree para limpar fragmentos antigos orfãos
            })
        });
        if (!treeRes.ok) throw new Error("Erro ao criar árvore de arquivos.");
        const treeData = await treeRes.json();

        const commitRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/commits`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `FF Sync: ${imageEntries.length} imgs em ${treeEntries.length} arquivos`,
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

        return true;
    },

    /**
     * Baixa os dados fragmentados e reconstrói o banco
     */
    async downloadData(token) {
        if (!token) throw new Error("Token não configurado.");
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

        // 2. Baixar fragmentos em paralelo
        const downloadPromises = treeData.tree.map(async (file) => {
            if (file.path === DATA_FILENAME || file.path.startsWith(IMAGE_PREFIX)) {
                const blobRes = await fetch(`https://api.github.com/repos/${repoFull}/git/blobs/${file.sha}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                const arrayBuffer = await blobRes.arrayBuffer();
                const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
                const json = JSON.parse(decompressed);

                if (file.path === DATA_FILENAME) {
                    combinedData.store = json.store || {};
                } else {
                    Object.assign(combinedData.images, json);
                }
            }
        });

        await Promise.all(downloadPromises);
        await db.importDatabaseFromJSON(combinedData);
        return true;
    }
};

// Help function for binary to base64
function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
