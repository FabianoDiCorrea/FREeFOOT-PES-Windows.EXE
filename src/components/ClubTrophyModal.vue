<template>
  <div v-if="isVisible" class="form-full-screen-overlay trophy-room-overlay" style="z-index: 9999; display: flex;" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable m-auto" style="width: 90%; max-width: 1200px; max-height: 90vh;">
      <div class="modal-content bg-dark-expert text-white border-gold-glow" style="height: 100%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
        <div class="modal-header border-0 pb-0 pt-3 px-4 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3 w-100">
             <TeamShield :teamName="localClub" :size="50" />
             <div class="flex-grow-1">
               <h3 class="modal-title fw-black text-uppercase ls-1 m-0">{{ localClub }}</h3>
               <div class="d-flex gap-3 mt-1">
                 <button 
                   class="btn btn-sm text-uppercase fw-bold ls-1 tab-btn" 
                   :class="activeTab === 'trophies' ? 'active-tab text-warning-neon' : 'text-secondary'"
                   @click="activeTab = 'trophies'">
                   SALA DE TROFÉUS
                 </button>
                 <button 
                   class="btn btn-sm text-uppercase fw-bold ls-1 tab-btn" 
                   :class="activeTab === 'timeline' ? 'active-tab text-info-neon' : 'text-secondary'"
                   @click="activeTab = 'timeline'">
                   LINHA DO TEMPO
                 </button>
               </div>
             </div>
          </div>
          <button type="button" class="btn-close btn-close-white" @click="close" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scrollbar p-4" style="flex: 1; overflow-y: auto;">
          
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-warning mb-3"></div>
            <p class="opacity-50">CARREGANDO CONQUISTAS...</p>
          </div>

          <!-- CONTEÚDO DA SALA DE TROFÉUS -->
          <div v-if="activeTab === 'trophies'" class="w-100 h-100">
            <div v-if="trophies.length === 0" class="text-center py-5">
               <i class="bi bi-trophy opacity-10 display-1 mb-3 d-block"></i>
               <h4 class="text-secondary text-uppercase fw-black">Nenhuma conquista registrada</h4>
               <p class="opacity-50">Este clube ainda não possui títulos computados no sistema.</p>
            </div>

            <div v-else class="trophy-grid">
              <div v-for="trophy in trophies" :key="trophy.nome" class="trophy-card">
                <div class="tc-inner shadow-lg">
                  <!-- Estrelas -->
                  <div class="tc-stars text-center py-2">
                     <span class="stars-text">{{ formatStars(trophy.count) }}</span>
                  </div>

                  <!-- Troféu -->
                  <div class="tc-trophy-img-container">
                     <img :src="trophy.trofeuUrl" class="tc-img" @error="handleImgError" />
                     <div class="tc-glow"></div>
                  </div>

                  <!-- Info Competição -->
                  <div class="tc-info text-center mt-3">
                    <div class="tc-name fw-black text-info-neon text-uppercase">{{ trophy.nome }}</div>
                    <div class="tc-badge mt-1">{{ trophy.count }} {{ trophy.count > 1 ? 'TÍTULOS' : 'TÍTULO' }}</div>
                  </div>

                  <!-- Datas (Vertical) -->
                  <div class="tc-dates-list mt-3 custom-scrollbar">
                    <div v-for="date in trophy.dates" :key="date" class="tc-date-item">
                      {{ date }}
                    </div>
                  </div>

                  <!-- Escudo do Time ao Fundo (Sutil) -->
                  <div class="tc-bg-shield">
                     <TeamShield :teamName="localClub" :size="100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CONTEÚDO DA LINHA DO TEMPO -->
          <div v-show="activeTab === 'timeline'" class="timeline-container w-100 h-100 px-3 pb-4 custom-scrollbar">
            <div v-if="timelineEvents.length === 0" class="text-center py-5">
               <i class="bi bi-clock-history opacity-10 display-1 mb-3 d-block"></i>
               <h4 class="text-secondary text-uppercase fw-black">Nenhum evento registrado</h4>
               <p class="opacity-50">O clube não possui participação mapeada nas temporadas.</p>
            </div>
            
            <div v-else class="timeline-wrapper pt-3">
               <div v-for="(yearGroup, idx) in timelineEvents" :key="idx" class="timeline-row d-flex align-items-stretch position-relative mb-5">
                  <!-- Coluna Esquerda: Ano e Conquista de Carreira -->
                  <div class="timeline-year-col text-end pe-4 d-flex flex-column justify-content-center" style="width: 140px; flex-shrink: 0;">
                     <div class="fw-bold text-white opacity-50" style="font-size: 0.85rem; letter-spacing: 1px;">{{ yearGroup.year.includes('=') ? yearGroup.year.split('=')[0].trim() : '' }}</div>
                     <h3 class="fw-black text-white m-0" style="text-shadow: 0 0 10px rgba(255,255,255,0.3); font-size: 1.8rem; letter-spacing: -1px;">
                        {{ yearGroup.shortYear }}
                     </h3>
                     <div v-if="yearGroup.isMyCareer" class="text-neon-green mt-2 d-flex gap-1 align-items-center justify-content-end" style="font-size: 0.70rem; border-top: 1px solid rgba(0, 255, 115, 0.3); padding-top: 4px;">
                        <span class="fw-black text-uppercase ls-1">VOCÊ TÉCNICO</span>
                        <i class="bi bi-controller neon-pulse-icon"></i>
                     </div>
                  </div>

                  <!-- Coluna Central: A Trilha e Bolinha -->
                  <div class="timeline-track-col position-relative d-flex justify-content-center" style="width: 50px; flex-shrink: 0;">
                      <div class="timeline-line position-absolute h-100" style="width: 4px; background: rgba(255,255,255,0.05); top: 0; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);"></div>
                      <div class="timeline-bullet mt-2 shadow-sm d-flex justify-content-center align-items-center" :class="yearGroup.bulletClass">
                         <div class="timeline-bullet-inner bg-dark"></div>
                      </div>
                  </div>

                  <!-- Coluna Direita: O Cartão de Resumo Anual -->
                  <div class="timeline-content-col ps-4 flex-grow-1 pb-2">
                     <div class="timeline-card p-3 rounded-4 shadow-lg border-0" :class="yearGroup.cardClass" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);">
                        
                        <!-- Lista de eventos (Competições) daquele ano -->
                        <div v-for="(evt, eIdx) in yearGroup.events" :key="eIdx" 
                             :class="{'border-bottom border-light border-opacity-10 mb-3 pb-3': eIdx !== yearGroup.events.length - 1}">
                           
                           <div class="d-flex align-items-center justify-content-between mb-2">
                              <div class="d-flex align-items-center gap-2">
                                 <TeamShield :teamName="localClub" :size="24" class="opacity-100 drop-shadow-sm" />
                                 <span class="fw-bold opacity-75 small text-uppercase ls-1 text-white">{{ evt.compName }}</span>
                              </div>
                              <span v-if="evt.badgeText" class="badge rounded-pill px-3 py-1 fw-black timeline-badge-shadow" :class="evt.badgeClass" style="letter-spacing: 1px; font-size: 0.75rem;">{{ evt.badgeText }}</span>
                           </div>
                           <h4 class="fw-black m-0 mt-3 text-white d-flex align-items-center" :class="evt.textClass" style="text-shadow: 0 2px 10px rgba(0,0,0,0.8); letter-spacing: -0.5px;">
                              <img v-if="evt.type === 'champion' && evt.trophyUrl" :src="evt.trophyUrl" class="me-3 drop-shadow-sm" style="height: 40px; width: auto; object-fit: contain;" />
                              <i v-else-if="evt.icon" :class="evt.icon" class="me-2 opacity-100 fs-5"></i>
                              {{ evt.description }}
                           </h4>
                        </div>

                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
        <div class="modal-footer border-0 pt-0 opacity-50">
          <small class="fw-bold ls-1">FREeFOOT PES21 - UNIVERSO EXPERT</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { seasonStore } from '../services/season.store'
