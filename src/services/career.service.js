import { db } from './db';

const STORAGE_KEY = 'career_history';

export const careerService = {
    /**
     * Recupera todo o histórico de carreira do banco de dados.
     */
    async getAll() {
        const data = await db.get(STORAGE_KEY) || [];
        // Garantir que não retornamos entradas nulas por falhas na persistência
        return Array.isArray(data) ? data.filter(h => h && typeof h === 'object') : [];
    },

    /**
     * Salva ou atualiza um registro de temporada de carreira.
     */
    async save(careerEntry) {
        const history = await this.getAll();

        if (!careerEntry.id) {
            careerEntry.id = Date.now() + Math.random();
            history.push(careerEntry);
        } else {
            const index = history.findIndex(h => h.id === careerEntry.id);
            if (index !== -1) {
                history[index] = careerEntry;
            } else {
                history.push(careerEntry);
            }
        }

        await db.save(STORAGE_KEY, history);
        return careerEntry;
    },

    /**
     * Remove um registro do histórico.
     */
    async remove(id) {
        let history = await this.getAll();
        history = history.filter(h => h.id !== id);
        await db.save(STORAGE_KEY, history);
        return true;
    }
};
