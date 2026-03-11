import { db } from './db';

const SYNC_REPO_NAME = 'freefoot-pes-cloud-sync';
const SYNC_BACKUP_FILENAME = 'backup.json';

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
     * Faz upload dos dados para o Repositório
     */
    async uploadData(token) {
        if (!token) throw new Error("Você precisa configurar seu Token do GitHub com permissão 'repo'.");

        const repo = await this.getOrCreateRepo(token);
        const exportData = await db.exportDatabase();
        const jsonContent = JSON.stringify(exportData);
        
        // 1. Verificar se o arquivo já existe para pegar o SHA (necessário para update)
        const fileUrl = `https://api.github.com/repos/${repo.full_name}/contents/${SYNC_BACKUP_FILENAME}`;
        const getFileRes = await fetch(fileUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        let sha = null;
        if (getFileRes.ok) {
            const fileData = await getFileRes.json();
            sha = fileData.sha;
        }

        // 2. Upload usando a API de Contents (Base64)
        // Nota: O conteúdo aqui pode ter até 100MB via API.
        const putRes = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Sync Update ${new Date().toISOString()}`,
                content: b64EncodeUnicode(jsonContent),
                sha: sha // Necessário se estiver atualizando
            })
        });

        if (!putRes.ok) {
            const err = await putRes.json();
            throw new Error(err.message || "Erro ao salvar no repositório.");
        }

        return true;
    },

    /**
     * Baixa os dados do Repositório
     */
    async downloadData(token) {
        if (!token) throw new Error("Token não configurado.");
        const user = await this.authenticate(token);
        const fileUrl = `https://api.github.com/repos/${user.login}/${SYNC_REPO_NAME}/contents/${SYNC_BACKUP_FILENAME}`;

        const response = await fetch(fileUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3.raw' // Puxa o conteúdo cru diretamente
            }
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error("Nenhum backup encontrado na sua conta.");
            throw new Error("Erro ao baixar dados do repositório.");
        }

        const backupData = await response.json();
        await db.importDatabaseFromJSON(backupData);
        return true;
    }
};

// Help function for large content encoding
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}
