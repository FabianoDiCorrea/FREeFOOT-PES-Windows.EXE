<template>
  <div class="view-container animated-fade-in" v-if="teamName">
    <!-- Header com Voltar -->
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <button @click="$router.back()" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>VOLTAR
      </button>
      <LogoFREeFOOT />
    </div>

    <!-- CABEÇALHO DA SELEÇÃO -->
    <div class="club-header-panel mb-4 p-4 rounded-4 shadow-lg position-relative overflow-hidden border border-white border-opacity-10">
      <div class="club-header-bg">
        <NationalFlag :countryName="teamName" :size="300" class="bg-shield-blur" />
      </div>

      <div class="position-relative z-1 d-flex flex-wrap align-items-center gap-4">
        <div class="club-shield-wrap p-2 shadow-lg rounded-circle bg-white bg-opacity-10 border border-white border-opacity-20">
          <TeamShield :teamName="teamName" :size="120" isNational noFlagFallback borderless />
        </div>
        
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-3">
            <h1 class="display-4 fw-black text-white text-uppercase m-0 ls-n2">{{ teamName }}</h1>
            <div v-if="isAnyYearMyCareer" class="header-coach-neon neon-pulse-icon" title="Você comandou esta seleção">
              <i class="bi bi-controller"></i>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3 mt-2">
            <div v-if="teamInfo" class="d-flex align-items-center gap-2 opacity-75 fw-bold text-uppercase ls-1">
                <img :src="teamInfo.federacao_logo" v-if="teamInfo.federacao_logo" style="height: 25px; width: auto;" class="shadow-sm" />
                <span v-if="teamInfo.federacao">{{ teamInfo.federacao }}</span>
                <span class="mx-1 opacity-25">|</span>
                <span>{{ teamInfo.continente_nome || 'Mundial' }}</span>
            </div>
            <div class="badge bg-gold text-dark fw-black px-3 py-1">TOTAL: {{ totalChampionCount }} TÍTULOS</div>
          </div>
        </div>

        <div class="d-flex gap-2 ms-auto align-items-center">
           <div class="stat-box-gold">
              <div class="val">{{ totalChampionCount }}</div>
              <div class="lbl">TÍTULOS</div>
           </div>
           <div class="stat-box-silver">
              <div class="val">{{ totalViceCount }}</div>
              <div class="lbl">VICES</div>
           </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- SALA DE TROFÉUS -->
      <div class="col-lg-4 col-xl-3">
        <GamePanel customClass="h-100 border-gold-glow overflow-hidden">
           <div class="p-3 border-bottom border-secondary border-opacity-10 d-flex align-items-center justify-content-between">
              <h5 class="m-0 fw-black text-warning text-uppercase ls-1">
                 <i class="bi bi-trophy-fill me-2"></i>SALA DE TROFÉUS
              </h5>
           </div>

           <div class="p-3 custom-scrollbar list-scroll-area">
              <div v-if="loading" class="text-center py-5">
                 <div class="spinner-border spinner-border-sm text-warning"></div>
              </div>
              <div v-else-if="processedTrophies.length === 0" class="text-center py-5 opacity-25">
                 <i class="bi bi-trophy display-1"></i>
                 <p class="mt-2 fw-bold">NENHUM TÍTULO</p>
              </div>
              
              <div v-for="t in processedTrophies" :key="t.nome" class="trophy-row-item mb-4 animate-slide-in">
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

      <!-- LINHA DO TEMPO ANUAL -->
      <div class="col-lg-8 col-xl-9">
         <GamePanel customClass="h-100 p-0 overflow-hidden bg-glass-dark border border-white border-opacity-10">
            <div class="p-3 bg-black bg-opacity-30 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10">
               <h5 class="m-0 fw-black text-info text-uppercase ls-1">
                  <i class="bi bi-clock-history me-2"></i>RAIO-X HISTÓRICO ANUAL
               </h5>
               <div class="small opacity-50 fw-bold d-flex gap-2">
                  <span>{{ seasonStore.list.length }} REGISTROS NA BASE</span>
               </div>
            </div>

            <div class="timeline-scroll-container p-4 custom-scrollbar list-scroll-area" style="background: rgba(0,0,0,0.2);">
               <div v-if="loading" class="text-center py-5">
                  <div class="spinner-border text-info mb-3"></div>
                  <p class="text-info fw-bold animate-pulse text-uppercase">Sincronizando Dados...</p>
               </div>

               <div v-else-if="timelineGroups.length === 0" class="text-center py-5">
                  <i class="bi bi-geo-alt opacity-10 display-1 mb-3 d-block"></i>
                  <h4 class="text-secondary text-uppercase fw-black">Registros não localizados</h4>
                  <p class="opacity-50">Não encontramos participações de <strong>{{ teamName }}</strong> nesta fase do Universo.</p>
                  
                  <div class="mt-4 p-3 bg-dark bg-opacity-50 rounded border border-white border-opacity-10 small opacity-50" style="max-width: 400px; margin: 0 auto;">
                     Dica: Verifique se o nome na Matriz de Temporadas coincide exatamente com a rota.
                  </div>
               </div>

               <div v-else class="timeline-v2">
                  <div v-for="(group, idx) in timelineGroups" :key="idx" class="timeline-year-block d-flex gap-4 mb-5 animate-slide-up">
                      
                       <div class="timeline-date-side text-end py-2" style="width: 140px; flex-shrink: 0;">
                          <div class="fw-black text-white-glow ls-n1 line-height-1" style="font-size: 1.5rem;">{{ group.year }}</div>
                       </div>

                      <div class="timeline-trilha-side position-relative py-2" style="width: 20px; flex-shrink: 0;">
                         <div class="timeline-main-line"></div>
                         <div class="timeline-main-bullet shadow-lg shadow-white-10" :class="group.bulletClass"></div>
                      </div>

                      <div class="timeline-main-content flex-grow-1">
                         <div class="year-card-dashboard p-4 rounded-4 shadow-2xl position-relative overflow-hidden border border-white border-opacity-5" :class="group.cardClass">
                            
                            <div v-for="(evt, eIdx) in group.events" :key="eIdx" class="event-row-timeline py-3" :class="{'border-bottom border-white border-opacity-10': eIdx !== group.events.length - 1}">
                               <div class="d-flex align-items-center justify-content-between mb-2">
                                   <div class="d-flex align-items-center gap-2">
                                      <div class="competition-indicator shadow-sm" :class="evt.statusClass"></div>
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
                                      <div v-if="evt.scFoto" class="award-square-block photo-block shadow-sm">
                                         <img :src="getCachedUrl(evt.scFoto)" @error="handleImgError" />
                                      </div>
                                      <div v-if="evt.trophyUrl" class="award-square-block trophy-block shadow-sm">
                                         <img :src="evt.trophyUrl" @error="handleImgError" />
                                      </div>
                                   </div>
                                   <div v-else class="event-icon-circle bg-dark bg-opacity-50 border border-white border-opacity-10 shadow-inner">
                                      <TeamShield :teamName="evt.teamShield" :size="40" isNational noFlagFallback borderless />
                                   </div>

                                   <div class="flex-grow-1">
                                      <div class="d-flex justify-content-between align-items-start">
                                         <h4 class="fw-black text-white m-0 ls-n1 text-uppercase">{{ evt.description }}</h4>
                                         <div v-if="evt.isMyCareer" class="coach-indicator-pulse-v2 neon-pulse-icon" title="Você comandou a seleção neste ano">
                                            <i class="bi bi-controller"></i>
                                         </div>
                                      </div>
                                      
                                     <div v-if="evt.prints && evt.prints.length > 0" class="mt-3 d-flex gap-2 flex-wrap">
                                        <div v-for="(url, pIdx) in evt.prints" :key="pIdx" class="mini-print-timeline shadow-sm hover-scale cursor-zoom-in">
                                           <img :src="getCachedUrl(url)" />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { careerStore } from '../services/career.store'
