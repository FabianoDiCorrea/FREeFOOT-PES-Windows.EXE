<template>
  <div class="view-container animated-fade-in">
    <!-- Header com Voltar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="$router.push('/universo')" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>VOLTAR AO UNIVERSO
      </button>
      <LogoFREeFOOT />
    </div>

    <!-- Título Principal -->
    <div class="trophy-room-header text-center mb-5">
      <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
        <NationalFlag :countryName="countryName" :size="40" class="shadow-sm border border-secondary border-opacity-25 rounded-circle" />
        <h2 class="text-warning fw-black text-uppercase ls-2 m-0">
          <i class="bi bi-trophy-fill me-2"></i>Sala de Troféus - {{ countryName }}
        </h2>
      </div>
      <div class="header-line"></div>
      <p class="text-secondary opacity-75 small text-uppercase ls-1">Histórico de Conquistas Nacionais</p>
    </div>

    <!-- Conteúdo Principal -->
    <div class="container-fluid px-4">
      
      <!-- Se estiver carregando -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-warning mb-3"></div>
        <p class="opacity-50 text-uppercase fw-bold">GARIMPANDO CAMPEÕES...</p>
      </div>

      <!-- Se não houver dados -->
      <div v-else-if="competitions.length === 0" class="text-center py-5">
        <i class="bi bi-trophy opacity-25" style="font-size: 4rem;"></i>
        <p class="mt-3 text-secondary">Ainda não existem dados arquivados sobre os campeões deste país.</p>
      </div>

      <!-- Lista de Competições -->
      <div v-else>
        <div v-for="comp in competitions" :key="comp.nome" class="competition-section mb-5">
          
          <!-- Faixa da Competição -->
          <div class="comp-banner d-flex align-items-center gap-4 px-4 py-3 mb-4 rounded-3 shadow-lg position-relative overflow-hidden">
             <!-- Efeito de Fundo -->
             <div class="banner-glass"></div>
             
             <!-- Logo Competição (ou Troféu) -->
             <div class="comp-logo-container z-1">
                <img v-if="getCompLogoUrl(comp)" :src="getCompLogoUrl(comp)" class="comp-logo-img" @error="handleImgError" />
                <i v-else class="bi bi-trophy text-warning display-4"></i>
             </div>

             <!-- Info da Competição -->
             <div class="z-1">
                <h3 class="fw-black text-white text-uppercase m-0 ls-1" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">{{ comp.nome }}</h3>
                <span class="badge bg-warning text-dark fw-bold mt-1 text-uppercase">{{ comp.tipo || 'Competição Nacional' }}</span>
             </div>
          </div>

          <!-- Grid de Campeões -->
          <div class="trophy-grid">
            <div v-for="club in comp.champions" :key="club.nome" class="trophy-card cursor-pointer" @click="navigateToClubHistory(club.nome)">
              <div class="tc-inner shadow-lg d-flex flex-column h-100 position-relative">
                
                <!-- Escudo Grande de Fundo (Marca d'água) -->
                <div class="tc-bg-shield pointer-events-none">
                   <TeamShield :teamName="club.nome" :size="240" class="shield-watermark" borderless />
                </div>

                <!-- Sistema de Estrelas -->
                <div class="tc-stars text-center py-2 flex-shrink-0 position-relative z-index-2">
                   <span class="stars-text">{{ formatStars(club.count) }}</span>
                </div>

                <!-- Troféu centralizado e Clube -->
                <div class="tc-trophy-img-container flex-grow-1 d-flex flex-column align-items-center justify-content-center position-relative z-index-2">
                   
                   <!-- Imagem da Taça -->
                   <img v-if="getCompTrophyUrl(comp) || getCompLogoUrl(comp)" :src="getCompTrophyUrl(comp) || getCompLogoUrl(comp)" class="tc-img" @error="handleImgError" />
                   <i v-else class="bi bi-trophy-fill text-warning opacity-75" style="font-size: 5rem;"></i>
                   <div class="tc-glow"></div>
                   
                   <!-- Nome do Clube em Destaque -->
                   <div class="club-title-container w-100 mt-3 pt-2 text-center" style="border-top: 1px solid rgba(255,255,255,0.05);">
                       <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
                           <TeamShield :teamName="club.nome" :size="30" borderless />
                           <h5 class="fw-black text-info-neon text-uppercase m-0">{{ club.nome }}</h5>
                       </div>
                       <span class="badge bg-dark border border-secondary text-warning fw-bold">{{ club.count }} {{ club.count > 1 ? 'TÍTULOS' : 'TÍTULO' }}</span>
                   </div>

                </div>

                <!-- Lista de Anos -->
                <div class="tc-dates-list mt-3 flex-shrink-0 position-relative z-index-2">
                  <div v-for="(yearObj, idx) in club.years" :key="idx" class="tc-date-item text-center d-flex justify-content-center align-items-center gap-2">
                    {{ yearObj.year }}
                    <i v-if="yearObj.isMyCareer" class="bi bi-controller text-neon-green neon-pulse-icon" title="Conquista na Sua Carreira"></i>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { seasonStore } from '../services/season.store'

import { careerStore } from '../services/career.store'
import { getTrofeuPath, normalizeString } from '../services/utils'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import NationalFlag from '../components/NationalFlag.vue'
import TeamShield from '../components/TeamShield.vue'

const route = useRoute()
const router = useRouter()
const countryName = ref('')

const loading = ref(true)
const competitions = ref([])

onMounted(async () => {
    countryName.value = decodeURIComponent(route.params.id)
    
    if (seasonStore.list.length === 0) {
        await seasonStore.loadAll()
    }
    
    if (careerStore.history.length === 0) {
        await careerStore.loadAll()
    }

    processCountryData()
})

const handleImgError = (e) => {
    e.target.style.display = 'none'
}

/**
 * Agrupa todos os campeões de todas as temporadas do Universo que são relativas a copas e ligas deste país.
 */
const processCountryData = () => {
    // 1. Extrair quais competições pertencem ao país
    const countryObj = ALL_COMPETITIONS_DATA
        .flatMap(cont => cont.paises || [])
        .find(p => normalizeString(p.nome) === normalizeString(countryName.value))

    const validComps = countryObj ? (countryObj.competicoes || []) : []

    // 2. Criar mapinha para agrupar -> { "Brasileirão Série A": { compObj, champions: { "Cruzeiro": [2027, 2026] } } }
    const groupedData = {}

    validComps.forEach(c => {
        groupedData[c.nome] = {
            compInfo: c,
            championsMap: {}
        }
    })

    // 3. Varrer o SeasonStore inteiro procurando ocorrências destas ligas.
    seasonStore.list.forEach(season => {
        const compName = season.competitionName
        const champion = season.campeao

        // Pular se não tiver campeão definido ou se não for uma competição deste país
        if (!champion || champion === '---' || champion.trim() === '') return
        
        // Encontrar a "chave oficial" da competição ignorando maiusculas/minusculas
        const officialCompKey = Object.keys(groupedData).find(key => normalizeString(key) === normalizeString(compName))

        if (officialCompKey) {
            const yearStr = (season.ano || '').toString().trim()
            if (!yearStr) return

            if (!groupedData[officialCompKey].championsMap[champion]) {
                groupedData[officialCompKey].championsMap[champion] = {
                    nome: champion,
                    count: 0,
                    years: [],
                    isMyCareer: false
                }
            }
            // Verificar se o título tbm pertence à Career do usuário naquele Time e Ano específico ou Manual
            const hasCareerTitle = careerStore.history.some(h => 
                normalizeString(h.timeNome) === normalizeString(champion) && 
                (h.temporada.toString().includes(yearStr) || (h.titulos && h.titulos.some(t => normalizeString(t.nome) === normalizeString(compName))))
            )

            groupedData[officialCompKey].championsMap[champion].count++
            groupedData[officialCompKey].championsMap[champion].years.push({
                year: yearStr,
                isMyCareer: hasCareerTitle
            })
        }
    })

    // 4. Transformar o Map em Arrays formatados para renderização do Vue
    const finalArray = []

    for (const [compName, data] of Object.entries(groupedData)) {
        const championsArray = Object.values(data.championsMap)
        
        // Só renderiza a faixa da competição se tiver pelo menos 1 clube que a ganhou.
        if (championsArray.length > 0) {
            
            // Ordena as datas internamente para cada clube (Mais nova no topo)
            championsArray.forEach(club => {
                club.years.sort((a,b) => {
                    const yearA = parseInt(a.year.split('/')[0]) || 0
                    const yearB = parseInt(b.year.split('/')[0]) || 0
                    return yearB - yearA
                })
            })

            // Ordena os Clubes (Quem tem mais títulos aparece primeiro no Grid)
            championsArray.sort((a,b) => b.count - a.count)

            finalArray.push({
                nome: compName,
                tipo: data.compInfo.tipo,
                logo: data.compInfo.logo,
                trofeu: data.compInfo.trofeu,
                champions: championsArray
            })
        }
    }

    // Ordenar as Prateleiras de Competições
    // Ligas primeiro, depois Copas, depois Supercopas...
    const typeOrder = { 'Liga': 1, 'Copa': 2, 'Supercopa': 3 }
    finalArray.sort((a,b) => {
        // Ordena por Tipo
        const tA = typeOrder[a.tipo] || 99
        const tB = typeOrder[b.tipo] || 99
        if (tA !== tB) return tA - tB
        // Desempate por Nome Alfabético
        return a.nome.localeCompare(b.nome)
    })

    competitions.value = finalArray
    loading.value = false
}

// Utilitários Visuais
const getCompLogoUrl = (comp) => {
    if (comp.logo) return comp.logo
    return null
}

const getCompTrophyUrl = (comp) => {
    if (comp.trofeu) return getTrofeuPath(comp.trofeu)
    return null
}

const formatStars = (count) => {
    const tens = Math.floor(count / 10)
    const fives = Math.floor((count % 10) / 5)
    const ones = count % 5
    
    let result = ''
    if (tens > 0) result += `${tens * 10}x⭐ `
    if (fives > 0) result += `${fives * 5}x⭐ `
    if (ones > 0) result += '⭐'.repeat(ones)
    
    return result.trim() || '⭐'
}
const navigateToClubHistory = (name) => {
    router.push({ name: 'club-history', params: { id: encodeURIComponent(name) } })
}
</script>

<style scoped>
.animated-fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.trophy-room-header {
    margin-bottom: 2rem;
}

.header-line {
    height: 2px;
    width: 200px;
    background: linear-gradient(90deg, transparent, #ffc107, transparent);
    margin: 0 auto;
}

.comp-banner {
    background: linear-gradient(135deg, #151a24 0%, #0a0c10 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 5px solid #ffc107;
}

.banner-glass {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 100%);
    z-index: 0;
}

.comp-logo-img {
    height: 80px;
    object-fit: contain;
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));
}

