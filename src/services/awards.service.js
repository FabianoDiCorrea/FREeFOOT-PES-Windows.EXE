import { db } from './db';

const STORAGE_KEY_AWARDS = 'individualAwardsHistory';

export const awardsService = {
    async getAll() {
        return await db.get(STORAGE_KEY_AWARDS) || [];
    },

    async save(award) {
        const awards = await this.getAll();
        const cleanAward = JSON.parse(JSON.stringify(award));
        const newAward = {
            ...cleanAward,
            id: Date.now()
        };
        awards.push(newAward);
        await db.save(STORAGE_KEY_AWARDS, awards);
        return newAward;
    },

    async update(id, updatedData) {
        const awards = await this.getAll();
        const index = awards.findIndex(a => String(a.id) === String(id));
        if (index !== -1) {
            const updatedAward = JSON.parse(JSON.stringify({ ...awards[index], ...updatedData }));
            awards[index] = updatedAward;
            await db.save(STORAGE_KEY_AWARDS, awards);
            return updatedAward;
        }
        throw new Error('Prêmio não encontrado.');
    },

    async remove(id) {
        let awards = await this.getAll();
        awards = awards.filter(a => String(a.id) !== String(id));
        await db.save(STORAGE_KEY_AWARDS, awards);
    }
};
