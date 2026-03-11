import { db } from './db';
import pako from 'pako';

const SYNC_REPO_NAME = 'freefoot-pes-cloud-sync';
<<<<<<< HEAD
const DATA_FILENAME = 'data.json.gz';
const IMAGE_PREFIX = 'images_part_';
const MAX_CHUNK_SIZE = 20 * 1024 * 1024; // 20MB por fragmento (limite seguro da API)
=======
const SYNC_BACKUP_FILENAME = 'backup.json.gz'; // Mudamos a extensão para .gz para indicar compressão
>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52

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
<<<<<<< HEAD
     * Faz upload dos dados fragmentados para o Repositório (Suporta GBs)
=======
     * Faz upload dos dados para o Repositório com Compressão
>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52
     */
    async uploadData(token) {
        if (!token) throw new Error("Você precisa configurar seu Token do GitHub com permissão 'repo'.");

        const repo = await this.getOrCreateRepo(token);
        const exportData = await db.exportDatabase();
<<<<<<< HEAD
=======
        const jsonContent = JSON.stringify(exportData);
        
        // --- COMPRESSÃO COM PAKO ---
        const compressed = pako.deflate(jsonContent); // Gera um Uint8Array (binário)
        const base64Content = uint8ArrayToBase64(compressed);
        const sizeOriginal = (new TextEncoder().encode(jsonContent).length / (1024 * 1024)).toFixed(2);
        const sizeCompressed = (compressed.length / (1024 * 1024)).toFixed(2);
        
        console.log(`Sync: ${sizeOriginal}MB -> ${sizeCompressed}MB (Redução de ${((1 - sizeCompressed/sizeOriginal)*100).toFixed(0)}%)`);

        // 1. Verificar se o arquivo já existe para pegar o SHA
        const fileUrl = `https://api.github.com/repos/${repo.full_name}/contents/${SYNC_BACKUP_FILENAME}`;
        const getFileRes = await fetch(fileUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52

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

<<<<<<< HEAD
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
=======
        // 2. Upload usando a API de Contents
        const putRes = await fetch(fileUrl, {
            method: 'PUT',
>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
<<<<<<< HEAD
                tree: treeEntries // Sem base_tree para limpar fragmentos antigos orfãos
=======
                message: `Sync Update ${new Date().toISOString()} (Compressed)`,
                content: base64Content,
                sha: sha
>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52
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
<<<<<<< HEAD
     * Baixa os dados fragmentados e reconstrói o banco
=======
     * Baixa os dados do Repositório e Decomprime
>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52
     */
    async downloadData(token) {
        if (!token) throw new Error("Token não configurado.");
        const user = await this.authenticate(token);
<<<<<<< HEAD
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
=======
        
        let fileUrl = `https://api.github.com/repos/${user.login}/${SYNC_REPO_NAME}/contents/${SYNC_BACKUP_FILENAME}`;
        let response = await fetch(fileUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Se não achou o .gz, tenta o .json antigo (sem compressão)
        if (!response.ok && response.status === 404) {
             const oldUrl = `https://api.github.com/repos/${user.login}/${SYNC_REPO_NAME}/contents/backup.json`;
             response = await fetch(oldUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
             });
        }

        if (!response.ok) {
            if (response.status === 404) {
                 // TENTATIVA 3: Gist Legado (Versão 1.0)
                 console.log("Repo não encontrado, tentando Gist Legado...");
                 const legacyGist = await this.findLegacyGist(token);
                 if (legacyGist) {
                     const filename = Object.keys(legacyGist.files)[0];
                     const rawUrl = legacyGist.files[filename].raw_url;
                     response = await fetch(rawUrl, {
                        headers: { 'Authorization': `Bearer ${token}` }
                     });
                     
                     if (response.ok) {
                         const backupData = await response.json();
                         await db.importDatabaseFromJSON(backupData);
                         return true;
                     }
                 }
                 throw new Error("Nenhum backup encontrado na sua conta. (PC: Gists/Repo não localizados)");
            }
            throw new Error("Erro ao acessar servidor do GitHub.");
        }

        const fileInfo = await response.json();
        const base64Encoded = fileInfo.content.replace(/\s/g, '');
        
        try {
            // Tenta descomprimir
            const compressedData = base64ToUint8Array(base64Encoded);
            const jsonString = pako.inflate(compressedData, { to: 'string' });
            const backupData = JSON.parse(jsonString);
            await db.importDatabaseFromJSON(backupData);
        } catch (e) {
            // Se falhar a descompressão, assume que é o JSON puro (antigo)
            console.log("Falha ao descomprimir, tentando ler como JSON puro...");
            const jsonString = decodeURIComponent(escape(window.atob(base64Encoded)));
            const backupData = JSON.parse(jsonString);
            await db.importDatabaseFromJSON(backupData);
        }

>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52
        return true;
    },

    /**
     * Busca por Gists legados (versão inicial)
     */
    async findLegacyGist(token) {
        const response = await fetch('https://api.github.com/gists', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!response.ok) return null;
        const gists = await response.json();
        const SYNC_GIST_DESCRIPTION = '[FREeFOOT PES] Sincronização em Nuvem do Banco de Dados';
        return gists.find(g => 
            g.description === SYNC_GIST_DESCRIPTION || 
            (g.files && g.files['freefoot-pes-v1-cloud-sync.json'])
        );
    }
};

<<<<<<< HEAD
// Help function for binary to base64
function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
=======
/**
 * Converte Uint8Array para Base64 de forma segura e performática
 */
function uint8ArrayToBase64(uint8) {
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return window.btoa(binary);
}

/**
 * Converte Base64 para Uint8Array
 */
function base64ToUint8Array(base64) {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
>>>>>>> b5abbef7bca21cfd8a3a35b7f9f237d4d316cd52
}
