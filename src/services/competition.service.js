import { db } from './db';

const STORAGE_KEY = 'competicoes';

export const competitionService = {
    async getAll() {
        return await db.get(STORAGE_KEY);
    },

    async save(competition) {
        const competitions = await this.getAll();
        const newCompetition = {
            ...competition,
            id: Date.now()
        };
        competitions.push(newCompetition);
        await db.save(STORAGE_KEY, competitions);
        return newCompetition;
    },

    async delete(id) {
        let competitions = await this.getAll();
        competitions = competitions.filter(c => c.id !== id);
        await db.save(STORAGE_KEY, competitions);
    }
};
