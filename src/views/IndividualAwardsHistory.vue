<template>
  <div class="view-container animated-fade-in">
    <!-- Cabeçalho -->
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <div class="d-flex align-items-center gap-3">
        <h2 class="m-0"><i class="bi bi-trophy-fill me-2 text-warning"></i>PRÊMIOS INDIVIDUAIS</h2>
        <GameButton class="btn-sm" @click="openAwardModal()">
          <i class="bi bi-plus-circle me-1"></i> ADICIONAR PREMIAÇÃO
        </GameButton>
      </div>
      <LogoFREeFOOT />
    </div>

    <!-- Filtros / Busca (Opcional, seguindo padrão) -->
    <div class="px-2 mb-4">
      <GamePanel customClass="py-2 px-3">
        <div class="d-flex align-items-center gap-3">
          <div class="flex-grow-1">
             <input type="text" v-model="searchQuery" class="form-control game-input-sm" placeholder="Buscar por jogador, clube ou temporada...">
          </div>
          <div class="d-flex gap-2">
            <button v-for="type in awardTypes" :key="type" 
                    @click="toggleTypeFilter(type)"
                    :class="['btn btn-sm fw-bold', activeFilters.includes(type) ? 'btn-warning' : 'btn-outline-secondary']">
              {{ type }}
            </button>
          </div>
        </div>
      </GamePanel>
    </div>

    <!-- Lista em Accordion por Temporada -->
    <div class="px-2">
      <div v-if="groupedAwards.length === 0" class="text-center py-5">
        <i class="bi bi-journal-x display-1 opacity-10 mb-3"></i>
        <h4 class="opacity-50">NENHUM PRÊMIO REGISTRADO</h4>
      </div>

      <div v-else class="season-accordion">
        <div v-for="group in filteredGroupedAwards" :key="group.season" class="season-group mb-3">
          <div class="season-header-bar d-flex justify-content-between align-items-center p-3 cursor-pointer" 
               @click="toggleSeason(group.season)">
            <div class="d-flex align-items-center gap-3">
              <i :class="['bi', expandedSeasons.includes(group.season) ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
              <h4 class="m-0 fw-black text-warning ls-2 text-uppercase">{{ group.season }}</h4>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="badge bg-dark border border-secondary border-opacity-25 px-3 py-2 fw-black">
                {{ group.awards.length }} {{ group.awards.length === 1 ? 'PRÊMIO' : 'PRÊMIOS' }}
              </span>
            </div>
          </div>

          <div v-if="expandedSeasons.includes(group.season)" class="season-content animated-fade-in pb-3">
            <div class="row g-3 p-2">
              <div v-for="award in group.awards" :key="award.id" class="col-12">
                <GamePanel customClass="p-0 overflow-hidden award-card-premium">
                    <div class="award-linear-row d-flex align-items-center w-100 p-0">
                      <!-- 🏆 TROFÉU -->
                      <div class="cell-award cell-trophy">
                        <img :src="getTrophyUrl(award.tipo)" class="award-trophy-img" @error="handleTrophyError" @click="openPhotoZoom(getTrophyUrl(award.tipo))">
                      </div>

                      <!-- POSIÇÃO -->
                      <div class="cell-award cell-pos">
                        <span class="fw-black text-info text-uppercase" style="font-size: 1.5rem;">{{ award.posicao }}</span>
                      </div>

                      <!-- NOME DO JOGADOR E PRÊMIO -->
                      <div class="cell-award cell-player">
                        <div class="d-flex flex-column justify-content-center">
                          <span class="x-small fw-black text-warning text-uppercase mb-1 ls-1" style="font-size: 0.9rem;">{{ award.tipo }}</span>
                          <h4 class="m-0 fw-black text-uppercase text-truncate text-white" style="font-size: 2.5rem; letter-spacing: -1px; line-height: 1;">{{ award.nome }}</h4>
                        </div>
                      </div>

                      <!-- NACIONALIDADE (TEXTO À ESQUERDA, BANDEIRA À DIREITA) -->
                      <div class="cell-award cell-nation d-flex align-items-center justify-content-between gap-3">
                        <span class="fw-bold text-uppercase text-white" style="font-size: 1.5rem;">{{ award.nacionalidade }}</span>
                        <NationalFlag :countryName="award.nacionalidade" :size="78" class="rounded-circle shadow flex-shrink-0" />
                      </div>

                      <!-- CLUBE (TEXTO À ESQUERDA, ATIVOS À DIREITA) -->
                      <div class="cell-award cell-club d-flex align-items-center justify-content-between gap-3">
                        <span class="fw-black text-uppercase text-white" style="font-size: 1.5rem;">{{ award.clube }}</span>
                        <div class="d-flex align-items-center gap-2 flex-shrink-0">
                          <TeamShield :teamName="award.clube" :size="78" borderless />
                          <NationalFlag v-if="award.clube" :countryName="award.clube" :size="78" class="rounded-circle shadow" />
                        </div>
                      </div>

                      <!-- 📸 FOTOS (JOGADOR | VOTOS ou TÉCNICO ÚNICA) -->
                      <div class="cell-award cell-photos d-flex align-items-center gap-3">
                        <template v-if="award.tipo === 'Melhor do Mundo (Técnico)'">
                          <div class="award-thumb-linear-wide" @click="openPhotoZoom(award.fotoJogador)" title="Ver Detalhes">
                            <img v-if="award.fotoJogador" :src="getCachedLogo(award.fotoJogador)" class="img-fit">
                            <div v-else class="sc-photo-placeholder-mini"><i class="bi bi-person-badge"></i></div>
                          </div>
                        </template>
                        <template v-else>
                          <div class="award-thumb-linear" @click="openPhotoZoom(award.fotoJogador)" title="Ver Jogador">
                            <img v-if="award.fotoJogador" :src="getCachedLogo(award.fotoJogador)" class="img-fit">
                            <div v-else class="sc-photo-placeholder-mini"><i class="bi bi-person"></i></div>
                          </div>
                          <div class="award-thumb-linear" @click="openPhotoZoom(award.fotoVotos)" title="Ver Votos">
                            <img v-if="award.fotoVotos" :src="getCachedLogo(award.fotoVotos)" class="img-fit">
                            <div v-else class="sc-photo-placeholder-mini"><i class="bi bi-card-list"></i></div>
                          </div>
                        </template>
                      </div>

                      <!-- ✏️ 🗑️ AÇÕES -->
                      <div class="cell-award cell-actions d-flex gap-2">
                        <button class="btn btn-warning btn-sm rounded-circle p-2 action-btn-linear" @click.stop="editAward(award)" title="Editar" style="z-index: 50; position: relative;">
                          <i class="bi bi-pencil-fill" style="font-size: 1rem;"></i>
                        </button>
                        <button class="btn btn-danger btn-sm rounded-circle p-2 action-btn-linear" @click.stop="confirmDeleteAward(award.id)" title="Excluir" style="z-index: 50; position: relative;">
                          <i class="bi bi-trash-fill" style="font-size: 1rem;"></i>
                        </button>
                      </div>
                    </div>
                </GamePanel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar / Editar -->
    <div v-if="showAwardModal" class="game-modal-overlay animated-fade-in" @click.self="showAwardModal = false">
      <GamePanel class="modal-content-panel award-form-modal" :customClass="'neon-fifa'">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="m-0 text-warning">
            <i class="bi bi-award-fill me-2"></i>{{ isEditing ? 'EDITAR' : 'CADASTRAR' }} PRÊMIO
          </h3>
          <button class="btn-close btn-close-white" @click="showAwardModal = false"></button>
        </div>

        <form @submit.prevent="saveAwardData">
          <div class="row g-3">
            <!-- Temporada e Tipo -->
            <div class="col-md-6">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Temporada</label>
              <input type="text" v-model="form.season" class="form-control game-input" placeholder="Ex: 2024/2025" required>
            </div>
            <div class="col-md-6">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Tipo de Prêmio</label>
              <select v-model="form.tipo" class="form-select game-input" required>
                <option value="" disabled>Selecione o prêmio</option>
                <option v-for="t in awardTypesList" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <!-- Dados do Jogador -->
            <div class="col-md-9">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Nome do Jogador / Técnico</label>
              <input type="text" v-model="form.nome" class="form-control game-input" placeholder="Nome completo" required>
            </div>
            <div class="col-md-3">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Posição / Sigla</label>
              <input type="text" v-model="form.posicao" class="form-control game-input" placeholder="Ex: PTD, 1º" required>
            </div>

            <!-- Nacionalidade e Clube -->
            <div class="col-md-6">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Nacionalidade</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" v-model="form.nacionalidade" class="form-control game-input" placeholder="País" required>
                <NationalFlag v-if="form.nacionalidade" :countryName="form.nacionalidade" :size="30" />
              </div>
            </div>
            <div class="col-md-6">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Clube / Seleção</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" v-model="form.clube" class="form-control game-input" placeholder="Nome do Clube">
                <TeamShield v-if="form.clube" :teamName="form.clube" :size="30" />
              </div>
            </div>

            <!-- Upload de Imagens -->
            <div :class="form.tipo === 'Melhor do Mundo (Técnico)' ? 'col-md-12' : 'col-md-6'">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">
                {{ form.tipo === 'Melhor do Mundo (Técnico)' ? 'Foto do Prêmio / Card (Pasta/CTRL+V)' : 'Foto do Jogador (Pasta/CTRL+V)' }}
              </label>
              <div 
                class="image-upload-zone" 
                :class="{ 'wide-upload-zone': form.tipo === 'Melhor do Mundo (Técnico)' }"
                @paste="e => handlePaste(e, 'fotoJogador')" 
                @click="$refs.fileJogador.click()" 
                tabindex="0"
              >
                <template v-if="previews.fotoJogador">
                  <img :src="getCachedLogo(previews.fotoJogador)" class="preview-img-full">
                  <div class="change-overlay"><i class="bi bi-camera-fill"></i> ALTERAR</div>
                </template>
                <div v-else class="upload-placeholder">
                  <i class="bi bi-person-bounding-box fs-2 opacity-25"></i>
                  <span class="small opacity-50 mt-1">CLIQUE OU PASTE</span>
                </div>
                <input type="file" ref="fileJogador" class="d-none" accept="image/*" @change="e => handleFile(e, 'fotoJogador')">
              </div>
              <div class="x-small text-secondary mt-1 fw-bold italic opacity-50">Opcional</div>
            </div>

            <div class="col-md-6" v-if="form.tipo !== 'Melhor do Mundo (Técnico)'">
              <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Tela de Votos (Pasta/CTRL+V)</label>
               <div class="image-upload-zone" @paste="e => handlePaste(e, 'fotoVotos')" @click="$refs.fileVotos.click()" tabindex="0">
                <template v-if="previews.fotoVotos">
                  <img :src="getCachedLogo(previews.fotoVotos)" class="preview-img-full">
                  <div class="change-overlay"><i class="bi bi-camera-fill"></i> ALTERAR</div>
                </template>
                <div v-else class="upload-placeholder">
                  <i class="bi bi-list-check fs-2 opacity-25"></i>
                  <span class="small opacity-50 mt-1">CLIQUE OU PASTE</span>
                </div>
                <input type="file" ref="fileVotos" class="d-none" accept="image/*" @change="e => handleFile(e, 'fotoVotos')">
              </div>
              <div class="x-small text-secondary mt-1 fw-bold italic opacity-50">Opcional</div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary fw-bold px-4" @click="showAwardModal = false">CANCELAR</button>
            <button type="submit" class="btn btn-warning fw-black px-5 shadow-lg" :disabled="!isFormValid">
              {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO' }}
            </button>
          </div>
        </form>
      </GamePanel>
    </div>

    <!-- Zoom de Foto -->
    <div v-if="showPhotoZoom" class="photo-zoom-overlay" @click.self="showPhotoZoom = false">
      <div class="zoom-content-container">
        <button class="btn-close-zoom" @click="showPhotoZoom = false">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="getCachedLogo(zoomedPhotoUrl)" class="zoomed-image-full">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { awardsStore } from '../services/awards.store'
import { db } from '../services/db'
import { imageCacheService } from '../services/imageCache.service'
import GamePanel from '../components/GamePanel.vue'
import GameButton from '../components/GameButton.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'

const awardTypesList = [
  'Melhor do Mundo',
  'Melhor do Mundo (Técnico)',
  'Melhor da Europa',
  'Melhor da CONMEBOL (Rei da América)',
  'Melhor da CONCACAF'
]

const searchQuery = ref('')
const activeFilters = ref([])
const expandedSeasons = ref([])
const showAwardModal = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)
const showPhotoZoom = ref(false)
const zoomedPhotoUrl = ref('')
const cachedLogos = ref({})

