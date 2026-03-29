import { reactive, computed } from 'vue';
import { careerService } from './career.service';
import { seasonStore } from './season.store';
import { normalizeYearStrict, normalizeString, clubSmartNormalize } from './utils';

export const careerStore = reactive({
    history: [],
    loading: false,

    async loadAll() {
        this.loading = true;
        try {
            const data = await careerService.getAll();
            
            // Lista básica de detecção de seleções para migração automática
            const nationalNames = [
                'brasil', 'eua', 'estados unidos', 'argentina', 'uruguai', 'chile', 'colombia', 
                'equador', 'peru', 'paraguai', 'bolivia', 'venezuela', 'franca', 'espanha', 
                'inglaterra', 'alemanha', 'italia', 'portugal', 'belgica'
            ];

            // Migração e Filtro: registros sem tipo são 'clube', ignorar corrompidos
            this.history = data
                .filter(h => h && typeof h === 'object')
                .map(h => {
                    const nameLower = h.timeNome?.toLowerCase().trim() || '';
                    let tipo = h.tipo;
                    
                    // Se não tem tipo ou é clube, mas o nome é de seleção, migra
                    if (!tipo || tipo === 'clube') {
                        if (nationalNames.some(n => nameLower.includes(n))) {
                            tipo = 'selecao';
                        } else {
                            tipo = tipo || 'clube';
                        }
                    }
                    
                    if (h.copasManual && h.copasManual.nome === 'COPAS (AMÉRICA / EURO)') {
                        h.copasManual.nome = 'COPAS CONTINENTAIS';
                    }
                    return { ...h, tipo };
                });
        } catch (e) {
            console.error('Erro ao carregar histórico de carreira:', e);
        } finally {
            this.loading = false;
        }
    },

    async saveEntry(entry) {
        try {
            // Lista básica para garantir tipo correto no salvamento
            const nationalNames = [
                'brasil', 'eua', 'estados unidos', 'argentina', 'uruguai', 'chile', 'colombia', 
                'equador', 'peru', 'paraguai', 'bolivia', 'venezuela', 'franca', 'espanha', 
                'inglaterra', 'alemanha', 'italia', 'portugal', 'belgica'
            ];
            
            const nameLower = entry.timeNome?.toLowerCase().trim() || '';
            const isNational = nationalNames.some(n => nameLower.includes(n));

            // Garantir que tipo esteja presente e correto
            if (!entry.tipo || entry.tipo === 'clube') {
                entry.tipo = isNational ? 'selecao' : 'clube';
            }
            
            const saved = await careerService.save(entry);
            // Atualizar lista local
            const index = this.history.findIndex(h => h.id === saved.id);
            if (index !== -1) {
                this.history[index] = saved;
            } else {
                this.history.push(saved);
            }
            return saved;
        } catch (e) {
            console.error('Erro ao salvar entrada de carreira:', e);
            throw e;
        }
    },

    async removeEntry(id) {
        try {
            await careerService.remove(id);
            this.history = this.history.filter(h => h.id !== id);
        } catch (e) {
            console.error('Erro ao remover entrada de carreira:', e);
        }
    },

    /**
     * Verifica se um determinado time em uma determinada temporada foi comandado pelo usuário.
     * @param {string} teamName 
     * @param {string} seasonYear 
     * @param {string} compName - nome da competição (opcional)
     */
    isUserTeam(teamName, seasonYear, compName = null) {
        if (!teamName || !seasonYear || !this.history || this.history.length === 0) return false;
        
        const norm = (n) => normalizeString(n);
        const smartNorm = (n) => clubSmartNormalize(n);
        
        // Função para bater nomes de times de forma flexível
        const teamMatch = (n1, n2) => {
            const v1 = smartNorm(n1); // history
            const v2 = smartNorm(n2); // matrix
            if (!v1 || !v2) return false;
            
            if (v1 === v2) return true;
            
            // Tratamento especial para EUA
            const isEUA = (v) => v === 'eua' || v === 'estados unidos' || v === 'usa';
            if (isEUA(v1) && isEUA(v2)) return true;
            
            // Match parcial (Ex: "Nova Iguaçu" vs "Nova Iguaçu FC")
            if (v1.length > 3 && v2.length > 3) {
                if (v1.includes(v2) || v2.includes(v1)) return true;
            }

            return false;
        };

        // Função para bater anos de forma flexível (Ex: 2024 vs 2023-2024)
        const yearMatch = (y1, y2) => {
            const s1 = y1?.toString().trim();
            const s2 = y2?.toString().trim();
            if (!s1 || !s2) return false;
            if (s1 === s2) return true;
            return s1.includes(s2) || s2.includes(s1);
        };

        const targetComp = compName ? norm(compName) : null;

        return this.history.some(h => {
            const isYearOk = yearMatch(h.temporada, seasonYear);
            const isTeamOk = teamMatch(h.timeNome, teamName);

            if (smartNorm(teamName).includes('iguacu')) {
                console.log(`DEBUG NOVA IGUACU: checking ${teamName} vs history ${h.timeNome}. seasonYear: ${seasonYear} vs history: ${h.temporada}. yearMatch: ${isYearOk}, teamMatch: ${isTeamOk}`);
            }

            if (isYearOk && isTeamOk) {
                return true;
            }
            return false;
        });
    },

    /**
     * Tenta buscar estatísticas da liga automaticamente do seasonStore.
     */
    getAutoStats(teamName, seasonYear) {
        // Esta lógica será melhor implementada na view ou via helper, 
        // pois depende do carregamento das temporadas de uma competição específica.
        return null;
    }
});