import { careerStore } from '../services/career.store'
import { awardsStore } from '../services/awards.store'
import { seasonService } from '../services/season.service'
import { getTrofeuPath, normalizeString, getSeasonFinalYear, clubSmartNormalize } from '../services/utils'
import { SOUTH_AMERICA_COMPETITIONS, UEFA_COMPETITIONS, CONCACAF_COMPETITIONS, INTERNATIONAL_COMPETITIONS } from '../data/competitions.data'
import TeamShield from './TeamShield.vue'

const props = defineProps({
  clubName: {
    type: String,
    required: true
  }
})

const loading = ref(false)
const trophies = ref([])
const activeTab = ref('trophies')
const timelineEvents = ref([])
const modalRef = ref(null)

const isVisible = ref(false)
const localClub = ref('')

const handleImgError = (e) => {
  e.target.style.display = 'none'
  // Adicionar um ícone de fallback ou manter vazio
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

const getCompMeta = (name) => {
  const all = [...SOUTH_AMERICA_COMPETITIONS, ...UEFA_COMPETITIONS, ...CONCACAF_COMPETITIONS, ...INTERNATIONAL_COMPETITIONS]
  const norm = normalizeString(name)
  let found = all.find(c => normalizeString(c.nome) === norm)
  
  if (!found && ALL_COMPETITIONS_DATA) {
     const allCompsAPI = [
        ...ALL_COMPETITIONS_DATA.flatMap(continent => [
          ...continent.paises.flatMap(p => p.competicoes),
          ...continent.continentais
        ])
     ]
     found = allCompsAPI.find(c => normalizeString(c.nome) === norm)
  }
  return found
}

const isClubMatchTrophy = (target, searchNorm, searchSmart) => {
    if (!target) return false
    const targetNorm = normalizeString(target)
    if (targetNorm === searchNorm) return true
    
    // Smart match usando a normalização global do utils.js
    const targetSmart = clubSmartNormalize(target)
    if (searchSmart && targetSmart === searchSmart) return true
    
    // Fallback para contenção
    if (targetNorm.includes(searchSmart) || searchNorm.includes(targetSmart)) return true

    return false
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

const loadTimeline = async () => {
  if (!localClub.value) return
  const clubNorm = normalizeString(localClub.value)
  const clubSmart = clubSmartNormalize(localClub.value)
  
  const allSeasons = await seasonService.getAll()
  const events = []

  allSeasons.forEach(s => {
      const compNameRaw = s.competitionName || ''
      let compName = compNameRaw
      
      // Padronização de Nomes
      if (compNameRaw.toLowerCase().trim() === 'liga argentina') compName = 'Liga Profissional'
      if (compNameRaw.toLowerCase().trim() === 'liga argentina serie b') compName = 'Primera Nacional'

      let isChampion = normalizeString(s.campeao || '') === clubNorm
      let isVice = normalizeString(s.vice || '') === clubNorm

      // Career Check
      let isMyCareer = false;
      const historyMatch = careerStore.history.find(h => isClubMatchTrophy(h.timeNome, clubNorm, clubSmart) && (h.temporada.toString().includes(s.ano.split('/')[0]) || h.temporada.toString() === s.ano));
      if (historyMatch) {
          isMyCareer = true;
      } else {
          isMyCareer = careerStore.history.some(h => isClubMatchTrophy(h.timeNome, clubNorm, clubSmart) && h.titulos && h.titulos.some(t => normalizeString(t.nome) === normalizeString(compName) && t.ano === s.ano.split('/')[0]));
      }

      let eventAdded = false;

      // 1. Check Table para Divisoes e Acessos
      if (s.tabela) {
          const tableData = parseTable(s.tabela)
          const positionIdx = tableData.findIndex(t => isClubMatchTrophy(t.time, clubNorm, clubSmart))
          
          if (positionIdx !== -1) {
              const position = tableData[positionIdx].position
              const compMeta = getCompMeta(compName)
              
              const lowName = compName.toLowerCase()
              const isSerieA = lowName.includes('serie a') || lowName.includes('liga profissional') || lowName.includes('premier league') || lowName.includes('brasileirao')
              const isLowerSerie = lowName.includes('serie b') || lowName.includes('serie c') || lowName.includes('serie d') || lowName.includes('national')

              const isPromoted = !isSerieA && (position <= 4 || isChampion) && isLowerSerie
              const isRelegated = isSerieA && position >= 17 && tableData.length >= 17

              let statusType = isChampion ? 'champion' : isVice ? 'vice' : 'neutral'
              let badgeText = isChampion ? 'CAMPEÃO' : isVice ? 'VICE' : `${position}º LUGAR`
              let description = isChampion ? `Venceu a ${compName}` : isVice ? `Vice-campeão da ${compName}` : `${position}º lugar na ${compName}`

              if (isPromoted && !isChampion) {
                  statusType = 'promoted'
                  badgeText = 'ACESSO'
                  description = `${position}º lugar - Acesso garantido na ${compName}`
              } else if (isRelegated) {
                  statusType = 'relegated'
                  badgeText = 'REBAIXADO'
                  description = `${position}º lugar - Rebaixado na ${compName}`
              }

              let bgClass = 'bg-secondary bg-opacity-10'
              let statusClass = 'bg-secondary'
              let textClass = 'text-white'
              let icon = 'bi-record-circle'
              let badgeClass = 'bg-secondary text-white'

              if (statusType === 'champion') {
                  bgClass = 'bg-dark border-warning'
                  statusClass = 'bg-warning'
                  textClass = 'text-warning'
                  icon = 'bi-trophy-fill'
                  badgeClass = 'bg-warning text-dark'
              } else if (statusType === 'vice') {
                  bgClass = 'bg-light bg-opacity-10'
                  statusClass = 'bg-light'
                  textClass = 'text-light'
                  icon = 'bi-award'
                  badgeClass = 'bg-light text-dark'
              } else if (statusType === 'promoted') {
                  bgClass = 'bg-success bg-opacity-10 border-success'
                  statusClass = 'bg-success'
                  textClass = 'text-success'
                  icon = 'bi-arrow-up-circle-fill'
                  badgeClass = 'bg-success text-white'
              } else if (statusType === 'relegated') {
                  bgClass = 'bg-danger bg-opacity-10 border-danger'
                  statusClass = 'bg-danger'
                  textClass = 'text-danger'
                  icon = 'bi-arrow-down-circle-fill'
                  badgeClass = 'bg-danger text-white'
              }

              events.push({
                  year: s.ano,
                  shortYear: getSeasonFinalYear(s.ano),
                  compName,
                  type: statusType,
                  badgeText,
                  description,
                  bgClass,
                  statusClass,
                  textClass,
                  icon,
                  badgeClass,
                  isMyCareer,
                  sortYear: parseInt(s.ano.split('/')[0]) || 0,
                  trophyUrl: statusType === 'champion' ? (compMeta?.trofeu ? getTrofeuPath(compMeta.trofeu) : `logos/competitions/${normalizeString(compName).replace(/\s+/g, '-')}.png`) : null
              })
              eventAdded = true;
          }
      }

      // 2. Cup Check (Se não adicionado por tabela)
      if (!eventAdded) {
          const participantInfo = s.participantes?.find(p => isClubMatchTrophy(p.nome, clubNorm, clubSmart))
          const isParticipant = !!participantInfo

          if (isChampion || isVice || isParticipant) {
              const colocacao = isChampion ? 'Campeão' : isVice ? 'Vice' : (participantInfo?.colocacao || '')
              const bText = isChampion ? 'CAMPEÃO' : isVice ? 'VICE' : (colocacao || 'PARTICIPANTE')
              let type = isChampion ? 'champion' : isVice ? 'vice' : 'neutral'
              let bClass = 'bg-secondary text-white'
              let tClass = 'text-white'
              let bgC = 'glow-neutral'
              let sClass = 'bg-secondary'
              let ico = 'bi-shield'

              if (isChampion) {
                  bClass = 'bg-warning text-dark'; tClass = 'text-warning'; bgC = 'glow-warning'; sClass = 'bg-warning'; ico = 'bi-trophy-fill';
              } else if (isVice) {
                  bClass = 'bg-light text-dark'; tClass = 'text-light'; bgC = 'glow-silver'; sClass = 'bg-light'; ico = 'bi-award';
              } else if (colocacao) {
                  const c = colocacao.toLowerCase()
                  if (c.includes('semi')) {
                      type = 'promoted'; bClass = 'bg-success text-white'; sClass = 'bg-success'; tClass = 'text-success'; bgC = 'glow-promoted'; ico = 'bi-award-fill';
                  } else if (c.includes('quart')) {
                      bClass = 'bg-info text-dark'; sClass = 'bg-info'; ico = 'bi-award';
                  } else if (c.includes('oitav') || c.includes('16')) {
                      bClass = 'bg-primary text-white'; sClass = 'bg-primary'; ico = 'bi-shield-check';
                  }
              }

              const descricao = isChampion ? `Venceu a ${compName}` : isVice ? `Finalista da ${compName}` : (colocacao ? `${colocacao} da ${compName}` : `Disputou a ${compName}`)
              events.push({
                  year: s.ano,
                  shortYear: getSeasonFinalYear(s.ano),
                  compName: compName,
                  type: type,
                  badgeText: bText,
                  description: descricao,
                  bgClass: bgC,
                  statusClass: sClass,
                  textClass: tClass,
                  icon: ico,
                  badgeClass: bClass,
                  isMyCareer,
                  sortYear: parseInt(s.ano.split('/')[0]) || 0,
                  trophyUrl: isChampion ? (getCompMeta(compName)?.trofeu ? getTrofeuPath(getCompMeta(compName).trofeu) : `logos/competitions/${normalizeString(compName).replace(/\s+/g, '-')}.png`) : null
              })
              eventAdded = true;
          }
      }

      // 3. Mundial Check
      if (s.mundial) {
          const m = s.mundial
          let isThird = isClubMatchTrophy(m.terceiro?.time1, clubNorm, clubSmart) && (m.terceiro.placar1 > m.terceiro.placar2 || m.terceiro.pen1 > m.terceiro.pen2) || isClubMatchTrophy(m.terceiro?.time2, clubNorm, clubSmart) && (m.terceiro.placar2 > m.terceiro.placar1 || m.terceiro.pen2 > m.terceiro.pen1)
          let isFourth = isClubMatchTrophy(m.terceiro?.time1, clubNorm, clubSmart) && (m.terceiro.placar1 < m.terceiro.placar2 || m.terceiro.pen1 < m.terceiro.pen2) || isClubMatchTrophy(m.terceiro?.time2, clubNorm, clubSmart) && (m.terceiro.placar2 < m.terceiro.placar1 || m.terceiro.pen2 < m.terceiro.pen1)
          
          if (isThird) {
              events.push({ year: s.ano, shortYear: getSeasonFinalYear(s.ano), compName: compName, type: 'neutral', badgeText: '3º LUGAR', description: `Medalha de Bronze na ${compName}`, bgClass: 'glow-bronze', statusClass: 'bg-bronze', textClass: 'text-bronze', icon: 'bi-award-fill', badgeClass: 'bg-bronze text-white', isMyCareer, sortYear: parseInt(s.ano.split('/')[0]) || 0 })
          } else if (isFourth) {
              events.push({ year: s.ano, shortYear: getSeasonFinalYear(s.ano), compName: compName, type: 'neutral', badgeText: '4º LUGAR', description: `Semifinalista na ${compName}`, bgClass: 'glow-neutral', statusClass: 'bg-light-black', textClass: 'text-light-black', icon: 'bi-award', badgeClass: 'bg-light-black text-white', isMyCareer, sortYear: parseInt(s.ano.split('/')[0]) || 0 })
          }
      }

      // 4. Check Top Scorers (Artilheiros)
      const topScorers = s.topScorers || (s.artilheiro && s.artilheiro.nome ? [s.artilheiro] : [])
      topScorers.forEach(scorer => {
         if (isClubMatchTrophy(scorer.clube, clubNorm, clubSmart)) {
            events.push({
               year: s.ano,
               shortYear: getSeasonFinalYear(s.ano),
               compName: compName,
               type: 'award',
               badgeText: 'ARTILHEIRO',
               description: `${scorer.nome} - Jogador da Equipe`,
               bgClass: 'glow-neutral',
               statusClass: 'bg-info',
               textClass: 'text-info',
               icon: 'bi-person-badge-fill',
               badgeClass: 'bg-info text-dark',
               isMyCareer,
               sortYear: parseInt(s.ano.split('/')[0]) || 0
            })
         }
      })
  })

  // 5. Integrar também Premiações Individuais Globais
  if (awardsStore.list && awardsStore.list.length > 0) {
      awardsStore.list.forEach(award => {
          if (isClubMatchTrophy(award.clube, clubNorm, clubSmart)) {
              events.push({
                  year: award.temporada.toString(),
                  shortYear: getSeasonFinalYear(award.temporada.toString()),
                  compName: award.tipo.toUpperCase(),
                  type: 'award',
                  badgeText: 'PRÊMIO',
                  description: `${award.nome} - Jogador da Equipe`,
                  bgClass: 'glow-warning border-warning',
                  statusClass: 'bg-warning',
                  textClass: 'text-warning-glow',
                  icon: award.tipo.includes('Técnico') ? 'bi-person-gear' : 'bi-star-fill',
                  badgeClass: 'bg-warning text-dark',
                  isMyCareer: false,
                  sortYear: parseInt(award.temporada.toString().split('/')[0]) || 0
              })
          }
      })
  }

  // Deduplication
  const uniqueEvents = []
  const dedupKey = new Set()
  events.forEach(e => {
      const key = `${e.year}-${e.compName}-${e.type}-${e.badgeText}`
      if (!dedupKey.has(key)) {
          dedupKey.add(key)
          uniqueEvents.push(e)
      }
  })

  // Agrupamento de Eventos por Ano
  const groupedEventsMap = new Map()
  uniqueEvents.forEach(e => {
      if (!groupedEventsMap.has(e.shortYear)) {
          groupedEventsMap.set(e.shortYear, {
              year: e.year,
              shortYear: e.shortYear,
              sortYear: e.sortYear,
              isMyCareer: false,
              events: [],
              maxStatus: 'neutral'
          })
      }
      const group = groupedEventsMap.get(e.shortYear)
      if (e.isMyCareer) group.isMyCareer = true;
      group.events.push(e)
  })

  // Priority Map para cor do Card
  const priorityMap = { champion: 1, promoted: 2, relegated: 3, vice: 4, neutral: 5, award: 6 }
  
  const finalGrouped = Array.from(groupedEventsMap.values()).map(g => {
      g.events.sort((a, b) => priorityMap[a.type] - priorityMap[b.type])
      const mainEvent = g.events.find(e => e.type !== 'award') || g.events[0]
      g.maxStatus = mainEvent.type
      
      let baseCardClass = 'glow-neutral'
      let bulletClass = 'bg-secondary'
      
      if (g.maxStatus === 'champion') { baseCardClass = 'glow-warning'; bulletClass = 'bg-warning'; }
      else if (g.maxStatus === 'promoted') { baseCardClass = 'glow-success'; bulletClass = 'bg-success'; }
      else if (g.maxStatus === 'relegated') { baseCardClass = 'glow-danger'; bulletClass = 'bg-danger'; }
      else if (g.maxStatus === 'vice') { baseCardClass = 'glow-silver'; bulletClass = 'bg-light'; }
      else if (g.maxStatus === 'award') { baseCardClass = 'glow-neutral border-info'; bulletClass = 'bg-info'; }
      
      g.cardClass = baseCardClass
      g.bulletClass = bulletClass
      
      return g
  })

  finalGrouped.sort((a, b) => b.sortYear - a.sortYear)
  timelineEvents.value = finalGrouped;
}

const loadTrophies = async () => {
  if (!localClub.value) return
  loading.value = true
  const clubNorm = normalizeString(localClub.value)
  const clubSmart = clubSmartNormalize(localClub.value)
  
  // Bug fix: Buscar todas as temporadas via service para o modal
  const allSeasons = await seasonService.getAll()
  
  const grouped = {}
  
  // Cache de metadados para evitar buscas lineares repetitivas
  const metaCache = new Map();

  allSeasons.forEach(s => {
    if (isClubMatchTrophy(s.campeao, clubNorm, clubSmart)) {
      const compNameRaw = s.competitionName || ''
      let compName = compNameRaw
      
      // Padronização de Nomes (Liga Argentina -> Liga Profissional)
      if (compNameRaw.toLowerCase().trim() === 'liga argentina') compName = 'Liga Profissional'
      if (compNameRaw.toLowerCase().trim() === 'liga argentina serie b') compName = 'Primera Nacional'

      if (!grouped[compName]) {
        let meta = metaCache.get(compName);
        if (!meta) {
            meta = getCompMeta(compName);
            metaCache.set(compName, meta);
        }

        grouped[compName] = {
          nome: compName,
          count: 0,
          dates: [],
          trofeuUrl: meta?.trofeu ? getTrofeuPath(meta.trofeu) : `logos/competitions/${normalizeString(compName).replace(/\s+/g, '-')}.png`
        }
      }
      grouped[compName].count++
      grouped[compName].dates.push(s.ano)
    }
  })
  
  // Ordenar cada lista de datas (mais recentes primeiro ou conforme solicitado)
  Object.values(grouped).forEach(g => {
    g.dates.sort((a, b) => {
       const yearA = parseInt(a.split('/')[0]) || 0
       const yearB = parseInt(b.split('/')[0]) || 0
       return yearB - yearA
    })
  })

  trophies.value = Object.values(grouped).sort((a, b) => b.count - a.count)
  loading.value = false
}

watch(() => props.clubName, () => {
  loadTrophies()
})

onMounted(() => {
  loadTrophies()
})


// Estado de Controle do Modal


const open = async (overrideClub = null) => {
    localClub.value = overrideClub || props.clubName
    // Limpar eventos velhos imediatamente para evitar ghosts
    timelineEvents.value = []
    trophies.value = []

    activeTab.value = 'trophies'
    isVisible.value = true
    
    // Espera a reatividade do Vue atualizar as props para este ciclo
    await nextTick()

    loadTrophies()
    
    // Garanta load dos prêmios se necessário antes de montar a timeline
    if(!awardsStore.list || awardsStore.list.length === 0){
        awardsStore.loadAll().then(() => loadTimeline())
    } else {
        loadTimeline()
    }
}

const close = () => {
    isVisible.value = false
}

defineExpose({
  open,
  close,
  refresh: loadTrophies
})

</script>

<style scoped>
.timeline-bullet {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 10px rgba(0,0,0,0.8);
}

.timeline-bullet-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.5;
}

.timeline-card {
  transition: transform 0.2s, box-shadow 0.2s;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
}
.form-full-screen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 5vh 5vw;
}

