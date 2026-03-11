<template>
  <div class="country-matrix-container p-2 min-vh-100 bg-dark text-white">
    <!-- TOOLBAR SUPERIOR -->
    <div class="d-flex justify-content-between align-items-center mb-3 px-3 py-2 bg-glass border-bottom border-white border-opacity-10 shadow-lg">
      <div class="d-flex align-items-center gap-4">
        <button @click="$router.push(`/pais/${countryId}/historico`)" class="btn btn-sm btn-action hover-glow px-3 me-2">
          <i class="bi bi-table me-2"></i>HISTÓRICO
        </button>
        <button @click="$router.push('/universo?pais=' + countryName)" class="btn btn-sm btn-outline-info hover-glow px-3 me-2">
          <i class="bi bi-trophy me-2"></i>COMPETIÇÕES
        </button>
        <button @click="$router.push(`/pais/${countryName}/trofeus`)" class="btn btn-sm btn-warning text-dark hover-glow px-3 fw-bold">
          <i class="bi bi-trophy-fill me-2"></i>SALA DE TROFÉUS
        </button>
        <div class="d-flex align-items-center gap-2">
          <NationalFlag v-if="countryName" :countryName="countryName" :size="32" />
          <h4 class="m-0 text-uppercase fw-black ls-2 title-expert">MATRIZ EXPERT <span class="text-info opacity-50 ms-2">// {{ countryName }}</span></h4>
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
          <option v-for="slot in countrySlots" :key="slot.key" :value="slot.key">{{ slot.label }} {{ slot.type === 'intl' ? '(INTL)' : 'SÉRIE' }}</option>
        </select>
      </div>

      <LogoFREeFOOT :size="35" />
    </div>

    <!-- MENSAGENS DE STATUS -->
    <div v-if="seasonStore.loading" class="p-5 text-center">
      <div class="spinner-border text-info mb-3"></div>
      <p class="opacity-50 fw-bold">CARREGANDO DADOS DO UNIVERSO...</p>
    </div>
    <div v-else-if="sortedClubs.length === 0" class="p-5 text-center bg-black bg-opacity-40 rounded border border-white border-opacity-10 m-2">
      <i class="bi bi-exclamation-triangle fs-1 text-warning mb-3 d-block"></i>
      <h4 class="fw-black text-uppercase">Nenhum dado encontrado</h4>
      <p class="opacity-50">Não há registros de temporadas ou clubes vinculados a <strong>{{ countryName }}</strong> no momento.</p>
      <button @click="forceReload" class="btn btn-info btn-sm mt-3 fw-bold text-dark px-4">TENTAR RECARREGAR AGORA</button>
    </div>



    <!-- TABELA ESTILO EXCEL -->
    <div v-else class="matrix-xl-wrapper custom-scrollbar shadow-2xl border border-white border-opacity-10 rounded overflow-auto glass-table m-1">
      <table class="matrix-xl-table mb-0">
        <thead>
          <!-- LINHA 1: TEMPORADAS -->
          <tr>
            <th rowspan="3" class="sticky-club first-col-header bg-black text-center border-all">
              CLUBE
            </th>
            <th v-for="season in sortedSeasons" :key="'s'+season" :colspan="countrySlots.length" class="season-group-header border-all text-center">
              {{ season }}
            </th>
          </tr>

          <!-- LINHA 2: LOGOS / TÍTULOS DE COMPETIÇÃO -->
          <tr>
            <template v-for="season in sortedSeasons" :key="'l'+season">
              <!-- LIGA NACIONAL -->
              <th :colspan="ligaSlotsCount" class="bg-liga-header border-all text-center py-2">
                <div class="d-flex flex-column align-items-center gap-1">
                  <img v-if="mainLeagueLogo" :src="mainLeagueLogo" class="liga-header-logo" />
                  <span class="header-main-label" v-else>LIGA SÉRIE</span>
                </div>
              </th>
              <!-- COPAS NACIONAIS -->
              <th v-for="cupSlot in cupSlots" :key="season+'cup'+cupSlot.key" class="bg-cup-header border-all text-center py-1">
                <div class="d-flex flex-column align-items-center">
                  <img v-if="cupSlot.meta?.logo" :src="cupSlot.meta.logo" class="intl-header-logo" />
                  <i v-else class="bi bi-trophy-fill text-warning" style="font-size:1.1rem;"></i>
                  <span class="intl-header-minor">{{ cupSlot.meta?.nome?.split(' ').slice(-2).join(' ') || 'COPA' }}</span>
                </div>
              </th>
              <!-- INTERNACIONAIS -->
              <th v-for="intl in intlSlots" :key="season+intl.id" class="bg-intl-header border-all text-center py-1">
                <div class="d-flex flex-column align-items-center">
                  <img :src="intl.logo" class="intl-header-logo" v-tooltip="intl.name" />
                  <span class="intl-header-minor">{{ intl.shortName }}</span>
                </div>
              </th>
            </template>
          </tr>

          <!-- LINHA 3: SUB-DIVISÕES (A, B, C, D...) -->
          <tr>
            <template v-for="season in sortedSeasons" :key="'sd'+season">
              <th v-for="slot in countrySlots" :key="season+slot.key" class="slot-header border-all text-center px-0" 
                  :class="[
                    { 'last-of-season': isLastSlot(slot) },
                    { 'intl-column-bg intl-slot-width': slot.type === 'intl' }
                  ]">
                {{ slot.label }}
              </th>
            </template>
          </tr>
        </thead>

        <tbody>
          <tr v-for="club in sortedClubs" :key="club" class="club-row-xl">
            <!-- COLUNA FIXA: CLUBE -->
            <td class="sticky-club club-info-cell border-all px-2">
              <div class="d-flex align-items-center gap-2">
                <TeamShield :teamName="clubNames[club] || club" :size="20" />
                <span class="club-name-text d-flex align-items-center gap-1">
                  {{ clubNames[club] || club }}
                </span>
              </div>
            </td>

            <!-- CÉLULAS DE DADOS -->
            <template v-for="season in sortedSeasons" :key="club+season">
                <td v-for="slot in countrySlots" 
                    :key="club+season+slot.key" 
                    class="matrix-xl-cell border-all text-center"
                    :class="[
                      getCellBackground(club, season, slot), 
                      { 'last-of-season': isLastSlot(slot) },
                      { 'intl-column-bg intl-slot-width': slot.type === 'intl' }
                    ]">
                   <span class="cell-rank-text">{{ getRank(club, season, slot) }}</span>
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
        <span>Campeão (A ou Intl)</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-silver-bg neon-border-silver" style="width: 12px; height: 12px;"></div> 
        <span>Vice / Top Ranking</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-green-bg" style="width: 12px; height: 12px; border: 1px solid #55ef44;"></div> 
        <span>Acesso / Elite</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-red-bg" style="width: 12px; height: 12px; border: 1px solid #ff5555;"></div> 
        <span>Rebaixado</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <div class="mini-box expert-blue-intl-bg" style="width: 12px; height: 12px; border: 1px solid #44d2ff;"></div> 
        <span>Participação Intl</span>
      </div>
      <div class="ms-auto opacity-50">{{ sortedClubs.length }} Clubes | {{ sortedSeasons.length }} Temporadas</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { careerStore } from '../services/career.store'
