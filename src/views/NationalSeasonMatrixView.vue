<template>
  <div class="country-matrix-container p-2 min-vh-100 bg-dark text-white">
    <!-- TOOLBAR SUPERIOR -->
    <div class="d-flex justify-content-between align-items-center mb-3 px-3 py-2 bg-glass border-bottom border-white border-opacity-10 shadow-lg">
      <div class="d-flex align-items-center gap-4">
        <button @click="$router.push(`/selecao/${continentId}/historico`)" class="btn btn-sm btn-action hover-glow px-3 me-2">
          <i class="bi bi-table me-2"></i>HISTÓRICO
        </button>
        <button @click="$router.push('/universo')" class="btn btn-sm btn-outline-info hover-glow px-3">
          <i class="bi bi-trophy me-2"></i>COMPETIÇÕES
        </button>
        <div class="d-flex align-items-center gap-2">
          <img :src="federationLogo" class="rounded-circle bg-white p-1" style="width: 32px; height: 32px; object-fit: contain;" v-if="federationLogo" />
          <h4 class="m-0 text-uppercase fw-black ls-2 title-expert">MATRIZ EXPERT <span class="text-info opacity-50 ms-2">// {{ continentId }}</span></h4>
        </div>
      </div>
      
      <!-- FILTROS EXPERT -->
      <div class="d-flex align-items-center gap-2 bg-dark bg-opacity-50 p-1 rounded border border-white border-opacity-10">
        <span class="small fw-bold text-info ms-2 opacity-75">ORDENAR POR:</span>
        <select v-model="sortYear" class="form-select form-select-sm expert-select w-auto">
          <option value="">ALFABÉTICA</option>
          <option v-for="y in sortedSeasons" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="sortSlot" class="form-select form-select-sm expert-select w-auto" :disabled="!sortYear">
          <option v-for="slot in countrySlots" :key="slot.key" :value="slot.key">{{ slot.label }}</option>
        </select>
      </div>

      <LogoFREeFOOT :size="35" />
    </div>

    <!-- MENSAGENS DE STATUS -->
    <div v-if="seasonStore.loading" class="p-5 text-center">
      <div class="spinner-border text-info mb-3"></div>
      <p class="opacity-50 fw-bold">CARREGANDO DADOS DO UNIVERSO...</p>
    </div>
    <div v-else-if="sortedTeams.length === 0" class="p-5 text-center bg-black bg-opacity-40 rounded border border-white border-opacity-10 m-2">
      <i class="bi bi-exclamation-triangle fs-1 text-warning mb-3 d-block"></i>
      <h4 class="fw-black text-uppercase">Nenhum dado encontrado</h4>
      <p class="opacity-50">Não há registros de temporadas ou seleções vinculadas a <strong>{{ continentId }}</strong> no momento.</p>
    </div>

    <!-- TABELA ESTILO EXCEL -->
    <div v-else class="matrix-xl-wrapper custom-scrollbar shadow-2xl border border-white border-opacity-10 rounded overflow-auto glass-table m-1">
      <table class="matrix-xl-table mb-0">
        <thead>
          <!-- LINHA 1: TEMPORADAS -->
          <tr>
            <th rowspan="3" class="sticky-club first-col-header bg-black text-center border-all">
              SELEÇÃO
            </th>
            <th v-for="season in sortedSeasons" :key="'s'+season" :colspan="countrySlots.length" class="season-group-header border-all text-center">
              {{ season }}
            </th>
          </tr>

          <!-- LINHA 2: LOGOS / TÍTULOS DE COMPETIÇÃO -->
          <tr>
            <template v-for="season in sortedSeasons" :key="'l'+season">
              <th v-for="slot in countrySlots" :key="season+slot.key+'_logo'" class="bg-liga-header border-all text-center py-2" :class="{ 'bg-intl-header': slot.type === 'intl' }">
                <div class="d-flex flex-column align-items-center gap-1">
                  <img :src="slot.logo" class="liga-header-logo" v-if="slot.logo" />
                  <span class="header-main-label" v-else>{{ slot.label }}</span>
                </div>
              </th>
            </template>
          </tr>

          <!-- LINHA 3: SUB-DIVISÕES -->
          <tr>
            <template v-for="season in sortedSeasons" :key="'sd'+season">
              <th v-for="slot in countrySlots" :key="season+slot.key" class="slot-header border-all text-center px-0" 
                  :class="[
                    { 'last-of-season': isLastSlot(slot) }
                  ]">
                {{ slot.shortLabel || slot.label }}
              </th>
            </template>
          </tr>
        </thead>

        <tbody>
          <tr v-for="team in sortedTeams" :key="team" class="club-row-xl">
            <!-- COLUNA FIXA: SELEÇÃO -->
            <td class="sticky-club club-info-cell border-all px-2">
              <div class="d-flex align-items-center gap-2">
                <NationalFlag :countryName="teamNames[team] || team" :size="20" />
                <span class="club-name-text d-flex align-items-center gap-1">
                  {{ teamNames[team] || team }}
                </span>
              </div>
            </td>

            <!-- CÉLULAS DE DADOS -->
            <template v-for="season in sortedSeasons" :key="team+season">
                <td v-for="slot in countrySlots" 
                    :key="team+season+slot.key" 
                    class="matrix-xl-cell border-all text-center"
                    :class="[
                      getCellBackground(team, season, slot), 
                      { 'last-of-season': isLastSlot(slot) }
                    ]">
                   <span class="cell-rank-text">{{ getRank(team, season, slot) }}</span>
                </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- LEGENDA EXPERT COMPACTA -->
    <div class="mt-2 d-flex flex-wrap gap-3 align-items-center small opacity-75 px-2">
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-gold-bg neon-border-gold" style="width: 12px; height: 12px;"></div> 
        <span>Campeão</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-silver-bg neon-border-silver" style="width: 12px; height: 12px;"></div> 
        <span>Vice</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-blue-intl-bg" style="width: 12px; height: 12px; border: 1px solid #44d2ff;"></div> 
        <span>Colocação</span>
      </div>
      <div class="ms-auto opacity-50">{{ sortedTeams.length }} Seleções | {{ sortedSeasons.length }} Temporadas</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { rankingsStore } from '../services/rankings.store'
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data'
import { NATIONAL_COMPETITIONS_STRUCTURE } from '../services/national.data'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { normalizeYearStrict } from '../services/utils'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'

