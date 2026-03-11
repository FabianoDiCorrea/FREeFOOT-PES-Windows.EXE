<template>
  <div class="view-container animated-fade-in" v-if="competition">
    <!-- Cabeçalho Compacto -->
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <div class="d-flex align-items-center gap-3">
        <button @click="$router.back()" class="btn-back-clean">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h2 class="m-0 fw-black text-uppercase ls-1 competition-title-top">{{ competition.nome }}</h2>
          <div class="text-secondary x-small fw-bold text-uppercase opacity-50">{{ competition.pais }} • {{ competition.tipo }}</div>
        </div>
      </div>
      <LogoFREeFOOT size="3rem" />
    </div>

    <!-- RESUMO DE ESTATÍSTICAS (Grid Horizontal Clean) -->
    <div class="stats-summary-grid mb-4">
      <div class="stats-card-clean">
        <div class="stats-val">{{ history.length }}</div>
        <div class="stats-lab">Temporadas</div>
      </div>

      <div class="stats-card-clean highlight-gold" v-if="maiorCampeao">
        <div class="d-flex align-items-center gap-3">
          <TeamShield :teamName="maiorCampeao.nome" :size="48" borderless class="cursor-pointer" @click="navigateToClubHistory(maiorCampeao.nome)" />
          <div class="text-start">
            <div class="stats-val">{{ maiorCampeao.nome }}</div>
            <div class="d-flex align-items-center gap-2 mb-1" v-if="isInternational && getClubInfo(maiorCampeao.nome)">
               <template v-if="competition.modoRegistro === 'mundial'">
                   <img :src="getClubInfo(maiorCampeao.nome).federacaoLogo" style="height: 10px; width: auto;" />
                   <span class="x-small fw-bold text-uppercase opacity-75" style="font-size: 0.6rem;">{{ getClubInfo(maiorCampeao.nome).federacao }}</span>
                   <span class="opacity-25 mx-0">|</span>
               </template>
               <NationalFlag :countryName="getClubInfo(maiorCampeao.nome).pais" :size="12" />
               <span class="x-small fw-bold text-uppercase opacity-75" style="font-size: 0.65rem;">{{ getClubInfo(maiorCampeao.nome).pais }}</span>
            </div>
            <div class="stats-lab text-warning">Líder de Títulos ({{ maiorCampeao.titulos }})</div>
          </div>
        </div>
      </div>

      <div class="stats-card-clean" v-if="liderVices">
        <div class="d-flex align-items-center gap-3">
          <TeamShield :teamName="liderVices.nome" :size="48" borderless class="cursor-pointer" @click="navigateToClubHistory(liderVices.nome)" />
          <div class="text-start">
             <div class="stats-val small-val">{{ liderVices.nome }}</div>
             <div class="d-flex align-items-center gap-2 mb-1" v-if="isInternational && getClubInfo(liderVices.nome)">
                 <template v-if="competition.modoRegistro === 'mundial'">
                     <img :src="getClubInfo(liderVices.nome).federacaoLogo" style="height: 8px; width: auto;" />
                     <span class="x-small fw-bold text-uppercase opacity-50" style="font-size: 0.55rem;">{{ getClubInfo(liderVices.nome).federacao }}</span>
                     <span class="opacity-25 mx-0">|</span>
                 </template>
                 <NationalFlag :countryName="getClubInfo(liderVices.nome).pais" :size="10" />
                 <span class="x-small fw-bold text-uppercase opacity-50" style="font-size: 0.6rem;">{{ getClubInfo(liderVices.nome).pais }}</span>
             </div>
             <div class="stats-lab">Mais Vices ({{ liderVices.count }})</div>
          </div>
        </div>
      </div>

      <template v-if="competition.tipo === 'Liga'">
        <div class="stats-card-clean" v-if="liderAcessos && liderAcessos.count > 0">
          <div class="d-flex align-items-center gap-3">
             <TeamShield :teamName="liderAcessos.nome" :size="48" borderless class="cursor-pointer" @click="navigateToClubHistory(liderAcessos.nome)" />
             <div class="text-start">
               <div class="stats-val small-val">{{ liderAcessos.nome }}</div>
               <div class="stats-lab text-success">Mais Acessos ({{ liderAcessos.count }})</div>
             </div>
          </div>
        </div>
        <div class="stats-card-clean" v-if="liderRebaixamentos && liderRebaixamentos.count > 0 && isRelegationCountry">
          <div class="d-flex align-items-center gap-3">
             <TeamShield :teamName="liderRebaixamentos.nome" :size="48" borderless class="cursor-pointer" @click="navigateToClubHistory(liderRebaixamentos.nome)" />
             <div class="text-start">
               <div class="stats-val small-val">{{ liderRebaixamentos.nome }}</div>
               <div class="stats-lab text-danger">Mais Rebaixamentos ({{ liderRebaixamentos.count }})</div>
             </div>
          </div>
        </div>
      </template>
    </div>



    <!-- LISTA DE TEMPORADAS (Estilo Lista Clean) -->
    <div class="history-list-wrapper">
      <div class="history-list-header px-4 py-2 border-bottom border-secondary border-opacity-10">
        <div class="row align-items-center x-small fw-black text-secondary text-uppercase ls-1">
          <div class="col-1">ANO</div>
          <div class="col-3">CAMPEÃO</div>
          <div class="col-2">VICE</div>
          <div class="col-5">EXTRAS</div>
          <div class="col-1"></div>
        </div>
      </div>

      <div v-for="s in history" :key="s.id" class="history-list-item px-4 py-1 border-bottom border-secondary border-opacity-10">
        <div class="row align-items-center">
          <!-- ANO -->
          <div class="col-1">
            <span class="fw-black fs-5">{{ s.ano?.replace('/', ' / ') }}</span>
          </div>

          <!-- CAMPEÃO -->
          <div class="col-3">
            <div class="d-flex align-items-center gap-2">
              <img v-if="competition && competition.trofeu" 
                   :src="getTrofeuPath(competition.trofeu)" 
                   class="trofeu-hist" 
                   alt="Troféu"
                   @error="e => e.target.style.display='none'">
              <TeamShield :teamName="s.campeao" :size="24" borderless :season="s.ano" class="cursor-pointer" @click="navigateToClubHistory(s.campeao)" />
              <div class="d-flex flex-column lh-1">
                <span class="fw-bold text-uppercase name-champion d-flex align-items-center">
                    {{ s.campeao }}
                    <i v-if="careerStore.isUserTeam(s.campeao, s.ano)" class="bi bi-controller text-neon-green pulse-neon ms-1" style="font-size: 1.1rem;"></i>
                    <span v-if="maiorCampeao && s.campeao === maiorCampeao.nome" class="ms-1" title="Rei de Copas">👑</span>
                </span>
                <div v-if="isInternational && getClubInfo(s.campeao)" class="d-flex align-items-center gap-1 opacity-50 mt-1">
                    <template v-if="competition.modoRegistro === 'mundial'">
                        <img :src="getClubInfo(s.campeao).federacaoLogo" style="height: 8px; width: auto;" />
                        <span class="x-small fw-bold text-uppercase" style="font-size: 0.55rem;">{{ getClubInfo(s.campeao).federacao }}</span>
                        <span class="opacity-25 mx-0">|</span>
                    </template>
                    <NationalFlag :countryName="getClubInfo(s.campeao).pais" :size="10" />
                    <span class="x-small fw-bold text-uppercase" style="font-size: 0.6rem;">{{ getClubInfo(s.campeao).pais }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- VICE -->
          <div class="col-2">
            <div class="d-flex align-items-center gap-2 opacity-75" v-if="s.vice">
              <TeamShield :teamName="s.vice" :size="20" borderless :season="s.ano" class="cursor-pointer" @click="navigateToClubHistory(s.vice)" />
              <div class="d-flex flex-column lh-1" style="min-width: 0;">
                <span class="text-secondary small fw-bold text-uppercase text-truncate d-flex align-items-center gap-1">
                  {{ s.vice }}
                  <i v-if="s.vice && careerStore.isUserTeam(s.vice, s.ano)" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 1.1rem;"></i>
                </span>
                <div v-if="isInternational && getClubInfo(s.vice)" class="d-flex align-items-center gap-1 opacity-50 mt-1">
                  <template v-if="competition.modoRegistro === 'mundial'">
                      <img :src="getClubInfo(s.vice).federacaoLogo" style="height: 8px; width: auto;" />
                      <span style="font-size: 0.55rem;" class="fw-bold text-uppercase">{{ getClubInfo(s.vice).federacao }}</span>
                      <span class="opacity-25 mx-0">|</span>
                  </template>
                  <NationalFlag :countryName="getClubInfo(s.vice).pais" :size="10" />
                  <span style="font-size: 0.6rem;" class="fw-bold text-uppercase">{{ getClubInfo(s.vice).pais }}</span>
                </div>
              </div>
            </div>
            <span v-else class="opacity-10 small">—</span>
          </div>

          <!-- EXTRAS (Acessos/Rebaixados) -->
          <div class="col-5">
            <div class="d-flex flex-column gap-2 py-1">
              <div v-if="competition.tipo === 'Liga' && s.promovidosList && s.promovidosList.length" class="extra-group access">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="icon-label">⬆ ACESSOS</span>
                </div>
                <div class="extra-names-wrap">
                  <div v-for="(t, tidx) in s.promovidosList" :key="tidx" class="extra-team-item">
                    <TeamShield :teamName="t" :size="16" borderless :season="s.ano" />
                    <span class="name text-truncate d-flex align-items-center gap-1">
                      {{ t }}
                      <i v-if="careerStore.isUserTeam(t, s.ano)" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 0.9rem;"></i>
                    </span>
                    <span v-if="tidx < s.promovidosList.length - 1" class="sep">•</span>
                  </div>
                </div>
              </div>

              <!-- REBAIXADOS -->
              <div v-if="competition.tipo === 'Liga' && s.rebaixadosList && s.rebaixadosList.length && isRelegationCountry" class="extra-group relegation">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="icon-label">↓ REBAIXADOS</span>
                </div>
                <div class="extra-names-wrap">
                  <div v-for="(t, tidx) in s.rebaixadosList" :key="tidx" class="extra-team-item">
                    <TeamShield :teamName="t" :size="16" borderless :season="s.ano" />
                    <span class="name text-truncate d-flex align-items-center gap-1">
                      {{ t }}
                      <i v-if="careerStore.isUserTeam(t, s.ano)" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 0.9rem;"></i>
                    </span>
                    <span v-if="tidx < s.rebaixadosList.length - 1" class="sep">•</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AÇÃO -->
          <div class="col-1 text-end">
            <button @click="$router.push('/season/' + s.id)" class="btn-view-clean" title="Ver Detalhes">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="history.length === 0" class="text-center py-5 opacity-25">
        <i class="bi bi-calendar-x display-4 d-block mb-3"></i>
        Nenhuma temporada registrada.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { seasonService } from '../services/season.service'
import { seasonStore } from '../services/season.store'
import TeamShield from '../components/TeamShield.vue'
import { CLUBS_DATA } from '../data/clubs.data'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { getTrofeuPath, getSeasonFinalYear } from '../services/utils'
import NationalFlag from '../components/NationalFlag.vue'
import { careerStore } from '../services/career.store'

const props = defineProps({
  competition: {
    type: Object,
    default: null
  }
})

const route = useRoute()
const router = useRouter()
const competition = ref(null)
const history = ref([])

onMounted(async () => {
  if (props.competition) {
      competition.value = props.competition
      loadData(props.competition)
  } else {
      loadData()
  }
  await careerStore.loadAll()
})

// Adicionar watcher para quando a prop mudar (ex: trocar de competição no Universo)
watch(() => props.competition, (newVal) => {
    if (newVal) {
        competition.value = newVal
        loadData(newVal)
    }
})
// FIX: Reatividade para carregar dados assim que o store atualizar (ex: ao voltar da tela de edição)
watch(() => seasonStore.list, () => {
    loadData()
}, { deep: true })

const getFederation = (continentName) => {
  if (!continentName) return { nome: 'Federação', logo: '' };
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const normalizedKey = normalize(continentName);
  const key = Object.keys(FEDERATIONS_DATA).find(k => normalize(k) === normalizedKey);
  return FEDERATIONS_DATA[key] || { nome: 'Federação', logo: '' };
}

const getClubInfo = (clubName) => {
  if (!clubName) return null;
  const club = CLUBS_DATA.find(c => c.nome?.toLowerCase().trim() === clubName.toLowerCase().trim());
  if (!club) return null;
  const fed = getFederation(club.continente);
  return {
    pais: club.pais,
    bandeira: club.bandeira_url,
    federacao: fed.nome,
    federacaoLogo: fed.logo
  };
}

const isInternational = computed(() => {
  if (!competition.value) return false
  const isInterType = competition.value.tipo === 'internacional'
  const isWorld = competition.value.pais === 'Mundo' || competition.value.continente === 'Mundo'
  const isContinent = ['América do Sul', 'Europa', 'América do Norte', 'Ásia', 'África', 'Oceania'].includes(competition.value.pais)
  
  return isInterType || isWorld || isContinent
})

const isRelegationCountry = computed(() => {
  if (!competition.value || !competition.value.pais) return false
  const p = competition.value.pais.toLowerCase().trim()
  return p === 'brasil' || p === 'argentina' || p === 'inglaterra'
})

const parseTable = (tableText) => {
  if (!tableText) return []
  const lines = tableText.split('\n').filter(l => l.trim())
  const parsed = []
  
  lines.forEach((line, index) => {
    let cells = line.split('\t')
    if (cells.length === 1) cells = line.split(/\s{2,}/)
    
    // Tenta extrair nome se falhar
    if (cells.length === 1) {
       const match = line.match(/^(\d+)?\.?\s*([^\d]+)(.*)$/)
       if (match) {
         cells = [match[2].trim()]
       }
    }
    
    let teamName = cells[0]?.trim();
    if (/^\d+$/.test(teamName) || /^\d+\.?$/.test(teamName)) {
        teamName = cells[1]?.trim();
    }

    if (teamName) {
      parsed.push({
        pos: index + 1,
        team: teamName
      })
    }
  })
  return parsed
}

const loadData = async (compOverride = null) => {
  if (compOverride) {
      competition.value = compOverride
  } else {
      const compId = parseInt(route.params.id)
      const allComps = [
        ...ALL_COMPETITIONS_DATA.flatMap(c => c.paises.flatMap(p => p.competicoes)),
        ...ALL_COMPETITIONS_DATA.flatMap(c => (c.continentais || [])),
        ...INTERNATIONAL_DATA
      ]
      competition.value = allComps.find(c => c.id === compId)
  }
  
  if (competition.value) {
    // ESTRATÉGIA DE FILTRO LOCAL (Mais robusta para casos como Primera Nacional)
    const allSeasons = await seasonService.getAll()
    
    const normalize = (str) => {
        if (!str) return ""
        return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
    }
    const targetName = normalize(competition.value.nome)
    const targetCountry = competition.value.pais ? normalize(competition.value.pais) : null

    const filtered = allSeasons.filter(s => {
        const sName = normalize(s.competitionName)
        let sCountry = s.pais ? normalize(s.pais) : null

        // 0. Inferência de País
        if (!sCountry) {
            if (sName.includes('brasileirao') || sName.includes('copa do brasil')) sCountry = 'brasil';
            if (sName.includes('argentina') || sName.includes('primera nacional') || sName.includes('liga profissional')) sCountry = 'argentina';
        }

        // 1. Bloqueio de País (se ambos definidos e diferentes)
        const isInternational = targetCountry && ['AMERICA DO SUL', 'EUROPA', 'CONMEBOL', 'UEFA', 'MUNDO', 'INTERNACIONAL', 'FIFA'].includes(targetCountry.toUpperCase());
        if (targetCountry && sCountry && sCountry !== targetCountry && !isInternational) return false;

        // 2. Proteção Recopa vs Sul-Americana
        const isTargetRecopa = targetName.includes('recopa');
        const isSeasonRecopa = sName.includes('recopa');
        if (isTargetRecopa !== isSeasonRecopa) return false; // Se um é recopa e o outro não, barra.

        // 3. Match de Nome
        if (sName === targetName) return true;
        
        if (targetName.includes('primera nacional') && sName.includes('primera nacional')) return true;
        if ((targetName.includes('profissional') || targetName.includes('liga argentina')) && 
            (sName.includes('profissional') || sName.includes('liga argentina'))) return true;

        if (sName.includes(targetName) || targetName.includes(sName)) {
            // Bloqueio de sub-strings curtas demais ou divisões
            if (sName.length <= 5 && sName !== targetName) return false;
            if ((sName.includes('serie b') || sName.includes('serie a')) && sName !== targetName) return false;
            return true;
        }

        return false;
    })

    // Deduplicação por Ano Final para evitar contagem dupla de registros sujos
    const seenYears = new Set()
    const uniqueSeasons = filtered.filter(s => {
        const fYear = getSeasonFinalYear(s.ano)
        if (seenYears.has(fYear)) return false
        seenYears.add(fYear)
        return true
    })

    console.log('HISTORY LOCAL FILTER:', uniqueSeasons.length, 'unique seasons found.')
    
    // Process promoted/relegated from table data
    history.value = uniqueSeasons.map(s => {
      let rebaixadosList = []
      let promovidosList = []

      // Lógica de Rebaixamento (Prioridade para Argentina 4 times)
      const isArgentinaA = competition.value.nome === 'Liga Profissional' || competition.value.nome === 'Primera División' || competition.value.nome === 'Liga Argentina'
      
      if (s.tabela) {
        const lines = s.tabela.split('\n').filter(l => l.trim())
        const teams = []
        
        lines.forEach(line => {
            let cells = line.split('\t')
            if (cells.length === 1) cells = line.split(/\s{2,}/)
            if (cells.length === 1) {
               const match = line.match(/^([^\d]+)(.*)$/)
               if (match) cells = [match[1].trim()]
            }
            if (cells[0]) teams.push(cells[0].trim())
        })

        // Rebaixados
        let countRelegation = competition.value.rebaixados || 0
        if (isArgentinaA) countRelegation = 4 // Forçar 4 para Argentina
        
        if (countRelegation > 0 && teams.length >= countRelegation) {
           rebaixadosList = teams.slice(-countRelegation)
        }

      // Promovidos (Lógica de Quota: Direto + Playoff)
      let countPromotion = competition.value.promovidos || 0
      if (countPromotion > 0 && teams.length > 0) {
        const manualPromoted = s.promovidosPlayoff || []
        const normManual = manualPromoted.map(p => normalize(p))
        const directCount = Math.max(0, countPromotion - manualPromoted.length)
        
        // Pega os que não foram selecionados manualmente mas estão no topo
        const directPromoted = teams
           .slice(0, directCount + manualPromoted.length) // Pega uma margem maior para filtrar
           .filter(t => !normManual.includes(normalize(t)))
           .slice(0, directCount)

        // IMPORTANTE: Ordenar pela classificação (ordem na tabela original)
        promovidosList = [...manualPromoted, ...directPromoted].sort((a, b) => {
             const idxA = teams.findIndex(t => normalize(t) === normalize(a))
             const idxB = teams.findIndex(t => normalize(t) === normalize(b))
             return idxA - idxB
        })
      }
    }

      const parsedTable = parseTable(s.tabela)

      return {
        ...s,
        rebaixadosList, 
        promovidosList,
        parsedTable
      }
    }).sort((a, b) => {
        const yearA = parseInt(a.ano.split('/')[0]) || 0
        const yearB = parseInt(b.ano.split('/')[0]) || 0
        return yearB - yearA
    })
  }
}





// ESTATÍSTICAS COMPUTADAS
const getLeader = (key) => {
    if (history.value.length === 0) return null
    const counts = {}
    history.value.forEach(s => {
        if (key === 'campeao') {
            counts[s.campeao] = (counts[s.campeao] || 0) + 1
        } else if (key === 'vice' && s.vice) {
            counts[s.vice] = (counts[s.vice] || 0) + 1
        } else if (key === 'promovidos' && s.promovidosList) {
            s.promovidosList.forEach(t => counts[t] = (counts[t] || 0) + 1)
        } else if (key === 'rebaixados' && s.rebaixadosList) {
            s.rebaixadosList.forEach(t => counts[t] = (counts[t] || 0) + 1)
        }
    })
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    if (sorted.length === 0) return null
    return { nome: sorted[0], count: counts[sorted[0]] }
}

const maiorCampeao = computed(() => {
    const leader = getLeader('campeao')
    if (!leader) return null
    
    // Adicionar info de país para o card
    const info = getClubInfo(leader.nome)
    
    return { 
        nome: leader.nome, 
        titulos: leader.count,
        pais: info ? info.pais : null
    }
})

const liderVices = computed(() => {
    const leader = getLeader('vice')
    if (!leader) return null
    
    // Adicionar info de país para o card
    const info = getClubInfo(leader.nome)
    
    return { 
        nome: leader.nome, 
        count: leader.count,
        pais: info ? info.pais : null
    }
}) 
const liderAcessos = computed(() => getLeader('promovidos'))
const liderRebaixamentos = computed(() => getLeader('rebaixados'))

const navigateToClubHistory = (name) => {
  router.push({ name: 'club-history', params: { id: encodeURIComponent(name) } })
}

onMounted(loadData)
</script>

<style scoped>
.view-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
}

