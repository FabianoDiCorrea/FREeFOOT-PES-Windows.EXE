<template>
  <div class="view-container p-4 min-vh-100 bg-black text-white">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-warning border-opacity-25">
       <div class="d-flex align-items-center gap-3">
          <LogoFREeFOOT size="2rem" />
          <h2 class="m-0 fw-black text-uppercase ls-2 text-warning gold-glow-text">RANKINGS</h2>
       </div>
       <div class="d-flex gap-2">
          <button @click="activeTab = 'clubes'" class="btn btn-sm fw-black px-4 ripple prestige-btn" 
             :class="activeTab === 'clubes' ? 'active' : ''">
             RANK DE CLUBES
          </button>
          <button @click="activeTab = 'selecoes'" class="btn btn-sm fw-black px-4 ripple prestige-btn" 
             :class="activeTab === 'selecoes' ? 'active' : ''">
             RANK DE SELEÇÕES
          </button>
          <button @click="handleOpenModal()" class="btn btn-warning btn-sm fw-black px-4 ms-3 shadow-gold border-0">
             <i class="bi bi-plus-lg me-1"></i> ADICIONAR RANKING
          </button>
       </div>
    </div>

    <!-- CONTENT -->
    <div class="rankings-content custom-scrollbar py-2">
       
       <!-- ACCORDION POR TEMPORADA (ESTILO CHECKLIST) -->
       <div class="checklist-main-wrapper mx-auto" style="max-width: 1100px;">
          
          <div v-for="group in sortedRankings" :key="group.season" class="mb-4">
             <!-- HEADER DA TEMPORADA -->
             <div class="season-header-premium d-flex align-items-center gap-3 p-3 cursor-pointer mb-2" @click="toggleSeason(group.season)">
                <i class="bi" :class="expandedSeasons[group.season] ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
                <h3 class="fw-black text-warning m-0 text-uppercase ls-1">{{ group.season }}</h3>
                <div class="ms-auto d-flex align-items-center gap-3">
                   <span class="badge bg-black text-warning border border-warning border-opacity-25 px-3 py-2 text-uppercase fw-black small">
                      {{ group.ranking.length }} TIMES NO TOP 16
                   </span>
                   <button @click.stop="handleOpenModal(group)" class="btn btn-outline-warning btn-sm border-0 opacity-50 hover-opacity-100">
                      <i class="bi bi-pencil-square"></i>
                   </button>
                   <button @click.stop="confirmDelete(group.season)" class="btn btn-outline-danger btn-sm border-0 opacity-50 hover-opacity-100">
                      <i class="bi bi-trash3"></i>
                   </button>
                </div>
             </div>

             <!-- CONTEÚDO DA TEMPORADA (EXPANSÍVEL) -->
             <div v-if="expandedSeasons[group.season]" class="row g-4 animated-fade-in">
                <!-- COLUNA RANKING (TABELA) -->
                <div class="col-lg-8">
                   <div class="table-rank-container">
                      <table class="table table-dark-premium mb-0">
                         <thead>
                            <tr>
                               <th class="text-center" width="60">POS</th>
                               <th class="text-center" width="80">EVO</th>
                               <th width="80">ESCUDO</th>
                               <th>{{ activeTab === 'clubes' ? 'TIME' : 'SELEÇÃO' }}</th>
                               <th v-if="activeTab === 'clubes'">PAÍS</th>
                               <th class="text-center">BAND.</th>
                               <th class="text-center">FED.</th>
                            </tr>
                         </thead>
                         <tbody>
                            <tr v-for="item in group.ranking" :key="item.teamId" class="rank-row">
                               <td class="text-center fw-black fs-5">{{ item.position }}º</td>
                               <td class="text-center">
                                  <div class="d-flex flex-column align-items-center justify-content-center">
                                     <template v-if="item.isNew">
                                        <span class="badge bg-info text-dark x-small fw-black px-2">NEW</span>
                                     </template>
                                     <template v-else>
                                        <div v-if="item.evolution > 0" class="text-success fw-black small animate-up">
                                           <i class="bi bi-caret-up-fill"></i> +{{ item.evolution }}
                                        </div>
                                        <div v-else-if="item.evolution < 0" class="text-danger fw-black small animate-down">
                                           <i class="bi bi-caret-down-fill"></i> {{ item.evolution }}
                                        </div>
                                        <div v-else class="evolution-neutral"></div>
                                     </template>
                                  </div>
                               </td>
                               <td>
                                  <TeamShield :teamName="item.teamName" :isNational="activeTab === 'selecoes'" :size="45" borderless class="shield-hover" />
                               </td>
                               <td>
                                  <div class="fw-black text-uppercase ls-1 fs-5 d-flex align-items-center gap-3">
                                     {{ item.teamName }}
                                     <i v-if="careerStore.isUserTeam(item.teamName, group.season)" 
                                        class="bi bi-controller text-neon-green pulse-neon fs-4"></i>
                                  </div>
                               </td>
                               <td v-if="activeTab === 'clubes'">
                                  <span class="x-small text-uppercase fw-bold opacity-50">{{ item.country }}</span>
                               </td>
                               <td class="text-center">
                                  <NationalFlag :countryName="item.country" :size="40" class="rounded-circle shadow-sm" />
                               </td>
                               <td class="text-center">
                                  <img v-if="item.federationLogo" :src="item.federationLogo" class="federation-logo-table" />
                               </td>
                            </tr>

                            <!-- MEU TIME (17º) -->
                            <tr v-if="group.myTeam" class="rank-row my-team-row mt-2">
                               <td class="text-center fw-black fs-5 text-warning">{{ group.myTeam.position }}</td>
                               <td class="text-center">
                                  <div class="d-flex flex-column align-items-center justify-content-center">
                                     <template v-if="group.myTeam.isNew">
                                        <span class="badge bg-info text-dark x-small fw-black px-2">NEW</span>
                                     </template>
                                     <template v-else>
                                        <div v-if="group.myTeam.evolution > 0" class="text-success fw-black small animate-up">
                                           <i class="bi bi-caret-up-fill"></i> +{{ group.myTeam.evolution }}
                                        </div>
                                        <div v-else-if="group.myTeam.evolution < 0" class="text-danger fw-black small animate-down">
                                           <i class="bi bi-caret-down-fill"></i> {{ group.myTeam.evolution }}
                                        </div>
                                        <div v-else class="evolution-neutral"></div>
                                     </template>
                                  </div>
                               </td>
                               <td>
                                  <TeamShield :teamName="group.myTeam.teamName" :isNational="activeTab === 'selecoes'" :size="45" borderless class="shield-hover" />
                               </td>
                               <td>
                                  <div class="fw-black text-uppercase ls-1 fs-5 text-warning d-flex align-items-center gap-3">
                                     {{ group.myTeam.teamName }}
                                     <i class="bi bi-controller text-neon-green pulse-neon fs-4"></i>
                                  </div>
                               </td>
                               <td v-if="activeTab === 'clubes'">
                                  <span class="x-small text-uppercase fw-bold opacity-50">{{ group.myTeam.country }}</span>
                               </td>
                               <td class="text-center">
                                  <NationalFlag :countryName="group.myTeam.country" :size="40" class="rounded-circle" />
                               </td>
                               <td class="text-center">
                                  <img v-if="group.myTeam.federationLogo" :src="group.myTeam.federationLogo" class="federation-logo-table" />
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>

                <!-- COLUNA PAÍSES (REPRESENTAÇÃO) -->
                <div class="col-lg-4">
                   <div class="table-side-container p-3">
                      <h5 class="fw-black text-warning text-uppercase mb-3 ls-1 x-small border-bottom border-warning border-opacity-25 pb-2">
                        {{ activeTab === 'clubes' ? 'RANK DE PAÍSES (TOP 16)' : 'RANK DE FEDERAÇÕES (TOP 16)' }}
                      </h5>
                      <div class="d-flex flex-column gap-2">
                         <div v-for="(p, idx) in calculateSidebarStats(group.ranking)" :key="p.name" 
                              class="country-stat-row d-flex align-items-center justify-content-between p-2 rounded-2">
                            <div class="d-flex align-items-center gap-3">
                               <span class="fw-bold text-secondary small" style="width: 20px;">{{ idx + 1 }}º</span>
                               
                               <template v-if="activeTab === 'clubes'">
                                 <NationalFlag :countryName="p.name" :size="30" class="rounded-circle shadow-sm" />
                               </template>
                               <template v-else>
                                 <img v-if="p.logo" :src="p.logo" class="federation-logo-sidebar" />
                                 <i v-else class="bi bi-globe-americas text-secondary fs-4"></i>
                               </template>

                               <span class="fw-bold text-uppercase small ls-1 truncate-country">{{ p.name }}</span>
                            </div>
                            <span class="badge bg-warning text-dark fw-black fs-6">{{ p.count }}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- ESTADO VAZIO -->
          <div v-if="sortedRankings.length === 0" class="text-center py-5 opacity-25">
             <i class="bi bi-trophy fs-1 mb-3 d-block"></i>
             NENHUM RANKING CADASTRADO PARA ESTA CATEGORIA.
          </div>
       </div>

    </div>

    <!-- MODAL ADICIONAR RANKING -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
       <div class="modal-content-premium bg-dark border border-warning border-opacity-50 p-0 shadow-gold-lg">
          <div class="modal-header-premium p-4 border-bottom border-warning border-opacity-25">
             <h4 class="m-0 fw-black text-warning text-uppercase ls-2">{{ isEditing ? 'EDITAR' : 'ADICIONAR' }} RANKING - {{ activeTab === 'clubes' ? 'CLUBES' : 'SELEÇÕES' }}</h4>
             <button class="btn-close-premium" @click="showModal = false"><i class="bi bi-x-lg"></i></button>
          </div>
          
          <div class="modal-body-premium p-4 custom-scrollbar" style="max-height: 70vh;">
             <div class="row g-4">
                <div class="col-md-12">
                   <label class="x-small text-uppercase fw-black text-warning mb-2">TEMPORADA</label>
                   <input type="text" v-model="form.season" class="form-control game-input-gold text-center fs-5 fw-bold" placeholder="EX: 2026 / 2027 - 2026">
                </div>

                <div class="col-md-12">
                   <div class="d-flex justify-content-between align-items-end mb-2">
                      <label class="x-small text-uppercase fw-black text-warning">LISTA DO TOP 16 (UM TIME POR LINHA)</label>
                      <span class="badge bg-black text-warning x-small border border-warning border-opacity-25">{{ linesCount }} LINHAS IDENTIFICADAS</span>
                   </div>
                   <textarea 
                     v-model="form.rawList" 
                     class="form-control game-input-gold font-monospace small" 
                     rows="8" 
                     placeholder="1. Flamengo&#10;2. Palmeiras&#10;3. Real Madrid..."
                   ></textarea>
                </div>

                <div class="col-md-12 border-top border-warning border-opacity-25 pt-4">
                   <h5 class="fw-black text-warning text-uppercase ls-1 x-small mb-3">POSIÇÃO EXTRA (MEU TIME)</h5>
                   <div class="row g-3">
                      <div class="col-md-4">
                         <label class="x-small text-uppercase fw-bold opacity-50 mb-1">POSIÇÃO NO RANKING</label>
                         <input type="text" v-model="form.myTeamPos" class="form-control game-input-gold" placeholder="Ex: 271º">
                      </div>
                      <div class="col-md-8 position-relative">
                         <label class="x-small text-uppercase fw-bold opacity-50 mb-1">NOME DO TIME</label>
                         <input 
                           type="text" 
                           v-model="form.myTeamName" 
                           @input="handleSearchMyTeam"
                           class="form-control game-input-gold" 
                           placeholder="Digite para buscar..."
                         >
                         <!-- Autocomplete -->
                         <div v-if="searchResults.length > 0" class="search-results-floating border border-warning border-opacity-50">
                            <div v-for="res in searchResults" :key="res.id" class="search-item d-flex align-items-center gap-2" @click="selectMyTeam(res)">
                               <TeamShield :teamName="res.nome" :size="25" />
                               <span class="small fw-bold">{{ res.nome }}</span>
                               <span class="ms-auto x-small opacity-50">{{ res.pais }}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div class="modal-footer-premium p-4 border-top border-warning border-opacity-25 d-flex justify-content-end gap-3">
             <button class="btn btn-outline-secondary fw-black px-4" @click="showModal = false">CANCELAR</button>
             <button class="btn btn-warning fw-black px-5 shadow-gold border-0" @click="saveRanking" :disabled="!isFormValid">
                CONCLUIR E SALVAR
             </button>
          </div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { rankingsStore } from '../services/rankings.store'
