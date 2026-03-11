<template>
  <div class="view-container animated-fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4 px-2 position-relative py-3 overflow-hidden rounded-3 header-country-box">
      <!-- Logo da Federação ao Fundo -->
      <div class="country-bg-flag" v-if="federationLogo" :style="{ backgroundImage: `url(${federationLogo})` }"></div>
      
      <div class="d-flex align-items-center gap-3 position-relative" style="z-index: 2;">
        <button @click="$router.push('/universo')" class="btn btn-outline-info btn-sm hover-glow px-3">
          <i class="bi bi-trophy me-2"></i>COMPETIÇÕES
        </button>
        <h2 class="m-0 text-uppercase fw-black d-flex align-items-center gap-3 header-title-main" v-if="continentName">
          <img :src="federationLogo" class="shadow-lg border border-white border-opacity-20 rounded-circle bg-white" style="width: 45px; height: 45px; object-fit: contain;" v-if="federationLogo" />
          <span class="text-white">HISTÓRICO - {{ continentName }}</span>
        </h2>
      </div>
      <LogoFREeFOOT style="z-index: 2;" />
    </div>

     <div class="px-2 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="d-flex align-items-center gap-2">
          <label class="text-secondary small fw-bold text-uppercase opacity-75">ORDENAR POR:</label>
          <select v-model="sortBy" class="form-select form-select-sm bg-dark text-white border-secondary border-opacity-25 fw-bold" style="width: 200px;">
            <option value="total">Total de Títulos</option>
            <option v-for="comp in nationalCompetitions" :key="comp.nome" :value="'nat_' + comp.nome">
              {{ comp.nome }}
            </option>
            <option value="world_cup">Copa do Mundo</option>
          </select>
        </div>

        <button @click="$router.push(`/selecao/${continentName}/matriz`)" class="btn btn-info btn-sm fw-black text-dark px-3 hover-glow border-0 shadow-sm" style="background: #00f2ff;">
          <i class="bi bi-calendar3 me-2"></i>VER MATRIZ DE TEMPORADAS
        </button>
     </div>

    <GamePanel customClass="p-0 overflow-hidden shadow-lg border border-secondary border-opacity-10 bg-black bg-opacity-20">
      <div class="table-responsive custom-scrollbar py-1">
        <table class="table table-dark align-middle mb-0" style="font-size: 0.75rem; border-collapse: separate; border-spacing: 0 4px;">
          <thead class="bg-black bg-opacity-80">
            <tr class="row-competicoes-logos border-bottom border-white border-opacity-10">
              <th colspan="2" class="py-1 bg-black bg-opacity-80"></th>
              <th v-for="comp in sortedCompetitions" :key="'logo_' + comp.nome" class="py-1 border-start border-black border-opacity-10">
                <div class="logo-comp-container">
                  <img :src="comp.logo" :alt="comp.nome" class="logo-comp-img" v-if="comp.logo" />
                  <span v-else class="text-dark opacity-25 x-small">{{ comp.nome }}</span>
                </div>
              </th>
            </tr>
            <tr class="text-secondary opacity-70 x-small text-uppercase text-center fw-black border-bottom border-secondary border-opacity-10">
              <th class="text-start ps-3 align-middle bg-black bg-opacity-30" style="width: 150px; min-width: 150px;">SELEÇÃO</th>
              <th class="text-warning-neon align-middle px-1 py-1 header-cell-neon col-total-titulos" style="width: 70px;">🏆 TOTAL</th>
              <th v-for="comp in sortedCompetitions" :key="comp.nome" style="width: 90px;" class="align-middle px-1 py-1 header-cell-neon border-start border-white border-opacity-5">
                <div v-html="formatHeader(comp.nome)" class="lh-1"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in sortedTeams" :key="team.nome" class="club-row">
              <td class="ps-3 fw-black text-uppercase border-none">
                <div class="d-flex align-items-center gap-2">
                  <NationalFlag :countryName="team.nome" :size="20" />
                  <span class="name-cell-full d-flex align-items-center gap-1">
                    {{ team.nome }}
                  </span>
                </div>
              </td>

              <td class="text-center px-1 fw-black text-warning-neon col-total-titulos">
                <span class="stat-badge">{{ calculateTotalTitles(team) || '' }}</span>
              </td>
              
              <td v-for="comp in sortedCompetitions" :key="comp.nome + team.nome" class="text-center px-1">
                <span class="stat-badge" :class="{ 'text-neon-gold': (team.stats[comp.nome] || 0) > 0 }">
                  {{ team.stats[comp.nome] || '' }}
                </span>
              </td>
            </tr>
             <tr v-if="continentTeams.length === 0">
              <td :colspan="nationalCompetitions.length + 3" class="text-center py-5 opacity-25 fw-black text-uppercase fs-5">
                Nenhuma seleção carregada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GamePanel>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { NATIONAL_COMPETITIONS_STRUCTURE } from '../services/national.data'
import { seasonStore } from '../services/season.store'
import GamePanel from '../components/GamePanel.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'

const route = useRoute()
const continentName = ref('')
const continentTeams = ref([])
const nationalCompetitions = ref([])
const sortBy = ref('total')

const federationLogo = computed(() => {
  if (!continentName.value) return null;
  return FEDERATIONS_DATA[continentName.value]?.logo;
})