import { clubStore } from '../services/club.store'
import { ALL_COMPETITIONS_DATA as RAW_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import { normalizeYearStrict } from '../services/utils'

const route = useRoute()
const countryId = computed(() => route.params.id)

const countryName = computed(() => {
  const name = route.params.id || ''
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
})

const sortYear = ref('')
const sortSlot = ref('league_A')

// CONFIGURAÇÃO DE SLOTS (COLUNAS)
const countrySlots = ref([])
const intlSlots = ref([])

const isRelegationCountry = computed(() => {
  const c = countryName.value?.toLowerCase().trim()
  return c === 'brasil' || c === 'argentina' || c === 'inglaterra' || c === 'brazil' || c === 'england'
})

const getFederationByCountry = (cName) => {
  const norm = (s) => s?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""
  const target = norm(cName)
  for (const continent of RAW_DATA) {
    if (continent.paises.some(p => norm(p.nome) === target)) {
      return continent.continente
    }
  }
  return null
}

const mainLeagueLogo = computed(() => {
  const countryIdVal = countryId.value?.toLowerCase()
  for (const continent of RAW_DATA) {
    const p = continent.paises.find(p => p.nome.toLowerCase() === countryIdVal)
    if (p) {
      const liga = p.competicoes.find(c => c.tipo === 'Liga')
      return liga?.logo || null
    }
  }
  return null
})

const ligaSlotsCount = computed(() => countrySlots.value.filter(s => s.type === 'league').length)
const cupSlots = computed(() => countrySlots.value.filter(s => s.type === 'cup'))

const setupSlots = () => {
  const slots = []
  const countryIdVal = countryId.value?.toLowerCase()
  let leaguesFound = []
  
  // 1. Identificar Continente e definir Slots Internacionais
  const continentName = getFederationByCountry(countryName.value)
  
  // Buscando logos dinamicamente do data central
  const getIntlLogo = (shortName) => {
    const comp = INTERNATIONAL_DATA.find(c => c.shortName === shortName || c.nome.includes(shortName) || c.nome === shortName)
    return comp ? comp.logo : ''
  }

  const intlMap = {
    'América do Sul': [
      { id: 'liberta', key: 'intl_Libertadores', name: 'Libertadores', shortName: 'LIBERTADORES', logo: getIntlLogo('Libertadores') },
      { id: 'sula', key: 'intl_Sul-Americana', name: 'Sul-Americana', shortName: 'SUDAMERICANA', logo: getIntlLogo('Sul-Americana') },
      { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: getIntlLogo('Mundial') }
    ],
    'Europa': [
      { id: 'champions', key: 'intl_Champions League', name: 'Champions League', shortName: 'CHAMPIONS', logo: getIntlLogo('Champions League') },
      { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: getIntlLogo('Mundial') }
    ],
    'América do Norte': [
      { id: 'concacaf', key: 'intl_CONCACAF Champions', name: 'CONCACAF Champions', shortName: 'CONCACAF', logo: getIntlLogo('CONCACAF') },
      { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: getIntlLogo('Mundial') }
    ]
  }

  intlSlots.value = intlMap[continentName] || [
    { id: 'mundial', key: 'intl_Mundial de Clubes', name: 'Mundial de Clubes', shortName: 'MUNDIAL', logo: getIntlLogo('Mundial') }
  ]

  // 2. Buscar ligas deste país no sistema
  for (const continent of RAW_DATA) {
     const p = continent.paises.find(p => p.nome.toLowerCase() === countryIdVal)
     if (p) {
       leaguesFound = p.competicoes.filter(c => c.tipo === 'Liga')
       break
     }
  }

  // Ordenar por ID (geralmente A -> B -> C...)
  leaguesFound.sort((a, b) => (a.id || 0) - (b.id || 0))

  leaguesFound.forEach((liga, idx) => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    slots.push({ 
      key: `league_${labels[idx] || (idx+1)}`, 
      label: labels[idx] || (idx+1), 
      type: 'league',
      meta: liga 
    })
  })

  // Adicionar Copas Nacionais
  let cupsFound = []
  for (const continent of RAW_DATA) {
    const p = continent.paises.find(p => p.nome.toLowerCase() === countryIdVal)
    if (p) {
      cupsFound = (p.competicoes || []).filter(c => c.tipo === 'Copa')
      break
    }
  }
  cupsFound.forEach(copa => {
    slots.push({
      key: `cup_${copa.nome.replace(/\s+/g, '_')}`,
      label: 'Copa',
      type: 'cup',
      meta: copa
    })
  })

  intlSlots.value.forEach(i => {
    slots.push({ key: i.key, label: 'Pos', type: 'intl', id: i.id })
  })
  countrySlots.value = slots
}

