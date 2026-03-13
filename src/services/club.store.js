import { reactive } from 'vue'
import { CLUBS_DATA } from '../data/clubs.data'
import { db } from './db'

export const clubStore = reactive({
    list: [],
    customClubs: [], // Clubes salvos no IDB
    deletedClubIds: [], // IDs de clubes que foram excluídos (inclusive nativos)
    needsExport: false, // Indica se há mudanças não exportadas para CSV

    /**
     * Limpa caracteres corrompidos por encoding (Ã%, Ã£, etc)
     */
    sanitizeString(str) {
        if (!str) return '';
        let result = str.toString()
            // High priority: Specific corrupted patterns from user screenshots
            .replace(/Ã%/g, 'É')
            .replace(/Ã©/g, 'é')
            .replace(/Ã¡/g, 'á')
            .replace(/Ã³/g, 'ó')
            .replace(/Ãº/g, 'ú')
            .replace(/Ã­/g, 'í')
            .replace(/Ã£/g, 'ã')
            .replace(/Ãµ/g, 'õ')
            .replace(/Ã§/g, 'ç')
            .replace(/Ã±/g, 'ñ')
            .replace(/Ã‰/g, 'É')
            .replace(/Ã\*/g, 'Á')
            .replace(/Ã\+/g, 'Í')
            .replace(/Ã\-/g, 'Ó')
            .replace(/Ã\./g, 'Ú')
            .replace(/Ã‚/g, 'Â')
            .replace(/Ãª/g, 'ê')
            .replace(/Ã´/g, 'ô')
            .replace(/Ã\–/g, 'Í')
            .replace(/Ã\—/g, '×')
            .replace(/Ãœ/g, 'Ü')
            .replace(/Ã\~/g, 'ñ')
            .replace(/ColÃ´mbi/g, 'Colômbia')
            .replace(/BolÃ-via/g, 'Bolívia')
            .replace(/AnzoÃ¡tegui/g, 'Anzoátegui')
            .replace(/PeÃ±arol/g, 'Peñarol')
            // Lower priority: common Latin-1 misinterpreted as UTF-8
            .replace(/Ã /g, 'à').replace(/Ã¢/g, 'â')
            .replace(/Ã¨/g, 'è')
            .replace(/Ã¬/g, 'ì').replace(/Ã®/g, 'î')
            .replace(/Ã²/g, 'ò')
            .replace(/Ã¹/g, 'ù').replace(/Ã»/g, 'û')
            .replace(/Ã‡/g, 'Ç')
            .replace(/Ã‘/g, 'Ñ')
            // Special symbols and noise
            .replace(/Âº/g, 'º')
            .replace(/Âª/g, 'ª')
            .replace(/Â/g, '') // Clean residual A
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim();

        return result;
    },

    /**
     * Inicializa o store carregando dados do IndexedDB e mesclando com CLUBS_DATA.
     */
    async init() {
        this.loading = true;
        try {
            this.customClubs = await db.getAll('custom_clubs') || [];
            this.deletedClubIds = await db.get('deleted_club_ids') || [];
            this.needsExport = await db.get('clubs_needs_export') || false;

            // Rotina de Reparo Profundo (v5.7.1)
            let hasRepair = false;
            const repairedClubs = [];

            for (const club of this.customClubs) {
                let clubChanged = false;

                // 1. Sanitização de Caracteres (Ã% -> É, Ã± -> ñ)
                const fields = ['nome', 'pais', 'continente'];
                fields.forEach(f => {
                    const original = club[f] || '';
                    const sanitized = this.sanitizeString(original);
                    if (original !== sanitized) {
                        club[f] = sanitized;
                        clubChanged = true;
                    }
                });

                // 2. Reparo de IDs (Apenas se for inválido - NaN, null, new)
                const idStr = (club.id || '').toString();
                if (!club.id || idStr.includes('E+') || idStr === 'new' || idStr === 'null' || idStr.includes('NaN')) {
                    // Importante: Passamos repairedClubs para detectar colisões com IDs já gerados neste loop
                    club.id = this.generateIdForCountry(club.pais, repairedClubs);
                    clubChanged = true;
                }

                repairedClubs.push(club);
                if (clubChanged) hasRepair = true;
            }

            if (hasRepair) {
                this.customClubs = repairedClubs;
                await db.save('custom_clubs', this.customClubs);
                console.log('Sanitização e Reparo de IDs v5.8.0 aplicados com sucesso.');
            }

            this.refreshList();
        } catch (error) {
            console.error('Erro ao inicializar clubStore:', error);
        } finally {
            this.loading = false;
        }
    },

    /**
     * Mapeamento de 3 letras para países comuns.
     */
    getCountryCode(countryName) {
        const map = {
            'brasil': 'BRA',
            'argentina': 'ARG',
            'peru': 'PER',
            'inglaterra': 'ING',
            'itália': 'ITA',
            'espanha': 'ESP',
            'frança': 'FRA',
            'alemanha': 'ALE',
            'equador': 'EQU',
            'colômbia': 'COL',
            'uruguai': 'URU',
            'paraguai': 'PAR',
            'chile': 'CHI',
            'bolívia': 'BOL',
            'venezuela': 'VEN',
            'méxico': 'MEX',
            'estados unidos': 'EUA',
            'costa rica': 'CRC',
            'jamaica': 'JAM',
            'egito': 'EGI',
            'marrocos': 'MAR',
            'japão': 'JAP',
            'china': 'CHI',
            'arábia saudita': 'ARA',
            'portugal': 'POR',
            'holanda': 'HOL',
            'bélgica': 'BEL'
        };
        const norm = (countryName || '').toLowerCase().trim();
        return map[norm] || norm.substring(0, 3).toUpperCase();
    },

    /**
     * Gera um novo ID sequencial baseado no país.
     */
    generateIdForCountry(country, currentList) {
        const prefix = this.getCountryCode(country);
        const prefixLower = prefix.toLowerCase();

        // Busca o maior número já usado para este prefixo
        let maxNum = 0;
        const allClubs = [...this.list, ...currentList];

        allClubs.forEach(c => {
            if (c.id && c.id.toString().toLowerCase().startsWith(prefixLower)) {
                // Tenta extrair o número do final (ex: BRA99 -> 99)
                const numPart = c.id.toString().substring(prefix.length);
                const num = parseInt(numPart);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        });

        // Retorna o prefixo + número com 2 dígitos (ou mais se passar de 99)
        const nextNum = maxNum + 1;
        const paddedNum = nextNum.toString().padStart(2, '0');
        return `${prefix}${paddedNum}`;
    },

    /**
     * Atualiza a lista principal mesclando dados estáticos com customizados.
     */
    refreshList() {
        // Começamos com os dados estáticos do arquivo
        const base = JSON.parse(JSON.stringify(CLUBS_DATA));

        const normalize = (s) => (s || '').toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Aplicamos as customizações (overrides por ID ou Nome+País)
        this.customClubs.forEach(custom => {
            const qName = normalize(custom.nome);
            const qCountry = normalize(custom.pais);

            // Correspondência ROBUSTA: ID ou (Nome E País)
            const idx = base.findIndex(c => {
                const sameId = c.id && custom.id && c.id.toString() === custom.id.toString();
                const sameName = normalize(c.nome) === qName;
                const sameCountry = normalize(c.pais) === qCountry;

                return sameId || (sameName && sameCountry);
            });

            if (idx !== -1) {
                // Preservamos o escudo original se o custom não tiver um novo (evita shields genéricos)
                const originalEscudo = base[idx].escudo_url;
                base[idx] = { ...base[idx], ...custom };
                if (!custom.escudo_url && originalEscudo) {
                    base[idx].escudo_url = originalEscudo;
                }
            } else {
                base.push(custom);
            }
        });

        // FILTRAGEM FINAL: Remove times que estão na lista de exclusão
        this.list = base.filter(c => {
            if (!c.id) return true;
            return !this.deletedClubIds.includes(c.id.toString());
        });
    },

    /**
     * Salva ou atualiza um clube.
     */
    async saveClub(clubData) {
        if (!clubData.nome) throw new Error('Nome do clube é obrigatório');

        const normalize = (s) => (s || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const qName = normalize(clubData.nome);
        const qCountry = normalize(clubData.pais);

        // 1. Verificar se já existe (Deduplicação)
        // CRÍTICO: Se temos um ID, ele deve ser o mestre da edição (Editar Barcelonaa -> Barcelona)
        let existingIndex = -1;

        if (clubData.id && clubData.id !== 'new') {
            existingIndex = this.customClubs.findIndex(c => c.id.toString() === clubData.id.toString());
        }

        // Se não achou por ID, tenta por Nome+País (evita duplicar o mesmo time adicionado 2x)
        if (existingIndex === -1) {
            existingIndex = this.customClubs.findIndex(c =>
                normalize(c.nome) === qName && normalize(c.pais) === qCountry
            );
        }

        let clubToSave = { ...clubData };

        if (existingIndex !== -1) {
            clubToSave = { ...this.customClubs[existingIndex], ...clubData };
            this.customClubs[existingIndex] = clubToSave;
        } else {
            // NOVO CLUBE: Se não tem ID, gera seguindo o padrão BRA01
            if (!clubToSave.id || clubToSave.id === 'new') {
                clubToSave.id = this.generateIdForCountry(clubData.pais, this.customClubs);
            }
            this.customClubs.push(clubToSave);
        }

        // Se o time estava na lista de exclusão (ex: re-adicionado), remove de lá
        if (clubToSave.id) {
            this.deletedClubIds = this.deletedClubIds.filter(id => id !== clubToSave.id.toString());
            await db.save('deleted_club_ids', this.deletedClubIds);
        }

        // Marcar que precisa de exportação
        this.needsExport = true;
        await db.save('clubs_needs_export', true);

        // Salva a lista completa no IndexedDB
        await db.save('custom_clubs', this.customClubs);

        this.refreshList();
        return clubToSave;
    },

    /**
     * Remove um clube (apenas se for customizado).
     */
    async removeClub(clubId) {
        if (!clubId) return;
        const idStr = clubId.toString();

        // 1. Remove da lista de customizados (se estiver lá)
        this.customClubs = this.customClubs.filter(c => c.id.toString() !== idStr);
        await db.save('custom_clubs', this.customClubs);

        // 2. Adiciona à lista de exclusão (para sumir de vez, inclusive se for nativo)
        if (!this.deletedClubIds.includes(idStr)) {
            this.deletedClubIds.push(idStr);
            await db.save('deleted_club_ids', this.deletedClubIds);
        }

        this.needsExport = true;
        await db.save('clubs_needs_export', true);

        this.refreshList();
    },

    /**
     * Busca info de um clube de forma unificada.
     * @param {string} clubName Nome do clube
     * @param {string} countryName Opcional: Nome do país para desempate
     */
    getClub(clubName, countryName = null) {
        if (!clubName) return null;

        const normalize = (s) => (s || '').toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const qName = normalize(clubName);
        const qCountry = countryName ? normalize(countryName) : null;

        // 1. Tenta Match EXATO (Nome + País) se o país for fornecido
        if (qCountry) {
            const match = this.list.find(c => normalize(c.nome) === qName && normalize(c.pais) === qCountry);
            if (match) return match;
        }

        // 2. Tenta Match EXATO (Nome)
        const nameMatch = this.list.find(c => normalize(c.nome) === qName);
        if (nameMatch) return nameMatch;

        // 3. Fallback: Busca Parcial
        return this.list.find(c => normalize(c.nome).includes(qName)) || null;
    },

    /**
     * Marca a sincronização como concluída (chamado após Export CSV).
     */
    async markSynced() {
        this.needsExport = false;
        await db.save('clubs_needs_export', false);
    }
});