const route = useRoute()
const continentId = computed(() => route.params.id)

const sortYear = ref('')
const sortSlot = ref('')

const countrySlots = ref([])

const federationLogo = computed(() => {
  if (!continentId.value) return null;
  return FEDERATIONS_DATA[continentId.value]?.logo;
})

const setupSlots = () => {
    const slots = []
    const continentVal = continentId.value;

    // 1. Buscar competições deste continente
    const structure = NATIONAL_COMPETITIONS_STRUCTURE.find(s => s.continente === continentVal);
    if (structure) {
        structure.competicoes.forEach(comp => {
            slots.push({
                key: `comp_${comp.id}`,
                label: comp.nome,
                shortLabel: comp.nome.includes('Eliminatórias') ? 'Elim' : 'Copa',
                type: 'national',
                logo: comp.logo
            });
        });
    }

    // 2. Adicionar Copa do Mundo
    const worldCup = NATIONAL_COMPETITIONS_STRUCTURE.find(s => s.continente === 'Mundial')?.competicoes[0];
    if (worldCup) {
        slots.push({
            key: `comp_${worldCup.id}`,
            label: 'Copa do Mundo',
            shortLabel: 'Mundo',
            type: 'intl',
            logo: worldCup.logo
        });
    }

    countrySlots.value = slots;
    if (slots.length > 0 && !sortSlot.value) {
        sortSlot.value = slots[0].key;
    }
}

const processedMatrix = computed(() => {
    const data = {}
    const seasonsSet = new Set()
    const teamsSet = new Set()
    const namesMap = {}

    const normalize = (s) => s?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""
    const fedUrl = FEDERATIONS_DATA[continentId.value]?.logo;

    if (!seasonStore.list || seasonStore.list.length === 0) {
        return { data, seasons: [], teams: [], names: {} }
    }

    // 1. Identificar seleções do continente
    const continentTeamsNormalized = NATIONAL_TEAMS_DATA.filter(t => t.continente === fedUrl).map(t => normalize(t.nome));

    seasonStore.list.forEach(season => {
        // Verifica se a temporada tem dados de tabela e nome de competição
        if (!season.tabela || !season.competitionName) return

        const tableStr = season.tabela || ''
        const table = parseTable(tableStr)
        const yearRaw = season.ano
        const year = normalizeYearStrict(yearRaw)
        const compName = normalize(season.competitionName)

        table.forEach((row, index) => {
            const teamNameRaw = row.time
            const teamNameNorm = normalize(teamNameRaw)

            // Filtra seleções que não pertencem ao continente atual
            if (!continentTeamsNormalized.includes(teamNameNorm)) return

            // Determinar Slot
            let slotKey = null
            countrySlots.value.forEach(slot => {
                if (normalize(slot.label) === compName) {
                    slotKey = slot.key
                }
            })

            if (slotKey) {
                if (!data[teamNameNorm]) {
                    data[teamNameNorm] = {}
                    const originalTeam = NATIONAL_TEAMS_DATA.find(t => normalize(t.nome) === teamNameNorm)
                    namesMap[teamNameNorm] = originalTeam ? originalTeam.nome : teamNameRaw
                }
                if (!data[teamNameNorm][year]) data[teamNameNorm][year] = {}
                
                let rank = index + 1
                if (row.extra) {
                    const derivedRank = getRankFromExtra(row.extra)
                    if (derivedRank !== 999) rank = derivedRank
                }

                if (!data[teamNameNorm][year][slotKey] || rank < data[teamNameNorm][year][slotKey].rank) {
                    data[teamNameNorm][year][slotKey] = { rank }
                }
                
                teamsSet.add(teamNameNorm)
                seasonsSet.add(year)
            }
        })
    })

    const sortedSeasonsList = Array.from(seasonsSet).sort((a, b) => parseInt(a) - parseInt(b))
    const sortedTeamsList = Array.from(teamsSet).sort((a, b) => {
        if (sortYear.value && sortSlot.value) {
            const resA = data[a]?.[sortYear.value]?.[sortSlot.value]?.rank || 999
            const resB = data[b]?.[sortYear.value]?.[sortSlot.value]?.rank || 999
            if (resA !== resB) return resA - resB
        }
        return a.localeCompare(b)
    })

    return { data, seasons: sortedSeasonsList, teams: sortedTeamsList, names: namesMap }
})