import { awardsStore } from '../services/awards.store'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { NATIONAL_COMPETITIONS_STRUCTURE } from '../services/national.data'
import { getTrofeuPath, normalizeCountry, getSeasonFinalYear } from '../services/utils'
import { dataSearchService } from '../services/dataSearch.service'

import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import GamePanel from '../components/GamePanel.vue'

// IMAGES
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
  'Melhor da CONCACAF': imgMelhorConcacaf,
  'Bola de Ouro': imgMelhorMundo,
  'Chuteira de Ouro': 'logos/competitions/chuteira-de-ouro.png',
  'Luva de Ouro': 'logos/competitions/luva-de-ouro.png'
}

const route = useRoute()
const teamName = ref('')
const loading = ref(true)
const teamInfo = ref(null)

/**
 * Normalização Ultra-Agressiva para Match (Sem acentos, sem espaços, sem pontuação)
 */
const deepNorm = (s) => {
    if (!s) return ''
    return s.toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim()
}

const isTeamMatch = (target, searchNorm) => {
    if (!target || !searchNorm) return false
    let raw = ''
    if (typeof target === 'object' && target !== null) {
        raw = target.nome || target.time || target.country || ''
    } else {
        raw = target.toString()
    }
    const t = deepNorm(raw)
    const s = deepNorm(searchNorm)
    
    if (t === s) return true

    // Se o alvo contém o termo de busca (ex: Uruguai Sub-20 contém Uruguai)
    if (t.includes(s)) {
        // FIREWALL: Evita que 'Brasil' case com 'Brasil de Pelotas'
        // Se a diferença de tamanho for muito grande, provavelmente é um clube contendo o nome do país
        if (s.length <= 6 && t.length > s.length + 5) return false
        return true
    }
    
    return s.includes(t)
}

