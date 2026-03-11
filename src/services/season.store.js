import { reactive } from 'vue';
import { seasonService } from './season.service';
import { getSeasonFinalYear } from './utils';
import { db } from './db';

export const seasonStore = reactive({
    list: [],
    loading: false,

    async loadSeasons(competitionName, countryName = null) {
        this.loading = true;
        // Limpar lista ANTES do await para evitar flash de dados antigos na tela
        this.list = [];
        const data = await seasonService.getByCompetitionFlexible(competitionName, countryName);
        // Ordenar do mais recente para o mais antigo
        this.list = data.sort((a, b) => getSeasonFinalYear(b.ano) - getSeasonFinalYear(a.ano));
        this.loading = false;
    },

    async loadAll() {
        this.loading = true;
        try {
            const data = await seasonService.getAll();
            this.list = data.sort((a, b) => getSeasonFinalYear(b.ano) - getSeasonFinalYear(a.ano));
        } catch (e) {
            console.error('Erro ao carregar todas as temporadas:', e);
        } finally {
            this.loading = false;
        }
    },

    async addSeason(season) {
        const saved = await seasonService.save(season);
        this.list.unshift(saved); // Adiciona no início
        // Re-ordenar para garantir
        this.list.sort((a, b) => getSeasonFinalYear(b.ano) - getSeasonFinalYear(a.ano));
    },

    async updateSeason(id, updatedData) {
        console.log('updateSeason called for ID:', id, updatedData);
        try {
            const seasons = await seasonService.getAll();
            const index = seasons.findIndex(s => String(s.id) === String(id));

            if (index !== -1) {
                // Limpeza de proxies para garantir salvamento no IndexedDB
                const updatedSeason = JSON.parse(JSON.stringify({ ...seasons[index], ...updatedData }));
                seasons[index] = updatedSeason;

                await db.save('temporadas', seasons);
                console.log('IndexedDB atualizado com sucesso');

                // Atualizar lista local reativamente
                const localIndex = this.list.findIndex(s => String(s.id) === String(id));
                if (localIndex !== -1) {
                    this.list[localIndex] = updatedSeason;
                    this.list.sort((a, b) => getSeasonFinalYear(b.ano) - getSeasonFinalYear(a.ano));
                    console.log('Lista local atualizada');
                }
            } else {
                console.error('Temporada não encontrada para ID:', id);
                throw new Error('Registro da temporada não localizado no banco de dados.');
            }
        } catch (e) {
            console.error('Erro em updateSeason:', e);
            throw e;
        }
    },

    async removeSeason(id) {
        let seasons = await seasonService.getAll();
        seasons = seasons.filter(s => s.id !== id);
        await db.save('temporadas', seasons);
        this.list = this.list.filter(s => s.id !== id);
    }
});