const form = ref({
  season: '',
  tipo: '',
  nome: '',
  posicao: '',
  nacionalidade: '',
  clube: '',
  fotoJogador: '',
  fotoVotos: ''
})

const previews = ref({
  fotoJogador: '',
  fotoVotos: ''
})

onMounted(async () => {
  await awardsStore.loadAll()
  // Expandir a temporada mais recente por padrão
  const sorted = [...awardsStore.list].sort((a, b) => b.season.localeCompare(a.season))
  if (sorted.length > 0) {
    expandedSeasons.value = [sorted[0].season]
  }
  await loadImagesIntoCache()
})

const groupedAwards = computed(() => {
  const groups = {}
  awardsStore.list.forEach(a => {
    if (!groups[a.season]) groups[a.season] = []
    groups[a.season].push(a)
  })
  
  return Object.entries(groups)
    .map(([season, awards]) => ({
      season,
      awards: awards.sort((a, b) => {
        // Ordenar por tipo fixo para manter consistência
        const orderA = awardTypesList.indexOf(a.tipo)
        const orderB = awardTypesList.indexOf(b.tipo)
        return orderA - orderB
      })
    }))
    .sort((a, b) => b.season.localeCompare(a.season))
})

const filteredGroupedAwards = computed(() => {
  const q = searchQuery.value.toLowerCase()
  
  return groupedAwards.value.map(group => {
    const filtered = group.awards.filter(a => {
      const matchSearch = a.nome.toLowerCase().includes(q) || 
                          a.clube.toLowerCase().includes(q) || 
                          a.tipo.toLowerCase().includes(q) ||
                          a.season.toLowerCase().includes(q)
      
      const matchFilter = activeFilters.value.length === 0 || activeFilters.value.includes(a.tipo)
      
      return matchSearch && matchFilter
    })
    
    return { ...group, awards: filtered }
  }).filter(group => group.awards.length > 0)
})