const parseTable = (str) => {
    if (!str) return []
    return str.split('\n').filter(l => l.trim()).map(line => {
        let cells = line.split('\t')
        if (cells.length === 1) cells = line.split(/\s{2,}/)
        let tName = cells[0]?.trim() || ''
        let ext = ''
        if (/^\d+/.test(tName)) { tName = cells[1]?.trim() || ''; ext = cells[2]?.trim() || '' }
        else { ext = cells[1]?.trim() || '' }
        return { 
            time: tName, 
            extra: ext, 
            rank: (ext.includes('1º') || ext.toUpperCase().includes('CAMPEÃO')) ? 1 : 
                  (ext.includes('2º') || ext.toUpperCase().includes('VICE')) ? 2 : 99 
        }
    }).filter(x => x.time)
}

const getCompetitionInfo = (name) => {
    if (!name) return null
    const n = deepNorm(name)
    const all = [
        ...ALL_COMPETITIONS_DATA.flatMap(c => c.paises.flatMap(p => p.competicoes || [])),
        ...ALL_COMPETITIONS_DATA.flatMap(c => c.continentais || []),
        ...INTERNATIONAL_DATA,
        ...NATIONAL_COMPETITIONS_STRUCTURE.flatMap(s => s.competicoes)
    ]
    return all.find(c => deepNorm(c.nome) === n || n.includes(deepNorm(c.nome)))
}

const getTrofeuPathByCompName = (name) => {
    const info = getCompetitionInfo(name)
    if (info?.trofeu) return getTrofeuPath(info.trofeu)
    
    const n = deepNorm(name)
    if (n.includes('copadomundo') || n.includes('mundial')) return 'assets/trofeus/trofeu-copadomundo.png'
    if (n.includes('eurocopa') || n.includes('uefaeuro')) return 'assets/trofeus/trofeu-eurocopa.png'
    if (n.includes('copaamerica')) return 'assets/trofeus/trofeu-copaamerica.png'
    
    return `logos/competitions/${name.replace(/\s+/g, '-')}.png`
}

/**
 * PROCESSAMENTO REATIVO (COMPUTED)
 * Garante que assim que seasonStore.list for preenchido, os dados apareçam.
 */