import { careerStore } from '../services/career.store'
import { dataSearchService } from '../services/dataSearch.service'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import { FEDERATIONS_DATA } from '../services/federations.data'

const activeTab = ref('clubes')
const expandedSeasons = ref({})
const showModal = ref(false)
const searchResults = ref([])

const isEditing = ref(false)
const originalSeason = ref('')
const form = ref({
  season: '',
  rawList: '',
  myTeamPos: '',
  myTeamName: '',
  myTeamId: null
})

onMounted(async () => {
  await rankingsStore.loadAll()
  await careerStore.loadAll()
  if (sortedRankings.value.length > 0) {
    expandedSeasons.value[sortedRankings.value[0].season] = true
  }
})

const sortedRankings = computed(() => {
  const filtered = rankingsStore.list.value.filter(r => r.type === activeTab.value)
  
  // Enriquecer com dados de evolução
  return filtered.map(r => {
    const prev = rankingsStore.getPreviousSeasonRanking(r.season, r.type)
    
    // Normalizador de nomes para comparação segura
    const norm = (n) => n?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    const rankingWithEvo = r.ranking.map(item => {
      // Enriquecimento de federação para dados legados (Seleções)
      let fedLogo = item.federationLogo
      let fedName = item.federationName
      
      if (r.type === 'selecoes' && (!fedLogo || !fedName)) {
          const found = dataSearchService.findNationalTeam(item.teamName)
          if (found) {
              fedLogo = fedLogo || found.federacao_logo || found.continente || ''
              if (!fedName) {
                  const fedEntry = Object.values(FEDERATIONS_DATA).find(f => f.logo === fedLogo)
                  fedName = fedEntry ? fedEntry.nome : ''
              }
          }
      }

      const prevItem = prev?.ranking.find(p => norm(p.teamName) === norm(item.teamName))
      if (prevItem) {
        return { 
          ...item, 
          federationLogo: fedLogo, 
          federationName: fedName, 
          evolution: prevItem.position - item.position, 
          isNew: false 
        }
      }
      // Se não achou no ranking principal, tenta achar no MyTeam da temporada anterior
      const prevMyTeam = prev?.myTeam
      if (prevMyTeam && norm(prevMyTeam.teamName) === norm(item.teamName)) {
         return { 
           ...item, 
           federationLogo: fedLogo, 
           federationName: fedName, 
           evolution: prevMyTeam.position - item.position, 
           isNew: false 
         }
      }
      return { 
        ...item, 
        federationLogo: fedLogo, 
        federationName: fedName, 
        evolution: 0, 
        isNew: true 
      }
    })

    // Calcular evolução para o MyTeam
    let myTeamWithEvo = { ...r.myTeam }
    if (r.myTeam && r.myTeam.teamName) {
       const prevItemInRanking = prev?.ranking.find(p => norm(p.teamName) === norm(r.myTeam.teamName))
       const prevMyTeam = prev?.myTeam && norm(prev?.myTeam.teamName) === norm(r.myTeam.teamName) ? prev.myTeam : null
       
       const prevMatch = prevItemInRanking || prevMyTeam
       if (prevMatch) {
          myTeamWithEvo.evolution = prevMatch.position - r.myTeam.position
          myTeamWithEvo.isNew = false
       } else {
          myTeamWithEvo.evolution = 0
          myTeamWithEvo.isNew = true
       }
    }

    return { ...r, ranking: rankingWithEvo, myTeam: myTeamWithEvo }
  }).sort((a, b) => {
      const getBaseYear = (s) => {
          const parts = s.split('-')
          const yrString = parts[parts.length - 1].trim()
          return parseInt(yrString) || 0
      }
      return getBaseYear(b.season) - getBaseYear(a.season)
  })
})