const isFormValid = computed(() => {
  return form.value.season && form.value.tipo && form.value.nome
})

const getTrophyUrl = (type) => {
  if (!type) return ''
  
  // Casos especiais de mapeamento conforme os arquivos enviados
  if (type === 'Melhor do Mundo (Técnico)') {
     return '/assets/trofeus/individuais/melhor_tecnico_mundo.png'
  }
  if (type === 'Melhor da CONMEBOL (Rei da América)') {
     return '/assets/trofeus/individuais/melhor_da_america.png'
  }

  const filename = type.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '')
  
  return `/assets/trofeus/individuais/${filename}.png`
}

const handleTrophyError = (e) => {
  // Em vez de display none, vamos tentar recarregar ou mostrar um placeholder sutil
  // Se o erro persistir, escondemos
  if (e.target.src.includes('placeholder')) {
    e.target.style.display = 'none'
  } else {
    // e.target.src = '/src/assets/trofeus/individuais/default.png' // Se houvesse um padrão
  }
}

const toggleSeason = (season) => {
  const index = expandedSeasons.value.indexOf(season)
  if (index === -1) expandedSeasons.value.push(season)
  else expandedSeasons.value.splice(index, 1)
}

const toggleTypeFilter = (type) => {
  const index = activeFilters.value.indexOf(type)
  if (index === -1) activeFilters.value.push(type)
  else activeFilters.value.splice(index, 1)
}