const timelineGroups = computed(() => {
    const allSeasons = toRaw(seasonStore.list) || []
    if (allSeasons.length === 0) return []
    
    const searchNorm = teamName.value
    const events = []
    
    allSeasons.forEach(s => {
        let isChamp = isTeamMatch(s.campeao, searchNorm)
        let isVice = isTeamMatch(s.vice, searchNorm)
        let partInfo = null

        // Participantes
        if (s.participantes?.length > 0) {
            const found = s.participantes.find(p => isTeamMatch(p, searchNorm))
            if (found) partInfo = typeof found === 'string' ? { nome: found, colocacao: '' } : found
        }
        
        // Tabela
        if (!partInfo && s.tabela) {
            const table = parseTable(s.tabela)
            const row = table.find(r => isTeamMatch(r.time, searchNorm))
            if (row) {
                partInfo = { nome: row.time, colocacao: row.extra || (row.rank < 99 ? row.rank + 'º' : '') }
                if (row.rank === 1 || (row.extra && row.extra.toUpperCase().includes('CAMPEÃO'))) isChamp = true
                if (row.rank === 2 || (row.extra && row.extra.toUpperCase().includes('VICE'))) isVice = true
            }
        }

        const isUser = careerStore.isUserTeam(searchNorm, s.ano)

        if (isChamp || isVice || partInfo) {
            const compName = s.competitionName || ''
            const info = getCompetitionInfo(compName)
            const colocar = partInfo?.colocacao || ''
            let status = 'neutral'
            if (isChamp) status = 'champion'
            else if (isVice) status = 'vice'
            else if (colocar) {
                const low = colocar.toLowerCase()
                if (low.includes('3')) status = 'bronze'
                else if (low.includes('semi') || low.includes('4')) status = 'info'
                else if (low.includes('quartas') || low.includes('8')) status = 'quartas'
                else if (low.includes('oitavas') || low.includes('16')) status = 'oitavas'
                else if (low.includes('grupos') || low.includes('32')) status = 'grupos'
            }

            events.push({
                year: s.ano, shortYear: getSeasonFinalYear(s.ano), compName, compLogo: info?.logo || null,
                type: status, badgeText: isChamp ? 'CAMPEÃO' : isVice ? 'VICE-CAMPEÃO' : (colocar || 'PARTICIPANTE'),
                description: isChamp ? `Venceu a ${compName}` : isVice ? `Finalista da ${compName}` : (colocar ? `${colocar} da ${compName}` : `Disputou a ${compName}`),
                statusClass: getStatusClass(status), icon: isChamp ? 'bi-trophy-fill' : isVice ? 'bi-award' : 'bi-shield',
                badgeClass: getBadgeClass(status), isMyCareer: isUser, sortYear: getSeasonFinalYear(s.ano),
                trophyUrl: isChamp ? (info?.trofeu ? getTrofeuPath(info.trofeu) : getTrofeuPathByCompName(compName)) : null,
                prints: s.printsUrls?.filter(u => u) || [], teamShield: teamName.value
            })
        }

        // Artilheiros
        const scList = s.topScorers || (s.artilheiro?.nome ? [s.artilheiro] : [])
        scList.forEach(sc => {
            if (isTeamMatch(sc.clube, searchNorm)) {
                events.push({
                    year: s.ano, shortYear: getSeasonFinalYear(s.ano), compName: 'ARTILHARIA', type: 'award', badgeText: 'ARTILHEIRO',
                    description: `${sc.nome} (${sc.gols} Gols) ${s.competitionName}`, statusClass: 'bg-info', icon: 'bi-person-badge-fill',
                    badgeClass: 'bg-info text-dark', isMyCareer: false, sortYear: getSeasonFinalYear(s.ano),
                    trophyUrl: 'logos/competitions/artilheiro.png', scFoto: sc.fotoUrl || sc.foto || null, scNome: sc.nome
                })
            }
        })
    })

    // Prêmios Individuais
    if (awardsStore.list) {
        awardsStore.list.forEach(aw => {
            if (isTeamMatch(aw.clube, searchNorm)) {
                const awYr = aw.season?.toString() || '2025'
                events.push({
                    year: awYr, shortYear: getSeasonFinalYear(awYr), compName: 'PREMIAÇÃO INDIVIDUAL', type: 'award', badgeText: 'PRÊMIO',
                    description: `${aw.nome} - ${aw.tipo}`, statusClass: 'bg-warning', icon: aw.tipo?.includes('Técnico') ? 'bi-person-gear' : 'bi-star-fill',
                    badgeClass: 'bg-warning text-dark', isMyCareer: false, sortYear: getSeasonFinalYear(awYr),
                    trophyUrl: trophyMap[aw.tipo] || './logos/competitions/premio-trofeu.png', scFoto: aw.fotoJogador || aw.foto || null
                })
            }
        })
    }

    const annualMap = new Map()
    events.forEach(e => {
        const k = e.shortYear
        if (!annualMap.has(k)) annualMap.set(k, { year: e.year, shortYear: e.shortYear, sortYear: e.sortYear, isMyCareer: false, events: [] })
        const g = annualMap.get(k)
        if (e.isMyCareer) g.isMyCareer = true
        g.events.push(e)
    })

    const priority = { champion: 1, promoted: 2, vice: 3, neutral: 4, award: 5 }
    return Array.from(annualMap.values()).map(g => {
        g.events.sort((a,b) => (priority[a.type] || 9) - (priority[b.type] || 9))
        const m = g.events.find(e => e.type !== 'award') || g.events[0]
        g.cardClass = `glow-${m.type === 'neutral' ? 'neutral' : m.type === 'award' ? 'info' : m.type}`
        g.bulletClass = `bg-${m.type === 'neutral' ? 'secondary' : m.type === 'award' ? 'info' : m.type}`
        return g
    }).sort((a,b) => b.sortYear - a.sortYear)
})

