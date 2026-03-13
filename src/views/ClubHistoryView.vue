<template>
  <div class="view-container animated-fade-in" v-if="clubName">
    <!-- Header com Voltar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="$router.back()" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>VOLTAR
      </button>
      <LogoFREeFOOT />
    </div>

    <!-- CABEÇALHO DO CLUBE -->
    <div class="club-header-panel mb-4 p-4 rounded-4 shadow-lg position-relative overflow-hidden">
      <!-- Background com escudo desfocado -->
      <div class="club-header-bg">
        <TeamShield :teamName="clubName" :size="300" borderless class="bg-shield-blur" />
      </div>

      <div class="position-relative z-1 d-flex flex-wrap align-items-center gap-4">
        <div class="club-shield-wrap p-2 bg-dark bg-opacity-50 rounded-circle border border-gold-glow">
          <TeamShield :teamName="clubName" :size="120" borderless />
        </div>
        
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-3">
            <h1 class="display-4 fw-black text-white text-uppercase m-0 ls-n2">{{ clubName }}</h1>
            <!-- Ícone Neon do Treinador no Cabeçalho -->
            <div v-if="isAnyYearMyCareer" class="header-coach-neon neon-pulse-icon" title="Você comandou este clube">
              <i class="bi bi-controller"></i>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3 mt-2">
            <div v-if="clubInfo" class="d-flex align-items-center gap-2 opacity-75 fw-bold text-uppercase ls-1">
                <NationalFlag :countryName="clubInfo.pais" :size="20" />
                <span>{{ clubInfo.pais }}</span>
                <span class="mx-1 opacity-25">|</span>
                <span>{{ clubInfo.continente }}</span>
            </div>
            <div class="badge bg-gold text-dark fw-black px-3 py-1">TOTAL: {{ trophies.length }} TÍTULOS</div>
          </div>
        </div>

        <div class="d-flex gap-2 ms-auto">
           <div class="stat-box-gold">
              <div class="val">{{ totalChampion }}</div>
              <div class="lbl">TÍTULOS</div>
           </div>
           <div class="stat-box-silver">
              <div class="val">{{ totalVice }}</div>
              <div class="lbl">VICES</div>
           </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- COLUNA LATERAL: SALA DE TROFÉUS -->
      <div class="col-lg-4 col-xl-3">
        <GamePanel customClass="h-100 border-gold-glow">
           <div class="p-3 border-bottom border-secondary border-opacity-10 d-flex align-items-center justify-content-between">
              <h5 class="m-0 fw-black text-warning text-uppercase ls-1">
                 <i class="bi bi-trophy-fill me-2"></i>SALA DE TROFÉUS
              </h5>
           </div>

           <div class="p-3 custom-scrollbar" style="max-height: 700px;">
              <div v-if="trophies.length === 0" class="text-center py-5 opacity-25">
                 <i class="bi bi-trophy display-1"></i>
                 <p class="mt-2 fw-bold">NENHUM TÍTULO</p>
              </div>
              
              <div v-for="t in trophies" :key="t.nome" class="trophy-row-item mb-4 animate-slide-in">
                 <div class="d-flex align-items-center gap-3">
                    <img :src="t.trofeuUrl" class="trophy-thumb" @error="handleImgError" />
                    <div>
                       <div class="d-flex align-items-center gap-2">
                          <span class="badge bg-warning text-dark fw-black">{{ t.count }}x</span>
                          <h6 class="m-0 fw-black text-white text-uppercase" style="font-size: 0.9rem;">{{ t.nome }}</h6>
                       </div>
                       <div class="small opacity-50 mt-1 text-uppercase ls-1" style="font-size: 0.75rem;">
                          {{ t.dates.join(', ') }}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </GamePanel>
      </div>

      <!-- COLUNA PRINCIPAL: LINHA DO TEMPO ANUAL -->
      <div class="col-lg-8 col-xl-9">
         <GamePanel customClass="h-100 p-0 overflow-hidden">
            <div class="p-3 bg-black bg-opacity-30 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10">
               <h5 class="m-0 fw-black text-info text-uppercase ls-1">
                  <i class="bi bi-clock-history me-2"></i>RAIO-X HISTÓRICO ANUAL
               </h5>
               <div class="small opacity-50 fw-bold">DADOS AGRUPADOS POR TEMPORADA</div>
            </div>

            <div class="timeline-scroll-container p-4 custom-scrollbar" style="max-height: 700px; background: rgba(0,0,0,0.2);">
               <div v-if="timelineEvents.length === 0" class="text-center py-5">
                  <i class="bi bi-map opacity-10 display-1 mb-3 d-block"></i>
                  <h4 class="text-secondary text-uppercase fw-black">Registros não localizados</h4>
                  <p class="opacity-50">Não encontramos participações deste clube em nossa base de temporadas.</p>
               </div>

               <div v-else class="timeline-v2">
                  <div v-for="(yearGroup, idx) in timelineEvents" :key="idx" class="timeline-year-block d-flex gap-4 mb-5 animate-slide-up">
                     
                     <!-- DATA -->
                      <div class="timeline-date-side text-end py-2" style="width: 120px; flex-shrink: 0;">
                         <div class="opacity-50 fw-bold x-small">{{ yearGroup.year.includes('=') ? yearGroup.year.split('=')[0].trim() : '' }}</div>
                         <div class="display-5 fw-black text-white-glow">{{ yearGroup.shortYear }}</div>
                      </div>

                     <!-- TRILHA -->
                     <div class="timeline-trilha-side position-relative py-2" style="width: 20px; flex-shrink: 0;">
                        <div class="timeline-main-line"></div>
                        <div class="timeline-main-bullet shadow-lg" :class="yearGroup.bulletClass"></div>
                     </div>

                     <!-- CONTEÚDO (CARTÃO ANUAL) -->
                     <div class="timeline-main-content flex-grow-1">
                        <div class="year-card-dashboard p-4 rounded-4 shadow-2xl position-relative overflow-hidden" :class="yearGroup.cardClass">
                           
                           <!-- Eventos de Competição -->
                           <div v-for="(evt, eIdx) in yearGroup.events" :key="eIdx" class="event-row-timeline py-3" :class="{'border-bottom border-white border-opacity-10': eIdx !== yearGroup.events.length - 1}">
                              <div class="d-flex align-items-center justify-content-between mb-2">
                                  <div class="d-flex align-items-center gap-2">
                                     <div class="competition-indicator" :class="evt.statusClass"></div>
                                     <img v-if="evt.compLogo" :src="evt.compLogo" class="comp-logo-mini" @error="handleImgError" />
                                     <span class="fw-bold text-uppercase ls-1 opacity-75 small">{{ evt.compName }}</span>
                                  </div>
                                  <span v-if="evt.badgeText" class="badge rounded-pill px-4 py-2 fw-black timeline-badge-v2 shadow-sm fs-6" :class="evt.badgeClass">{{ evt.badgeText }}</span>
                              </div>

                              <div class="d-flex align-items-start gap-4 mt-2">
                                  <div v-if="evt.type === 'champion' && evt.trophyUrl" class="trophy-main-wrap">
                                     <img :src="evt.trophyUrl" @error="handleImgError" class="trophy-main-img" />
                                  </div>
                                   <div v-else-if="evt.type === 'award'" class="award-dual-blocks d-flex gap-2">
                                     <!-- Bloco Foto -->
                                     <div v-if="evt.scFoto" class="award-square-block photo-block" @click="openPhotoZoom(evt.scFoto)" style="cursor: zoom-in;" title="Clique para ampliar">
                                        <img :src="getCachedUrl(evt.scFoto)" @error="handleImgError" />
                                        <i class="bi bi-person opacity-25 position-absolute" style="font-size: 2rem;"></i>
                                     </div>
                                     
                                     <!-- Bloco Troféu -->
                                     <div v-if="evt.trophyUrl" class="award-square-block trophy-block">
                                        <img :src="evt.trophyUrl" @error="handleImgError" />
                                     </div>

                                     <!-- Fallback (caso não tenha nada) -->
                                     <div v-if="!evt.scFoto && !evt.trophyUrl" class="event-icon-circle bg-info bg-opacity-10 border-info border-opacity-25">
                                        <i :class="evt.icon" class="text-info fs-3 opacity-50"></i>
                                     </div>
                                   </div>
                                  <div v-else class="event-icon-circle bg-dark bg-opacity-50 border-white border-opacity-10">
                                     <TeamShield :teamName="evt.clubShield" :size="40" borderless />
                                  </div>

                                  <div class="flex-grow-1">
                                     <div class="d-flex justify-content-between align-items-start">
                                        <h4 class="fw-black text-white m-0 ls-n1" :class="evt.textClass">{{ evt.description }}</h4>
                                        <!-- Ícone do Treinador Pulsante (Dentro do evento se for sua carreira) -->
                                        <div v-if="evt.isMyCareer" class="coach-indicator-pulse-v2 neon-pulse-icon" title="Você comandou o time neste ano">
                                           <i class="bi bi-controller"></i>
                                        </div>
                                     </div>
                                     
                                     <!-- PRINTS/FOTOS DA TEMPORADA -->
                                    <div v-if="evt.prints && evt.prints.length > 0" class="mt-3 d-flex gap-2 flex-wrap">
                                       <div v-for="(url, pIdx) in evt.prints" :key="pIdx" class="mini-print-timeline" @click="openPhotoZoom(url)">
                                          <img :src="getCachedUrl(url)" />
                                          <div class="print-overlay-icon"><i class="bi bi-zoom-in"></i></div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                  </div>
               </div>
            </div>
         </GamePanel>
      </div>
    </div>

    <!-- PHOTO ZOOM MODAL -->
    <div v-if="showPhotoZoom" class="photo-zoom-overlay" @click.self="showPhotoZoom = false">
      <div class="zoom-content-container">
        <button class="btn-close-zoom" @click="showPhotoZoom = false">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="getCachedUrl(zoomedPhotoUrl)" class="zoomed-image-full">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { careerStore } from '../services/career.store'