const sortedSeasons = computed(() => processedMatrix.value.seasons)
const sortedTeams = computed(() => processedMatrix.value.teams)
const matrixData = computed(() => processedMatrix.value.data)
const teamNames = computed(() => processedMatrix.value.names)

const parseTable = (str) => {
    if (!str) return [];
    return str.split('\n').filter(l => l.trim()).map(line => {
        let cells = line.split('\t');
        if (cells.length === 1) cells = line.split(/\s{2,}/);
        let teamName = cells[0]?.trim();
        let extra = '';
        if (/^\d+$/.test(teamName) || /^\d+\.?$/.test(teamName)) {
            teamName = cells[1]?.trim();
            if (cells[2]) extra = cells[2].trim();
        } else {
             if (cells[1]) extra = cells[1].trim();
        }
        return { time: teamName, extra };
    }).filter(x => x.time);
}

const getRankFromExtra = (extra) => {
    if (!extra) return 999;
    const e = extra.toUpperCase();
    if (e.includes('CAMPEÃO') || e === 'CAMPEAO') return 1;
    if (e.includes('VICE') || e.includes('2º')) return 2;
    if (e.includes('SEMIFINAL') || e.includes('4º') || e === '3º') return 4;
    if (e.includes('QUARTAS') || e.includes('8º')) return 8;
    if (e.includes('OITAVAS') || e.includes('16º')) return 16;
    if (e.includes('16 AVOS')) return 24;
    if (e.includes('GRUPOS') || e.includes('32º')) return 32;
    if (e.includes('PRÉ') || e.includes('PRE')) return 64;
    return 999;
}

const getRank = (team, season, slot) => {
  const result = matrixData.value[team]?.[season]?.[slot.key]
  if (!result) return ''
  if (rank === 1) return '🏆 1º'
  if (rank === 2) return '🥈 2º'
  if (rank === 4) return '4º'
  if (rank === 8) return '8º'
  if (rank === 16) return '16º'
  if (rank === 24) return '16 AVOS'
  if (rank === 32) return 'GF'
  if (rank === 64) return 'P-LIB'
  return rank + 'º'
}

const getCellBackground = (team, season, slot) => {
  const result = matrixData.value[team]?.[season]?.[slot.key]
  if (!result) return ''
  const rank = result.rank
  if (rank === 1) return 'expert-gold-bg neon-border-gold'
  if (rank === 2) return 'expert-silver-bg neon-border-silver'
  if (rank === 4) return 'expert-bronze-intl-grad'
  if (rank === 8) return 'expert-green-intl-grad'
  if (rank === 16) return 'expert-cyan-intl-grad'
  if (rank === 24) return 'expert-blue-intl-grad'
  if (rank === 32) return 'expert-red-light-intl-grad'
  return 'expert-blue-intl-bg'
}

const isLastSlot = (slot) => {
  if (countrySlots.value.length === 0) return false
  return slot.key === countrySlots.value[countrySlots.value.length - 1].key
}

watch(() => route.params.id, () => {
    setupSlots()
}, { immediate: true })

onMounted(async () => {
    await seasonStore.loadAll()
    setupSlots()
})
</script>

<style scoped>
.country-matrix-container {
  background: radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0c0c14 100%);
  position: relative;
  overflow: hidden;
}

.country-matrix-container::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url("https://www.transparenttextures.com/patterns/carbon-fibre.png");
  opacity: 0.15;
  pointer-events: none;
}