const processedTrophies = computed(() => {
    const allSeasons = toRaw(seasonStore.list) || []
    const searchNorm = teamName.value
    const trGrouped = {}

    allSeasons.forEach(s => {
        let isCH = isTeamMatch(s.campeao, searchNorm)
        if (!isCH && s.tabela) {
            const table = parseTable(s.tabela)
            const row = table.find(r => isTeamMatch(r.time, searchNorm))
            if (row && (row.rank === 1 || (row.extra && row.extra.toUpperCase().includes('CAMPEÃO')))) isCH = true
        }

        if (isCH) {
            const name = s.competitionName || 'Competição'
            if (!trGrouped[name]) trGrouped[name] = { nome: name, count: 0, dates: [], trofeuUrl: getTrofeuPathByCompName(name) }
            trGrouped[name].count++
            trGrouped[name].dates.push(s.ano)
        }
    })
    return Object.values(trGrouped).sort((a,b) => b.count - a.count)
})

const totalChampionCount = computed(() => processedTrophies.value.reduce((acc, t) => acc + t.count, 0))
const totalViceCount = computed(() => {
    const allSeasons = toRaw(seasonStore.list) || []
    const searchNorm = teamName.value
    let vcount = 0
    allSeasons.forEach(s => {
        let isV = isTeamMatch(s.vice, searchNorm)
        if (!isV && s.tabela) {
             const table = parseTable(s.tabela)
             const row = table.find(r => isTeamMatch(r.time, searchNorm))
             if (row && (row.rank === 2 || (row.extra && row.extra.toUpperCase().includes('VICE')))) isV = true
        }
        if (isV) vcount++
    })
    return vcount
})

const isAnyYearMyCareer = computed(() => timelineGroups.value.some(g => g.isMyCareer))

function getStatusClass(type) {
    if (type === 'champion') return 'bg-pos-gold'
    if (type === 'vice') return 'bg-pos-silver'
    if (type === 'bronze') return 'bg-pos-bronze'
    if (type === 'info') return 'bg-pos-copper' 
    if (type === 'quartas') return 'bg-pos-green'
    if (type === 'oitavas') return 'bg-pos-blue'
    if (type === 'grupos') return 'bg-pos-red'
    return 'bg-secondary'
}

function getBadgeClass(type) {
    const base = getStatusClass(type)
    if (type === 'champion') return base + ' text-dark fw-black'
    if (type === 'oitavas') return base + ' text-dark fw-bold'
    return base + ' text-white fw-bold'
}

const getCachedUrl = (url) => url // Simplificado para evitar quebras
const handleImgError = () => {}

import { FEDERATIONS_DATA } from '../services/federations.data'

const loadTeamData = async () => {
    const id = route.params.id
    if (!id) return
    teamName.value = decodeURIComponent(id).trim()
    loading.value = true
    
    try {
        await seasonStore.loadAll()
        await careerStore.loadAll().catch(() => {})
        await awardsStore.loadAll().catch(() => {})
        
        teamInfo.value = dataSearchService.findNationalTeam(teamName.value)
        if (teamInfo.value && FEDERATIONS_DATA) {
            const fed = Object.entries(FEDERATIONS_DATA).find(([k, v]) => v.logo === teamInfo.value.federacao_logo)
            teamInfo.value.federacao = fed ? fed[0] : ''
        }
    } finally {
        loading.value = false
    }
}