import { awardsStore } from '../services/awards.store'
import { clubStore } from '../services/club.store'
import { seasonService } from '../services/season.service'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { getTrofeuPath, normalizeString, getSeasonFinalYear, clubSmartNormalize } from '../services/utils'
import { dataSearchService } from '../services/dataSearch.service'
import { imageCacheService } from '../services/imageCache.service'

const showPhotoZoom = ref(false)
const zoomedPhotoUrl = ref('')

const openPhotoZoom = (url) => {
  if (!url) return
  zoomedPhotoUrl.value = url
  showPhotoZoom.value = true
}

import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import GamePanel from '../components/GamePanel.vue'

// Import de Troféus Individuais
import imgMelhorMundo from '../assets/trofeus/individuais/melhor_do_mundo.png'
import imgMelhorTecnico from '../assets/trofeus/individuais/melhor_tecnico_mundo.png'
import imgMelhorEuropa from '../assets/trofeus/individuais/melhor_da_europa.png'
import imgMelhorAmerica from '../assets/trofeus/individuais/melhor_da_america.png'
import imgMelhorConcacaf from '../assets/trofeus/individuais/melhor_da_concacaf.png'

const trophyMap = {
  'Melhor do Mundo': imgMelhorMundo,
  'Melhor do Mundo (Técnico)': imgMelhorTecnico,
  'Melhor da Europa': imgMelhorEuropa,
  'Melhor da CONMEBOL (Rei da América)': imgMelhorAmerica,
  'Melhor da CONCACAF': imgMelhorConcacaf
}
const route = useRoute()
const clubName = ref('')
const loading = ref(false)
const trophies = ref([])
const timelineEvents = ref([])
const clubInfo = ref(null)
const cachedLogos = ref({})