const linesCount = computed(() => {
  if (!form.value.rawList) return 0
  return form.value.rawList.split('\n').filter(l => l.trim() !== '').length
})

const isFormValid = computed(() => {
  return form.value.season && form.value.rawList && linesCount.value >= 1
})

const handleOpenModal = (group = null) => {
  if (group) {
    isEditing.value = true
    originalSeason.value = group.season
    // Formatar a lista de volta para o textarea
    const listString = group.ranking.map(r => `${r.position}. ${r.teamName}`).join('\n')
    
    form.value = {
      season: group.season,
      rawList: listString,
      myTeamPos: group.myTeam?.position || '',
      myTeamName: group.myTeam?.teamName || '',
      myTeamId: group.myTeam?.teamId || null
    }
  } else {
    isEditing.value = false
    form.value = {
      season: '',
      rawList: '',
      myTeamPos: '',
      myTeamName: '',
      myTeamId: null
    }
  }
  showModal.value = true
}

const toggleSeason = (season) => {
  expandedSeasons.value[season] = !expandedSeasons.value[season]
}

const handleSearchMyTeam = () => {
  if (form.value.myTeamName.length < 2) {
    searchResults.value = []
    return
  }
  const term = form.value.myTeamName.toLowerCase()
  if (activeTab.value === 'clubes') {
      import('../data/clubs.data').then(m => {
          searchResults.value = m.CLUBS_DATA.filter(c => c.nome.toLowerCase().includes(term)).slice(0, 5)
      })
  } else {
      import('../data/nationalTeams.data').then(m => {
          searchResults.value = m.NATIONAL_TEAMS_DATA.filter(n => n.nome.toLowerCase().includes(term)).slice(0, 5)
      })
  }
}

