import { reactive } from 'vue';
import { awardsService } from './awards.service';

export const awardsStore = reactive({
    list: [],
    loading: false,

    async loadAll() {
        this.loading = true;
        try {
            const data = await awardsService.getAll();
            // Ordenar por temporada (ano) descendente pode ser útil, mas prêmios individuais
            // são agrupados por temporada na visualização.
            this.list = data;
        } catch (e) {
            console.error('Erro ao carregar prêmios:', e);
        } finally {
            this.loading = false;
        }
    },

    async addAward(award) {
        const saved = await awardsService.save(award);
        this.list.push(saved);
        return saved;
    },

    async updateAward(id, updatedData) {
        try {
            const updated = await awardsService.update(id, updatedData);
            const index = this.list.findIndex(a => String(a.id) === String(id));
            if (index !== -1) {
                this.list[index] = updated;
            }
            return updated;
        } catch (e) {
            console.error('Erro ao atualizar prêmio:', e);
            throw e;
        }
    },

    async removeAward(id) {
        try {
            await awardsService.remove(id);
            this.list = this.list.filter(a => String(a.id) !== String(id));
        } catch (e) {
            console.error('Erro ao remover prêmio:', e);
            throw e;
        }
    }
});