const openAwardModal = (award = null) => {
  if (award) {
    isEditing.value = true
    currentEditId.value = award.id
    form.value = { ...award }
    previews.value = {
      fotoJogador: award.fotoJogador,
      fotoVotos: award.fotoVotos
    }
  } else {
    isEditing.value = false
    currentEditId.value = null
    form.value = {
      season: groupedAwards.value.length > 0 ? groupedAwards.value[0].season : '',
      tipo: '',
      nome: '',
      posicao: '',
      nacionalidade: '',
      clube: '',
      fotoJogador: '',
      fotoVotos: ''
    }
    previews.value = {
      fotoJogador: '',
      fotoVotos: ''
    }
  }
  showAwardModal.value = true
}

const editAward = (award) => {
  openAwardModal(award)
}

const confirmDeleteAward = async (id) => {
  if (confirm('Tem certeza que deseja excluir esta premiação?')) {
    await awardsStore.removeAward(id)
  }
}

const handlePaste = (event, field) => {
  const items = event.clipboardData.items
  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const blob = item.getAsFile()
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        previews.value[field] = base64
        form.value[field] = base64
      }
      reader.readAsDataURL(blob)
    }
  }
}

const handleFile = (event, field) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result
      previews.value[field] = base64
      form.value[field] = base64
    }
    reader.readAsDataURL(file)
  }
}

