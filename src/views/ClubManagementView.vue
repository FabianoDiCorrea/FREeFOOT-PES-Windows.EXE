<template>
  <div class="view-container animated-fade-in position-relative">
    <!-- OVERLAY DE SINCRONIZAÇÃO -->
    <div v-if="syncing" class="sync-overlay">
      <div class="sync-content text-center">
        <div class="spinner-border text-warning mb-3" style="width: 3rem; height: 3rem;"></div>
        <h3 class="fw-black text-uppercase ls-2">Sincronizando...</h3>
        <p class="text-secondary fw-bold">Por favor, aguarde. Lendo dados do Excel...</p>
      </div>
    </div>

    <!-- CABEÇALHO -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex gap-2">
        <button @click="handleBack" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>VOLTAR
        </button>
        <button @click="repairClubData" class="btn btn-info fw-black" title="Corrigir Erros de Importação (Escudo/Continente)">
          <i class="bi bi-wrench-adjustable me-2"></i>REPARAR DADOS
        </button>
      </div>
      <div class="text-center flex-grow-1">
        <h2 class="fw-black text-uppercase m-0 ls-2 text-warning">
          <i class="bi bi-shield-shaded me-2"></i>GESTÃO DE CLUBES
        </h2>
        <div class="small text-secondary fw-bold text-uppercase mt-1 opacity-75 d-flex align-items-center justify-content-center gap-2">
          Navegue por país ou use a busca global
          <span v-if="clubStore.needsExport" class="badge bg-danger pulse-red ms-2" title="Você adicionou times que ainda não estão no seu Excel. Exporte para atualizar!">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>ALTERAÇÕES PENDENTES
          </span>
          <span v-else class="badge bg-success opacity-50 ms-2">
            <i class="bi bi-check-circle-fill me-1"></i>SINCRONIZADO
          </span>
        </div>
      </div>
      <LogoFREeFOOT />
    </div>

    <!-- BREADCRUMB DE NAVEGAÇÃO -->
    <div class="mb-4 d-flex gap-2 align-items-center flex-wrap px-2" v-if="!searchQuery">
      <button @click="resetNavigation" class="breadcrumb-btn" :class="{ active: !selectedContinent }">
        MUNDO
      </button>
      <i class="bi bi-chevron-right opacity-25" v-if="selectedContinent"></i>
      <button v-if="selectedContinent" @click="selectedCountry = null" class="breadcrumb-btn" :class="{ active: selectedContinent && !selectedCountry }">
        {{ selectedContinent.continente }}
      </button>
      <i class="bi bi-chevron-right opacity-25" v-if="selectedCountry"></i>
      <button v-if="selectedCountry" class="breadcrumb-btn active">
        {{ selectedCountry.nome }}
      </button>
    </div>

    <div class="row g-4">
      <!-- COLUNA ESQUERDA: NAVEGAÇÃO / LISTA -->
      <div class="col-lg-7">
        <GamePanel customClass="h-100 d-flex flex-column" style="min-height: 70vh;">
          <div class="p-3 border-bottom border-secondary border-opacity-10">
            <div class="input-group">
              <span class="input-group-text bg-black border-secondary border-opacity-25 text-secondary">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control game-input" 
                placeholder="BUSCAR TIME NO MUNDO TODO..."
              />
              <button class="btn btn-warning fw-black" @click="createNewClub">
                <i class="bi bi-plus-lg me-1"></i> NOVO TIME
              </button>
              <button class="btn btn-outline-info fw-black" @click="exportClubsToExcel" title="Exportar para Excel (.xlsx)">
                <i class="bi bi-file-earmark-excel me-1"></i> EXPORTAR
              </button>
              <button class="btn btn-outline-info fw-black" @click="$refs.fileInput.click()" title="Importar do Excel (.xlsx ou .csv)">
                <i class="bi bi-file-earmark-arrow-up me-1"></i> IMPORTAR
              </button>
              <input type="file" ref="fileInput" @change="handleExcelImport" accept=".xlsx, .xls, .csv" class="d-none">
            </div>
          </div>

          <div class="flex-grow-1 overflow-auto custom-scrollbar p-3">
            
            <!-- RESULTADOS DA BUSCA (OVERRIDE) -->
            <div v-if="searchQuery" class="club-list-grid">
              <div 
                v-for="club in searchResults" 
                :key="club.id" 
                class="club-item-card"
                :class="{ 'active': selectedClub?.id === club.id }"
                @click="selectClub(club)"
              >
                <div class="d-flex align-items-center gap-3">
                  <TeamShield :teamName="club.nome" :size="40" :forceUrl="club.escudo_url" />
                  <div class="min-w-0">
                    <div class="fw-black text-uppercase truncate text-white mb-0" style="font-size: 0.85rem;">{{ club.nome }}</div>
                    <div class="d-flex align-items-center gap-1 opacity-50">
                      <NationalFlag :countryName="club.pais" :forceUrl="club.bandeira_url" :size="12" />
                      <span class="x-small fw-bold text-uppercase">{{ club.pais }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="searchResults.length === 0" class="text-center py-5 opacity-25 fw-black text-uppercase">
                 Nenhum time encontrado para "{{ searchQuery }}".
              </div>
            </div>

            <!-- NÍVEL 1: SELEÇÃO DE CONTINENTE -->
            <div v-else-if="!selectedContinent" class="continent-grid">
              <div v-for="cont in orderedContinents" :key="cont.continente" 
                   class="continent-card" @click="selectContinent(cont)">
                <img :src="cont.logo_continente" class="continent-logo mb-3">
                <h4 class="m-0 fw-black text-uppercase">{{ cont.continente }}</h4>
                <div class="small opacity-50 fw-bold">{{ cont.paises.length }} PAÍSES</div>
              </div>
            </div>

            <!-- NÍVEL 2: SELEÇÃO DE PAÍS -->
            <div v-else-if="!selectedCountry" class="country-grid">
               <div v-for="pais in selectedContinent.paises" :key="pais.nome" 
                    class="country-item-card" @click="selectCountry(pais)">
                 <div class="d-flex align-items-center gap-3">
                   <NationalFlag :countryName="pais.nome" :forceUrl="pais.bandeira" :size="40" />
                   <h5 class="m-0 fw-black text-uppercase">{{ pais.nome }}</h5>
                 </div>
               </div>
            </div>

            <!-- NÍVEL 3: LISTA DE TIMES DO PAÍS -->
            <div v-else>
              <div class="club-list-grid">
                <div 
                  v-for="club in visibleClubs" 
                  :key="club.id" 
                  class="club-item-card"
                  :class="{ 'active': selectedClub?.id === club.id }"
                  @click="selectClub(club)"
                >
                  <div class="d-flex align-items-center gap-3">
                    <TeamShield :teamName="club.nome" :size="44" :forceUrl="club.escudo_url" />
                    <div class="min-w-0">
                      <div class="fw-black text-uppercase truncate text-white mb-1">{{ club.nome }}</div>
                      <div class="d-flex align-items-center gap-2 opacity-50">
                        <span class="x-small fw-black text-uppercase">{{ club.continente }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botão Carregar Mais -->
              <div v-if="countryClubs.length > displayLimit" class="text-center mt-4">
                <button class="btn btn-outline-warning fw-black text-uppercase px-5" @click="displayLimit += 50">
                   <i class="bi bi-plus-circle me-2"></i>Carregar mais {{ countryClubs.length - displayLimit }} times
                </button>
              </div>

              <div v-if="countryClubs.length === 0" class="text-center py-5 opacity-25 fw-black text-uppercase">
                 Nenhum time registrado em {{ selectedCountry.nome }}.
              </div>
            </div>

          </div>
          
          <div class="p-3 border-top border-secondary border-opacity-10 bg-black bg-opacity-20">
            <div class="d-flex justify-content-between align-items-center small fw-bold text-secondary">
              <span v-if="searchQuery">BUSCA: {{ searchResults.length }} RESULTADOS</span>
              <span v-else-if="selectedCountry">TIMES EM {{ selectedCountry.nome.toUpperCase() }}: {{ countryClubs.length }}</span>
              <span v-else-if="selectedContinent">PAÍSES EM {{ selectedContinent.continente.toUpperCase() }}: {{ selectedContinent.paises.length }}</span>
              <span v-else>MUNDO: {{ ALL_COMPETITIONS_DATA.length }} CONTINENTES</span>
            </div>
          </div>
        </GamePanel>
      </div>

      <!-- COLUNA DIREITA: FORMULÁRIO DE EDIÇÃO -->
      <div class="col-lg-5">
        <GamePanel v-if="selectedClub" customClass="neon-warning h-100">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <h4 class="fw-black text-uppercase m-0">
              <i class="bi bi-pencil-square me-2"></i>{{ isNew ? 'CRIAR NOVO' : 'EDITAR' }} TIME
            </h4>
            <button v-if="!isNew" @click="deleteClub" class="btn btn-outline-danger btn-sm" title="Excluir Permanentemente">
              <i class="bi bi-trash"></i>
            </button>
          </div>

          <div class="scroll-form custom-scrollbar pe-2" style="max-height: 65vh; overflow-y: auto;">
            <div class="text-center mb-4 p-4 bg-black bg-opacity-40 rounded-4 border border-secondary border-opacity-10">
              <div class="mb-3 position-relative d-inline-block">
                <TeamShield :teamName="editForm.nome" :size="120" :forceUrl="editForm.escudo_url" />
              </div>
              <h3 class="fw-black text-uppercase mb-0">{{ editForm.nome || 'NOME DO TIME' }}</h3>
              <div class="d-flex justify-content-center align-items-center gap-3 mt-2">
                <div class="d-flex align-items-center gap-2 px-3 py-1 bg-white bg-opacity-5 rounded-pill border border-secondary border-opacity-10">
                  <NationalFlag :countryName="editForm.pais" :forceUrl="editForm.bandeira_url" :size="20" />
                  <span class="small fw-bold text-uppercase">{{ editForm.pais || 'PAÍS' }}</span>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">Nome do Clube</label>
              <input type="text" v-model="editForm.nome" class="form-control game-input" placeholder="Ex: Vasco da Gama">
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">URL do Escudo</label>
              <input type="text" v-model="editForm.escudo_url" class="form-control game-input" placeholder="https://...">
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label x-small fw-bold text-secondary text-uppercase">País</label>
                  <input type="text" v-model="editForm.pais" class="form-control game-input" placeholder="Ex: Brasil">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label x-small fw-bold text-secondary text-uppercase">Continente</label>
                  <select v-model="editForm.continente" class="form-select game-input">
                    <option value="AMÉRICA DO SUL">AMÉRICA DO SUL</option>
                    <option value="EUROPA">EUROPA</option>
                    <option value="AMÉRICA DO NORTE">AMÉRICA DO NORTE</option>
                    <option value="ÁFRICA">ÁFRICA</option>
                    <option value="ÁSIA">ÁSIA</option>
                    <option value="OCEANIA">OCEANIA</option>
                    <option value="FIFA">FIFA / MUNDIAL</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">URL da Bandeira</label>
              <input type="text" v-model="editForm.bandeira_url" class="form-control game-input" placeholder="https://...">
            </div>

            <div class="mb-3">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">ID PES (Opcional)</label>
              <input type="number" v-model="editForm.pesId" class="form-control game-input" placeholder="ID">
            </div>
            
            <div class="mb-3" v-if="!isNew">
              <label class="form-label x-small fw-bold text-secondary text-uppercase">ID do App (Referência: {{ editForm.id }})</label>
              <input type="text" :value="editForm.id" class="form-control game-input opacity-50" readonly>
            </div>
          </div>

          <div class="d-grid gap-2 mt-4 pt-4 border-top border-secondary border-opacity-10">
            <button class="btn btn-warning btn-lg fw-black text-uppercase" @click="saveClub" :disabled="!editForm.nome || saving">
              <i class="bi bi-save2 me-2" v-if="!saving"></i>
              <span v-else class="spinner-border spinner-border-sm me-2"></span>
              {{ isNew ? 'CRIAR TIME' : 'SALVAR ALTERAÇÕES' }}
            </button>
            <button @click="selectedClub = null" class="btn btn-link text-secondary text-decoration-none fw-bold x-small">
              CANCELAR
            </button>
          </div>
        </GamePanel>

        <GamePanel v-else customClass="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5">
           <i class="bi bi-shield-lock-fill display-1 mb-3 opacity-10"></i>
           <h4 class="text-secondary opacity-50 fw-black text-uppercase">Selecione um time para editar</h4>
           <div class="small text-secondary opacity-25 px-4 mt-2">Escolha um país e então o time, ou use a busca global para encontrar qualquer clube instantaneamente.</div>
        </GamePanel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { clubStore } from '../services/club.store'
import GamePanel from '../components/GamePanel.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { db } from '../services/db'
import * as XLSX from 'xlsx'

const searchQuery = ref('')
const selectedContinent = ref(null)
const selectedCountry = ref(null)
const selectedClub = ref(null)
const isNew = ref(false)
const saving = ref(false)
const syncing = ref(false)
const displayLimit = ref(50)

const editForm = ref({
  id: null,
  nome: '',
  pais: '',
  continente: 'AMÉRICA DO SUL',
  escudo_url: '',
  bandeira_url: '',
  federacao_logo: '',
  pesId: null
})

onMounted(async () => {
  await clubStore.init()
})

const orderedContinents = computed(() => {
  const order = ["América do Sul", "América do Norte", "Europa", "África", "Ásia", "Oceania"]
  return [...ALL_COMPETITIONS_DATA].sort((a, b) => {
    const idxA = order.indexOf(a.continente)
    const idxB = order.indexOf(b.continente)
    return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99)
  })
})

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase().trim()
  return clubStore.list.filter(c => 
    c.nome.toLowerCase().includes(q) || 
    c.pais.toLowerCase().includes(q)
  ).slice(0, 30)
})