// COLETA E PROCESSAMENTO DE DADOS (REATIVO)
const processedMatrix = computed(() => {
  const data = {}
  const seasonsSet = new Set()
  const clubsSet = new Set() // Chaves Normalizadas
  const clubNameMap = {} // Mapa: Normalizado -> Raw (Mantém o primeiro nome "bonito" encontrado)
  
  // Normalização profunda para evitar erros de case/acentos/espaços extras
  const normalize = (s) => s?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim() || ""
  const countryIdVal = normalize(countryId.value)

  if (!seasonStore.list || seasonStore.list.length === 0) {
    return { data, seasons: [], clubs: [], empty: true }
  }

  // 1. Identificar clubes do país (Normalizado) incluindo os Customizados
  const countryClubsNamesNormalized = clubStore.list.filter(c => 
    normalize(c.pais) === countryIdVal
  ).map(c => normalize(c.nome))

  if (countryClubsNamesNormalized.length === 0) {
    return { data, seasons: [], clubs: [], noClubs: true }
  }

  // 1.5 Pre-processar Metadata das Competições para busca ultra-rápida (Evita hangs)
  const allCompsFlat = RAW_DATA.flatMap(c => c.paises ? c.paises.flatMap(p => p.competicoes || []) : [])
  const compsMapByName = {}
  const compsMapById = {}
  
  allCompsFlat.forEach(c => {
    const normName = normalize(c.nome)
    if (!compsMapByName[normName]) compsMapByName[normName] = c
    if (!compsMapById[c.id]) compsMapById[c.id] = c
  })

  // 2. Processar temporadas
  seasonStore.list.forEach(season => {
    if (!season.competitionName) return
    
    // Bloqueio de País: Só processa temporadas que pertencem ao país da Matriz ou são continentais/mundiais.
    const seasonCountry = normalize(season.pais || '')
    const isInternational = !seasonCountry || 
                           ['continente', 'mundial', 'internacional', 'america do sul', 'europa', 'america do norte', 'asia', 'oceania', 'africa'].includes(seasonCountry)
    if (!isInternational && seasonCountry !== countryIdVal) return
    
    const tableStr = season.tabela || ''
    const table = parseTable(tableStr)
    const yearRaw = season.ano
    const year = normalizeYearStrict(yearRaw)
    const compName = normalize(season.competitionName)

    table.forEach((row, index) => {
      const clubNameRaw = row.time
      const clubNameNorm = normalize(clubNameRaw)
      
      // FIX: Tentar obter rank real da coluna extra (para Copas desordenadas)
      let rank = index + 1
      if (row.extra) {
          const derivedRank = getRankFromExtra(row.extra)
          if (derivedRank !== 999) {
              rank = derivedRank
          }
      }

      // Verificação flexível: Se o clube está no banco de dados, deve ser deste país.
      // Se não está no banco, permitimos (provavelmente é um time de divisões inferiores ou novo).
      const clubInStore = clubStore.list.find(c => normalize(c.nome) === clubNameNorm)
      if (clubInStore && normalize(clubInStore.pais) !== countryIdVal) return

      // Determinar Slot
      let slotKey = null
      
      // 1. Ligas (Matching por Metadata das Competicações do País + Aliases Argentina)
      countrySlots.value.filter(s => s.type === 'league').forEach(slot => {
        const slotNameNorm = normalize(slot.meta.nome)
        
        // Match exato ou o nome da temporada contém o nome da liga configurada
        if (compName === slotNameNorm || compName.includes(slotNameNorm)) {
          slotKey = slot.key
        }
        
        // Aliases específicos para Argentina
        if (!slotKey && countryIdVal === 'argentina') {
           if (slot.label === 'A' && (compName.includes('lpf') || compName.includes('primera'))) slotKey = slot.key
           if (slot.label === 'B' && (compName.includes('nacional'))) slotKey = slot.key
        }
      })

      // 2. Fallbacks de termos comuns para ligas
      if (!slotKey) {
        if (compName.includes('serie a') || compName.includes('primeira') || compName.includes('liga profissional') || compName.includes('liga inglesa')) slotKey = 'league_A'
        else if (compName.includes('serie b') || compName.includes('segunda') || compName.includes('nacional') || compName.includes('liga inglesa serie b')) slotKey = 'league_B'
        else if (compName.includes('serie c') || compName.includes('terceira')) slotKey = 'league_C'
        else if (compName.includes('serie d')) slotKey = 'league_D'
      }
      
      // 3. Internacionais (Matching Dinâmico por Continente)
      if (!slotKey) {
        intlSlots.value.forEach(intl => {
          const intlNorm = normalize(intl.name)
          const terms = intlNorm.split(' ')
          // Verificação mais precisa para evitar falsos positivos
          if (terms.some(t => t.length > 4 && compName.includes(t)) || compName.includes(intlNorm)) {
               slotKey = intl.key
          }
        })
      }

      if (slotKey) {
          if (!data[clubNameNorm]) {
             data[clubNameNorm] = {}
             // Preservar o nome "Raw" para exibição consultando todos os clubes (nativos e adcionados)
             const originalClub = clubStore.list.find(c => normalize(c.nome) === clubNameNorm)
             clubNameMap[clubNameNorm] = originalClub ? originalClub.nome : clubNameRaw
          }
          if (!data[clubNameNorm][year]) data[clubNameNorm][year] = {}
          
          // Determinar se é ACESSO (Direto ou Playoff)
          let isAccess = false
          const meta = compsMapById[season.competitionId] || compsMapByName[compName]
          
          if (meta && meta.promovidos > 0) {
             const normPlayoffs = (season.promovidosPlayoff || []).map(p => normalize(p))
             const playoffCount = normPlayoffs.length
             const directCount = Math.max(0, meta.promovidos - playoffCount)
             
             isAccess = (rank <= directCount) || normPlayoffs.includes(clubNameNorm)
          }

          // Determinar se é REBAIXAMENTO
          let isRelegation = false
          if (meta && meta.rebaixados > 0) {
             isRelegation = (rank > (table.length - meta.rebaixados))
          }

          if (!data[clubNameNorm][year][slotKey] || rank < data[clubNameNorm][year][slotKey].rank) {
            data[clubNameNorm][year][slotKey] = { 
              rank, 
              compName: season.competitionName,
              isAccess,
              isRelegation
            }
          }
          
          const isNationalSlot = slotKey.startsWith('league_') || slotKey.startsWith('cup_')
          const isFromThisCountry = countryClubsNamesNormalized.includes(clubNameNorm)

          if (isNationalSlot || isFromThisCountry) {
            clubsSet.add(clubNameNorm)
          }
          seasonsSet.add(year)
      }
    })

    // COPA NACIONAL: Popular via participantes com colocacao
    const cupSlots = countrySlots.value.filter(s => s.type === 'cup')
    if (cupSlots.length > 0 && season.participantes && season.participantes.length > 0) {
      const compNorm = normalize(season.competitionName)
      
      cupSlots.forEach(cupSlot => {
        const cupNomNorm = normalize(cupSlot.meta.nome)
        // Match via ID (definitivo) ou nome completo — NUNCA via palavra parcial
        const isThisCup = (season.competitionId && cupSlot.meta.id && season.competitionId === cupSlot.meta.id) 
                       || compNorm === cupNomNorm
                       // Se o ID falhar, o nome deve ser match exato ou começar com o nome da copa (ex: "Copa Equador" -> "Copa Equador 2024")
                       || (compNorm.startsWith(cupNomNorm) && !isInternational)
        if (!isThisCup) return

        season.participantes.forEach(p => {
          if (!p.nome || !p.colocacao) return
          const pNorm = normalize(p.nome)
          
          const fase = p.colocacao.toString().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          const rank = getRankFromExtra(fase)
          
          // Smart-match: tenta encontrar o clube no PAÍS CORRETO (Prioridade Total)
          // 1. Busca exata no país
          let bestClub = clubStore.list.find(c => normalize(c.nome) === pNorm && normalize(c.pais) === countryIdVal)
          
          // 2. Se for uma copa nacional e não achou no país, tenta o smart-match local
          if (!bestClub && isThisCup) {
            bestClub = clubStore.list.find(c => 
              normalize(c.pais) === countryIdVal && 
              (normalize(c.nome).startsWith(pNorm) || pNorm.startsWith(normalize(c.nome)))
            )
          }

          // 3. Bloqueio de Intrusos: Se achou match exato em OUTRO país e nada no atual, ignora na Matriz Nacional
          if (!bestClub && isThisCup) {
              const foreignMatch = clubStore.list.find(c => normalize(c.nome) === pNorm)
              if (foreignMatch && normalize(foreignMatch.pais) !== countryIdVal) return
          }

          // Usa a chave normalizada do clube encontrado para mergear com dados de liga
          const effectiveNorm = bestClub ? normalize(bestClub.nome) : pNorm
          const displayName = bestClub ? bestClub.nome : p.nome
          
          if (!data[effectiveNorm]) {
            data[effectiveNorm] = {}
            clubNameMap[effectiveNorm] = displayName
          }
          if (!data[effectiveNorm][year]) data[effectiveNorm][year] = {}
          if (!data[effectiveNorm][year][cupSlot.key] || rank < (data[effectiveNorm][year][cupSlot.key].rank || 999)) {
            data[effectiveNorm][year][cupSlot.key] = { rank, compName: season.competitionName, colocacao: p.colocacao }
          }
          // Só adiciona ao Set se for do país ou se for uma competição nacional confirmada
          if (isThisCup || countryClubsNamesNormalized.includes(effectiveNorm)) {
            clubsSet.add(effectiveNorm)
          }
          seasonsSet.add(year)
        })
      })
    }

    // NOVO: Coleta detalhada do Mundial (Top 4) - Fora do loop da tabela
    if (season.mundial) {
        const m = season.mundial;
        const normComp = normalize(season.competitionName);
        if (normComp.includes('mundial de clubes')) {
            const processMundialPos = (teamRaw, pRank) => {
                if (!teamRaw) return;
                const tNorm = normalize(teamRaw);
                if (countryClubsNamesNormalized.includes(tNorm)) {
                    if (!data[tNorm]) {
                        data[tNorm] = {};
                        const originalClub = CLUBS_DATA.find(c => normalize(c.nome) === tNorm);
                        clubNameMap[tNorm] = originalClub ? originalClub.nome : teamRaw;
                    }
                    if (!data[tNorm][year]) data[tNorm][year] = {};
                    data[tNorm][year]['intl_Mundial de Clubes'] = { 
                        rank: pRank, 
                        compName: 'Mundial de Clubes' 
                    };
                    clubsSet.add(tNorm);
                    seasonsSet.add(year);
                }
            };

            // Campeão (A partir do campo season.campeao que é preenchido pelo watcher do mundial)
            if (season.campeao) processMundialPos(season.campeao, 1);

            // Vice (Finalista perdedor)
            let vice = null;
            if (m.final && m.final.time1 && m.final.time2) {
                const p1 = Number(m.final.placar1) || 0;
                const p2 = Number(m.final.placar2) || 0;
                const pn1 = Number(m.final.pen1) || 0;
                const pn2 = Number(m.final.pen2) || 0;

                if (p1 > p2 || (p1 === p2 && pn1 > pn2)) vice = m.final.time2;
                else if (p2 > p1 || (p2 === p1 && pn2 > pn1)) vice = m.final.time1;
            }
            if (vice) processMundialPos(vice, 2);

            // 3º e 4º
            let terceiro = null, quarto = null;
            if (m.terceiro && m.terceiro.time1 && m.terceiro.time2) {
                const p1 = Number(m.terceiro.placar1) || 0;
                const p2 = Number(m.terceiro.placar2) || 0;
                const pn1 = Number(m.terceiro.pen1) || 0;
                const pn2 = Number(m.terceiro.pen2) || 0;

                if (p1 > p2 || (p1 === p2 && pn1 > pn2)) {
                    terceiro = m.terceiro.time1; quarto = m.terceiro.time2;
                } else if (p2 > p1 || (p2 === p1 && pn2 > pn1)) {
                    terceiro = m.terceiro.time2; quarto = m.terceiro.time1;
                }
            }
            if (terceiro) processMundialPos(terceiro, 3);
            if (quarto) processMundialPos(quarto, 4);
        }
    }
  })

  // Ordenação de temporadas
  const sortedSeasonsList = Array.from(seasonsSet).sort((a, b) => {
    const aVal = parseInt(a.toString().split('/')[0]) || 0
    const bVal = parseInt(b.toString().split('/')[0]) || 0
    return aVal - bVal
  })

  // Ordenação de clubes (Personalizada por Filtro ou mais registros)
  const sortedClubsList = Array.from(clubsSet).sort((a, b) => {
    // Ordenação por Temporada/Slot de Referência
    if (sortYear.value && sortSlot.value) {
      const resA = data[a]?.[sortYear.value]?.[sortSlot.value]?.rank || 999
      const resB = data[b]?.[sortYear.value]?.[sortSlot.value]?.rank || 999
      
      if (resA !== resB) return resA - resB
    }

    const countA = Object.keys(data[a]).length
    const countB = Object.keys(data[b]).length
    if (countB !== countA) return countB - countA
    return a.localeCompare(b)
  })

  return { data, seasons: sortedSeasonsList, clubs: sortedClubsList, names: clubNameMap }
})

