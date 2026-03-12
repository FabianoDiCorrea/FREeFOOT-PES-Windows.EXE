<template>
  <div class="checklist-container p-4 min-vh-100 bg-dark text-white">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
       <div class="d-flex align-items-center gap-3">
           <button @click="goBack" class="btn btn-outline-light btn-sm">
              <i class="bi bi-arrow-left"></i> VOLTAR
           </button>
          <h2 class="m-0 fw-black text-uppercase ls-1">CHECKLIST DE TEMPORADAS</h2>
       </div>
       <div class="d-flex gap-2">
          <button @click="activeTab = 'americas'" class="btn btn-sm fw-bold px-4" 
             :class="activeTab === 'americas' ? 'btn-info text-dark' : 'btn-outline-secondary'">
             AMÉRICAS 🌎
          </button>
          <button @click="activeTab = 'europa'" class="btn btn-sm fw-bold px-4" 
             :class="activeTab === 'europa' ? 'btn-info text-dark' : 'btn-outline-secondary'">
             EUROPA 🇪🇺
          </button>
       </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
       <div class="spinner-border text-info mb-3"></div>
       <p class="text-muted small">ANALISANDO UNIVERSO...</p>
    </div>

    <!-- CONTENT -->
    <div v-else class="checklist-content custom-scrollbar py-2">
       
       <!-- CONTAINER CENTRALIZADO E ESTREITO (Puxado para o meio) -->
       <div class="checklist-main-wrapper mx-auto">
          
          <!-- LOOP DE TEMPORADAS (ANOS) -->
          <div v-for="year in sortedYears" :key="year" class="mb-5">
             <!-- HEADER DO ANO (ACORDEÃO) -->
             <div class="d-flex align-items-center gap-3 p-3 bg-dark border border-secondary border-opacity-25 rounded-3 cursor-pointer header-year-premium mb-2" @click="toggleYear(year)">
                <i class="bi" :class="expandedYears[year] ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                <h3 class="fw-black text-warning m-0 text-uppercase ls-2">{{ year }}</h3>
                <div class="ms-auto d-flex align-items-center gap-2">
                   <span class="badge bg-black text-secondary border border-secondary border-opacity-25 px-3">{{ getCompetitionsForRegion(activeTab).length }} COMPETIÇÕES</span>
                </div>
             </div>

             <!-- LISTA DE COMPETIÇÕES (EXPANSÍVEL) -->
             <div v-if="expandedYears[year]" class="d-flex flex-column gap-1 animated-fade-in">
                <div v-for="comp in getCompetitionsForRegion(activeTab)" :key="comp.id" 
                     class="slim-checklist-row p-2 rounded-2 d-flex align-items-center gap-3"
                     :class="[
                       getStatus(comp, year).registered ? 'row-registered' : 'row-pending',
                       { 'intl-row-bg': comp.tipo === 'internacional' }
                     ]">
                   <!-- INÍCIO: ESCUDO OU TROFÉU -->
                   <div v-if="comp.tipo === 'especial'" class="d-flex align-items-center justify-content-center" style="width: 30px;">
                       <img v-if="comp.realTrofeu" :src="comp.realTrofeu" style="height: 30px; width: 30px; object-fit: contain; filter: drop-shadow(0 0 5px rgba(255,193,7,0.3));">
                       <i v-else class="bi bi-trophy-fill text-warning fs-5"></i>
                   </div>
                   <TeamShield v-else :teamName="getStatus(comp, year).champion" :size="30" :season="year" />

                   <!-- 1. LOGO -->
                   <div class="comp-logo-box">
                       <img v-if="comp.logo" :src="comp.logo" class="comp-logo-img" @error="(e) => e.target.style.display='none'" />
                       <i v-else class="bi bi-trophy-fill text-muted opacity-25"></i>
                   </div>

                   <!-- 2. NOME LIGA (ALTO CONTRASTE) -->
                   <div class="flex-grow-1 min-w-0">
                       <div class="fw-bold text-uppercase text-truncate ls-1 comp-name-label" 
                            :class="getStatus(comp, year).registered ? 'text-white' : 'text-secondary-light'">
                           {{ comp.nome }}
                       </div>
                   </div>

                   <!-- 3 & 4. BANDEIRA E PAÍS -->
                   <div class="d-flex align-items-center gap-2" style="min-width: 130px;">
                       <NationalFlag :countryName="comp.pais || comp.continente" :size="18" />
                       <span class="x-small text-uppercase fw-bold opacity-50 text-white truncate-100">{{ comp.pais || comp.continente }}</span>
                   </div>

                   <!-- 5. TABELA -->
                   <div class="status-icon-center">
                       <i v-if="getStatus(comp, year).hasTable" class="bi bi-grid-3x3-gap-fill text-info" title="Tabela OK"></i>
                       <i v-else class="bi bi-grid-3x3-gap opacity-10"></i>
                   </div>

                   <!-- 6. ARTILHEIRO -->
                   <div class="status-icon-center">
                       <i v-if="getStatus(comp, year).hasScorers" class="bi bi-person-badge-fill text-warning" title="Artilharia OK"></i>
                       <i v-else class="bi bi-person-badge opacity-10"></i>
                   </div>

                   <!-- 7. STATUS FINAL (TIQUE OU X) -->
                   <div class="status-final-box">
                       <i v-if="getStatus(comp, year).registered" class="bi bi-check-circle-fill text-success fs-5"></i>
                       <i v-else class="bi bi-dash-circle text-danger opacity-25 fs-5"></i>
                   </div>
                   <!-- FIM: BOTAO DE CHECK OU STATUS -->
                </div>
             </div>
          </div>

          <!-- ESTADO VAZIO -->
          <div v-if="sortedYears.length === 0" class="text-center py-5 opacity-50">
             <i class="bi bi-calendar-x fs-1 mb-3 d-block"></i>
             NENHUMA TEMPORADA DISPONÍVEL.
          </div>
       </div> <!-- closes checklist-main-wrapper -->
    </div> <!-- closes checklist-content -->
  </div> <!-- closes checklist-container -->
