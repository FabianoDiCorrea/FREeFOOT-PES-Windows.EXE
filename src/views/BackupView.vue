<template>
  <div class="view-container">
    <h2 class="mb-4">BACKUP</h2>
    <div class="row g-4">
      <div class="col-md-4">
        <GamePanel>
          <div class="text-center p-4">
            <i class="bi bi-download fs-1 mb-3 text-secondary"></i>
            <h3>EXPORTAR BACKUP COMPLETO</h3>
            <p class="mb-4 opacity-75">Gere um arquivo JSON com todos os dados salvos e imagens.</p>
            <GameButton @click="handleExport" class="w-100">Exportar Agora</GameButton>
          </div>
        </GamePanel>
      </div>
      <div class="col-md-4">
        <GamePanel>
          <div class="text-center p-4">
            <i class="bi bi-upload fs-1 mb-3 text-warning"></i>
            <h3>RESTAURAR SAVE FILE</h3>
            <p class="mb-4 opacity-75">Restaure seu progresso de um backup salvo.</p>
            <input type="file" ref="jsonInput" @change="handleImport" class="d-none" accept=".json">
            <GameButton @click="$refs.jsonInput.click()" class="w-100">Importar Arquivo</GameButton>
          </div>
        </GamePanel>
      </div>
      <div class="col-md-4">
        <GamePanel>
          <div class="text-center p-4">
             <i class="bi bi-calendar-x fs-1 mb-3 text-warning"></i>
             <h3>LIMPAR TEMPORADAS</h3>
             <p class="mb-4 opacity-75">Apaga apenas as temporadas registradas e prêmios. Mantém os clubes e configs.</p>
             <GameButton @click="handleClearSeasons" class="w-100 btn-outline-warning">Limpar Histórico</GameButton>
          </div>
        </GamePanel>
      </div>

      <div class="col-md-4">
        <GamePanel>
          <div class="text-center p-4">
            <i class="bi bi-trash fs-1 mb-3 text-danger"></i>
            <h3>HARD RESET</h3>
            <p class="mb-4 opacity-75">Apaga **todos** os dados (incluindo clubes importados). Use com cautela!</p>
            <GameButton @click="handleClearAll" class="w-100 btn-danger">Zerar Sistema</GameButton>
          </div>
        </GamePanel>
      </div>

      <!-- INJETAR DADOS DE TESTE (MOCK) -->
      <div class="col-md-4">
        <GamePanel>
          <div class="text-center p-4">
            <i class="bi bi-magic fs-1 mb-3 text-info"></i>
            <h3>INJETAR DADOS TESTE</h3>
            <p class="mb-4 opacity-75">Adiciona temporadas falsas (ex: 2026 / 2027) para testar visuais da Matriz e Checklist.</p>
            <GameButton @click="handleInjectMock" class="w-100 btn-info text-dark">Injetar Mock Data</GameButton>
          </div>
        </GamePanel>
      </div>

      <!-- SEÇÃO NUVEM (CLOUD SYNC) -->
      <div class="col-12 mt-2">
        <GamePanel customClass="border-info border-opacity-50 shadow-lg">
          <div class="row align-items-center p-4">
            <div class="col-md-2 text-center">
              <i class="bi bi-github fs-1 text-white mb-2 d-block"></i>
              <div class="badge bg-info text-dark fw-bold">NOVIDADE</div>
            </div>
            <div class="col-md-6">
              <h3 class="text-info fw-black mt-0"><i class="bi bi-cloud-check-fill me-2"></i>SINCRONIZAÇÃO EM NUVEM (GITHUB)</h3>
              <p class="opacity-75 m-0 mb-3">Mantenha seus dados sincronizados entre Trabalho e Casa sem precisar de arquivos JSON manuais.</p>
              
              <div v-if="!githubToken" class="alert alert-dark border-secondary p-2 small mb-0">
                <i class="bi bi-info-circle me-2"></i> Para começar, crie um <b>Personal Access Token (Repo)</b> no seu GitHub e cole abaixo.
                <a href="https://github.com/settings/tokens/new?description=FreeFootSync&scopes=repo" target="_blank" class="text-info ms-2">Criar Token Agora <i class="bi bi-box-arrow-up-right"></i></a>
              </div>
              <div v-else class="d-flex align-items-center gap-3">
                 <div class="badge bg-success"><i class="bi bi-shield-lock-fill"></i> TOKEN CONFIGURADO</div>
                 <div v-if="ghUser" class="d-flex align-items-center gap-2 small text-secondary">
                    <img :src="ghUser.avatar_url" class="rounded-circle" width="20" height="20">
                    <span>{{ ghUser.login }}</span>
                 </div>
                 <button class="btn btn-link btn-sm text-secondary p-0 m-0" @click="logoutGithub">Alterar Conta</button>
              </div>
            </div>
            <div class="col-md-4">
              <div v-if="!githubToken">
                <input v-model="tempToken" type="password" class="form-control bg-black text-white border-info mb-2" placeholder="Cole seu Personal Access Token aqui...">
                <GameButton @click="saveToken(tempToken)" class="w-100 btn-info text-dark fw-bold">CONFIGURAR NUVEM</GameButton>
              </div>
              <div v-else class="d-flex flex-column gap-2">
                <GameButton @click="handleCloudUpload" :loading="isSyncing" class="btn-info text-dark fw-bold">
                  <i class="bi bi-cloud-arrow-up-fill me-2"></i> ENVIAR PARA NUVEM (UPLOAD)
                </GameButton>
                <GameButton @click="handleCloudDownload" :loading="isSyncing" class="btn-outline-info fw-bold">
                  <i class="bi bi-cloud-arrow-down-fill me-2"></i> PUXAR DA NUVEM (DOWNLOAD)
                </GameButton>
              </div>
            </div>
          </div>
          
          <div v-if="syncStatus" class="px-4 pb-1">
             <div :class="['alert py-2 px-3 m-0 small fw-bold d-flex align-items-center justify-content-between', syncStatus.type === 'error' ? 'alert-danger' : 'alert-success']">
                <span><i :class="syncStatus.type === 'error' ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill'" class="me-2"></i>{{ syncStatus.message }}</span>
                <span class="x-mini opacity-50">{{ syncStatus.time }}</span>
             </div>
          </div>
          <div class="px-4 pb-3 d-flex justify-content-between align-items-center">
             <div class="x-mini opacity-25 text-uppercase ls-1">Status: {{ githubToken ? 'Conectado' : 'Não Configurado' }}</div>
             <div v-if="dbSize" class="x-mini opacity-50">
                Imagens: <span class="text-white fw-bold me-2">{{ imgCount }}</span>
                Tamanho: <span class="text-info fw-bold">{{ dbSize }} MB</span>
             </div>
          </div>
        </GamePanel>
      </div>

      <!-- NOVA SEÇÃO: IMPORTAR BASE DO PES -->
      <div class="col-12 mt-4">
        <GamePanel>
          <div class="row align-items-center p-4">
            <div class="col-md-2 text-center">
              <i class="bi bi-file-earmark-excel fs-1 text-success"></i>
            </div>
            <div class="col-md-6">
              <h3>IMPORTAR BASE DO PES</h3>
              <p class="opacity-75 m-0">Converta sua planilha de clubes e seleções para o formato do sistema.</p>
              <small class="text-secondary opacity-50">Colunas: TIME, LINK ESCUDO, LINK BANDEIRA NACIONAL, CONTINENTE, PAÍS, LOGO CONTINENTE, FEDERAÇÃO</small>
            </div>
            <div class="col-md-4">
              <input type="file" ref="xlsxInput" @change="handlePESImport" class="d-none" accept=".xlsx, .xls">
              <GameButton @click="$refs.xlsxInput.click()" class="w-100">Selecionar Planilha Excel</GameButton>
            </div>
          </div>

          <!-- Preview/Log da Importação -->
          <div v-if="importLog" class="mt-3 p-3 bg-dark rounded border border-secondary border-opacity-25 small">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold text-secondary">LOG DE IMPORTAÇÃO:</span>
              <button class="btn btn-sm btn-outline-secondary py-0 border-0" @click="importLog = ''">Limpar</button>
            </div>
            <pre class="m-0 text-white-50" style="max-height: 150px; overflow-y: auto; font-family: monospace;">{{ importLog }}</pre>
            <div class="mt-3 d-flex gap-2">
              <GameButton v-if="clubsGenerated" @click="downloadFile('clubs.data.js', clubsGenerated)" class="btn-sm">Baixar clubs.data.js</GameButton>
              <GameButton v-if="nationalsGenerated" @click="downloadFile('nationalTeams.data.js', nationalsGenerated)" class="btn-sm">Baixar nationalTeams.data.js</GameButton>
            </div>
          </div>
        </GamePanel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GamePanel from '../components/GamePanel.vue'