// Atalhos reativos
const sortedSeasons = computed(() => processedMatrix.value.seasons)
const sortedClubs = computed(() => processedMatrix.value.clubs)
const matrixData = computed(() => processedMatrix.value.data)
const clubNames = computed(() => processedMatrix.value.names || {})

const forceReload = () => seasonStore.loadAll()

// HELPERS (Robustos)
const parseTable = (str) => {
    if (!str) return [];
    return str.split('\n').filter(l => l.trim()).map(line => {
        let cells = line.split('\t');
        if (cells.length === 1) cells = line.split(/\s{2,}/);
        
        let extra = '';

        // Tenta extrair nome se falhar regex padrão
        if (cells.length === 1) {
            const match = line.match(/^(\d+)?\.?\s*([^\d]+)(.*)$/)
            if (match) {
                 cells = [match[2].trim()]
                 extra = match[3]?.trim() || ''
            }
        }
        
        let teamName = cells[0]?.trim();
        // Se a primeira coluna for número, pega a segunda
        if (/^\d+$/.test(teamName) || /^\d+\.?$/.test(teamName)) {
            teamName = cells[1]?.trim();
            // Tenta pegar a terceira coluna como extra (status/colocação)
            if (cells[2]) extra = cells[2].trim();
        } else {
             // Se não tiver número no começo, a segunda coluna pode ser o extra
             if (cells[1]) extra = cells[1].trim();
        }

        return { time: teamName, extra };
    }).filter(x => x.time);
}