// Estatísticas Rápidas
const isAnyYearMyCareer = computed(() => {
  return timelineEvents.value.some(g => g.isMyCareer)
})

const totalChampion = ref(0)
const totalVice = ref(0)

const getCachedUrl = (url) => {
  if (!url) return null
  if (url.startsWith('data:')) return url
  return cachedLogos.value[url] || url
}

const handleImgError = (e) => {
  // e.target.style.display = 'none' // Desativado para não sumir com a foto se o cache for lento
}


/**
 * Verifica se o nome do clube bate com a busca, sendo flexível com sufixos.
 */
const isClubMatch = (target, searchNorm, searchSmart) => {
    if (!target) return false
    const targetNorm = normalizeString(target)
    if (targetNorm === searchNorm) return true
    
    // Smart match usando a normalização global do utils.js
    const targetSmart = clubSmartNormalize(target)
    if (searchSmart && targetSmart === searchSmart) return true

    return false
}

const loadClubData = async () => {
  clubName.value = decodeURIComponent(route.params.id)
  if (!clubName.value) return

  loading.value = true
  
  // Garantir que todas as bases estão prontas
  // No Raio-X sempre queremos a base COMPLETA para não mostrar apenas 
  // o filtro da última competição visitada.
  await seasonStore.loadAll()
  if (careerStore.history.length === 0) await careerStore.loadAll()
  if (awardsStore.list.length === 0) await awardsStore.loadAll()
  if (clubStore.list.length === 0) await clubStore.loadAll()

  clubInfo.value = clubStore.list.find(c => normalizeString(c.nome) === normalizeString(clubName.value)) || 
                   dataSearchService.findClub(clubName.value)

  const clubNorm = normalizeString(clubName.value)
  const clubSmart = clubSmartNormalize(clubName.value)
  const clubCountry = clubInfo.value?.pais ? normalizeString(clubInfo.value.pais) : null

  await loadTrophies(clubNorm, clubSmart, clubCountry)
  await loadTimeline(clubNorm, clubSmart, clubCountry)
  
  loading.value = false
}

