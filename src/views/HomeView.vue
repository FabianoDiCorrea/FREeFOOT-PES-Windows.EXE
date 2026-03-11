<template>
  <div class="view-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">HOME</h2>
      <!-- Botão de Sincronização em Tempo Real -->
      <button @click="syncIMLPES" class="btn btn-warning fw-black px-4 py-2 shadow-lg d-flex align-items-center gap-2" :disabled="syncing">
        <i class="bi" :class="syncing ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'"></i>
        ATUALIZAR iMLPES
      </button>
    </div>

    <GamePanel>
      <div class="text-center p-5">
        <h1 class="display-4 mb-4">Bem-vindo ao <LogoFREeFOOT size="5.5rem" /></h1>
        <p class="lead">Federação de Resultado eFootball - O seu histórico definitivo do PES/eFootball.</p>
        
        <div v-if="syncStatus" class="alert alert-info py-2 px-4 d-inline-block x-small fw-bold text-uppercase mb-4 animate__animated animate__fadeIn">
          <i class="bi bi-info-circle me-2"></i>{{ syncStatus }}
        </div>

        <hr class="border-secondary my-4">
        <p>Utilize os menus superiores para navegar entre os módulos do sistema <LogoFREeFOOT />.</p>
        <p>Criado por DevDuo-DD2 - 2026</p>
      </div>
    </GamePanel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GamePanel from '../components/GamePanel.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import { seasonStore } from '../services/season.store'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { CLUBS_DATA } from '../data/clubs.data'

const syncing = ref(false)
const syncStatus = ref('')

const syncIMLPES = async () => {
  syncing.value = true
  syncStatus.value = 'Buscando dados do iMLPES...'
  
  try {
    const response = await fetch('/data/imlpes_sync.json?t=' + Date.now())
    if (!response.ok) throw new Error('Arquivo de sincronização não encontrado ou iMLPES não está rodando.')
    
    const data = await response.json()
    console.log('Dados iMLPES recebidos:', data)
    
    let count = 0
    let updated = 0
    
    if (data.allLeagues) {
      await seasonStore.loadAll()
      
      for (const league of data.allLeagues) {
        // Tentar por ID ou Nome (Fallback)
        const ffComp = findCompetitionByCID(league.CompetitionId) || findCompetitionByName(league.Name)
        
        if (ffComp && league.Entries && league.Entries.length >= 2) {
          console.log(`Sincronizando: ${ffComp.nome} (${league.Entries.length} times)`)
          const participantes = []
          const tableLines = [
            "Pos | Time | P | J | V | E | D | GP | GC | SG",
            "------------------------------------------------------------"
          ]

          // Processa todos os participantes da liga
          league.Entries.forEach((entry, idx) => {
            const club = CLUBS_DATA.find(c => c.pesId == entry.teamId || String(c.id) == String(entry.teamId))
            const teamName = club ? club.nome : `Time ${entry.teamId}`
            const pos = idx + 1
            const losses = entry.losses || 0

            // Adiciona ao array de participantes
            const fed = club ? getFederation(club.continente) : { nome: '' }
            participantes.push({
              clubeId: club ? club.id : entry.teamId,
              nome: teamName,
              escudo: club ? club.escudo_url : '',
              pais: club ? club.pais : '',
              federacao: fed.nome,
              colocacao: pos
            })

            tableLines.push(
              `${pos.toString().padStart(2, ' ')} | ${teamName.padEnd(20, ' ')} | ${entry.points.toString().padStart(3, ' ')} | ${entry.matchesPlayed.toString().padStart(2, ' ')} | ${entry.wins.toString().padStart(2, ' ')} | ${entry.draws.toString().padStart(2, ' ')} | ${losses.toString().padStart(2, ' ')} | ${entry.goalsFor.toString().padStart(2, ' ')} | ${entry.goalsAgainst.toString().padStart(2, ' ')} | ${entry.goalDifference.toString().padStart(3, ' ')}`
            )
          })

          const champ = participantes[0]
          const vice = participantes[1]
          const seasonYear = data.year + '/' + (data.year + 1)
          const targetCountry = ffComp.pais || getCompetitionCountry(ffComp.id) || 'Internacional'
          
          const existing = seasonStore.list.find(s => 
            s.ano === seasonYear && 
            s.competitionName === ffComp.nome && 
            s.pais === targetCountry
          )

          const seasonData = {
            ano: seasonYear,
            campeao: champ.nome,
            vice: vice ? vice.nome : '',
            competitionName: ffComp.nome,
            competitionId: ffComp.id,
            pais: targetCountry,
            tabela: tableLines.join('\n'),
            participantes: participantes,
            updatedAt: new Date().toISOString()
          }

          if (existing) {
            await seasonStore.updateSeason(existing.id, seasonData)
            updated++
          } else {
            await seasonStore.addSeason(seasonData)
            count++
          }
        } else {
            console.warn('Competição não mapeada ou vazia:', league.Name, league.CompetitionId)
        }
      }
    }
    
    syncStatus.value = `Sucesso! ${count} novas temporadas e ${updated} atualizações.`
    setTimeout(() => syncStatus.value = '', 5000)
    
  } catch (err) {
    console.error(err)
    syncStatus.value = 'Erro: ' + err.message
  } finally {
    syncing.value = false
  }
}

const getFederation = (continentName) => {
  if (!continentName) return { nome: '', logo: '' };
  return FEDERATIONS_DATA[continentName] || { nome: '', logo: '' }
}

const getCompetitionCountry = (compId) => {
  for (const continent of ALL_COMPETITIONS_DATA) {
    if (continent.paises) {
      for (const p of continent.paises) {
        if (p.competicoes.some(c => c.id === compId)) return p.nome
      }
    }
  }
  return null
}

const findCompetitionByCID = (cid) => {
  for (const continent of ALL_COMPETITIONS_DATA) {
    if (continent.paises) {
      for (const p of continent.paises) {
        const c = p.competicoes.find(item => item.pesId == cid || item.id == cid)
        if (c) return c
      }
    }
    if (continent.continentais) {
      const c = continent.continentais.find(item => item.pesId == cid || item.id == cid)
      if (c) return c
    }
  }
  return null
}
const findCompetitionByName = (name) => {
  if (!name) return null
  for (const continent of ALL_COMPETITIONS_DATA) {
    if (continent.paises) {
      for (const p of continent.paises) {
        const c = p.competicoes.find(item => item.nome.toLowerCase().trim() === name.toLowerCase().trim())
        if (c) return c
      }
    }
    if (continent.continentais) {
      const c = continent.continentais.find(item => item.nome.toLowerCase().trim() === name.toLowerCase().trim())
      if (c) return c
    }
  }
  return null
}
</script>

<style scoped>
.fw-black { font-weight: 900; }
.x-small { font-size: 0.7rem; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
