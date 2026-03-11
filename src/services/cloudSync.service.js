import { db } from './db';
import pako from 'pako';

const SYNC_REPO_NAME = 'freefoot-pes-cloud-sync';
const SYNC_BACKUP_FILENAME = 'backup.json.gz'; // Mudamos a extensão para .gz para indicar compressão

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
     * Faz upload dos dados para o Repositório com Compressão
     */
    async uploadData(token) {
        if (!token) throw new Error("Você precisa configurar seu Token do GitHub com permissão 'repo'.");

        const repo = await this.getOrCreateRepo(token);
        const exportData = await db.exportDatabase();
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

        let sha = null;
        if (getFileRes.ok) {
            const fileData = await getFileRes.json();
            sha = fileData.sha;
        }

        // 2. Upload usando a API de Contents
        const putRes = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Sync Update ${new Date().toISOString()} (Compressed)`,
                content: base64Content,
                sha: sha
            })
        });

        if (!putRes.ok) {
            const err = await putRes.json();
            throw new Error(err.message || "Erro ao salvar no repositório.");
        }

        return true;
    },

    /**
     * Baixa os dados do Repositório e Decomprime
     */
    async downloadData(token) {
        if (!token) throw new Error("Token não configurado.");
        const user = await this.authenticate(token);
        
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
}
