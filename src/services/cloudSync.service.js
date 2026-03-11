import { db } from './db';

const SYNC_GIST_FILENAME = 'freefoot-pes-v1-cloud-sync.json';
const SYNC_GIST_DESCRIPTION = '[FREeFOOT PES] Sincronização em Nuvem do Banco de Dados';

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
            throw new Error("Token Inválido ou sem permissão de leitura as suas informações.");
        }
        return await response.json();
    },

    /**
     * Procura pelo Gist de Sincronização do FreeFoot
     */
    async findSyncGist(token) {
        const response = await fetch('https://api.github.com/gists', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) return null;
        const gists = await response.json();
        
        // Procura um Gist que tenha a descrição da sincronização ou o arquivo específico
        return gists.find(g => 
            g.description === SYNC_GIST_DESCRIPTION || 
            (g.files && g.files[SYNC_GIST_FILENAME])
        );
    },

    /**
     * Reúne todo o banco de dados do LocalForage e faz o upload (Cria ou Atualiza o Gist)
     */
    async uploadData(token) {
        if (!token) throw new Error("Você precisa configurar seu Token do GitHub primeiro.");

        // 1. Exporta tudo do IndexedDB local
        const exportData = await db.exportDatabase();

        // 2. Prepara o payload do Gist
        const payload = {
            description: SYNC_GIST_DESCRIPTION,
            public: false, // O Gist será privado e exclusivo para o usurio logado
            files: {
                [SYNC_GIST_FILENAME]: {
                    content: JSON.stringify(exportData, null, 2)
                }
            }
        };

        // 3. Procura se já existe
        const existingGist = await this.findSyncGist(token);

        let url = 'https://api.github.com/gists';
        let method = 'POST';

        if (existingGist) {
            url = `https://api.github.com/gists/${existingGist.id}`;
            method = 'PATCH'; // Atualiza o existente
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Erro ao salvar na nuvem.");
        }

        return await response.json();
    },

    /**
     * Baixa os dados da Nuvem e os salva no IndexedDB
     */
    async downloadData(token) {
        if (!token) throw new Error("Você precisa configurar seu Token do GitHub primeiro.");

        // 1. Busca o Gist
        const existingGist = await this.findSyncGist(token);
        if (!existingGist || !existingGist.files[SYNC_GIST_FILENAME]) {
            throw new Error("Nenhum backup encontrado na sua conta do GitHub.");
        }

        const rawUrl = existingGist.files[SYNC_GIST_FILENAME].raw_url;

        // 2. Faz o download do JSON Cru
        const response = await fetch(rawUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Erro ao baixar o arquivo da nuvem.");
        
        const backupData = await response.json();

        // 3. Importa de volta pro LocalForage
        await db.importDatabaseFromJSON(backupData);

        return true;
    }
};
