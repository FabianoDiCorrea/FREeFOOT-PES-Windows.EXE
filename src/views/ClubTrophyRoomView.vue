<template>
  <div class="view-container animated-fade-in" v-if="clubName">
    <!-- Header com Voltar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="$router.back()" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>VOLTAR
      </button>
      <LogoFREeFOOT />
    </div>

    <!-- Título Principal -->
    <div class="trophy-room-header text-center mb-5">
      <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
         <TeamShield :teamName="clubName" :size="60" borderless />
         <h2 class="text-warning fw-black text-uppercase ls-2 m-0">
           {{ clubName }} - Sala de Troféus
         </h2>
      </div>
      <div class="header-line"></div>
      <p class="text-secondary opacity-75 small text-uppercase ls-1">Galeria Histórica de Conquistas</p>
    </div>

    <!-- Conteúdo Principal -->
    <div class="container-fluid px-4">
      
      <!-- Se não houver troféus -->
      <div v-if="trophies.length === 0" class="text-center py-5">
        <i class="bi bi-trophy opacity-25" style="font-size: 4rem;"></i>
        <p class="mt-3 text-secondary">Nenhum troféu conquistado ainda por este clube.</p>
      </div>

      <!-- Galeria de Troféus -->
      <div v-else class="trophy-gallery">
        
        <div v-for="t in trophies" :key="t.nome" class="trophy-card">
          <div class="trophy-card-inner">
            <!-- Top: Título e Estrelas -->
            <div class="tc-header">
              <!-- Sistema de Estrelas -->
              <div class="tc-stars">
                <div class="stars-display">{{ formatStars(t.count) }}</div>
              </div>
            </div>

            <!-- Middle: Imagem do Troféu -->
            <div class="tc-main">
              <!-- Caixa do Troféu -->
              <div class="tc-trophy-box d-flex align-items-center justify-content-center">
                <img :src="t.trofeuUrl" class="trophy-img" alt="Troféu" @error="handleImgError">
              </div>
              
              <div class="tc-comp-name-large">
                {{ t.nome }}
              </div>
              <div class="text-center mb-2">
                <span class="tc-count-badge">{{ t.count }} {{ t.count === 1 ? 'Título' : 'Títulos' }}</span>
              </div>

              <!-- Bottom: Anos -->
              <div class="tc-footer">
                <div class="tc-dates-list custom-scrollbar mb-3">
                  <div v-for="year in t.dates" :key="year" class="tc-date-item">
                    {{ year }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { seasonService } from '../services/season.service'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { getTrofeuPath, normalizeString, normalizeCountry, clubSmartNormalize } from '../services/utils'
import { clubStore } from '../services/club.store'
import { dataSearchService } from '../services/dataSearch.service'

import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'

const route = useRoute()
const clubName = ref('')
const trophies = ref([])
const clubInfo = ref(null)

const clubNorm = computed(() => normalizeString(clubName.value))
const clubSmart = computed(() => clubSmartNormalize(clubName.value))
const clubCountry = computed(() => clubInfo.value?.pais ? normalizeCountry(clubInfo.value.pais) : null)

const handleImgError = (e) => {
  e.target.style.display = 'none'
}

const formatStars = (count) => {
    const tens = Math.floor(count / 10)
    const fives = Math.floor((count % 10) / 5)
    const ones = count % 5
    
    let result = ''
    if (tens > 0) result += `${tens * 10}x★ `
    if (fives > 0) result += `${fives * 5}x★ `
    if (ones > 0) result += '★'.repeat(ones)
    
    return result.trim() || '★'
}

const isClubMatch = (target, searchNorm, searchSmart) => {
    if (!target) return false
    const targetNorm = normalizeString(target)
    if (targetNorm === searchNorm) return true
    const targetSmart = clubSmartNormalize(target)
    if (searchSmart && targetSmart === searchSmart) return true
    return false
}

const loadData = async () => {
    clubName.value = decodeURIComponent(route.params.id)
    if (!clubName.value) return

    await clubStore.init()
    clubInfo.value = clubStore.list.find(c => normalizeString(c.nome) === normalizeString(clubName.value)) || 
                     dataSearchService.findClub(clubName.value)

    await fetchTrophies()
}

const fetchTrophies = async () => {
    const allSeasons = await seasonService.getAll()
    const grouped = {}

    allSeasons.forEach(s => {
        // Firewall de País
        let sPais = s.pais
        if (!sPais) {
            const lowComp = (s.competitionName || '').toLowerCase()
            if (lowComp.includes('brasileir') || lowComp.includes('copa do brasil')) sPais = 'Brasil'
            if (lowComp.includes('argentin')) sPais = 'Argentina'
        }

        if (clubCountry.value && sPais) {
            const sPaisNorm = normalizeCountry(sPais)
            const isInternational = ['MUNDO', 'EUROPA', 'AMERICA DO SUL', 'CONMEBOL', 'UEFA', 'INTERNACIONAL'].includes(sPaisNorm.toUpperCase())
            if (!isInternational && sPaisNorm !== clubCountry.value) return
        }

        if (isClubMatch(s.campeao, clubNorm.value, clubSmart.value)) {
            const compName = s.competitionName
            if (!grouped[compName]) {
                grouped[compName] = {
                    nome: compName,
                    count: 0,
                    dates: [],
                    trofeuUrl: getTrofeuPathByCompName(compName)
                }
            }
            grouped[compName].count++
            grouped[compName].dates.push(s.ano)
        }
    })

    trophies.value = Object.values(grouped).sort((a, b) => b.count - a.count)
}

const getCompetitionInfo = (name, country = null) => {
    if (!name) return null
    const lowName = normalizeString(name)
    const lowCountry = country ? normalizeString(country) : null

    const allComps = [
        ...ALL_COMPETITIONS_DATA.flatMap(c => c.paises.flatMap(p => p.competicoes || [])),
        ...ALL_COMPETITIONS_DATA.flatMap(c => c.continentais || []),
        ...INTERNATIONAL_DATA
    ]

    return allComps.find(c => {
        const cNome = normalizeString(c.nome)
        const isTargetSuper = lowName.includes('super');
        const isCompSuper = cNome.includes('super');
        if (isTargetSuper !== isCompSuper) return false;

        const isMatch = cNome === lowName || lowName.includes(cNome)
        if (!isMatch) return false
        
        if (lowCountry && c.pais) {
            const cPaisNorm = normalizeString(c.pais)
            const isInt = ['MUNDO', 'EUROPA', 'AMERICA DO SUL', 'CONMEBOL', 'UEFA', 'INTERNACIONAL'].includes(cPaisNorm.toUpperCase())
            if (!isInt && cPaisNorm !== lowCountry) return false
        }
        return true
    })
}

const getTrofeuPathByCompName = (name) => {
    const info = getCompetitionInfo(name)
    if (info && info.trofeu) return getTrofeuPath(info.trofeu)

    if (!name) return null
    const lowName = normalizeString(name)
    
    if (lowName.includes('brasileirao') && lowName.includes('serie a')) return getTrofeuPath('trofeu-brasileirao-serie-a')
    if (lowName.includes('brasileirao') && lowName.includes('serie b')) return getTrofeuPath('trofeu-brasileirao-serie-b')
    if (lowName.includes('brasileirao')) return getTrofeuPath('trofeu-brasileirao-serie-a')
    if (lowName.includes('copa do brasil') && !lowName.includes('super')) return getTrofeuPath('trofeu-copa-do-brasil')
    if (lowName.includes('supercopa do brasil')) return getTrofeuPath('trofeu-supercopa-do-brasil')
    if (lowName.includes('libertadores') && !lowName.includes('recopa')) return getTrofeuPath('trofeu-libertadores')
    if (lowName.includes('recopa')) return getTrofeuPath('trofeu-recopa-sulamericana')
    if (lowName.includes('sul-americana') || lowName.includes('sulamericana')) return getTrofeuPath('trofeu-sulamericana')
    if (lowName.includes('colombia')) return getTrofeuPath('trofeu-liga-colombia')
    if (lowName.includes('mundial')) return getTrofeuPath('trofeu-mundial-de-clubes')

    return `logos/competitions/${name.replace(/\s+/g, '-')}.png`
}

onMounted(loadData)
watch(() => route.params.id, loadData)
</script>

<style scoped>
.trophy-room-header {
    position: relative;
    padding-bottom: 10px;
}

.header-line {
    width: 100px;
    height: 4px;
    background: var(--color-accent, #ffcc00);
    margin: 10px auto;
    border-radius: 2px;
}

.trophy-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding-bottom: 40px;
}

.trophy-card {
    min-height: 480px;
    perspective: 1000px;
}

.trophy-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 15px;
    transition: all 0.4s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.trophy-card:hover .trophy-card-inner {
    border-color: #ffcc00;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.tc-header {
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 5px;
}

.tc-stars {
    text-align: center;
    padding: 5px 0;
}

.stars-display {
    font-size: 1.5rem;
    line-height: 1;
    animation: star-glow 2s ease-in-out infinite;
}

@keyframes star-glow {
    0%, 100% { filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5)); }
    50% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)); }
}

.tc-main {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
}

.tc-trophy-box {
    width: 100%;
    height: 220px;
    margin-bottom: 15px;
}

.trophy-img {
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 5px 15px rgba(255,193,7,0.3));
    transition: transform 0.3s ease;
}

.trophy-card:hover .trophy-img {
    transform: scale(1.1);
}

.tc-comp-name-large {
    font-size: 1.1rem;
    font-weight: 900;
    color: #ffcc00;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 10px;
}

.tc-count-badge {
    display: inline-block;
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 800;
}

.tc-footer {
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 15px;
    width: 100%;
}

.tc-dates-list {
    max-height: 100px;
    overflow-y: auto;
}

.tc-date-item {
    color: rgba(255, 255, 255, 0.8);
    font-weight: bold;
    font-size: 0.9rem;
    padding: 2px 0;
}

.animated-fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