</template>



<script setup>
import { ref, computed, onMounted, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { seasonService } from '../services/season.service'
import { awardsStore } from '../services/awards.store'
import { rankingsStore } from '../services/rankings.store'
import { ALL_COMPETITIONS_DATA as RAW_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { normalizeYearStrict as normalizeYear, getSeasonFinalYear as getYearDisplay } from '../services/utils'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'

// IMAGENS DE PRÊMIOS
import imgMelhorMundo from '../assets/trofeus/individuais/melhor_do_mundo.png'
import imgMelhorTecnico from '../assets/trofeus/individuais/melhor_tecnico_mundo.png'
import imgMelhorEuropa from '../assets/trofeus/individuais/melhor_da_europa.png'
import imgMelhorAmerica from '../assets/trofeus/individuais/melhor_da_america.png'
import imgMelhorConcacaf from '../assets/trofeus/individuais/melhor_da_concacaf.png'

const router = useRouter()
const loading = ref(true)
const seasons = ref([])
const availableYears = ref([])
const allCompetitions = ref([])
const activeTab = ref('americas')
const expandedYears = ref({})

const goBack = () => router.back()
const toggleYear = (year) => {
    expandedYears.value[year] = !expandedYears.value[year]
}

const loadAllData = async () => {
    loading.value = true
    // SEMPRE carrega tudo para o checklist para evitar instabilidade do store filtrado
    seasons.value = await seasonService.getAll()
    
    // Flatten Competitions Data
    const flat = []
    RAW_DATA.forEach(region => {
        // Add country competitions
        region.paises.forEach(pais => {
            if (pais.competicoes) {
                flat.push(...pais.competicoes.map(c => ({ ...c, pais: pais.nome })))
            }
        })
        // As continentais que vêm do RAW_DATA geralmente já existem no INTERNATIONAL_DATA
        if (region.continentais) {
            region.continentais.forEach(c => {
                const isDuplicate = INTERNATIONAL_DATA.some(intComp => 
                    intComp.nome.toLowerCase().includes(c.nome.toLowerCase()) || 
                    c.nome.toLowerCase().includes(intComp.nome.toLowerCase())
                )
                if (!isDuplicate) {
                    flat.push({ ...c, pais: region.continente })
                }
            })
        }
    })

    // Adicionar Competições Internacionais
    flat.push(...INTERNATIONAL_DATA)

    // Itens Especiais de Controle
    const awardsData = [
        { id: 'aw-1', nome: 'Melhor do Mundo', trofeu: imgMelhorMundo },
        { id: 'aw-2', nome: 'Melhor do Mundo (Técnico)', trofeu: imgMelhorTecnico },
        { id: 'aw-3', nome: 'Melhor da Europa', trofeu: imgMelhorEuropa },
        { id: 'aw-4', nome: 'Melhor da CONMEBOL (Rei da América)', trofeu: imgMelhorAmerica },
        { id: 'aw-5', nome: 'Melhor da CONCACAF', trofeu: imgMelhorConcacaf }
    ]

    awardsData.forEach(aw => {
        flat.push({ 
            id: aw.id, 
            nome: aw.nome, 
            tipo: "especial", 
            continente: "FIFA", 
            logo: "/logos/competitions/fifa.png", 
            realTrofeu: aw.trofeu, 
            pais: "Mundo",
            isAward: true
        })
    });

    flat.push({ id: 'special-rank-clubs', nome: "Ranking de Clubes", tipo: "especial", continente: "FIFA", logo: "/logos/competitions/fifa.png", pais: "Mundo" })
    flat.push({ id: 'special-rank-nt', nome: "Ranking de Seleções", tipo: "especial", continente: "FIFA", logo: "/logos/competitions/fifa.png", pais: "Mundo" })

    allCompetitions.value = flat

    // Extract unique years (Normalized)
    const yearsSet = new Set(seasons.value.map(s => normalizeYear(s.ano)))
    availableYears.value = Array.from(yearsSet).sort((a, b) => b.localeCompare(a))
    
    // Carregar outros dados necessários
    await awardsStore.loadAll()
    await rankingsStore.loadAll()

    loading.value = false
}

onMounted(loadAllData)
onActivated(loadAllData)

watch(() => seasonStore.list, loadAllData, { deep: true })

// Filtra anos com base na aba ativa: só aparece se tiver ALGO marcado
const sortedYears = computed(() => {
    return availableYears.value.filter(year => {
        if (!year) return false
        const val = year.toString()
        
        // Proteção contra anos malformados
        if (val.includes('(') || val.includes(')')) return false

        // Verifica se há pelo menos UMA competição registrada para este ano NESTA ABA
        const compsForRegion = getCompetitionsForRegion(activeTab.value)
        const hasAnyRegistered = compsForRegion.some(comp => {
            const status = getStatus(comp, year)
            return status.registered
        })

        return hasAnyRegistered
    })
})


const getCompetitionsForRegion = (region) => {
    return allCompetitions.value.filter(c => {
        const pais = c.pais || ''; 
        const continente = c.continente || '';

        // Itens Globais (Compartilhados em Ambas as Abas)
        const isGlobal = c.tipo === 'especial' || c.nome.includes('Mundial de Clubes');
        if (isGlobal) return true;

        if (region === 'americas') {
            const list = ['Brasil', 'Argentina', 'Uruguai', 'Colômbia', 'Chile', 'Paraguai', 'Bolívia', 'Peru', 'Equador', 'Estados Unidos', 'México', 'Costa Rica', 'América do Sul', 'América do Norte'];
            if (list.includes(pais)) return true;
            if (continente === 'CONMEBOL' || continente === 'CONCACAF') return true;
        }
        if (region === 'europa') {
            const list = ['Inglaterra', 'Itália', 'Espanha', 'França', 'Alemanha', 'Europa'];
            if (list.includes(pais)) return true;
            if (continente === 'UEFA') return true;
        }
        return false
    })
}

const getStatus = (comp, year) => {
    // Função auxiliar agressiva para normalização (remove espaços, hifens e acentos)
    const normalize = (str) => {
        if (!str) return ""
        return str.toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[^a-z0-9]/g, "")        // Remove tudo que não for letra ou número
            .trim()
    }
    
    const yearRef = year.toString() // Referência do loop (ex: "2026 / 2027")

    // Função de match de ano unificada por CICLO (Ancorada no Ano Final expandido)
    const isSameCycle = (s1, s2) => {
        if (!s1 || !s2) return false
        
        const getFinalYear4Digit = (yStr) => {
            const y = getYearDisplay(yStr); // Já lida com "/" e "-"
            if (!y) return 0;
            let s = y.toString().trim();
            if (s.length === 2) {
                const val = parseInt(s);
                return val > 50 ? 1900 + val : 2000 + val;
            }
            return parseInt(s) || 0;
        }

        return getFinalYear4Digit(s1) === getFinalYear4Digit(s2);
    }

    // 1. Tratamento para Itens Especiais
    if (comp.tipo === 'especial' || comp.isAward) {
        if (comp.isAward) {
            const hasAward = awardsStore.list.some(a => {
                const storedYear = a.season || a.temporada || "";
                if (!isSameCycle(storedYear, year)) return false;
                
                const aType = normalize(a.tipo || a.titulo || "");
                const cName = normalize(comp.nome || "");
                
                // Matchers precisos (Sem espaços nos termos, pois o normalize removeu)
                if (cName.includes("mundotecnico") && aType.includes("mundotecnico")) return true;
                if (cName.includes("mundo") && !cName.includes("tecnico") && aType.includes("mundo") && !aType.includes("tecnico")) return true;
                if (cName.includes("europa") && aType.includes("europa")) return true;
                if (cName.includes("conmebol") || cName.includes("reidaamerica")) {
                    if (aType.includes("conmebol") || aType.includes("reidaamerica") || aType.includes("america")) return true;
                }
                if (cName.includes("concacaf") && aType.includes("concacaf")) return true;
                
                return aType === cName || aType.includes(cName) || cName.includes(aType);
            })
            return { registered: hasAward }
        }
        if (comp.id === 'special-rank-clubs' || comp.id === 'special-rank-nt') {
            const type = comp.id === 'special-rank-clubs' ? 'clubes' : 'selecoes'
            const list = rankingsStore.list.value || []
            const hasRank = list.some(r => {
                if (r.type !== type) return false;
                // Match estrito de temporada (prioriza strings idênticas)
                if (normalizeYear(r.season) === normalizeYear(year)) return true;
                // Se não for idêntica, usa a lógica de ciclo (que agora bloqueia o vazamento 27/28 vs 28/29)
                return isSameCycle(r.season, year);
            })
            if (hasRank) return { registered: true }
        }
    }

    const match = seasons.value.find(s => {
        // Match de ano por Ciclo (Permite que salvar 2026 marque na linha 2026 / 2027)
        if (!isSameCycle(s.ano, year)) return false
        
        let sCountry = s.pais ? normalize(s.pais) : null
        
        // 0. Inferência Inteligente de País (Se ausente)
        if (!sCountry) {
            const sn = normalize(s.competitionName)
            if (sn.includes('brasileirao') || sn.includes('copa do brasil')) sCountry = 'brasil'
            if (sn.includes('argentina') || sn.includes('primera nacional') || sn.includes('liga profissional')) sCountry = 'argentina'
            if (sn.includes('inglesa') || sn.includes('premier league') || sn.includes('fa cup')) sCountry = 'inglaterra'
        }

        const cCountry = comp.pais ? normalize(comp.pais) : null
        
        // Competitções Continentais/Mundiais não barram por país
        const isCompContinental = !!comp.continente || ['americadosul', 'europa', 'mundo', 'conmebol', 'uefa', 'fifa'].includes(cCountry)

        // 1. Validação de País (Internacionais não barram por país)
        if (cCountry && sCountry && sCountry !== cCountry && !isCompContinental) {
            return false
        }

        // 1.5 FIREWALL EXPLÍCITO (Separação Brasil x Argentina) forçada
        const sName = normalize(s.competitionName)
        const cName = normalize(comp.nome)

        if (cCountry === 'brasil') {
            if (sName.includes('primera nacional') || sName.includes('liga profissional') || sName.includes('argentina')) return false
        }
        if (cCountry === 'argentina') {
            if (sName.includes('brasileirao') || sName.includes('serie a') || sName.includes('serie b') || sName.includes('copa do brasil')) return false
        }

        // Match logic RIGOROSO (Proteção Total entre divisões e tipos)
        if (sName === cName) return true
        
        // Match flexível para Sul-Americana / Sudamericana / Recopa
        const isSulAmer = (name) => (name.includes("sulamericana") || name.includes("sudamericana")) && !name.includes("recopa");
        if (isSulAmer(cName) && isSulAmer(sName)) return true;
        
        const isRecopa = (name) => name.includes("recopa");
        if (isRecopa(cName) && isRecopa(sName)) return true;

        // Bloqueio explícito entre divisões e tipos (Copa, Super, Recopa)
        const matchBlockers = ['serieb', 'seriec', 'seried', 'primeranacional', 'championship', 'recopa', 'super', 'copa'];
        for (const block of matchBlockers) {
            const inC = cName.includes(block);
            const inS = sName.includes(block);
            if (inC !== inS) return false; // Se um tem e o outro não, não casa.
        }

        if (sName.includes(cName) || cName.includes(sName)) {
            // Se passou pelo filtro de bloqueadores acima, podemos aceitar o match parcial longo
            return sName.length > 5 && cName.length > 5
        }
        
        return false
    })
    
    if (!match) return { registered: false }
    
    const hasValidTopScorer = match.topScorers && match.topScorers.some(s => s.nome && s.nome.trim() !== '')
    const hasValidLegacyScorer = match.artilheiro && match.artilheiro.nome && match.artilheiro.nome.trim() !== ''

    // Verificação de Tabela ou Bracket (Para Copas/Mundial)
    const isMataMata = comp.modoRegistro === 'mata_mata_simples' || normalize(comp.nome).includes('mundial')
    const hasBracket = match.mundial && match.mundial.final && match.mundial.final.time1
    const hasTable = !!match.tabela || (isMataMata && hasBracket)

    // Um registro só é considerado válido/visível se tiver dados reais
    const isReallyRegistered = match.campeao || hasTable || hasValidTopScorer || hasValidLegacyScorer;

    return {
        registered: !!isReallyRegistered,
        champion: match.campeao,
        id: match.id,
        hasTable,
        hasScorers: hasValidTopScorer || hasValidLegacyScorer
    }
}
</script>

<style scoped>
.checklist-container {
    padding-bottom: 5rem;
    background: #000;
}
.cursor-pointer { cursor: pointer; }

/* Wrapper centralizado (aprox meio da tela) */
.checklist-main-wrapper {
    max-width: 800px;
    width: 95%;
}

.header-year-premium {
    background: rgba(40, 40, 40, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s;
}

.header-year-premium:hover {
    background: rgba(60, 60, 60, 0.6) !important;
    border-color: var(--bs-warning);
}

.slim-checklist-row {
    background: rgba(20, 20, 20, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.03);
    margin-bottom: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

/* Efeito de Hover "Brabo" */
.slim-checklist-row:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    transform: scale(1.01) translateX(5px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 
                inset 0 0 20px rgba(255, 255, 255, 0.05);
    z-index: 10;
}

/* Brilho lateral no hover */
.slim-checklist-row::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg, 
        transparent, 
        rgba(255, 255, 255, 0.05), 
        transparent
    );
    transition: 0.5s;
}

.slim-checklist-row:hover::before {
    left: 100%;
}

.row-registered {
    border-left: 4px solid var(--bs-success) !important;
}

.row-registered:hover {
    box-shadow: -5px 0 20px rgba(25, 135, 84, 0.2), 
                0 10px 30px rgba(0,0,0,0.5);
}

.row-pending {
    border-left: 4px solid rgba(220, 53, 69, 0.3) !important;
}

.row-pending:hover {
    border-left-color: var(--bs-danger) !important;
    box-shadow: -5px 0 20px rgba(220, 53, 69, 0.1), 
                0 10px 30px rgba(0,0,0,0.5);
}

/* Animação dos ícones de status no hover */
.slim-checklist-row:hover .status-icon-center i {
    transform: scale(1.2) rotate(5deg);
    filter: drop-shadow(0 0 8px currentColor);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slim-checklist-row:hover .comp-logo-img {
    transform: scale(1.1);
    filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
    transition: all 0.3s ease;
}

.comp-name-label {
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.text-secondary-light {
    color: #999 !important; /* Muito mais legível que antes */
}

.comp-logo-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.comp-logo-box {
    width: 28px;
    display: flex;
    justify-content: center;
}

.status-icon-center {
    width: 35px;
    text-align: center;
    font-size: 1.1rem;
}

.status-final-box {
    width: 30px;
    display: flex;
    justify-content: center;
}

.animated-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.truncate-100 {
    display: inline-block;
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ls-2 { letter-spacing: 2px; }
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.6rem; }
.badge { font-size: 0.65rem; border-radius: 4px; }

/* DESTAQUE INTERNACIONAL (PEDIDO USUÁRIO) */
.intl-row-bg {
    background: rgba(0, 150, 255, 0.05) !important;
}
.intl-row-bg:hover {
    background: rgba(0, 150, 255, 0.12) !important;
}
</style>