const getRankFromExtra = (extra) => {
    if (!extra) return 999;
    const e = extra.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (e === 'CAMPEAO' || e.includes('CAMPEA')) return 1;
    if (e === 'VICE' || e.includes('VICE-CAMPEA') || e.includes('FINALISTA')) return 2;
    if (e.includes('SEMIFINAL') || e === 'SEMI') return 4;
    if (e.includes('QUARTAS DE FINAL') || e.includes('QUARTA DE FINAL') || e === 'QUARTAS') return 8;
    if (e.includes('OITAVAS DE FINAL') || e.includes('OITAVA DE FINAL') || e === 'OITAVAS') return 16;
    if (e.includes('16 AVOS') || e === 'ELIMINADO 16') return 24;
    if (e.includes('GRUPOS') || e.includes('FASE DE GRUPOS')) return 32;
    if (e.includes('PRE-COPA') || e.includes('ELIMINADO PRE') || e.includes('PRE COPA')) return 64;
    if (e.includes('ELIM') || e.includes('ELIMINADO')) return 64;
    if (e.includes('PRE') || e.includes('PRE')) return 64;
    return 999;
}

const getCellExpertStyle = (club, season, slot) => {
  const result = matrixData.value[club]?.[season]?.[slot.key]
  if (!result) return ''

  const rank = result.rank
  const classes = []

  if (slot.type === 'league' && slot.meta) {
    const { promovidos, rebaixados, label } = slot.meta
    const isSerieA = slot.label === 'A'
    
    // CAMPEÃO (1º Lugar)
    if (rank === 1) {
      if (isSerieA) classes.push('expert-gold-bg', 'neon-border-gold')
      else if (result.isAccess) classes.push('expert-champion-access-bg', 'neon-border-gold')
      else classes.push('expert-green-bg', 'neon-border-gold')
    } 
    // VICE / ACESSO OU REBAIXAMENTO (DINÂMICO)
    else {
      if (rank === 2) {
        if (result.isAccess && !isSerieA) classes.push('expert-vice-access-bg', 'neon-border-silver')
        else classes.push('expert-silver-bg', 'neon-border-silver')
      } else if (result.isAccess) {
         classes.push('expert-green-bg')
      } 
      
      if (result.isRelegation && isRelegationCountry.value) {
         classes.push('expert-red-bg')
      }

      if (classes.length === 0) {
         classes.push('expert-neutral-bg')
      }
    }
  }

  if (slot.type === 'cup') {
    if (rank === 1) classes.push('expert-gold-bg', 'neon-border-gold')
    else if (rank === 2) classes.push('expert-silver-bg', 'neon-border-silver')
    else if (rank === 4) classes.push('expert-green-intl-grad')
    else if (rank === 8) classes.push('expert-cyan-intl-grad')
    else if (rank === 16) classes.push('expert-blue-intl-grad')
    else if (rank === 24) classes.push('expert-brown-intl-grad') // 16 AVOS (MARROM)
    else if (rank === 64) classes.push('expert-red-intl-grad')      // PRÉ-COPA
    else classes.push('expert-neutral-bg')
  }

  if (slot.type === 'intl') {
    if (rank === 1) classes.push('expert-gold-bg', 'neon-border-gold')
    else if (rank === 2) classes.push('expert-silver-bg', 'neon-border-silver')
    else if (rank === 3) classes.push('expert-bronze-intl-grad')
    else if (rank === 4) classes.push('expert-neutral-bg', 'opacity-75')
    else if (rank === 4) classes.push('expert-bronze-intl-grad', 'opacity-50') // Fallback visual
    else if (rank === 8) classes.push('expert-green-intl-grad')
    else if (rank === 16) classes.push('expert-cyan-intl-grad')
    else if (rank === 24) classes.push('expert-blue-intl-grad')
    else if (rank === 32) classes.push('expert-red-light-intl-grad')
    else if (rank === 64) classes.push('expert-red-intl-grad')
    else classes.push('expert-neutral-bg')
  }

  return classes.join(' ')
}