const countryClubs = computed(() => {
  if (!selectedCountry.value) return []
  return clubStore.list.filter(c => 
    c.pais.toLowerCase() === selectedCountry.value.nome.toLowerCase()
  ).sort((a, b) => a.nome.localeCompare(b.nome))
})

const visibleClubs = computed(() => {
    return countryClubs.value.slice(0, displayLimit.value)
})

const selectContinent = (cont) => {
  selectedContinent.value = cont
  selectedCountry.value = null
  selectedClub.value = null
}

const selectCountry = (pais) => {
  selectedCountry.value = pais
  selectedClub.value = null
  displayLimit.value = 50 // Resetar limite ao mudar de país
}

const selectClub = (club) => {
  selectedClub.value = club
  isNew.value = false
  editForm.value = { ...club }
}

const resetNavigation = () => {
  selectedContinent.value = null
  selectedCountry.value = null
  selectedClub.value = null
  searchQuery.value = ''
}

const createNewClub = () => {
  isNew.value = true
  selectedClub.value = { id: 'new' }
  editForm.value = {
    id: null,
    nome: '',
    pais: selectedCountry.value ? selectedCountry.value.nome : '',
    continente: selectedContinent.value ? selectedContinent.value.continente.toUpperCase() : 'AMÉRICA DO SUL',
    escudo_url: '',
    bandeira_url: selectedCountry.value ? selectedCountry.value.bandeira : '',
    federacao_logo: '',
    pesId: null
  }
}