const selectMyTeam = (team) => {
  form.value.myTeamName = team.nome
  form.value.myTeamId = team.id
  searchResults.value = []
}

const saveRanking = async () => {
  const lines = form.value.rawList.split('\n').filter(l => l.trim() !== '')
  const parsedRanking = []

  for (let i = 0; i < lines.length; i++) {
    // Extrair apenas o nome, removendo numeração de início e qualquer "- País" ou "|" do final se houver
    const rawName = lines[i].replace(/^\d+[\s.]+|[-|]+.*$/g, '').trim()
    const found = dataSearchService.search(rawName, activeTab.value === 'selecoes' ? 'selecao' : 'clube')
    
    let fedLogo = found?.escudo_url || found?.federacao_logo || ''
    let fedName = ''

    if (activeTab.value === 'selecoes' && found) {
        fedLogo = found.federacao_logo || found.continente || ''
        // Tenta encontrar o nome da federação pelo logo
        const fedEntry = Object.values(FEDERATIONS_DATA).find(f => f.logo === fedLogo)
        fedName = fedEntry ? fedEntry.nome : ''
    }

    parsedRanking.push({
      position: i + 1,
      teamName: found?.nome || rawName,
      teamId: found?.id || null,
      country: found?.pais || found?.nome || '',
      federationLogo: fedLogo,
      federationName: fedName
    })
  }

  let myTeam = null
  if (form.value.myTeamName) {
    const fMy = dataSearchService.search(form.value.myTeamName)
    let myFedLogo = fMy?.federacao_logo || ''
    let myFedName = ''

    if (activeTab.value === 'selecoes' && fMy) {
        myFedLogo = fMy.federacao_logo || fMy.continente || ''
        const fedEntry = Object.values(FEDERATIONS_DATA).find(f => f.logo === myFedLogo)
        myFedName = fedEntry ? fedEntry.nome : ''
    }

    myTeam = {
      position: form.value.myTeamPos,
      teamName: fMy?.nome || form.value.myTeamName,
      country: fMy?.pais || fMy?.nome || '',
      federationLogo: myFedLogo,
      federationName: myFedName
    }
  }

  if (isEditing.value && originalSeason.value !== form.value.season) {
    await rankingsStore.delete(originalSeason.value, activeTab.value)
  }

  await rankingsStore.save({
    season: form.value.season,
    type: activeTab.value,
    ranking: parsedRanking,
    myTeam: myTeam
  })

  showModal.value = false
  expandedSeasons.value[form.value.season] = true
  await rankingsStore.loadAll() // Recarregar para garantir reatividade
}