import GameButton from '../components/GameButton.vue'
import { db } from '../services/db'
import * as XLSX from 'xlsx'
import { cloudSyncService } from '../services/cloudSync.service'

const githubToken = ref(localStorage.getItem('ff_github_token') || '')
const tempToken = ref('')
const isSyncing = ref(false)
const syncStatus = ref(null)
const dbSize = ref(null)
const imgCount = ref(0)
const ghUser = ref(null)

const calculateDbSize = async () => {
  console.log('Iniciando cálculo do tamanho do DB...')
  try {
    const data = await db.exportDatabase()
    const size = JSON.stringify(data).length
    dbSize.value = (size / (1024 * 1024)).toFixed(2)
    imgCount.value = Object.keys(data.images || {}).length
    console.log('Tamanho calculado:', dbSize.value, 'MB', 'Imagens:', imgCount.value)
  } catch (e) {
    console.error('Erro ao calcular tamanho do DB:', e)
  }
}

const loadGithubUser = async () => {
  if (!githubToken.value) return
  try {
    ghUser.value = await cloudSyncService.authenticate(githubToken.value)
  } catch (e) {
    ghUser.value = null
  }
}

const saveToken = async (token = '') => {
  if (token) githubToken.value = token
  localStorage.setItem('ff_github_token', githubToken.value)
  tempToken.value = ''
  await loadGithubUser()
}