const loadTrophies = async (clubNorm, clubSmart, clubCountry) => {
  // Bypassing store just in case to be 100% sure we have everything
  const allSeasons = await seasonService.getAll()
  const grouped = {}
  let champCount = 0
  let viceCount = 0

  allSeasons.forEach(s => {
    // 0. Desambiguação por País (Firewall)
    let sPais = s.pais
    if (!sPais) {
        const lowComp = (s.competitionName || '').toLowerCase()
        if (lowComp.includes('brasileir') || lowComp.includes('copa do brasil')) sPais = 'Brasil'
        if (lowComp.includes('argentin') || lowComp.includes('primera nacional') || lowComp.includes('liga profissional')) sPais = 'Argentina'
        if (lowComp.includes('colombia')) sPais = 'Colômbia'
        if (lowComp.includes('inglesa') || lowComp.includes('premier league')) sPais = 'Inglaterra'
    }

    if (clubCountry && sPais) {
        const sPaisNorm = normalizeString(sPais)
        if (sPaisNorm) { // Só filtra se a season tiver país definido para evitar falsos negativos
            const isInternational = ['MUNDO', 'EUROPA', 'AMERICA DO SUL', 'CONMEBOL', 'UEFA', 'INTERNACIONAL'].includes(sPaisNorm.toUpperCase())
            // Se a competição é nacional e o país não bate, pula
            if (!isInternational && sPaisNorm !== clubCountry) return
        }
    }

    const sChamp = normalizeString(s.campeao || '')
    const sVice = normalizeString(s.vice || '')

    // Match Inteligente Título
    const isChamp = isClubMatch(s.campeao, clubNorm, clubSmart)
    if (isChamp) {
      champCount++
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

    // Match Inteligente Vice
    const isVice = sVice === clubNorm || (clubSmart && sVice.includes(clubSmart))
    if (isVice) viceCount++
  })

  totalChampion.value = champCount
  totalVice.value = viceCount
  
  // Sort por quantidade
  trophies.value = Object.values(grouped).sort((a, b) => b.count - a.count)
}

const loadTimeline = async (clubNorm, clubSmart, clubCountry) => {
  const allSeasons = await seasonService.getAll()
  const events = []

  allSeasons.forEach(s => {
      // 0. Desambiguação por País (Firewall)
      let sPais = s.pais
      if (!sPais) {
          const lowComp = (s.competitionName || '').toLowerCase()
          if (lowComp.includes('brasileir') || lowComp.includes('copa do brasil')) sPais = 'Brasil'
          if (lowComp.includes('argentin') || lowComp.includes('primera nacional') || lowComp.includes('liga profissional')) sPais = 'Argentina'
          if (lowComp.includes('colombia')) sPais = 'Colômbia'
          if (lowComp.includes('inglesa') || lowComp.includes('premier league')) sPais = 'Inglaterra'
      }

      if (clubCountry && sPais) {
          const sPaisNorm = normalizeString(sPais)
          if (sPaisNorm) { // Só filtra se a season tiver país definido para evitar falsos negativos
              const isInternational = ['MUNDO', 'EUROPA', 'AMERICA DO SUL', 'CONMEBOL', 'UEFA', 'INTERNACIONAL'].includes(sPaisNorm.toUpperCase())
              // Se a competição é nacional e o país não bate, pula
              if (!isInternational && sPaisNorm !== clubCountry) return
          }
      }

      const compNameRaw = s.competitionName || ''
      let compName = compNameRaw
      
      // Padronização de Nomes (Liga Argentina -> Liga Profissional)
      if (compNameRaw.toLowerCase().trim() === 'liga argentina') compName = 'Liga Profissional'
      if (compNameRaw.toLowerCase().trim() === 'liga argentina serie b') compName = 'Primera Nacional'

      const isChampion = isClubMatch(s.campeao, clubNorm, clubSmart)
      const isVice = isClubMatch(s.vice, clubNorm, clubSmart)

      // Career Check
      const isMyCareer = careerStore.history.some(h => {
          return isClubMatch(h.timeNome, clubNorm, clubSmart) && 
                 (h.temporada && (h.temporada.toString().includes(s.ano.split('/')[0]) || h.temporada.toString() === s.ano))
      })

      let eventAdded = false
      const prints = s.printsUrls ? s.printsUrls.filter(u => u) : []

      // Verificar participantes com colocacao (dados de copa - tem PRIORIDADE sobre posição da tabela)
      const participantInfo = s.participantes?.find(p => isClubMatch(p.nome, clubNorm, clubSmart))
      const hasColocacao = !!(participantInfo?.colocacao)

      // Check Table — só usar posição numérica se NÃO houver colocacao de copa
      if (s.tabela && !hasColocacao) {
          const tableData = parseTable(s.tabela)
          const positionIdx = tableData.findIndex(t => {
              return isClubMatch(t.time, clubNorm, clubSmart)
          })

          if (positionIdx !== -1) {
              const position = tableData[positionIdx].position
              let statusType = isChampion ? 'champion' : isVice ? 'vice' : 'neutral'
              let badgeText = isChampion ? 'CAMPEÃO' : isVice ? 'VICE' : `${position}º LUGAR`
              
              // Lógica de Acesso/Rebaixamento Simplificada mas Funcional
              const lowName = compName.toLowerCase()
              const isSerieA = lowName.includes('serie a') || lowName.includes('liga profissional') || lowName.includes('premier league') || lowName.includes('brasileirao')
              const isLowerSerie = lowName.includes('serie b') || lowName.includes('serie c') || lowName.includes('serie d') || lowName.includes('national')

              const isPromoted = !isSerieA && (position <= 4 || isChampion) && isLowerSerie
              const isRelegated = isSerieA && position >= 17 && tableData.length >= 17

              let description = isChampion ? `Venceu a ${compName}` : isVice ? `Vice-campeão da ${compName}` : `Disputou a ${compName}`
              
              if (isPromoted && !isChampion) {
                  statusType = 'promoted'
                  badgeText = 'ACESSO'
                  description = `${position}º lugar - Acesso garantido na ${compName}`
              } else if (isRelegated) {
                  statusType = 'relegated'
                  badgeText = 'REBAIXADO'
                  description = `${position}º lugar - Rebaixado na ${compName}`
              } else if (!isChampion && !isVice) {
                  description = `${position}º lugar na ${compName}`
              }

              const compInfoObj = getCompetitionInfo(compName, s.pais)

              events.push({
                  year: s.ano,
                  shortYear: getSeasonFinalYear(s.ano),
                  compName: compName,
                  compLogo: compInfoObj?.logo || null,
                  type: statusType,
                  badgeText,
                  description,
                  statusClass: getStatusClass(statusType),
                  icon: isChampion ? 'bi-trophy-fill' : isVice ? 'bi-award' : 'bi-shield',
                  badgeClass: getBadgeClass(statusType),
                  isMyCareer,
                  sortYear: getSeasonFinalYear(s.ano),
                  trophyUrl: isChampion ? (compInfoObj?.trofeu ? getTrofeuPath(compInfoObj.trofeu) : getTrofeuPathByCompName(compName)) : null,
                  prints: prints,
                  clubShield: clubName.value
              })
              eventAdded = true
          }
      }

      // Cup Check: usa colocacao de copa OU match simples (Campeão/Vice) se não tiver tabela de liga
      const isParticipant = !!participantInfo

      if (!eventAdded && (isChampion || isVice || isParticipant)) {
          const compInfoObj = getCompetitionInfo(compName, s.pais)
          const colocacao = participantInfo?.colocacao || ''
          
          // Determinar status a partir da fase da copa
          let statusType = isChampion ? 'champion' : isVice ? 'vice' : 'neutral'
          let badgeText = isChampion ? 'CAMPEÃO' : isVice ? 'VICE' : (colocacao || 'PARTICIPANTE')
          
          if (!isChampion && !isVice && colocacao) {
              const c = colocacao.toLowerCase()
              if (c.includes('semi')) { statusType = 'promoted'; }
          }

          events.push({
              year: s.ano,
              shortYear: getSeasonFinalYear(s.ano),
              compName: compName,
              compLogo: compInfoObj?.logo || null,
              type: statusType,
              badgeText: badgeText,
              description: isChampion ? `Venceu a ${compName}` : isVice ? `Finalista da ${compName}` : (colocacao ? `${colocacao} da ${compName}` : `Disputou a ${compName}`),
              statusClass: getStatusClass(statusType),
              icon: isChampion ? 'bi-trophy-fill' : isVice ? 'bi-award' : 'bi-shield',
              badgeClass: getBadgeClass(statusType),
              isMyCareer,
              sortYear: getSeasonFinalYear(s.ano),
              trophyUrl: isChampion ? (compInfoObj?.trofeu ? getTrofeuPath(compInfoObj.trofeu) : getTrofeuPathByCompName(compName)) : null,
              prints: prints,
              clubShield: clubName.value
          })
      }
      
      // Top Scorers
      const scList = s.topScorers || (s.artilheiro && s.artilheiro.nome ? [s.artilheiro] : [])
      scList.forEach(sc => {
         if (isClubMatch(sc.clube, clubNorm, clubSmart)) {
             const description = `${sc.nome} (${sc.gols} Gols)`
             const statusClass = 'bg-info'
             const badgeText = 'ARTILHEIRO'
             events.push({
                 year: s.ano,
                 shortYear: getSeasonFinalYear(s.ano),
                 compName: 'ARTILHARIA',
                 type: 'award',
                  badgeText,
                  description: `${description} ${compName}`,
                  statusClass,
                 icon: 'bi-person-badge-fill',
                 badgeClass: 'bg-info text-dark',
                 isMyCareer, // Usa a detecção da temporada
                 sortYear: getSeasonFinalYear(s.ano),
                 trophyUrl: 'logos/competitions/artilheiro.png',
                 scFoto: sc.fotoUrl || sc.foto || sc.fotoJogador || null,
                 scNome: sc.nome
             })
         }
      })
  })

  // Awards Globais
  awardsStore.list.forEach(aw => {
     // 0. Firewall de País para Prêmios
     if (clubCountry && aw.pais) {
         const awPaisNorm = normalizeString(aw.pais)
         if (awPaisNorm !== clubCountry) return
     }

     const awClub = normalizeString(aw.clube)
     if (awClub === clubNorm || (clubSmart && awClub.includes(clubSmart))) {
         const awYear = aw.season ? aw.season.toString() : '2025'
         const awTrophy = trophyMap[aw.tipo] || '/logos/competitions/premio-trofeu.png'
         
         // Career Check simplificado: se o prêmio é do clube e você estava no clube nesse ano
         const isMyCareerAward = careerStore.history.some(h => {
             return isClubMatch(h.timeNome, clubNorm, clubSmart) && 
                    (h.temporada && (h.temporada.toString().includes(awYear.split('/')[0]) || h.temporada.toString() === awYear))
         })

         events.push({
            year: awYear,
            shortYear: getSeasonFinalYear(awYear),
            compName: 'PREMIAÇÃO INDIVIDUAL',
            compLogo: '/logos/competitions/premio-individual.png',
            type: 'award',
            badgeText: 'PRÊMIO',
            description: `${aw.nome} - ${aw.tipo}`,
            statusClass: 'bg-warning',
            icon: aw.tipo?.includes('Técnico') ? 'bi-person-gear' : 'bi-star-fill',
            badgeClass: 'bg-warning text-dark',
            isMyCareer: isMyCareerAward,
            sortYear: getSeasonFinalYear(awYear),
            trophyUrl: awTrophy,
            scFoto: aw.fotoJogador || aw.foto || null,
            scNome: aw.nome
         })
     }
  })

  // Agrupamento Anual
  const grouped = new Map()
  events.forEach(e => {
      const key = e.shortYear
      if (!grouped.has(key)) {
          grouped.set(key, {
              year: e.year,
              shortYear: e.shortYear,
              sortYear: e.sortYear,
              isMyCareer: false,
              events: [],
              maxStatus: 'neutral'
          })
      }
      const g = grouped.get(key)
      if (e.isMyCareer) g.isMyCareer = true
      g.events.push(e)
  })

  // Prioridade Cor
  const priority = { champion: 1, promoted: 2, vice: 3, relegated: 4, neutral: 5, award: 6 }
  
  const final = Array.from(grouped.values()).map(g => {
      g.events.sort((a, b) => priority[a.type] - priority[b.type])
      const main = g.events.find(e => e.type !== 'award') || g.events[0]
      g.maxStatus = main.type
      g.cardClass = `glow-${main.type}`
      g.bulletClass = `bg-${main.type}`
      
      // Fallbacks específicos
      if (g.maxStatus === 'neutral') { g.cardClass = 'glow-neutral'; g.bulletClass = 'bg-secondary'; }
      if (g.maxStatus === 'award') { g.cardClass = 'glow-info'; g.bulletClass = 'bg-info'; }

      return g
  })

  final.sort((a, b) => b.sortYear - a.sortYear)
  timelineEvents.value = final

  // Cache Imagens
  for (const e of events) {
      if (e.scFoto && !e.scFoto.startsWith('data:') && !cachedLogos.value[e.scFoto]) {
          imageCacheService.getOrCache(e.scFoto).then(b64 => {
             if (b64) cachedLogos.value[e.scFoto] = b64
          })
      }

      if (e.prints) {
          for (const url of e.prints) {
              if (url && !url.startsWith('data:') && !cachedLogos.value[url]) {
                  imageCacheService.getLogo(url).then(b64 => {
                     if (b64) cachedLogos.value[url] = b64
                  })
              }
          }
      }
  }
}

const getStatusClass = (type) => {
    if (type === 'champion') return 'bg-warning'
    if (type === 'promoted') return 'bg-success'
    if (type === 'relegated') return 'bg-danger'
    if (type === 'vice') return 'bg-light'
    return 'bg-secondary'
}

const getBadgeClass = (type) => {
    if (type === 'champion') return 'bg-warning text-dark'
    if (type === 'promoted') return 'bg-success text-white'
    if (type === 'relegated') return 'bg-danger text-white'
    if (type === 'vice') return 'bg-light text-dark'
    return 'bg-secondary text-white'
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

    // Busca exata ou por substring
    return allComps.find(c => {
        const cNome = normalizeString(c.nome)
        const isMatch = cNome === lowName || lowName.includes(cNome)
        if (!isMatch) return false
        
        // Se temos país, ele deve bater (ou ser internacional)
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
    
    // Fallbacks manuais Hardcoded baseados nos arquivos reais encontrados
    if (lowName.includes('brasileirao') && lowName.includes('serie a')) return getTrofeuPath('trofeu-brasileirao-serie-a')
    if (lowName.includes('brasileirao') && lowName.includes('serie b')) return getTrofeuPath('trofeu-brasileirao-serie-b')
    if (lowName.includes('brasileirao')) return getTrofeuPath('trofeu-brasileirao-serie-a')
    if (lowName.includes('copa do brasil')) return getTrofeuPath('trofeu-copa-do-brasil')
    if (lowName.includes('libertadores')) return getTrofeuPath('trofeu-libertadores')
    if (lowName.includes('sul-americana') || lowName.includes('sulamericana')) return getTrofeuPath('trofeu-sulamericana')
    if (lowName.includes('colombia') && lowName.includes('liga')) return getTrofeuPath('trofeu-liga-colombia')
    if (lowName.includes('mundial')) return getTrofeuPath('trofeu-mundial-de-clubes')
    if (lowName.includes('artilharia')) return 'logos/competitions/artilheiro.png'

    return `logos/competitions/${name.replace(/\s+/g, '-')}.png`
}

const parseTable = (tableStr) => {
    if (!tableStr) return [];
    return tableStr.split('\n').filter(l => l.trim()).map((line, idx) => {
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

        return { time: time || '', position: idx + 1 };
    }).filter(x => x.time);
}

onMounted(() => {
  loadClubData()
})

watch(() => route.params.id, () => {
  loadClubData()
})
</script>

<style scoped>
.club-header-panel {
  background: rgba(20, 20, 25, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.club-header-bg {
  position: absolute;
  top: -50px;
  right: -50px;
  opacity: 0.15;
  filter: blur(40px);
  pointer-events: none;
}

.bg-shield-blur {
  transform: rotate(-15deg);
}

.club-shield-wrap {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-box-gold, .stat-box-silver {
  padding: 15px 25px;
  border-radius: 15px;
  text-align: center;
  min-width: 100px;
}

.stat-box-gold {
  background: linear-gradient(135deg, #ffcc00, #ff9900);
  color: #000;
  box-shadow: 0 0 20px rgba(255, 204, 0, 0.3);
}

.stat-box-silver {
  background: linear-gradient(135deg, #e0e0e0, #9e9e9e);
  color: #000;
  box-shadow: 0 0 20px rgba(224, 224, 224, 0.2);
}

.stat-box-gold .val, .stat-box-silver .val {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.stat-box-gold .lbl, .stat-box-silver .lbl {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.trophy-thumb {
  height: 60px;
  width: auto;
  filter: drop-shadow(0 0 10px rgba(255,204,0,0.4));
}

.timeline-v2 {
  position: relative;
  padding-left: 10px;
}

.timeline-main-line {
  position: absolute;
  left: 9px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255,255,255,0.05);
}

.timeline-main-bullet {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid #1a1a1e;
  position: relative;
  z-index: 2;
}

.year-card-dashboard {
  background: rgba(30, 30, 40, 0.6);
  border: 1px solid rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
}

.glow-champion { border-left: 6px solid #ffcc00; box-shadow: inset 10px 0 30px rgba(255,204,0,0.05); }
.glow-promoted { border-left: 6px solid #28a745; }
.glow-relegated { border-left: 6px solid #dc3545; }
.glow-vice { border-left: 6px solid #adb5bd; }
.glow-neutral { border-left: 4px solid rgba(255,255,255,0.1); }
.glow-info { border-left: 6px solid #0dcaf0; }

.event-icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  opacity: 0.9;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
}

/* Removendo antigos estilos de círculo e overlay para limpar o código */

.award-dual-blocks {
  display: flex;
  align-items: center;
}

.award-square-block {
  width: 70px;
  height: 70px;
  background: rgba(10, 15, 25, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.award-square-block:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0,0,0,0.5);
}

.award-square-block img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.photo-block img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  border-radius: 10px;
  position: relative;
  z-index: 5;
}

.trophy-block {
  background: radial-gradient(circle at center, rgba(255, 193, 7, 0.1) 0%, transparent 80%);
  padding: 8px;
}

.trophy-block img {
  filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.6));
}

.coach-indicator-pulse-v2 {
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-coach-neon {
  font-size: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Removendo Keyframes locais redundantes */

.trophy-main-img {
  height: 90px;
  width: auto;
  filter: drop-shadow(0 0 15px rgba(255,204,0,0.5));
}

.comp-logo-mini {
  height: 22px;
  width: auto;
  object-fit: contain;
}

.mini-print-timeline {
  width: 80px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(255,255,255,0.1);
}

.mini-print-timeline img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.print-overlay-icon {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.mini-print-timeline:hover .print-overlay-icon {
  opacity: 1;
}

/* Animacoes */
.animate-slide-in {
  animation: slideIn 0.5s ease forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-up {
  animation: slideUp 0.6s ease forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.text-white-glow {
  color: #fff;
  text-shadow: 0 0 15px rgba(255,255,255,0.4);
}
</style>