.bg-glass {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.title-expert {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  font-size: 1.1rem;
}

.expert-select {
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.expert-select:focus {
  background-color: #000;
  color: #00f2ff;
  border-color: #00f2ff;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
}

.glass-table {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
}

.matrix-xl-wrapper {
  max-height: 82vh;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.matrix-xl-table {
  border-collapse: collapse;
  table-layout: fixed;
  color: #fff;
}

.border-all {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sticky-club {
  position: sticky;
  left: 0;
  z-index: 20;
  background: #0b0b13;
  min-width: 220px;
  width: 220px;
  border-right: 2px solid #00f2ff55 !important;
}

thead th {
  background: #151520;
  font-size: 0.75rem;
  color: #aaa;
}

.season-group-header {
  background: linear-gradient(180deg, #2a2a3e 0%, #151520 100%);
  padding: 8px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1px;
  border-bottom: 2px solid #000;
  min-width: 320px;
}

.bg-liga-header { 
  background: linear-gradient(180deg, #d4e1bc 0%, #b8cc9b 100%); 
  color: #1a3300; 
  font-weight: 900; 
  font-size: 1.1rem; 
  text-shadow: 0 1px 0 rgba(255,255,255,0.5);
  min-width: 150px;
}

.liga-header-logo {
  height: 45px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.bg-intl-header { 
  background: linear-gradient(180deg, #1a1a2e 0%, #0c0c14 100%);
  border-left: 2px solid rgba(0, 242, 255, 0.3) !important;
}

.intl-header-logo { 
  height: 38px; 
  width: auto;
  object-fit: contain; 
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.slot-header {
  font-size: 0.85rem;
  font-weight: 950;
  background: #0b0b13;
  color: #888;
  padding: 4px !important;
  width: 60px;
}

.matrix-xl-cell {
  height: 38px;
  max-height: 38px;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0 !important;
  vertical-align: middle;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
}

.cell-rank-text { display: block; }

.club-info-cell {
  background: #0b0b13;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.club-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Bordas de Separação de Temporada Neon */
.last-of-season {
  border-right: 4px solid #000 !important;
  position: relative;
}

.last-of-season::after {
  content: "";
  position: absolute;
  top: 0; right: -2px; width: 1px; height: 100%;
  background: rgba(0, 242, 255, 0.2);
}

/* Cores Estilo Expert (Neon e Vibrantes) */
.expert-gold-bg { 
  background: linear-gradient(135deg, #ffed4b 0%, #ffd700 100%) !important; 
  color: #332b00 !important; 
  font-weight: 950 !important;
}

.expert-silver-bg { 
  background: linear-gradient(135deg, #a0a0a0 0%, #707070 100%) !important; 
  color: #ffffff !important; 
  font-weight: 800 !important;
}

.expert-blue-intl-bg {
    background: rgba(0, 242, 255, 0.1) !important;
    color: #44d2ff !important;
}

.expert-bronze-intl-grad { 
  background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%) !important; 
  color: #fff !important; 
  font-weight: 950 !important;
}

.expert-green-intl-grad { 
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%) !important; 
  color: #fff !important; 
  font-weight: 950 !important;
}

.expert-cyan-intl-grad { 
  background: linear-gradient(135deg, #00f2ff 0%, #00a8b3 100%) !important; 
  color: #000 !important; 
  font-weight: 950 !important;
}

.expert-red-light-intl-grad { 
  background: linear-gradient(135deg, #ff8a8a 0%, #ff6e6e 100%) !important; 
  color: #fff !important; 
  font-weight: 800 !important;
}

.expert-blue-intl-grad { 
  background: linear-gradient(135deg, #0056b3 0%, #003366 100%) !important; 
  color: #fff !important; 
  font-weight: 900 !important;
}

/* Bordas Neon */
.neon-border-gold {
  box-shadow: inset 0 0 12px #ffd700aa, 0 0 8px #ffd70088 !important;
  border: 1.5px solid #ffd700 !important;
  z-index: 5;
}

.neon-border-silver {
  box-shadow: inset 0 0 15px #ffffff, 0 0 10px #ffffffcc !important;
  border: 2px solid #ffffff !important;
  z-index: 4;
}

.club-row-xl:hover td {
  box-shadow: inset 0 0 0 999px rgba(255, 255, 255, 0.08) !important;
}

.club-row-xl:hover .club-info-cell {
  color: #00f2ff;
}

.mini-box { width: 14px; height: 14px; border-radius: 3px; }

.ls-2 { letter-spacing: 2px; }
.btn-action {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid #00f2ff44;
  color: #00f2ff;
  font-weight: 800;
  font-size: 0.75rem;
}

.btn-action:hover {
  background: #00f2ff;
  color: #000;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0a0a10; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background: #2a2a3e; 
  border-radius: 10px; 
  border: 2px solid #0a0a10; 
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00f2ff88; }
</style>
