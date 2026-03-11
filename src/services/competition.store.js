import { reactive } from 'vue';
import { competitionService } from '../services/competition.service';

export const competitionStore = reactive({
    list: [],
    loading: false,

    async loadCompetitions() {
        this.loading = true;
        this.list = await competitionService.getAll();
        this.loading = false;
    },

    async addCompetition(competition) {
        const saved = await competitionService.save(competition);
        this.list.push(saved);
    },

    async removeCompetition(id) {
        await competitionService.delete(id);
        this.list = this.list.filter(c => c.id !== id);
    }
});
