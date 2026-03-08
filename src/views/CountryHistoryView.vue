<template>
  <div class="view-container animated-fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4 px-2 position-relative py-3 overflow-hidden rounded-3 header-country-box">
      <!-- Bandeira de Fundo Translúcida -->
      <div class="country-bg-flag" v-if="countryFlagUrl" :style="{ backgroundImage: `url(${countryFlagUrl})` }"></div>
      
      <div class="d-flex align-items-center gap-3 position-relative" style="z-index: 2;">
        <button @click="$router.push('/universo?pais=' + countryName)" class="btn btn-outline-light btn-sm border-opacity-25 bg-black bg-opacity-20 hover-glow">
          <i class="bi bi-arrow-left me-2"></i>VOLTAR
        </button>
        <h2 class="m-0 text-uppercase fw-black d-flex align-items-center gap-3 header-title-main" v-if="countryName">
          <NationalFlag :countryName="countryName" :size="45" class="shadow-lg border border-white border-opacity-20" />
          <span class="text-white">HISTÓRICO - {{ countryName }}</span>
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
            <option v-for="slot in intlSlots" :key="slot.id" :value="slot.id">
              {{ slot.name }}
            </option>
            <option value="relegations" v-if="isRelegationCountry">Rebaixamentos</option>
          </select>
        </div>

        <button @click="$router.push(`/pais/${countryName}/matriz`)" class="btn btn-info btn-sm fw-black text-dark px-3 hover-glow border-0 shadow-sm" style="background: #00f2ff;">
          <i class="bi bi-calendar3 me-2"></i>VER MATRIZ DE TEMPORADAS
        </button>
     </div>

    <GamePanel customClass="p-0 overflow-hidden shadow-lg border border-secondary border-opacity-10 bg-black bg-opacity-20">
      <!-- Container 'Quadro de Honra' removido conforme solicitação -->
      
      <div class="table-responsive custom-scrollbar py-1">
        <table class="table table-dark align-middle mb-0" style="font-size: 0.7rem; border-collapse: separate; border-spacing: 0 4px;">
          <thead class="bg-black bg-opacity-80">
            <!-- LINHA DE LOGOS DAS COMPETIÇÕES (ESTILO ELITE) -->
            <tr class="row-competicoes-logos border-bottom border-white border-opacity-10">
              <th colspan="2" class="py-1 bg-black bg-opacity-80"></th>
              <!-- Logos Nacionais -->
              <th v-for="comp in nationalCompetitions" :key="'logo_' + comp.nome" class="py-1 border-start border-black border-opacity-10">
                <div class="logo-comp-container">
                  <img :src="comp.logo" :alt="comp.nome" class="logo-comp-img" v-if="comp.logo" />
                  <span v-else class="text-dark opacity-25 x-small">{{ comp.nome.split(' ')[0] }}</span>
                </div>
              </th>
              <!-- Movimento (Dinamizado por existência de ligas) -->
              <template v-if="['Brasil', 'Argentina', 'Inglaterra'].includes(countryName)">
                <th :colspan="movementColspan" class="py-1 border-start border-black border-opacity-10 align-middle text-center">
                  <span class="fw-black ls-1 text-dark opacity-70" style="font-size: 0.9rem;">ACESSOS E REBAIXAMENTOS</span>
                </th>
              </template>
              <!-- Internacionais -->
              <!-- Internacionais Dinâmicos -->
              <template v-for="(intl, idx) in intlSlots" :key="'logo_intl_' + intl.id">
                <!-- Coluna de Participação (Logo Menor) -->
                <th :class="{ 'border-start border-black border-opacity-10': idx === 0 && !['Brasil', 'Argentina', 'Inglaterra'].includes(countryName) }" class="py-1 border-none align-middle">
                  <div class="logo-comp-container">
                    <img :src="intl.logo" class="logo-comp-img mini" />
                  </div>
                </th>
                <!-- Coluna de Título (Logo Normal) -->
                <th class="py-1 border-none align-middle">
                  <div class="logo-comp-container">
                    <img :src="intl.logo" class="logo-comp-img" />
                  </div>
                </th>
              </template>
              <!-- REMOVIDO: th condicional com ícone bi-caret-down-fill que causava duplicação visual -->
            </tr>
            <tr class="text-secondary opacity-70 x-small text-uppercase text-center fw-black border-bottom border-secondary border-opacity-10">
              <th class="text-start ps-1 align-middle bg-black bg-opacity-30" style="width: 120px; min-width: 120px;">CLUBE</th>
              <th class="text-warning-neon align-middle px-1 py-1 header-cell-neon col-total-titulos" style="width: 55px;">🏆 TOTAL<br>TÍTULOS</th>
              <th v-for="comp in nationalCompetitions" :key="comp.nome" style="width: 75px;" class="align-middle px-1 py-1 header-cell-neon border-start border-white border-opacity-5">
                <div v-html="formatHeader(comp.nome)" class="lh-1"></div>
              </th>
              <template v-if="['Brasil', 'Argentina', 'Inglaterra'].includes(countryName)">
                <th class="text-danger-neon align-middle px-1 py-1 header-cell-neon border-start border-white border-opacity-10 col-relegation" style="width: 60px;">QUEDA<br>DIV. 1</th>
                <th class="text-success-neon align-middle px-1 py-1 header-cell-neon col-access" style="width: 60px;">SUBIDA<br>DIV. 1</th>
                <th v-if="hasSerieC" class="text-danger-neon align-middle px-1 py-1 header-cell-neon col-relegation" style="width: 60px;">QUEDA<br>DIV. 2</th>
                <th v-if="hasSerieC" class="text-success-neon align-middle px-1 py-1 header-cell-neon col-access" style="width: 60px;">SUBIDA<br>DIV. 2</th>
                <th v-if="hasSerieD" class="text-danger-neon align-middle px-1 py-1 header-cell-neon col-relegation" style="width: 60px;">QUEDA<br>DIV. 3</th>
                <th v-if="hasSerieD" class="text-success-neon align-middle px-1 py-1 header-cell-neon col-access" style="width: 60px;">SUBIDA<br>DIV. 3</th>
              </template>
              <template v-for="intl in intlSlots" :key="'label_intl_' + intl.id">
                <th class="text-info-neon align-middle px-1 py-1 header-cell-neon border-start border-white border-opacity-10" style="width: 65px;">
                  {{ intl.shortName }}<br>CLASS.
                </th>
                <th class="text-warning-neon align-middle px-1 py-1 header-cell-neon" style="width: 65px;">
                  {{ intl.shortName }}<br>TÍTULO
                </th>
              </template>
              <!-- REMOVIDO: th genérico de REBAIXAMENTOS que causava duplicação na Argentina -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="club in sortedClubs" :key="club.nome" class="club-row">
              <td class="ps-1 fw-black text-uppercase border-none cursor-pointer hover-bright" @click="openClubTrophyRoom(club.nome)">
                <div class="d-flex align-items-center gap-1">
                  <TeamShield :teamName="club.nome" :size="20" />
                  <span class="name-cell-full d-flex align-items-center gap-1">
                    {{ club.nome }}
                  </span>
                </div>
              </td>

              <!-- CÉLULA TOTAL -->
              <td class="text-center px-1 fw-black text-warning-neon col-total-titulos" :data-value="calculateTotalTitles(club)">
                <span v-if="calculateTotalTitles(club) > 0" class="stat-badge">{{ calculateTotalTitles(club) }}</span>
              </td>
              
              <!-- CÉLULAS NACIONAIS -->
              <td v-for="comp in nationalCompetitions" :key="comp.nome + club.nome" class="text-center px-1" :data-value="club.stats.national[comp.nome]">
                <span v-if="club.stats.national[comp.nome] > 0" class="stat-badge" :class="{ 'text-neon-gold': club.stats.national[comp.nome] > 0 }">
                  {{ club.stats.national[comp.nome] }}
                </span>
              </td>

              <!-- CÉLULAS MOVIMENTO (BR, AR, EN) -->
              <template v-if="['Brasil', 'Argentina', 'Inglaterra'].includes(countryName)">
                <td class="text-center px-1 fw-black text-danger-neon col-relegation" :data-value="club.stats.relegation_A_B"><span v-if="club.stats.relegation_A_B > 0" class="stat-badge">{{ club.stats.relegation_A_B }}</span></td>
                <td class="text-center px-1 fw-black text-success-neon col-access" :data-value="club.stats.access_B_A"><span v-if="club.stats.access_B_A > 0" class="stat-badge">{{ club.stats.access_B_A }}</span></td>
                <td v-if="hasSerieC" class="text-center px-1 fw-black text-danger-neon col-relegation" :data-value="club.stats.relegation_B_C"><span v-if="club.stats.relegation_B_C > 0" class="stat-badge">{{ club.stats.relegation_B_C }}</span></td>
                <td v-if="hasSerieC" class="text-center px-1 fw-black text-success-neon col-access" :data-value="club.stats.access_C_B"><span v-if="club.stats.access_C_B > 0" class="stat-badge">{{ club.stats.access_C_B }}</span></td>
                <td v-if="hasSerieD" class="text-center px-1 fw-black text-danger-neon col-relegation" :data-value="club.stats.relegation_C_D"><span v-if="club.stats.relegation_C_D > 0" class="stat-badge">{{ club.stats.relegation_C_D }}</span></td>
                <td v-if="hasSerieD" class="text-center px-1 fw-black text-success-neon col-access" :data-value="club.stats.access_D_C"><span v-if="club.stats.access_D_C > 0" class="stat-badge">{{ club.stats.access_D_C }}</span></td>
              </template>

              <!-- CÉLULAS INTERNACIONAIS -->
              <!-- CÉLULAS INTERNACIONAIS DINÂMICAS -->
              <template v-for="intl in intlSlots" :key="'stat_intl_' + intl.id + club.nome">
                <td class="text-center px-1 fw-black text-info-neon" :data-value="club.stats['part_' + intl.id]">
                  <span v-if="club.stats['part_' + intl.id] > 0" class="stat-badge">{{ club.stats['part_' + intl.id] }}</span>
                </td>
                <td class="text-center px-1 fw-black text-neon-gold" :data-value="club.stats[intl.id]">
                  <span v-if="club.stats[intl.id] > 0" class="stat-badge">{{ club.stats[intl.id] }}</span>
                </td>
              </template>

              <!-- REMOVIDO: td genérico de REBAIXAMENTOS -->
            </tr>
             <tr v-if="countryClubs.length === 0">
              <td :colspan="nationalCompetitions.length + (['Brasil', 'Argentina', 'Inglaterra'].includes(countryName) ? movementColspan + 5 : 7)" class="text-center py-5 opacity-25 fw-black text-uppercase fs-5">
                Nenhum registro encontrado para este país.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GamePanel>

    <!-- LEGENDA MUNDIAL -->
    <div class="mt-3 px-2 d-flex flex-wrap gap-4 align-items-center justify-content-center opacity-75">
      <div class="d-flex align-items-center gap-2 small fw-bold">
        <span class="medal-dot bg-gold mini"></span> <span class="text-white">OURO: CAMPEÃO MUNDIAL</span>
      </div>
      <div class="d-flex align-items-center gap-2 small fw-bold">
        <span class="medal-dot bg-silver mini"></span> <span class="text-white">PRATA: VICE-CAMPEÃO</span>
      </div>
      <div class="d-flex align-items-center gap-2 small fw-bold">
        <span class="medal-dot bg-bronze mini"></span> <span class="text-white">BRONZE: 3º LUGAR</span>
      </div>
      <div class="d-flex align-items-center gap-2 small fw-bold">
        <span class="medal-dot bg-light-black mini"></span> <span class="text-white">CINZA: 4º LUGAR</span>
      </div>
    </div>
    
    <!-- MODAL DE TROFÉUS DO CLUBE -->
    <ClubTrophyModal :clubName="selectedClubName" ref="clubTrophyModalRef" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { CLUBS_DATA } from '../data/clubs.data'
