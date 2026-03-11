import { db } from './db';

export const imageCacheService = {
    /**
     * Converte uma URL de imagem para Base64.
     */
    async urlToBase64(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Erro ao converter imagem para Base64:", url, error);
            return null;
        }
    },

    /**
     * Busca uma imagem do cache ou faz o fetch e salva no cache.
     */
    async getOrCache(url) {
        if (!url || url.startsWith('data:')) return url;

        // 1. Tentar pegar do banco local
        const cached = await db.getImage(url);
        if (cached) return cached;

        // 2. Se não tem, faz o download e converte
        // Nota: Só faz o cache se for um link externo (http/https)
        if (url.startsWith('http')) {
            const base64 = await this.urlToBase64(url);
            if (base64) {
                await db.saveImage(url, base64);
                return base64;
            }
        }

        return url;
    },

    /**
     * Recupera uma imagem específica do banco local.
     */
    async getLogo(id) {
        if (!id) return null;
        if (id.startsWith('data:')) return id;
        return await db.getImage(id);
    }
};