.bg-dark-expert {
  background: radial-gradient(circle at top, #151a24 0%, #0a0c10 100%) !important;
}

.border-gold-glow {
  border: 1px solid rgba(255, 215, 0, 0.3) !important;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(255, 215, 0, 0.05);
}

/* NEON PULSE CONTROLLER */
@keyframes neonPulseController {
  0% { transform: scale(1); text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; }
  50% { transform: scale(1.2); text-shadow: 0 0 15px #00ff00, 0 0 30px #00ff00; }
  100% { transform: scale(1); text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; }
}

.neon-pulse-icon {
  animation: neonPulseController 1.5s infinite ease-in-out;
  font-size: 1.1em;
}

/* EFFECTS AND GLOWS */
.glow-warning { 
  background: linear-gradient(90deg, rgba(255, 193, 7, 0.15) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0,0,0,0.8) 100%);
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.15), inset 0 0 10px rgba(255, 193, 7, 0.05); 
  border-left: 4px solid #ffc107 !important; 
}
.text-warning-glow { color: #ffc107; text-shadow: 0 0 15px rgba(255, 193, 7, 0.6); }

.glow-silver { 
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0,0,0,0.8) 100%);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.02); 
  border-left: 4px solid #fff !important; 
}
.text-light { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }

.glow-bronze { 
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.15) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0,0,0,0.8) 100%);
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.15), inset 0 0 10px rgba(205, 127, 50, 0.05); 
  border-left: 4px solid #cd7f32 !important; 
}
.text-bronze { color: #cd7f32 !important; text-shadow: 0 0 15px rgba(205, 127, 50, 0.5); }

.glow-danger { 
  background: linear-gradient(90deg, rgba(220, 53, 69, 0.15) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0,0,0,0.8) 100%);
  box-shadow: 0 0 20px rgba(220, 53, 69, 0.2), inset 0 0 10px rgba(220, 53, 69, 0.1); 
  border-left: 4px solid #dc3545 !important; 
}
.text-danger-glow { color: #ff6b6b; text-shadow: 0 0 15px rgba(220, 53, 69, 0.8); }

.glow-success { 
  background: linear-gradient(90deg, rgba(40, 167, 69, 0.15) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0,0,0,0.8) 100%);
  box-shadow: 0 0 20px rgba(40, 167, 69, 0.2), inset 0 0 10px rgba(40, 167, 69, 0.1); 
  border-left: 4px solid #28a745 !important; 
}
.text-success-glow { color: #51cf66; text-shadow: 0 0 15px rgba(40, 167, 69, 0.8); }

.glow-neutral {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0,0,0,0.8) 100%);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  border-left: 4px solid rgba(255,255,255,0.1) !important;
}