const saveAwardData = async () => {
  const dataToSave = { ...form.value }
  
  // Persistir imagens no storage se forem base64
  for (const field of ['fotoJogador', 'fotoVotos']) {
    if (dataToSave[field] && dataToSave[field].startsWith('data:')) {
      const imageId = `award_${field}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      await db.saveImage(imageId, dataToSave[field])
      cachedLogos.value[imageId] = dataToSave[field]
      dataToSave[field] = imageId
    }
  }

  if (isEditing.value) {
    await awardsStore.updateAward(currentEditId.value, dataToSave)
  } else {
    await awardsStore.addAward(dataToSave)
  }
  
  showAwardModal.value = false
}

const getCachedLogo = (url) => {
  if (!url) return null
  if (url.startsWith('data:')) return url
  return cachedLogos.value[url] || url
}

const openPhotoZoom = (url) => {
  if (!url) return
  zoomedPhotoUrl.value = url
  showPhotoZoom.value = true
}

// Carregar imagens do cache
const loadImagesIntoCache = async () => {
  for (const a of awardsStore.list) {
    for (const field of ['fotoJogador', 'fotoVotos']) {
      const url = a[field]
      if (url && !url.startsWith('http') && !url.startsWith('data:') && !cachedLogos.value[url]) {
        const b64 = await imageCacheService.getLogo(url)
        if (b64) cachedLogos.value[url] = b64
      }
    }
  }
}

</script>

<style scoped>
.season-header-bar {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s;
}

.season-header-bar:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 193, 7, 0.3);
}

.award-card-premium {
  background: linear-gradient(145deg, rgba(15, 42, 68, 0.4), rgba(10, 31, 51, 0.5)) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  transition: transform 0.2s, border-color 0.2s;
}

.award-card-premium {
  background: linear-gradient(90deg, rgba(15, 42, 68, 0.4), rgba(10, 31, 51, 0.5)) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  transition: all 0.2s ease;
}

.award-card-premium:hover {
  border-color: rgba(255, 193, 7, 0.3) !important;
  background-color: rgba(255, 255, 255, 0.05) !important;
  transform: scale(1.002);
}

.cell-award {
  padding: 1rem 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  height: 100%;
}

.cell-trophy {
  width: 100px;
  justify-content: center;
  flex-shrink: 0;
}

.cell-pos {
  width: 100px;
  justify-content: center;
  flex-shrink: 0;
}

.cell-player {
  width: 450px;
  padding-left: 2rem;
  padding-right: 2rem;
  justify-content: flex-start;
  flex-shrink: 0;
}

.cell-nation {
  width: 280px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  flex-shrink: 0;
}

.cell-club {
  width: 420px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  flex-shrink: 0;
}

.cell-photos {
  width: 200px; /* Largura fixa para alinhar divisores */
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  justify-content: center;
  flex-shrink: 0;
}

.cell-actions {
  flex: 1; /* Ocupa o restante e alinha à direita */
  border-right: none;
  justify-content: flex-end;
  padding-right: 2rem;
}

.award-trophy-img {
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.4));
  cursor: pointer;
  transition: transform 0.2s;
}

.award-trophy-img:hover {
  transform: scale(1.2);
}

.cell-type {
  display: none !important; /* Removido do linear por solicitação */
}

.cell-player h4 {
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.5px;
}

.award-thumb-linear {
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.award-thumb-linear-wide {
  width: 176px; /* 80 + 80 + 16 (gap) */
  height: 80px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.award-thumb-linear-wide:hover {
  border-color: var(--bs-warning);
  transform: scale(1.02);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
}

.wide-upload {
  height: 120px !important;
}

.img-fit {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sc-photo-placeholder-mini {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  opacity: 0.2;
}

.action-btn-linear {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.2s;
}

.action-btn-linear:hover {
  opacity: 1;
  transform: scale(1.1);
}

.image-upload-zone {
  width: 100%;
  height: 150px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.image-upload-zone:hover, .image-upload-zone:focus {
  border-color: var(--bs-warning);
  background: rgba(255, 193, 7, 0.05);
  outline: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.preview-img-full {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.change-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.image-upload-zone:hover .change-overlay {
  opacity: 1;
}

.award-form-modal {
  max-width: 800px !important;
}

.ls-1 { letter-spacing: 1px; }
.ls-2 { letter-spacing: 2px; }

/* Photo Zoom Styles */
.photo-zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.zoom-content-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.zoomed-image-full {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.btn-close-zoom {
  position: absolute;
  top: -40px;
  right: -40px;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .award-linear-row {
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