const getRank = (club, season, slot) => {
  const result = matrixData.value[club]?.[season]?.[slot.key]
  if (!result) return ''
  
  const rank = result.rank
  
  // Caso Especial: Campeão de Série Inferior (Acesso) -> Já tem troféu no híbrido
  if (slot.type === 'league' && rank === 1 && result.isAccess && slot.label !== 'A') {
    return '🏆 1º'
  }

  // Campeão de Série A ou qualquer outro título nacional que não seja acesso híbrido
  if (slot.type === 'league' && rank === 1) {
    return '🏆 1º'
  }

  // Caso Especial: Vice com Acesso
  if (slot.type === 'league' && rank === 2 && result.isAccess && slot.label !== 'A') {
    return '🥈 2º'
  }

  // Vice Geral
  if (slot.type === 'league' && rank === 2) {
    return '🥈 2º'
  }

  // Rebaixamento (Seta para baixo) - Apenas para países selecionados
  if (slot.type === 'league' && result.isRelegation && isRelegationCountry.value) {
    return '↓ ' + rank + 'º'
  }

  // COPA NACIONAL: Usar colocacao real ou rank mapeado
  if (slot.type === 'cup') {
    // Preferencialmente exibir o texto original da colocacao (Normalizado para curto)
    let coloc = result.colocacao || '';
    const n = coloc.toLowerCase();
    if (n.includes('campe')) return '🏆 CAMPEÃO';
    if (n.includes('vice')) return '🥈 VICE';
    if (n.includes('semi')) return 'SEMI';
    if (n.includes('quart')) return 'QUARTAS';
    if (n.includes('oitav')) return 'OITAVAS';
    if (n.includes('16')) return '16 AVOS';
    if (n.includes('grupos')) return 'GRUPOS';
    if (n.includes('pre') || n.includes('pré')) return 'PRÉ-COPA';
    
    if (rank === 1) return '🏆 CAMPEÃO'
    if (rank === 2) return '🥈 VICE'
    return result.colocacao || 'PART.'
  }

  if (slot.type === 'intl') {
    if (rank === 1) return '🏆 CAMPEÃO'
    if (rank === 2) return '🥈 VICE'
    if (rank === 3) return '🥉 3º LUGAR'
    if (rank === 4) return '4º LUGAR'
    if (rank === 4) return 'SEMIFINAL' // Compatibilidade com outras comps
    if (rank === 8) return 'QUARTAS'
    if (rank === 16) return 'OITAVAS'
    if (rank === 24) return '16 AVOS'
    if (rank === 32) return 'GRUPOS'
    if (rank === 64) return 'PRÉ-LIBERTA'
    return rank + 'º'
  }
  return rank + 'º'
}