onMounted(loadTeamData)
watch(() => route.params.id, loadTeamData)
</script>

<style scoped>
.view-container { padding: 1rem; color: white; }
.club-header-panel { background: rgba(20, 20, 25, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
.club-header-bg { position: absolute; top: -50px; right: -50px; opacity: 0.15; filter: blur(40px); pointer-events: none; }
.bg-shield-blur { transform: rotate(-15deg); }
.club-shield-wrap { width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
.stat-box-gold, .stat-box-silver { padding: 15px 25px; border-radius: 15px; text-align: center; min-width: 100px; }
.stat-box-gold { background: linear-gradient(135deg, #ffcc00, #ff9900); color: #000; box-shadow: 0 0 20px rgba(255, 204, 0, 0.3); }
.stat-box-silver { background: linear-gradient(135deg, #e0e0e0, #9e9e9e); color: #000; box-shadow: 0 0 20px rgba(224, 224, 224, 0.2); }
.stat-box-gold .val, .stat-box-silver .val { font-size: 2rem; font-weight: 900; line-height: 1; }
.stat-box-gold .lbl, .stat-box-silver .lbl { font-size: 0.7rem; font-weight: 700; opacity: 0.8; text-transform: uppercase; }
.timeline-v2 { position: relative; }
.timeline-main-line { position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.1); z-index: 0; }
.timeline-main-bullet { width: 20px; height: 20px; border-radius: 50%; position: relative; z-index: 2; border: 4px solid #1a1b24; }
.year-card-dashboard { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease; }
.year-card-dashboard:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }
.glow-champion { box-shadow: 0 0 30px rgba(255, 215, 0, 0.1); border-left: 4px solid #ffd700; }
.glow-vice { box-shadow: 0 0 30px rgba(192, 192, 192, 0.05); border-left: 4px solid #c0c0c0; }
.glow-bronze { box-shadow: 0 0 30px rgba(205, 127, 50, 0.05); border-left: 4px solid #cd7f32; }
.glow-info { box-shadow: 0 0 30px rgba(139, 69, 19, 0.05); border-left: 4px solid #8b4513; }
.glow-quartas { box-shadow: 0 0 30px rgba(46, 204, 113, 0.05); border-left: 4px solid #2ecc71; }
.glow-oitavas { box-shadow: 0 0 30px rgba(52, 152, 219, 0.05); border-left: 4px solid #3498db; }
.glow-grupos { box-shadow: 0 0 30px rgba(231, 76, 60, 0.05); border-left: 4px solid #e74c3c; }
.glow-neutral { border-left: 4px solid rgba(255,255,255,0.2); }

.bg-pos-gold { background: linear-gradient(135deg, #ffed4b 0%, #ffd700 100%) !important; color: #332b00 !important; }
.bg-pos-silver { background: linear-gradient(135deg, #a0a0a0 0%, #707070 100%) !important; color: #fff !important; }
.bg-pos-bronze { background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%) !important; color: #fff !important; }
.bg-pos-copper { background: linear-gradient(135deg, #8b4513 0%, #5d2e0a 100%) !important; color: #fff !important; }
.bg-pos-green { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%) !important; color: #fff !important; }
.bg-pos-blue { background: linear-gradient(135deg, #00f2ff 0%, #00a8b3 100%) !important; color: #000 !important; }
.bg-pos-red { background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%) !important; color: #fff !important; }
.comp-logo-mini { height: 20px; width: auto; object-fit: contain; }
.timeline-badge-v2 { font-size: 0.7rem !important; letter-spacing: 1px; }
.trophy-thumb { width: 60px; height: 80px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,215,0,0.2)); }
.trophy-main-img { height: 60px; width: auto; filter: drop-shadow(0 0 15px rgba(255,215,0,0.4)); }
.event-icon-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.mini-print-timeline { width: 60px; height: 40px; border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.mini-print-timeline img { width: 100%; height: 100%; object-fit: cover; }
.award-square-block { width: 50px; height: 50px; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); position: relative; display: flex; align-items: center; justify-content: center; }
.award-square-block img { width: 100%; height: 100%; object-fit: cover; z-index: 2; }
.header-coach-neon { color: #00f2ff; text-shadow: 0 0 10px #00f2ff; font-size: 1.5rem; }
.animate-pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
</style>