.btn-back-clean {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.btn-back-clean:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-3px);
}

.competition-title-top {
    font-size: 1.5rem;
    letter-spacing: 1px;
}

/* STATS GRID */
.stats-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stats-card-clean {
    background: rgba(15, 25, 40, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1.25rem;
    border-radius: 12px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: all 0.3s;
}

.stats-card-clean.highlight-gold {
    background: linear-gradient(145deg, rgba(255, 215, 0, 0.05), rgba(0, 0, 0, 0.4));
    border-color: rgba(255, 215, 0, 0.2);
}

.stats-val {
    font-size: 1.75rem;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 0.25rem;
}
.stats-val.small-val {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.stats-lab {
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 1.5px;
    opacity: 0.5;
}

/* HISTORY LIST */
.history-list-wrapper {
    background: rgba(10, 15, 25, 0.4);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
}

.history-list-header {
    background: rgba(255, 255, 255, 0.02);
}

.history-list-item {
    transition: all 0.2s;
    background: transparent;
}

.history-list-item:hover {
    background: rgba(255, 255, 255, 0.04) !important;
    transform: scale(1.005);
    z-index: 10;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.name-champion {
    font-size: 0.85rem;
    letter-spacing: 0.3px;
}

.trofeu-hist {
    height: 24px;
    width: auto;
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.3));
    flex-shrink: 0;
}

/* EXTRA ITEMS (ACESSOS/REBAIXADOS) */
.extra-group {
    display: flex;
    flex-direction: column;
}
.extra-group.access .icon-label { color: #58ffc1; font-size: 0.6rem; font-weight: 900; letter-spacing: 0.5px; opacity: 0.8; }
.extra-group.relegation .icon-label { color: #ff5858; font-size: 0.6rem; font-weight: 900; letter-spacing: 0.5px; opacity: 0.8; }

.extra-group.countries-info .icon-label { font-size: 0.8rem; }
.extra-country-name {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.gold-label { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); }
.silver-label { filter: drop-shadow(0 0 5px rgba(192, 192, 192, 0.4)); }

.extra-names-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    row-gap: 2px;
}

.extra-team-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    font-weight: 600;
}

.extra-team-item .name {
    max-width: 150px;
    text-transform: uppercase;
    opacity: 0.9;
}

.extra-team-item .sep {
    opacity: 0.2;
    margin-left: 2px;
}

.btn-view-clean {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    font-size: 1.25rem;
    padding: 0.5rem;
    transition: all 0.2s;
}
.btn-view-clean:hover {
    color: var(--bs-info);
    transform: translateX(3px);
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animated-fade-in {
    animation: fadeIn 0.4s ease-out;
}

.text-neon-green {
  color: #39ff14;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8), 0 0 18px rgba(57, 255, 20, 0.4);
}

.pulse-neon {
  animation: pulse-neon-anim 2s infinite;
  display: inline-block;
}

@keyframes pulse-neon-anim {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.7; transform: scale(1); }
}
</style>