const saveClub = async () => {
  if (!editForm.value.nome) return
  saving.value = true
  try {
    await clubStore.saveClub(editForm.value)
    selectedClub.value = null
    isNew.value = false
  } catch (error) {
    alert('Erro ao salvar clube: ' + error.message)
  } finally {
    saving.value = false
  }
}

const deleteClub = async () => {
  if (!confirm(`Deseja realmente excluir o clube ${editForm.value.nome}?`)) return
  await clubStore.removeClub(editForm.value.id)
  selectedClub.value = null
}

const isCustom = (id) => {
  if (!id) return false
  return clubStore.customClubs.some(c => c.id.toString() === id.toString())
}

const exportClubsToExcel = () => {
  const headers = ['id', 'nome', 'pais', 'continente', 'escudo_url', 'bandeira_url', 'pesId']
  
  // Garantir que os dados exportados estejam sanitizados (limpeza final)
  const data = clubStore.list.map(c => ({
    id: c.id || '',
    nome: clubStore.sanitizeString(c.nome || ''),
    pais: clubStore.sanitizeString(c.pais || ''),
    continente: clubStore.sanitizeString(c.continente || ''),
    escudo_url: (c.escudo_url || '').trim(),
    bandeira_url: (c.bandeira_url || '').trim(),
    pesId: c.pesId || ''
  }))

  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clubes")
  
  // Gerar arquivo XLSX
  XLSX.writeFile(workbook, `FREEFOOT_CLUBS_${new Date().toISOString().slice(0,10)}.xlsx`)
  
  clubStore.markSynced()
}

const handleExcelImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  syncing.value = true
  const reader = new FileReader()
  
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // Perguntar se deseja Mesclar ou Substituir
      const isFullSync = confirm("Deseja fazer uma SINCRONIZAÇÃO COMPLETA?\n\nOK: Substituir tudo pelo Excel (O que não estiver no Excel será APAGADO).\nCANCELAR: Apenas adicionar/atualizar times (Merge).")
      
      if (isFullSync) {
          // No modo Full Sync, limpamos as customizações e a lista de exclusão antes de importar
          // Isso garante que o Excel seja a fonte única de verdade
          clubStore.customClubs = []
          clubStore.deletedClubIds = []
          await db.delete('custom_clubs')
          await db.delete('deleted_club_ids')
      }

      // Converter para JSON ignorando espaços vazios e garantindo cabeçalhos
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
      
      for (const row of jsonData) {
        // Mapeamento flexível de colunas (caso o usuário mude o nome da coluna ou a ordem)
        const clubData = {
          id: row.id || row.ID || null,
          nome: row.nome || row.Nome || row.NOME || '',
          pais: row.pais || row.Pais || row.PAÍS || row.PAIS || '',
          continente: row.continente || row.Continente || row.CONTINENTE || '',
          escudo_url: row.escudo_url || row.Escudo || '',
          bandeira_url: row.bandeira_url || row.Bandeira || '',
          pesId: row.pesId || row.PESID || null
        }

        if (clubData.nome && clubData.pais) {
           // Sanitização de nomes por precaução
           clubData.nome = clubStore.sanitizeString(clubData.nome)
           clubData.pais = clubStore.sanitizeString(clubData.pais)
           
           let pais = clubData.pais.trim()
           if (pais.toLowerCase() === 'bolivia') pais = 'Bolívia'
           if (pais.toLowerCase() === 'colombia') pais = 'Colômbia'
           if (pais.toLowerCase() === 'mexico') pais = 'México'
           
           let continente = (clubData.continente || '').trim().toUpperCase()
           if (continente.startsWith('AMERICA') || continente.startsWith('AMÉRICA')) {
              if (!continente.includes('SUL') && !continente.includes('NORTE')) {
                 continente = 'AMÉRICA DO SUL'
              }
           }

           const idVal = clubData.id && clubData.id !== 'null' && clubData.id !== '' ? clubData.id : null

           await clubStore.saveClub({
             ...clubData,
             id: idVal,
             pais: pais,
             continente: continente,
             pesId: clubData.pesId ? parseInt(clubData.pesId) : null
           })

           if (idVal) updatedCount++
           else importedCount++
        } else {
           errorCount++
        }
      }

      alert(`Sincronização via Excel concluída!\n${importedCount} novos times criados.\n${updatedCount} times atualizados.\n${errorCount > 0 ? errorCount + ' linhas ignoradas por dados incompletos.' : ''}`)
      await clubStore.markSynced()
    } catch (err) {
      console.error("Erro na importação Excel:", err)
      alert("Erro ao ler o arquivo Excel. Verifique se o arquivo está correto.")
    } finally {
      syncing.value = false
      event.target.value = ''
      await clubStore.init()
    }
  }
  reader.readAsArrayBuffer(file)
}