const sortedCompetitions = computed(() => {
  return [...nationalCompetitions.value].sort((a, b) => {
    // Copa do Mundo por último
    if (a.nome.includes('MUNDO')) return 1;
    if (b.nome.includes('MUNDO')) return -1;
    return 0;
  });
})

const formatHeader = (name) => {
  if (!name) return '';
  return name.replace('Eliminatórias ', 'Elim.<br>')
             .replace('Copa América', 'Copa<br>América')
             .replace('Euro Copa', 'Euro<br>Copa')
             .replace('Copa do Mundo', 'COPA DO<br>MUNDO')
             .replace('Copa da ', 'Copa da<br>');
}

const loadData = async () => {
    const routeId = route.params.id;
    continentName.value = decodeURIComponent(routeId);

    await seasonStore.loadAll();

    // 1. Identificar Competições do Continente
    const structure = NATIONAL_COMPETITIONS_STRUCTURE.find(s => s.continente === continentName.value);
    if (structure) {
        nationalCompetitions.value = [...structure.competicoes];
    }
    
    // Adicionar Copa do Mundo (Mundial) se não estiver na lista
    const worldCup = NATIONAL_COMPETITIONS_STRUCTURE.find(s => s.continente === 'Mundial')?.competicoes[0];
    if (worldCup && !nationalCompetitions.value.some(c => c.id === worldCup.id)) {
        nationalCompetitions.value.push(worldCup);
    }

    // 2. Filtrar Seleções do Continente
    const fedUrl = FEDERATIONS_DATA[continentName.value]?.logo;
    const teamsData = NATIONAL_TEAMS_DATA.filter(t => t.continente === fedUrl);
    
    const statsMap = {};
    teamsData.forEach(t => {
        statsMap[t.nome] = {
            stats: {}
        };
        nationalCompetitions.value.forEach(nc => {
            statsMap[t.nome].stats[nc.nome] = 0;
        });
    });

    const getStatsKey = (name) => {
        if (!name) return null;
        const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const target = norm(name);
        return Object.keys(statsMap).find(key => norm(key) === target);
    };

    // 3. Processar Temporadas
    seasonStore.list.forEach(season => {
        const compName = season.competitionName;
        const campeaoNorm = getStatsKey(season.campeao);

        if (campeaoNorm) {
            // Verifica se a competição da temporada está entre as do continente ou é Copa do Mundo
            const matchedComp = nationalCompetitions.value.find(nc => {
                const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                return norm(nc.nome) === norm(compName);
            });

            if (matchedComp) {
                statsMap[campeaoNorm].stats[matchedComp.nome]++;
            }
        }
    });

    continentTeams.value = Object.keys(statsMap).map(key => ({
        nome: key,
        stats: statsMap[key].stats
    }));
}

const calculateTotalTitles = (team) => {
    return Object.values(team.stats).reduce((acc, v) => acc + v, 0);
}

const sortedTeams = computed(() => {
    return [...continentTeams.value].sort((a, b) => {
        if (sortBy.value === 'total') {
            const diff = calculateTotalTitles(b) - calculateTotalTitles(a);
            if (diff !== 0) return diff;
        } else if (sortBy.value.startsWith('nat_')) {
            const compName = sortBy.value.replace('nat_', '');
            const diff = (b.stats[compName] || 0) - (a.stats[compName] || 0);
            if (diff !== 0) return diff;
        } else if (sortBy.value === 'world_cup') {
            const wc = nationalCompetitions.value.find(c => c.nome.includes('MUNDO'))?.nome;
            if (wc) {
                const diff = (b.stats[wc] || 0) - (a.stats[wc] || 0);
                if (diff !== 0) return diff;
            }
        }
        return a.nome.localeCompare(b.nome);
    });
})

onMounted(() => {
    loadData();
})
</script>

<style scoped>
/* Estilos extraídos de CountryHistoryView para evitar @import de .vue */
.view-container {
  padding: 1rem;
}

.header-country-box {
  background: linear-gradient(135deg, rgba(0, 50, 20, 0.8) 0%, rgba(0, 10, 30, 0.9) 100%);
  position: relative;
  min-height: 100px;
}

.country-bg-flag {
  position: absolute;
  top: 0;
  right: 0;
  width: 70%;
  height: 100%;
  background-size: cover;
  background-position: right center;
  filter: blur(1px) grayscale(0.2) brightness(0.6);
  opacity: 0.35;
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0));
  z-index: 1;
  pointer-events: none;
}

.club-row {
  transition: all 0.3s ease;
}

.club-row td {
  background: rgba(255, 255, 255, 0.03) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 12px 8px !important;
}

.club-row:hover td {
  background: rgba(0, 242, 255, 0.1) !important;
  border-top: 1px solid rgba(0, 242, 255, 0.3) !important;
}

.text-warning-neon {
  color: #ffea00 !important;
  text-shadow: 0 0 10px rgba(255, 234, 0, 0.3);
}

.text-neon-gold {
  color: #ffea00 !important;
}

.stat-badge {
    font-weight: 900;
    font-size: 1.1rem !important;
}

.name-cell-full {
  font-size: 0.85rem;
  font-weight: 900;
  text-transform: uppercase;
}

.logo-comp-container {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-comp-img {
    max-height: 45px;
    object-fit: contain;
}

.header-cell-neon {
    font-size: 0.65rem;
    text-align: center;
    font-weight: 900;
}
</style>
