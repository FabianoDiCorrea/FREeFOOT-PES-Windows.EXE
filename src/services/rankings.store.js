import { ref } from 'vue'
import { db } from './db'

const STORAGE_KEY = 'rankingsHistory'

export const rankingsStore = {
    list: ref([]),

    async loadAll() {
        this.list.value = await db.get(STORAGE_KEY) || []
    },

    async save(seasonRanking) {
        // ID único baseado em temporada + tipo para evitar duplicatas simples
        const id = `${seasonRanking.season}_${seasonRanking.type}`

        const index = this.list.value.findIndex(r => `${r.season}_${r.type}` === id)

        if (index !== -1) {
            this.list.value[index] = { ...seasonRanking }
        } else {
            this.list.value.push({ ...seasonRanking })
        }

        await db.save(STORAGE_KEY, this.list.value)
    },

    async delete(season, type) {
        const id = `${season}_${type}`
        this.list.value = this.list.value.filter(r => `${r.season}_${r.type}` !== id)
        await db.save(STORAGE_KEY, this.list.value)
    },

    getPreviousSeasonRanking(currentSeason, type) {
        // Encontrar os rankings do mesmo tipo
        const candidates = this.list.value.filter(r => r.type === type && r.season !== currentSeason)

        // Ordenar candidatos por temporada decrescente e pegar o que é imediatamente anterior a currentSeason
        // Nota: as temporadas são no formato "2026 / 2027 - 2026" ou "2026"
        // Vamos extrair o ano base para comparação
        const getBaseYear = (s) => {
            const parts = s.split('-')
            return parseInt(parts[parts.length - 1].trim())
        }

        const currentYear = getBaseYear(currentSeason)

        return candidates
            .filter(r => getBaseYear(r.season) < currentYear)
            .sort((a, b) => getBaseYear(b.season) - getBaseYear(a.season))[0] || null
    },

    getTeamRank(teamName, seasonYear, type = 'clubes') {
        if (!teamName || !seasonYear) return null
        const norm = (n) => n?.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const target = norm(teamName)

        const rankData = this.list.value.find(r =>
            (r.season === seasonYear || r.season.includes(seasonYear) || seasonYear.includes(r.season))
            && r.type === type
        )
        if (!rankData) return null

        // Procurar no ranking Top 16
        const item = rankData.ranking.find(i => norm(i.teamName) === target)
        if (item) return item.position

        // Procurar no MyTeam (17º ou qualquer posição extra)
        if (rankData.myTeam && norm(rankData.myTeam.teamName) === target) {
            return rankData.myTeam.position
        }

        return null
    }
}