const repairClubData = async () => {
  if (!confirm('Esta ação irá reconstruir nomes de times e países que foram "quebrados" em várias colunas no Excel. Deseja iniciar o Reparo Profundo?')) return
  
  let fixedCount = 0
  const customClubs = await db.getAll('custom_clubs') || []
  const repairedClubs = []
  
  const continenteList = ['AMÉRICA DO SUL', 'EUROPA', 'AMÉRICA DO NORTE', 'ÁFRICA', 'ÁSIA', 'OCEANIA', 'FIFA', 'MUNDIAL']
  const paisesConhecidos = [...new Set(ALL_COMPETITIONS_DATA.flatMap(cont => cont.paises.map(p => p.nome.toUpperCase())))]
  
  customClubs.forEach(club => {
    let changed = false
    const c = { ...club }
    
    // 1. RECONSTRUÇÃO INTELIGENTE POR ÂNCORAS (Split Fix v5.8.0)
    // Se o nome foi quebrado pelo Excel, tentamos "pescar" o país e continente na linha toda
    const rawValues = [c.nome, c.pais, c.continente, c.escudo_url, c.bandeira_url]
      .filter(v => v && !v.toString().startsWith('http')) // Evita pegar URLs como parte do nome
      .map(v => (v || '').toString().trim())
    
    const fullLine = rawValues.join(' ').toUpperCase()
    
    // Âncora A: Continente
    const continentsUpper = continenteList.map(ct => ct.toUpperCase())
    let foundContinent = continentsUpper.find(ct => fullLine.includes(ct))
    
    // Âncora B: País (Busca o país mais longo que encaixa na linha)
    let foundCountry = paisesConhecidos
      .filter(p => fullLine.includes(p.toUpperCase()))
      .sort((a, b) => b.length - a.length)[0]

    if (foundContinent && foundCountry) {
      const rawLine = rawValues.join(' ')
      const countryIdx = rawLine.toUpperCase().indexOf(foundCountry.toUpperCase())
      
      const newName = clubStore.sanitizeString(rawLine.substring(0, countryIdx).trim())
      const newCountry = clubStore.sanitizeString(foundCountry)
      
      if (newName && (newName !== c.nome || newCountry !== c.pais)) {
        c.nome = newName
        c.pais = newCountry.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        c.continente = foundContinent
        changed = true
      }
    }
    
    // Sanitização de URLs de escudos (muitas vezes vêm com resíduos de aspas)
    if (c.escudo_url && (c.escudo_url.includes('"') || c.escudo_url.includes(' '))) {
      c.escudo_url = c.escudo_url.replace(/"/g, '').trim()
      changed = true
    }

    repairedClubs.push(c)
    if (changed) fixedCount++
  })
  
  // Deduplicação e Salvamento
  const finalUnique = []
  const seenKeys = new Set()
  repairedClubs.forEach(club => {
    const key = `${(club.nome || '').toLowerCase().trim()}|${(club.pais || '').toLowerCase().trim()}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      finalUnique.push(club)
    }
  })
  
  await db.save('custom_clubs', finalUnique)
  await clubStore.init() // Isso aplicará a sanitização final e reparo de IDs
  alert(`Reparação profunda v5.7.0 concluída! ${fixedCount} clubes reconstruídos e textos limpos.`)
}

// Funções de navegação auxiliares
const handleBack = () => {
    if (history.length > 1) {
        window.history.back()
    } else {
        location.href = '#/'
    }
}
</script>

<style scoped>
/* Grid de Continentes */
.continent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.continent-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.continent-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  border-color: var(--bs-warning);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.continent-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
}

/* Grid de Países */
.country-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.country-item-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.country-item-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.02);
  border-color: var(--bs-info);
}

/* Grid de Clubes */
.club-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.club-item-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.club-item-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
  border-color: var(--bs-warning);
}

.club-item-card.active {
  background: rgba(255, 193, 7, 0.1);
  border-color: var(--bs-warning);
}

/* Breadcrumb Estilo Universo */
.breadcrumb-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 150, 255, 0.2);
  color: #a0aec0;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  transition: all 0.2s;
}

.breadcrumb-btn.active {
  background: var(--bs-warning);
  color: #000;
  border-color: #fff;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ls-2 { letter-spacing: 2px; }

.game-input {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border-radius: 8px;
}

.neon-warning {
  border-color: rgba(255, 193, 7, 0.3) !important;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.1) !important;
}

.pulse-red {
  animation: pulse-red-anim 2s infinite;
  box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
}

@keyframes pulse-red-anim {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
}

.sync-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 12, 24, 0.9);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
}

.sync-content {
  color: white;
}
</style>