.timeline-badge-shadow {
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}

.drop-shadow-sm {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}


/* CORES ADICIONAIS */
.bg-bronze { background-color: #cd7f32 !important; }
.text-bronze { color: #cd7f32 !important; }
.bg-light-black { background-color: #444 !important; }
.text-light-black { color: #aaa !important; }
.border-bronze { border-color: #cd7f32 !important; }

.text-warning-neon {
  color: #ffea00;
  text-shadow: 0 0 10px rgba(255, 234, 0, 0.3);
}

.text-info-neon {
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
}

.trophy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
}

.trophy-card {
  perspective: 1000px;
}

.tc-inner {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.trophy-card:hover .tc-inner {
  border-color: rgba(255, 215, 0, 0.4);
  background: rgba(255, 215, 0, 0.05);
  transform: translateY(-5px);
}

.tc-stars {
  font-size: 1.2rem;
  letter-spacing: 2px;
}

.tc-trophy-img-container {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.tc-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
  transition: transform 0.5s ease;
}

.trophy-card:hover .tc-img {
  transform: scale(1.1) rotate(2deg);
}

.tc-badge {
  display: inline-block;
  background: #ffea00;
  color: #000;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 900;
}

.tc-dates-list {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  max-height: 100px;
  overflow-y: auto;
  text-align: center;
  position: relative;
  z-index: 2;
}

.tc-date-item {
  padding: 2px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tc-date-item:last-child {
  border-bottom: none;
}

.tc-bg-shield {
  position: absolute;
  bottom: -20px;
  right: -20px;
  opacity: 0.05;
  transform: rotate(-15deg);
  z-index: 1;
}

.ls-2 { letter-spacing: 2px; }

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.2);
  border-radius: 10px;
}
</style>