import { seasonStore } from '../services/season.store'
import { clubStore } from '../services/club.store'
import { SOUTH_AMERICA_DATA, EUROPE_DATA, CONCACAF_DATA, ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import GamePanel from '../components/GamePanel.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import { careerStore } from '../services/career.store'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import { getSeasonFinalYear } from '../services/utils'
import ClubTrophyModal from '../components/ClubTrophyModal.vue'

const route = useRoute()
const countryName = ref('')
const countryClubs = ref([])
const intlSlots = ref([])
const nationalCompetitions = ref([])
const sortBy = ref('total')

// --- ESTADO DA SALA DE TROFÉUS ---
const selectedClubName = ref('')
const clubTrophyModalRef = ref(null)
let modalInstance = null

const openClubTrophyRoom = (clubName) => {
    selectedClubName.value = clubName
    nextTick(() => {
        if (clubTrophyModalRef.value) {
            clubTrophyModalRef.value.open()
        }
    })
}

const isRelegationCountry = computed(() => {
  if (!countryName.value) return false
  const p = countryName.value.toLowerCase().trim()
  return p === 'brasil' || p === 'argentina' || p === 'inglaterra'
})

// Helpers e Cache
const competitionCache = new Map();

const buildCompetitionCache = () => {
    competitionCache.clear();
    const allIntl = INTERNATIONAL_DATA || [];
    allIntl.forEach(c => {
        if (c.nome) competitionCache.set(normalizeName(c.nome), { ...c, type: 'international' });
    });

    const allNats = ALL_COMPETITIONS_DATA || [];
    allNats.forEach(cont => {
      cont?.paises?.forEach(p => {
        p?.competicoes?.forEach(c => {
          if (c.nome) competitionCache.set(normalizeName(c.nome), { ...c, type: 'national' });
        });
      });
    });
}

const normalizeName = (name) => {
    if (!name) return '';
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const getCompetitionInfo = (compName) => {
  if (!compName) return { type: 'unknown' };
  const norm = normalizeName(compName);
  if (competitionCache.size === 0) buildCompetitionCache();
  return competitionCache.get(norm) || { type: 'unknown' };
}



const getFederationByCountry = (cName) => {
  const norm = (s) => s?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""
  const target = norm(cName)
  for (const continent of ALL_COMPETITIONS_DATA) {
    if (continent.paises.some(p => norm(p.nome) === target)) {
      return continent.continente
    }
  }
  return null
}

const formatHeader = (name) => {
  if (!name) return '';
  return String(name).replace('Brasileirão ', 'Brasileirão<br>')
                    .replace('Série ', 'Série ')
                    .replace('Copa do Brasil', 'Copa do<br>Brasil')
                    .replace('Supercopa do Brasil', 'Supercopa<br>Brasil')
                    .replace('Copa do ', 'Copa do<br>');
}

// Computeds
const countryFlagUrl = computed(() => {
  if (!countryName.value) return null;
  const allContinents = [SOUTH_AMERICA_DATA, EUROPE_DATA, CONCACAF_DATA];
  for (const cont of allContinents) {
    if (cont && cont.paises) {
      const c = cont.paises.find(p => normalizeName(p.nome) === normalizeName(countryName.value));
      if (c) return c.bandeira;
    }
  }
  return null;
})

const hasSerieC = computed(() => nationalCompetitions.value.length >= 3)
const hasSerieD = computed(() => nationalCompetitions.value.length >= 4)
const movementColspan = computed(() => {
  let count = 2
  if (hasSerieC.value) count += 2
  if (hasSerieD.value) count += 2
  return count
})




const loadData = async () => {
    const routeId = route.params.id;
    const pNome = decodeURIComponent(routeId);
    countryName.value = pNome;

    // Inicializar Cache de Competições (Gargalo removido)
    buildCompetitionCache();

    // 0. Carregar TODAS as temporadas do banco (evita dados parciais na store)
    await seasonStore.loadAll();
    await careerStore.loadAll();
    await clubStore.init();

    // 1. Carregar Competições do País
    const allContinents = [SOUTH_AMERICA_DATA, EUROPE_DATA, CONCACAF_DATA];
    let foundCountry = null;

    for (const cont of allContinents) {
        if (cont && cont.paises) {
            const c = cont.paises.find(p => normalizeName(p.nome) === normalizeName(pNome));
            if (c) {
                foundCountry = c;
                break;
            }
        }
    }

    // --- DEFINIR SLOTS INTERNACIONAIS POR CONTINENTE ---
    const continentName = getFederationByCountry(foundCountry?.nome || pNome);
    const intlMap = {
      'América do Sul': [
        { id: 'liberta', key: 'intl_Libertadores', name: 'Libertadores', shortName: 'LIBERTA', logo: 'logos/competitions/libertadores.png' },
        { id: 'sula', key: 'intl_Sul-Americana', name: 'Sul-Americana', shortName: 'SUL-AM.', logo: 'logos/competitions/sulamericana.png' },
        { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: 'logos/competitions/mundial-de-clubes.png' }
      ],
      'Europa': [
        { id: 'champions', key: 'intl_Champions League', name: 'Champions League', shortName: 'CHAMPIONS', logo: 'logos/competitions/champions-league.png' },
        { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: 'logos/competitions/mundial-de-clubes.png' }
      ],
      'América do Norte': [
        { id: 'concacaf', key: 'intl_CONCACAF Champions', name: 'CONCACAF Champions', shortName: 'CONCACAF', logo: 'logos/competitions/concacaf-champions.png' },
        { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: 'logos/competitions/mundial-de-clubes.png' }
      ]
    }
    intlSlots.value = intlMap[continentName] || [
      { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: 'logos/competitions/mundial-de-clubes.png' }
    ];

    if (foundCountry) {
        // Incluir TODAS as competições nacionais (Ligas, Copas e Supercopas) para todos os países
        nationalCompetitions.value = (foundCountry.competicoes || []).filter(c => {
            const type = c.tipo?.toLowerCase();
            return type === 'liga' || type === 'copa' || type === 'supercopa';
        });
    }

    // 2. Carregar Clubes e Inicializar Stats
    const baseClubs = clubStore.list && clubStore.list.length > 0 ? clubStore.list : CLUBS_DATA;
    const clubsData = baseClubs.filter(c => c.pais && normalizeName(c.pais) === normalizeName(pNome));
    
    const statsMap = {};
    clubsData.forEach(c => {
        statsMap[c.nome] = {
            national: {},
            libertadores: 0,
            part_libertadores: 0,
            sudamericana: 0,
            part_sudamericana: 0,
            part_mundial: 0,
            pos1_mundial: 0,
            pos2_mundial: 0,
            pos3_mundial: 0,
            pos4_mundial: 0,
            relegations: 0,
            relegation_A_B: 0,
            access_B_A: 0,
            relegation_B_C: 0,
            access_C_B: 0,
            relegation_C_D: 0,
            access_D_C: 0
        };
        
        // Inicializar stats internacionais baseados nos slots
        intlSlots.value.forEach(slot => {
            statsMap[c.nome][slot.id] = 0;
            statsMap[c.nome]['part_' + slot.id] = 0;
        });
        nationalCompetitions.value.forEach(nc => {
            statsMap[c.nome].national[nc.nome] = 0;
        });
    });

    // Indexar nomes de clubes para busca rápida
    const clubNamesMap = new Map();
    clubsData.forEach(c => clubNamesMap.set(normalizeName(c.nome), c.nome));

    const getStatsKey = (name) => {
        if (!name) return null;
        return clubNamesMap.get(normalizeName(name));
    };

    // 3. Processar Temporadas (Com trava de unicidade por ID)
    const processedSeasons = new Set();
    seasonStore.list.forEach(season => {
        // Ignora se for uma temporada duplicada (mesmo ID ou mesma Comp-AnoFinal)
        const sFinalYear = getSeasonFinalYear(season.ano);
        const seasonId = season.id || `${season.competitionName}-${sFinalYear}`;
        
        // Além do ID, verificamos a chave de negócio (Comp + Ano) para blindar contra dados sujos
        const businessKey = `${normalizeName(season.competitionName)}-${sFinalYear}`;
        
        if (processedSeasons.has(seasonId) || processedSeasons.has(businessKey)) return;
        
        processedSeasons.add(seasonId);
        processedSeasons.add(businessKey);

        const compName = season.competitionName;
        const compInfo = getCompetitionInfo(compName);
        const campeaoNorm = getStatsKey(season.campeao);

        // --- TÍTULOS NACIONAIS ---
        const isNational = nationalCompetitions.value.find(nc => normalizeName(nc.nome) === normalizeName(compName));
        if (isNational && campeaoNorm) {
            statsMap[campeaoNorm].national[isNational.nome]++;
        }

        // --- INTERNACIONAIS (Títulos e Participações Dinâmicas) ---
        if (compInfo && compInfo.type === 'international') {
            const cLow = normalizeName(compName);
            
            intlSlots.value.forEach(slot => {
                const isMatch = normalizeName(slot.name).split(' ').some(t => t.length > 4 && cLow.includes(t)) || cLow.includes(normalizeName(slot.name));
                
                if (isMatch) {
                    // Títulos
                    if (campeaoNorm) {
                        statsMap[campeaoNorm][slot.id]++;
                        if (slot.id === 'mundial') statsMap[campeaoNorm].pos1_mundial++;
                    }
                    // Participações
                    let teamsInSeason = [];
                    if (season.tabela) {
                        teamsInSeason = parseTable(season.tabela).map(t => t.time);
                    } else if (slot.id === 'mundial' && season.mundial) {
                        // Se for mundial e não tem tabela, pega do bracket (semifinalistas e finalistas)
                        const m = season.mundial;
                        const candidates = [
                            m.semi1?.time1, m.semi1?.time2,
                            m.semi2?.time1, m.semi2?.time2,
                            m.final?.time1, m.final?.time2
                        ];
                        teamsInSeason = [...new Set(candidates.filter(t => t))];
                    }

                    teamsInSeason.forEach(teamName => {
                        const tNorm = getStatsKey(teamName);
                        if (tNorm) statsMap[tNorm]['part_' + slot.id]++;
                    });

                    // --- DETALHES DO MUNDIAL (1º AO 4º) ---
                    if (slot.id === 'mundial' && season.mundial) {
                        const m = season.mundial;
                        // Vice (Finalista perdedor)
                        let vice = null;
                        if (m.final.time1 && m.final.time2) {
                            if (m.final.placar1 > m.final.placar2 || (m.final.placar1 === m.final.placar2 && m.final.pen1 > m.final.pen2)) {
                                vice = m.final.time2;
                            } else if (m.final.placar2 > m.final.placar1 || (m.final.placar2 === m.final.placar1 && m.final.pen2 > m.final.pen1)) {
                                vice = m.final.time1;
                            }
                        }
                        if (vice) {
                            const vNorm = getStatsKey(vice);
                            if (vNorm) statsMap[vNorm].pos2_mundial++;
                        }

                        // 3º e 4º Lugar
                        let terceiro = null;
                        let quarto = null;
                        if (m.terceiro.time1 && m.terceiro.time2) {
                            if (m.terceiro.placar1 > m.terceiro.placar2 || (m.terceiro.placar1 === m.terceiro.placar2 && m.terceiro.pen1 > m.terceiro.pen2)) {
                                terceiro = m.terceiro.time1;
                                quarto = m.terceiro.time2;
                            } else if (m.terceiro.placar2 > m.terceiro.placar1 || (m.terceiro.placar2 === m.terceiro.placar1 && m.terceiro.pen2 > m.terceiro.pen1)) {
                                terceiro = m.terceiro.time2;
                                quarto = m.terceiro.time1;
                            }
                        }
                        if (terceiro) {
                            const t3Norm = getStatsKey(terceiro);
                            if (t3Norm) statsMap[t3Norm].pos3_mundial++;
                        }
                        if (quarto) {
                            const q4Norm = getStatsKey(quarto);
                            if (q4Norm) statsMap[q4Norm].pos4_mundial++;
                        }
                    }
                }
            });
        }

        // --- ACESSOS E REBAIXAMENTOS (BR, AR, EN) ---
        if (['brasil', 'argentina', 'inglaterra'].includes(normalizeName(countryName.value)) && season.tabela) {
             const items = parseTable(season.tabela);
             const cNameLow = normalizeName(compName);

             // Detecção de Tipo de Liga e Vagas
             const isSerieA = cNameLow.includes('serie a') || cNameLow.includes('profissional') || cNameLow.includes('primera division') || cNameLow.includes('liga inglesa');
             const isSerieB = cNameLow.includes('serie b') || cNameLow.includes('nacional') || cNameLow.includes('liga inglesa serie b');
             const isSerieC = cNameLow.includes('serie c');
             const isSerieD = cNameLow.includes('serie d');

             // REBAIXAMENTOS
             let nRebaixados = compInfo.rebaixados || 0;
             if (isSerieA && normalizeName(countryName.value) === 'argentina') nRebaixados = 4;
             if (!nRebaixados && (isSerieA || isSerieB || isSerieC)) nRebaixados = 4; // Fallback comum

             if (nRebaixados > 0 && items.length >= nRebaixados) {
                 const dropped = items.slice(-nRebaixados);
                 dropped.forEach(t => {
                     const key = getStatsKey(t.time);
                     if (key) {
                         if (isSerieA) statsMap[key].relegation_A_B++;
                         else if (isSerieB) statsMap[key].relegation_B_C++;
                         else if (isSerieC) statsMap[key].relegation_C_D++;
                     }
                 });
             }

             // ACESSOS
             let nPromovidos = compInfo.promovidos || 0;
             if (!nPromovidos && (isSerieB || isSerieC || isSerieD)) nPromovidos = 4; // Fallback comum

             if (nPromovidos > 0) {
                 const manualPromoted = season.promovidosPlayoff || [];
                 const normManual = manualPromoted.map(p => normalizeName(p));
                 const directCount = Math.max(0, nPromovidos - manualPromoted.length);
                 
                 // Times que subiram direto (topo da tabela não selecionados no playoff)
                 const directPromoted = items
                    .slice(0, directCount + manualPromoted.length)
                    .filter(t => !normManual.includes(normalizeName(t.time)))
                    .slice(0, directCount)
                    .map(t => t.time);

                 const totalPromoted = [...manualPromoted, ...directPromoted];
                 
                 totalPromoted.forEach(t => {
                     const key = getStatsKey(t);
                     if (key) {
                         if (isSerieB) statsMap[key].access_B_A++;
                         else if (isSerieC) statsMap[key].access_C_B++;
                         else if (isSerieD) statsMap[key].access_D_C++;
                     }
                 });
             }
        }
    });

    countryClubs.value = Object.keys(statsMap).map(key => ({
        nome: key,
        stats: statsMap[key]
    }));
}

// Helpers Extraídos para limpeza
const parseTable = (tableStr) => {
    if (!tableStr) return [];
    return tableStr.split('\n').filter(l => l.trim()).map(line => {
        let cells = line.split('\t');
        if (cells.length === 1) cells = line.split(/\s{2,}/);
        
        if (cells.length === 1) {
            const match = line.match(/^(\d+)?\.?\s*([^\d]+)(.*)$/);
            if (match) {
                cells = [match[2].trim(), ...match[3].trim().split(/\s+/)];
            }
        }
        
        let time = cells[0];
        if (time && /^\d+/.test(time) && cells.length > 1) {
            time = cells[1];
        }
        if (time) time = time.replace(/^\d+[\s.-]*/, '').trim();

        return { time: time || '' };
    }).filter(x => x.time);
}



const calculateTotalTitles = (club) => {
    const nat = Object.values(club.stats.national).reduce((acc, v) => acc + v, 0);
    const int = intlSlots.value.reduce((acc, slot) => acc + (club.stats[slot.id] || 0), 0);
    return nat + int;
}

const sortedClubs = computed(() => {
    return [...countryClubs.value].sort((a, b) => {
        // Regra Padrão do Usuário (Sempre considerar Total de Títulos primeiro se solicitado)
        if (sortBy.value === 'total') {
            const totalDiff = calculateTotalTitles(b) - calculateTotalTitles(a);
            if (totalDiff !== 0) return totalDiff;
            
            // Critério 2: Títulos de Brasileirão Série A (como desempate de peso)
            const getSerieA = (obj) => {
                const key = Object.keys(obj.stats.national).find(k => normalizeName(k) === 'brasileirao serie a');
                return key ? obj.stats.national[key] : 0;
            };
            const serieADiff = getSerieA(b) - getSerieA(a);
            if (serieADiff !== 0) return serieADiff;
        } else {
            // Se o usuário selecionou uma coluna específica no SELECT
            const val = (obj, key) => {
                if (key.startsWith('nat_')) return obj.stats.national[key.replace('nat_', '')] || 0;
                return obj.stats[key] || 0;
            }
            const res = val(b, sortBy.value) - val(a, sortBy.value);
            if (res !== 0) return res;
        }
        
        // Critério de desempate alfabético
        return a.nome.localeCompare(b.nome);
    });
})

onMounted(() => {
    loadData();
})
</script>

<style scoped>
/* 1. CABEÇALHO TRANSMISSÃO */
:deep(thead) {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)) !important;
  backdrop-filter: blur(10px);
}