const logoutGithub = () => {
  githubToken.value = ''
  localStorage.removeItem('ff_github_token')
  ghUser.value = null
}

loadGithubUser()

const handleCloudUpload = async () => {
  if (!confirm('Deseja enviar seu banco de dados atual para a nuvem? Isso substituirá o backup anterior no seu GitHub.')) return
  
  isSyncing.value = true
  syncStatus.value = null
  try {
    const res = await cloudSyncService.uploadData(githubToken.value)
    syncStatus.value = {
      type: 'success',
      message: 'Dados enviados para a nuvem com sucesso!',
      time: new Date().toLocaleTimeString()
    }
  } catch (err) {
    syncStatus.value = {
      type: 'error',
      message: 'Falha no Upload: ' + err.message,
      time: new Date().toLocaleTimeString()
    }
  } finally {
    isSyncing.value = false
  }
}

const handleCloudDownload = async () => {
  if (!confirm('ATENÇÃO: Isso BAIXARÁ os dados da nuvem e substituirá tudo o que você tem NESTA máquina agora. Continuar?')) return
  
  isSyncing.value = true
  syncStatus.value = null
  try {
    await cloudSyncService.downloadData(githubToken.value)
    syncStatus.value = {
      type: 'success',
      message: 'Dados baixados e restaurados! Recarregando sistema...',
      time: new Date().toLocaleTimeString()
    }
    setTimeout(() => window.location.reload(), 2000)
  } catch (err) {
    syncStatus.value = {
      type: 'error',
      message: 'Falha no Download: ' + err.message,
      time: new Date().toLocaleTimeString()
    }
    isSyncing.value = false
  }
}

const jsonInput = ref(null)
const xlsxInput = ref(null)
const importLog = ref('')
const clubsGenerated = ref('')
const nationalsGenerated = ref('')

onMounted(() => {
  calculateDbSize()
})

const handlePESImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Converte para array de arrays para procurar o cabeçalho manualmente
      const rowsRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      let headerIndex = -1
      let headers = []

      // Procura a linha que contém "TIME"
      for (let i = 0; i < rowsRaw.length; i++) {
        if (rowsRaw[i].includes('TIME')) {
          headerIndex = i
          headers = rowsRaw[i]
          break
        }
      }

      if (headerIndex === -1) {
        importLog.value += `❌ Erro: Coluna 'TIME' não encontrada em nenhuma linha.\n`
        return
      }

      importLog.value = `[${new Date().toLocaleTimeString()}] Lendo ${file.name}...\n`
      importLog.value += `Cabeçalho encontrado na linha ${headerIndex + 1}.\n`

      // Processa as linhas a partir do cabeçalho
      const clubs = []
      const nationals = []
      let processedCount = 0

      for (let i = headerIndex + 1; i < rowsRaw.length; i++) {
        const row = rowsRaw[i]
        const rowData = {}
        
        // Mapeia os valores da linha baseado nos nomes das colunas detectadas
        headers.forEach((h, idx) => {
          if (h) rowData[h] = row[idx]
        })

        if (!rowData['TIME'] || rowData['TIME'].toString().trim() === '') continue

        processedCount++

        const item = {
          id: processedCount,
          nome: rowData['TIME'] || '',
          pais: rowData['PAÍS'] || '',
          continente: rowData['CONTINENTE'] || '',
          escudo_url: rowData['LINK ESCUDO'] || '',
          bandeira_url: rowData['LINK BANDEIRA NACIONAL'] || '',
          logo_continente: rowData['LOGO CONTINENTE'] || '',
          federacao_logo: rowData['FEDERAÇÃO'] || rowData['LINK FEDERAÇÃO'] || rowData['FEDERACAO'] || ''
        }

        // Tentar identificar se é seleção
        if (item.nome.toUpperCase().includes('SELEÇÃO') || 
            item.continente.toUpperCase().includes('SELEÇÕES') ||
            !item.pais || item.federacao_logo) { /* Se tem federação logo, é forte indicio */
          nationals.push(item)
        } else {
          clubs.push(item)
        }
      }

      clubsGenerated.value = `export const CLUBS_DATA = ${JSON.stringify(clubs, null, 2)};`
      nationalsGenerated.value = `export const NATIONAL_TEAMS_DATA = ${JSON.stringify(nationals, null, 2)};`

      importLog.value += `Total processado: ${processedCount} linhas.\n`
      importLog.value += `✓ ${clubs.length} Clubes identificados.\n`
      importLog.value += `✓ ${nationals.length} Seleções identificadas.\n`
      importLog.value += `Clique nos botões abaixo para baixar os arquivos e salve-os na pasta /src/data do projeto.\n`

    } catch (err) {
      importLog.value += `❌ Erro ao processar: ${err.message}\n`
    }
  }
  reader.readAsArrayBuffer(file)
}

const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  importLog.value += `✓ Arquivo ${filename} baixado.\n`
}