const getCellBackground = (club, season, slot) => {
  return getCellExpertStyle(club, season, slot)
}

const isLastSlot = (slot) => {
  if (countrySlots.value.length === 0) return false
  return slot.key === countrySlots.value[countrySlots.value.length - 1].key
}

// Watcher para recarregar slots se o país mudar (Mover para o fim para evitar ReferenceError)
watch(() => route.params.id, () => {
  setupSlots()
}, { immediate: true })

onMounted(async () => {
    await seasonStore.loadAll()
    await careerStore.loadAll()
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
  background: linear-gradient(180deg, #4466aa 0%, #2f5597 100%); 
  color: #fff; 
  border-left: 1px solid rgba(255,255,255,0.2) !important;
}

.intl-header-logo { 
  height: 38px; 
  width: auto;
  object-fit: contain; 
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.intl-header-minor { 
  font-size: 0.45rem; 
  font-weight: 950; 
  margin-top: 3px; 
  letter-spacing: 0.5px;
  opacity: 0.8;
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
  height: 30px;
  max-height: 30px;
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

.expert-champion-access-bg {
  background: linear-gradient(135deg, #28a745 0%, #ffd700 100%) !important;
  color: #000 !important;
  font-weight: 950 !important;
}

.expert-vice-access-bg {
  background: linear-gradient(135deg, #28a745 0%, #c0c0c0 100%) !important;
  color: #000 !important;
  font-weight: 900 !important;
}

.expert-silver-bg { 
  background: linear-gradient(135deg, #a0a0a0 0%, #707070 100%) !important; 
  color: #ffffff !important; 
  font-weight: 800 !important;
}

.expert-green-bg { 
  background: #28a745 !important; 
  color: #fff !important; 
  border: 1px solid rgba(40, 167, 69, 0.3) !important;
}

.expert-red-bg { 
  background: #dc3545 !important; 
  color: #fff !important; 
  font-weight: 800 !important;
}

.expert-bronze-bg { 
  background: #ff8c00 !important; 
  color: #fff !important; 
  font-weight: 900 !important;
}

/* GRADIENTES PARA INTERNACIONAIS (DIFERENCIAÇÃO) - FONTE PRETA */
.expert-bronze-intl-grad { 
  background: linear-gradient(135deg, #ff8c00 0%, #cc7000 100%) !important; 
  color: #000 !important; 
  font-weight: 700 !important;
}

.expert-green-intl-grad { 
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%) !important; /* Emerald */
  color: #000 !important; 
  font-weight: 700 !important;
}

.expert-cyan-intl-grad { 
  background: linear-gradient(135deg, #00f2ff 0%, #00a8b3 100%) !important; 
  color: #000 !important; 
  font-weight: 700 !important;
}

.expert-blue-intl-grad { 
  background: linear-gradient(135deg, #0056b3 0%, #003366 100%) !important; 
  color: #fff !important; 
  font-weight: 700 !important;
}

.expert-brown-intl-grad { 
  background: linear-gradient(135deg, #8d6e63 0%, #4e342e 100%) !important; /* Marrom/Bronze */
  color: #fff !important; 
  font-weight: 700 !important;
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

.expert-red-intl-grad { 
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important; /* Carmesim */
  color: #fff !important; 
  font-weight: 700 !important;
}

.expert-cyan-bg { 
  background: #00f2ff !important; 
  color: #000 !important; 
  font-weight: 950 !important;
}

.expert-blue-bg { 
  background: #0056b3 !important; 
  color: #fff !important; 
  font-weight: 700 !important;
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

.neon-border-green {
  box-shadow: inset 0 0 10px #28a74588, 0 0 6px #28a74566 !important;
  border: 1.5px solid #28a745aa !important;
}

.club-row-xl:hover td {
  box-shadow: inset 0 0 0 999px rgba(255, 255, 255, 0.08) !important;
}

.club-row-xl:hover .club-info-cell {
  color: #00f2ff;
}

.mini-box { width: 14px; height: 14px; border-radius: 3px; }
.bg-gold-xl-leg { background: #ffd700; }
.bg-green-xl-leg { background: #28a745; }
.bg-red-xl-leg { background: #dc3545; }
.bg-blue-intl-xl-leg { background: #0096ff; }

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

/* FUNDO PARA DIFERENCIAR INTERNACIONAIS (PEDIDO USUÁRIO) */
.intl-column-bg {
  background-color: rgba(0, 150, 255, 0.05); /* Sem !important para não sobrepor cores de posição */
}

/* LARGURA EXPANDIDA PARA INTERNACIONAIS (PEDIDO USUÁRIO) */
.intl-slot-width {
  min-width: 110px !important;
  width: 110px !important;
  font-size: 0.38rem !important;
  line-height: 1 !important;
  letter-spacing: 0.6px !important;
  font-weight: 800 !important;
}

.intl-slot-width .cell-rank-text {
  font-weight: 950 !important;
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
/* === COPA NACIONAL NA MATRIZ === */
.bg-cup-header {
  background: linear-gradient(135deg, rgba(255, 140, 0, 0.15), rgba(255, 200, 0, 0.08)) !important;
  border-bottom: 2px solid rgba(255, 165, 0, 0.4) !important;
}

.intl-slot-width.cup-col {
  min-width: 110px !important;
  width: 110px !important;
  font-size: 0.38rem !important;
  line-height: 1 !important;
  letter-spacing: 0.6px !important;
  background-color: rgba(255, 140, 0, 0.04) !important;
  font-weight: 800 !important;
}

</style>