:deep(thead th) {
  border: none !important;
  padding: 10px 4px !important;
  vertical-align: middle;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

/* 2. LINHAS ESTILO "CARD" COM CORTE DIAGONAL */
.club-row {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fundo padrão para células NÃO técnicas */
.club-row td:not(.col-total-titulos):not(.col-relegation):not(.col-access) {
  background: linear-gradient(90deg, rgba(0, 40, 80, 0.5) 0%, rgba(0, 20, 40, 0.3) 85%, rgba(0, 0, 0, 0) 100%) !important;
  border-top: 1px solid rgba(0, 150, 255, 0.08) !important;
  border-bottom: 1px solid rgba(0, 150, 255, 0.08) !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  position: relative;
}

.club-row td:first-child {
  border-left: 1px solid rgba(0, 150, 255, 0.1) !important;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

/* Corte Diagonal na Extremidade Direita */
.club-row td:last-child {
  padding-right: 30px !important;
  clip-path: polygon(0 0, 100% 0, 93% 100%, 0 100%);
}

.club-row:nth-child(even) td:not(.col-total-titulos):not(.col-relegation):not(.col-access) {
  background: linear-gradient(90deg, rgba(0, 50, 100, 0.5) 0%, rgba(0, 25, 50, 0.3) 85%, rgba(0, 0, 0, 0) 100%) !important;
}

/* HOVER PREMIUM (Dominância Total do Brilho Ciano) */
.club-row:hover td,
.club-row:hover td:not(.col-total-titulos):not(.col-relegation):not(.col-access),
.club-row:hover .col-total-titulos,
.club-row:hover .col-relegation,
.club-row:hover .col-access {
  background: rgba(0, 242, 255, 0.12) !important;
  border-top: 1px solid rgba(0, 242, 255, 0.6) !important;
  border-bottom: 1px solid rgba(0, 242, 255, 0.6) !important;
  transition: all 0.2s ease !important;
}

/* Brilho Extra nas Bordas Laterais do Hover */
.club-row:hover td:first-child { border-left: 3px solid #00f2ff !important; box-shadow: inset 10px 0 15px -10px rgba(0, 242, 255, 0.6) !important; }
.club-row:hover td:last-child { border-right: 1px solid rgba(0, 242, 255, 0.4) !important; }

/* Glow no Nome ao Hover */
.club-row:hover .name-cell-full {
  color: #fff !important;
  text-shadow: 0 0 15px #00f2ff, 0 0 5px #00f2ff !important;
}

/* 3. PADRONIZAÇÃO DE NÚMEROS (ESTILO ELITE) */
.stat-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 0.95rem !important; /* Fonte Maior e Padronizada */
  font-weight: 950 !important; /* Negrito Ultra-Black */
  font-family: 'Inter', 'Outfit', sans-serif !important; /* Fonte Consistente */
  transition: all 0.2s ease;
}

/* 4. COLUNAS VERTICAIS COLORIDAS (ESTILO PILLAR BROADCAST) */
:deep(.col-total-titulos), :deep(.col-relegation), :deep(.col-access) {
  position: relative !important;
  z-index: 2 !important;
  padding: 0 !important;
  vertical-align: middle !important;
  border-top: 1px solid rgba(255, 255, 255, 0.03) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
}

/* Faixa Amarela (TOTAL) */
.col-total-titulos {
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%) !important;
  border-left: 3px solid rgba(255, 234, 0, 0.5) !important;
  border-right: 1px solid rgba(255, 215, 0, 0.05) !important;
}

/* Faixa Vermelha (REBAIXAMENTO) */
.col-relegation {
  background: linear-gradient(180deg, rgba(255, 50, 50, 0.1) 0%, rgba(255, 50, 50, 0.03) 100%) !important;
  border-left: 2px solid rgba(255, 0, 60, 0.4) !important;
  border-right: 1px solid rgba(255, 0, 60, 0.05) !important;
}

/* Faixa Verde (ACESSO) */
.col-access {
  background: linear-gradient(180deg, rgba(50, 255, 50, 0.1) 0%, rgba(50, 255, 50, 0.03) 100%) !important;
  border-left: 2px solid rgba(57, 255, 20, 0.4) !important;
  border-right: 1px solid rgba(57, 255, 20, 0.05) !important;
}

/* Ajuste do Header (Integrado à Faixa) */
:deep(thead th).col-total-titulos { border-left-color: rgba(255, 234, 0, 0.3) !important; }
:deep(thead th).col-relegation { border-left-color: rgba(255, 0, 60, 0.3) !important; }
:deep(thead th).col-access { border-left-color: rgba(57, 255, 20, 0.3) !important; }

/* Removido o seletor duplicado de stat-badge */

.col-total-titulos .stat-badge, 
.col-relegation .stat-badge, 
.col-access .stat-badge {
  color: #fff !important;
  text-shadow: 0 0 5px rgba(0,0,0,0.5) !important;
}

/* Removido o conflito de hover segmentado anterior */

/* 5. NEONS E FONTES (SEM SOMBRA/CONTORNO) */
.text-neon-gold { color: #ffea00 !important; }
.text-info-neon { color: #00f2ff !important; }
.text-success-neon { color: #39ff14 !important; }
.text-danger-neon { color: #ff003c !important; }

.name-cell-full {
  white-space: nowrap;
  font-size: 0.75rem;
  letter-spacing: 0;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.3s ease;
}

.fw-black { font-weight: 900; }
.ls-1 { letter-spacing: 1.5px; }

/* Medalhas Mundial */
.medal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  flex-shrink: 0;
}
.medal-dot.mini {
  width: 10px;
  height: 10px;
}
.x-mini-icon {
  font-size: 7px;
  color: rgba(0,0,0,0.5);
}
.bg-gold { background: radial-gradient(circle, #fff 0%, #ffea00 70%, #b8860b 100%) !important; box-shadow: 0 0 8px rgba(255, 234, 0, 0.6); }
.bg-silver { background: radial-gradient(circle, #fff 0%, #c0c0c0 70%, #808080 100%) !important; box-shadow: 0 0 8px rgba(192, 192, 192, 0.6); }
.bg-bronze { background: radial-gradient(circle, #fff 0%, #cd7f32 70%, #8b4513 100%) !important; box-shadow: 0 0 8px rgba(205, 127, 50, 0.4); }
.bg-light-black { background: #444 !important; border: 1px solid rgba(255,255,255,0.2) !important; box-shadow: 0 0 5px rgba(255,255,255,0.05); }

/* 6. ESTILOS DE PERSONALIZAÇÃO NACIONAL E COMPETIÇÃO */
.table-responsive {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-left: 10px;
}

.table {
  width: auto !important;
  margin: 0 auto !important;
  min-width: 60%;
}

.row-competicoes-logos {
  background-color: #ffffff !important;
  background-image: none !important;
  backdrop-filter: none !important;
}

.row-competicoes-logos th {
  background-color: #ffffff !important;
  background-image: none !important;
  color: #333 !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

.header-country-box {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 20, 50, 0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.country-bg-flag {
  position: absolute;
  top: 0;
  right: 0;
  width: 70%; /* Estendido para cobrir mais área */
  height: 100%;
  background-size: cover;
  background-position: right center;
  filter: blur(1px) grayscale(0.2) brightness(0.6);
  opacity: 0.35; /* Acordou mais / Mais brilhante */
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0));
  z-index: 1;
  pointer-events: none;
}

.header-title-main {
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.logo-comp-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 65px; /* <--- AQUI: Aumente este valor para dar mais espaço vertical aos logos */
  transition: transform 0.3s ease;
}

.logo-comp-img {
  max-width: 100%;
  max-height: 65px; /* <--- AQUI: Mude este valor para aumentar/diminuir os logos principais */
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2));
}

.logo-comp-img.mini {
  max-height: 38px; /* <--- AQUI: Mude este valor para os logos menores (Libertadores/Sula mini) */
  opacity: 0.8;
}

.hover-glow:hover {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5) !important;
}

/* 7. ESCUDOS E SCROLLBAR */
:deep(img) {
  transition: transform 0.3s ease;
}
.club-row:hover :deep(img) {
  transform: scale(1.3);
  filter: drop-shadow(0 0 8px rgba(0, 242, 255, 0.4));
}

.custom-scrollbar::-webkit-scrollbar {
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.3);
  border-radius: 10px;
}
/* 7. PAINEL DE ESTATÍSTICAS (SIDEBAR) */
/* REMOVIDO: .stats-sidebar */
/* REMOVIDO: .stats-card */
/* REMOVIDO: .highlight-card */
/* REMOVIDO: .card-label */
/* REMOVIDO: .card-header-stats */
/* REMOVIDO: .club-name-big */
/* REMOVIDO: .ranking-item */
/* REMOVIDO: .rank-pos */
/* REMOVIDO: .rank-name */
/* REMOVIDO: .rank-value */
/* REMOVIDO: .stat-box */
/* REMOVIDO: .stat-box.access */
/* REMOVIDO: .stat-box.relegation */
/* REMOVIDO: .st-val */
/* REMOVIDO: .stat-box.access .st-val */
/* REMOVIDO: .stat-box.relegation .st-val */
/* REMOVIDO: .st-lbl */
/* REMOVIDO: .int-item */
/* REMOVIDO: .mini-logo */
/* REMOVIDO: .int-title */
/* REMOVIDO: .int-vals */

@keyframes pulse-neon-anim {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.7; transform: scale(1); }
}

.text-neon-green {
  color: #39ff14;
  text-shadow: 0 0 8px rgba(57, 255, 20, 0.8);
}

.pulse-neon {
  animation: pulse-neon-anim 2s infinite;
  display: inline-block;
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 1200px) {
  /* REMOVIDO: .stats-sidebar */
}

.cursor-pointer { cursor: pointer; }
.hover-bright:hover { filter: brightness(1.3); color: #00f2ff !important; transition: all 0.2s ease; }
</style>
