import { competitionStore } from './competition.store';
import { db } from './db';
import { CLUBS_DATA } from '../data/clubs.data';

const STORAGE_KEY_SEASONS = 'temporadas';

export const seasonService = {
    async getAll() {
        return await db.get(STORAGE_KEY_SEASONS) || [];
    },

    async getByCompetition(competitionName) {
        const seasons = await this.getAll();
        return seasons.filter(s => s.competitionName === competitionName);
    },

    async getByCompetitionFlexible(targetCompetition, targetCountry = null) {
        const seasons = await this.getAll();
        const normalize = (s) => {
            if (!s) return "";
            try {
                return s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            } catch (e) {
                return "";
            }
        }

        const cName = normalize(targetCompetition);
        const cCountry = targetCountry ? normalize(targetCountry) : null;

        return seasons.filter(s => {
            const sName = normalize(s.competitionName);
            let sCountry = s.pais ? normalize(s.pais) : null;

            // 0. Inferência de País (Smart Fix para dados legados sem país)
            if (!sCountry) {
                if (sName.includes('brasileirao') || sName.includes('copa do brasil')) sCountry = 'brasil';
                if (sName.includes('argentina') || sName.includes('primera nacional') || sName.includes('liga profissional')) sCountry = 'argentina';
                if (sName.includes('inglesa') || sName.includes('premier league') || sName.includes('fa cup')) sCountry = 'inglaterra';
                if (sName.includes('venezuelana') || sName.includes('venezuela')) sCountry = 'venezuela';
            }

            // 1. Validação de País (Agora mais robusta com a inferência)
            const isInternational = cCountry && ['AMERICA DO SUL', 'EUROPA', 'CONMEBOL', 'UEFA', 'MUNDO', 'INTERNACIONAL', 'FIFA'].includes(cCountry.toUpperCase());

            if (cCountry && sCountry && sCountry !== cCountry && !isInternational) {
                return false;
            }

            // 1.5 FIREWALL EXPLÍCITO (Separação Brasil x Argentina) forçada
            if (cCountry === 'brasil') {
                if (sName.includes('primera nacional') || sName.includes('liga profissional') || sName.includes('argentina')) return false;
            }
            if (cCountry === 'argentina') {
                if (sName.includes('brasileirao') || sName.includes('serie a') || sName.includes('serie b') || sName.includes('copa do brasil')) return false;
            }

            // Se não tem país na temporada, checar o campeão como fallback (APENAS PARA LIGAS LOCAIS)
            if (cCountry && !sCountry && s.campeao && !isInternational) {
                const champ = CLUBS_DATA.find(c => normalize(c.nome) === normalize(s.campeao));
                if (champ && normalize(champ.pais) !== cCountry) return false;
            }

            // 2. Match de Nome Exato
            if (sName === cName) return true;

            // 3. Lógica Específica por País (Sem cruzamento)
            if (cCountry === 'argentina') {
                if (cName === 'primera nacional' && sName === 'primera nacional') return true;
                // Permite "Liga Argentina" casar com "Liga Profissional" se necessário, mas evita "Nacional" solto
            }

            if (cCountry === 'brasil') {
                if (cName.includes('profissional') && (sName.includes('profissional') || sName.includes('serie a'))) return true;
                // "Nacional" aqui só se for algo específico do Brasil, mas melhor evitar regra genérica
            }

            // 4. Proteção Específica: Copa vs Supercopa
            // "Copa do Brasil" não pode casar com "Supercopa do Brasil"
            if (cName.includes('copa') && !cName.includes('super') && sName.includes('super')) return false;
            if (sName.includes('copa') && !sName.includes('super') && cName.includes('super')) return false;

            // Regra Genérica (com cuidado) - Apenas se os países baterem ou não tiver país definido (e passou pelo firewall)
            // PROTEÇÃO: "Recopa" não pode casar com "Sul-Americana" via includes
            const isRecopaCase = cName.includes('recopa') || sName.includes('recopa');
            const isSulAmerCase = (cName.includes('sul-americana') || cName.includes('sulamericana')) || (sName.includes('sul-americana') || sName.includes('sulamericana'));

            if (isRecopaCase && isSulAmerCase && cName !== sName) {
                // Se um é recopa e o outro é sul-americana pura, não podem casar
                const onlySulAmer = (n) => (n.includes('sul-americana') || n.includes('sulamericana')) && !n.includes('recopa');
                if ((isRecopaCase && onlySulAmer(sName)) || (isRecopaCase && onlySulAmer(cName))) return false;
            }

            // Agora com proteção para não cruzar divisões (Serie A, Serie B, etc)
            const hasDiv = (name) => name.includes('serie') || name.includes('liga profissional') || name.includes('primera nacional') || name.includes('divisao');

            if (cName.includes(sName) || sName.includes(cName)) {
                // Se um tem "Serie B" e o outro não, não deve casar
                if (cName.includes('serie b') && !sName.includes('serie b')) return false;
                if (sName.includes('serie b') && !cName.includes('serie b')) return false;

                // Bloqueio genérico para sub-strings curtas demais que geram lixo
                if (sName.length <= 5 && cName !== sName) return false;

                if (hasDiv(cName) && hasDiv(sName) && cName !== sName) return false;

                return true;
            }

            return false;
        });
    },

    async save(season) {
        const seasons = await this.getAll();
        // Limpeza profunda de proxies para evitar DataCloneError no IndexedDB
        const cleanSeason = JSON.parse(JSON.stringify(season));

        // Normalização agressiva para match de temporada
        const normalize = (s) => s?.toString().toLowerCase().replace(/[^a-z0-9]/g, "").trim() || "";
        const targetName = normalize(cleanSeason.competitionName);
        const targetYear = normalize(cleanSeason.ano);

        // Busca se já existe este registro para evitar duplicidade
        const existingIndex = seasons.findIndex(s =>
            normalize(s.competitionName) === targetName &&
            normalize(s.ano) === targetYear
        );

        if (existingIndex > -1) {
            // Atualiza o existente mantendo o ID original
            const originalId = seasons[existingIndex].id;
            seasons[existingIndex] = {
                ...cleanSeason,
                id: originalId
            };
            await db.save(STORAGE_KEY_SEASONS, seasons);
            return seasons[existingIndex];
        } else {
            // Cria um novo registro
            const newSeason = {
                ...cleanSeason,
                id: Date.now()
            };
            seasons.push(newSeason);
            await db.save(STORAGE_KEY_SEASONS, seasons);
            return newSeason;
        }
    }
};