/* Grid de Clubes IDÊNTICO ao TrophyRoom/Modal */
.trophy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

.trophy-card {
    perspective: 1000px;
}

.tc-inner {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.trophy-card:hover .tc-inner {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(255, 215, 0, 0.05);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.tc-stars {
    font-size: 1.2rem;
    color: #ffd700;
    filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));
    min-height: 35px;
}

.tc-img {
    height: 180px;
    object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));
    z-index: 2;
    transition: transform 0.3s ease;
}

.trophy-card:hover .tc-img {
    transform: scale(1.1);
}

.tc-glow {
    position: absolute;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.text-info-neon {
    color: #fff;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.tc-bg-shield {
    position: absolute;
    top: -30px;
    left: -30px;
    transform: rotate(-25deg);
    z-index: 0;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

.shield-watermark {
    opacity: 0.06;
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
}

.pointer-events-none {
    pointer-events: none;
}

.z-index-2 {
    z-index: 2;
}

/* Lista Empilhada de Datas (Idêntico) */
.tc-dates-list {
    max-height: 120px;
    overflow-y: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 0.5rem;
    z-index: 2;
}

.tc-dates-list::-webkit-scrollbar {
    width: 6px;
}

.tc-dates-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.tc-dates-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
}

.tc-date-item {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 800;
    font-size: 0.85rem;
    letter-spacing: 1px;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tc-date-item:last-child {
    border-bottom: none;
}

.neon-pulse-icon {
    font-size: 1.1rem;
}
</style>