const confirmDelete = async (season) => {
  if (confirm(`Excluir ranking de ${season}?`)) {
    await rankingsStore.delete(season, activeTab.value)
  }
}

const calculateSidebarStats = (ranking) => {
  const stats = {}
  
  if (activeTab.value === 'clubes') {
      ranking.forEach(item => {
        if (!item.country) return
        if (!stats[item.country]) stats[item.country] = { name: item.country, count: 0 }
        stats[item.country].count++
      })
      return Object.values(stats).sort((a, b) => b.count - a.count)
  } else {
      // Para seleções, agrupar por federação
      ranking.forEach(item => {
        const key = item.federationName || 'Outros'
        if (!stats[key]) stats[key] = { name: key, count: 0, logo: item.federationLogo }
        stats[key].count++
      })
      return Object.values(stats).sort((a, b) => b.count - a.count)
  }
}
</script>

<style scoped>
.gold-glow-text {
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.4);
}

.shadow-gold {
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
}

.shadow-gold-sm {
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.2);
}

.shadow-gold-lg {
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.2);
}

.prestige-btn {
  background: rgba(40, 40, 40, 0.5);
  color: #999;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.prestige-btn:hover {
  background: rgba(60, 60, 60, 0.7);
  color: white;
}

.prestige-btn.active {
  background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
  color: black;
  border-color: #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.season-header-premium {
  background: linear-gradient(90deg, #111 0%, #222 100%);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-left: 4px solid #FFD700;
  transition: all 0.3s;
}

.season-header-premium:hover {
  background: linear-gradient(90deg, #181818 0%, #282828 100%);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: inset 0 0 15px rgba(255, 215, 0, 0.05);
}

.table-rank-container {
  background: #0a0a0a;
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.table-dark-premium {
  --bs-table-bg: transparent;
  --bs-table-color: white;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.table-dark-premium thead th {
  background: #151515;
  color: #FFD700;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 2px;
  font-weight: 900;
  padding: 1.2rem 1rem;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
}

.rank-row {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.rank-row:last-child {
  border-bottom: none;
}

.rank-row:hover {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.05) 0%, transparent 100%) !important;
  box-shadow: inset 4px 0 0 #FFD700;
  transform: translateX(5px);
}

.rank-row td {
  padding: 1rem;
  vertical-align: middle;
}

.my-team-row {
  background: rgba(255, 215, 0, 0.12) !important;
  border-top: 2px solid rgba(255, 215, 0, 0.3);
}

.table-side-container {
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.country-stat-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  transition: all 0.2s;
}

.country-stat-row:hover {
  background: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.3);
  transform: scale(1.02);
}

.federation-logo-table {
  height: 35px;
  width: 35px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
}

.federation-logo-sidebar {
  height: 24px;
  width: 24px;
  object-fit: contain;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s;
}

.modal-content-premium {
  width: 100%;
  max-width: 700px;
  border-radius: 15px;
  overflow: hidden;
}

.game-input-gold {
  background: #151515;
  border: 2px solid rgba(255, 215, 0, 0.1);
  color: white;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  transition: all 0.3s;
}

.game-input-gold:focus {
  background: #1a1a1a;
  border-color: #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
  outline: none;
}

.search-results-floating {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #1a1a1a;
  z-index: 10;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.search-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-item:hover {
  background: rgba(255, 215, 0, 0.1);
}

.animated-fade-in {
  animation: fadeInDown 0.4s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulseOpacity {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.animate-up { animation: slideInUp 0.5s ease-out; }
.animate-down { animation: slideInDown 0.5s ease-out; }
.animate-pulse { animation: pulseOpacity 1.5s infinite; }

.federation-logo-table:hover, .shield-hover:hover {
  transform: scale(1.2) rotate(5deg);
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Slim scrollbar inside modal body */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

.badge { border-radius: 4px; }
.x-small { font-size: 0.65rem; }
.ls-2 { letter-spacing: 2px; }
.ls-1 { letter-spacing: 1px; }

.truncate-country {
  display: inline-block;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.evolution-neutral {
  width: 12px;
  height: 3px;
  background-color: var(--bs-info);
  border-radius: 2px;
  margin: 10px 0;
  box-shadow: 0 0 5px rgba(13, 202, 240, 0.5);
}

.text-neon-green {
  color: #39FF14 !important;
  text-shadow: 0 0 5px rgba(57, 255, 20, 0.5), 0 0 10px rgba(57, 255, 20, 0.3);
}

.pulse-neon {
  animation: pulseNeon 2s infinite;
}

@keyframes pulseNeon {
  0% { transform: scale(1); opacity: 0.7; filter: drop-shadow(0 0 2px #39FF14); }
  50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 8px #39FF14); }
  100% { transform: scale(1); opacity: 0.7; filter: drop-shadow(0 0 2px #39FF14); }
}
</style>