const handleExport = async () => {
  const json = await db.exportData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `FREeFOOT_Backup_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!confirm('Deseja realmente importar este backup? Os dados atuais serão substituídos.')) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const success = await db.importData(e.target.result)
      if (success) {
        alert('Backup importado com sucesso! Reiniciando...')
        window.location.reload()
      } else {
        alert('Erro ao importar. Verifique o arquivo.')
      }
    } catch (err) {
      alert('Erro ao processar arquivo JSON: ' + err.message)
    }
  }
  reader.readAsText(file)
}

const handleClearSeasons = async () => {
  if (!confirm('Deseja realmente apagar TODAS as temporadas, prêmios e rankings? Isso limpará o checklist para você recomeçar seu ciclo.')) return
  
  try {
    const keysToWipe = ['temporadas', 'individual_awards', 'rankings', 'carreiras']
    for (const key of keysToWipe) {
      await db.save(key, [])
    }
    alert('Histórico de carreira zerado! Reiniciando...')
    window.location.reload()
  } catch (e) {
    alert('Erro ao limpar dados: ' + e.message)
  }
}

const handleClearAll = async () => {
  if (!confirm('ATENÇÃO: Isso apagará TODOS os seus dados e imagens definitivamente. Você tem absoluta certeza?')) return
  if (!confirm('ÚLTIMO AVISO: Não há volta sem um backup previo. Confirmar reset total?')) return

  const success = await db.clearDatabase()
  if (success) {
    alert('Sistema zerado com sucesso! Reiniciando...')
    window.location.reload()
  } else {
    alert('Erro ao limpar banco de dados.')
  }
}

const handleInjectMock = async () => {
  if (!confirm('Isso vai adicionar temporadas (ex: Brasileirão 2026/2027 e 2027/2028, Libertadores, etc) para testes. Deseja continuar?')) return;
  
  try {
    const mockSeasons = [
      {
        id: Date.now() + 1,
        ano: "2026 / 2027 = 2027",
        competitionName: "Brasileirão Série A",
        pais: "Brasil",
        campeao: "Flamengo",
        tabela: "1.\tFlamengo\n2.\tPalmeiras\n3.\tAtlético Mineiro\n4.\tSão Paulo\n17.\tVasco da Gama\n18.\tCorinthians",
        participantes: []
      },
      {
        id: Date.now() + 2,
        ano: "2027 / 2028 = 2028",
        competitionName: "Brasileirão Série A",
        pais: "Brasil",
        campeao: "Palmeiras",
        tabela: "1.\tPalmeiras\n2.\tFlamengo\n3.\tBotafogo\n4.\tInternacional\n17.\tCruzeiro\n18.\tBahia",
        participantes: []
      },
      {
        id: Date.now() + 3,
        ano: "2026 / 2027 = 2027",
        competitionName: "Copa Libertadores",
        pais: "América do Sul",
        campeao: "River Plate",
        tabela: "1.\tRiver Plate\n2.\tFlamengo\n3.\tBoca Juniors\n4.\tPalmeiras\n32.\tColo-Colo",
        participantes: []
      },
      {
        id: Date.now() + 4,
        ano: "2026 / 2027 = 2027",
        competitionName: "Copa do Brasil",
        pais: "Brasil",
        campeao: "São Paulo",
        tabela: "",
        participantes: [
          { nome: "São Paulo", colocacao: "Campeão" },
          { nome: "Flamengo", colocacao: "Vice" },
          { nome: "Palmeiras", colocacao: "Semifinal" },
          { nome: "Grêmio", colocacao: "Semifinal" }
        ]
      },
      {
        id: Date.now() + 5,
        ano: "2026 / 2027 = 2027",
        competitionName: "Liga Profissional",
        pais: "Argentina",
        campeao: "River Plate",
        tabela: "1.\tRiver Plate\n2.\tBoca Juniors\n3.\tRacing\n4.\tIndependiente",
        participantes: []
      },
      {
        id: Date.now() + 6,
        ano: "2026 / 2027 = 2027",
        competitionName: "Premier League",
        pais: "Inglaterra",
        campeao: "Arsenal",
        tabela: "1.\tArsenal\n2.\tManchester City\n3.\tLiverpool\n4.\tChelsea\n18.\tEverton",
        participantes: []
      },
      {
        id: Date.now() + 7,
        ano: "2026 / 2027 = 2027",
        competitionName: "UEFA Champions League",
        pais: "Europa",
        campeao: "Real Madrid",
        tabela: "1.\tReal Madrid\n2.\tManchester City\n3.\tBayern Munich\n4.\tArsenal",
        participantes: []
      }
    ];

    const currentSeasons = await db.get('temporadas') || [];
    await db.save('temporadas', [...currentSeasons, ...mockSeasons]);

    // Mock Awards
    const mockAwards = [
      { id: Date.now() + 10, season: "2026 / 2027 = 2027", tipo: "Melhor do Mundo", title: "Melhor do Mundo", nome: "Vini Jr" },
      { id: Date.now() + 11, season: "2026 / 2027 = 2027", tipo: "Rei da América", title: "Rei da América", nome: "De La Cruz" },
    ]
    const currentAwards = await db.get('individual_awards') || [];
    await db.save('individual_awards', [...currentAwards, ...mockAwards]);

    alert('Mock Data injetada com sucesso! Navegue pelas telas para ver os resultados.');
  } catch(e) {
    alert('Erro ao injetar mock data: ' + e.message);
  }
}
</script>
