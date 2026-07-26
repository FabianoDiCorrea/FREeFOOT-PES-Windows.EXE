<template>
  <div class="view-container animated-fade-in position-relative">

    <!-- CABEÇALHO COM BANNER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex gap-2">
        <button @click="handleBack" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>VOLTAR
        </button>
      </div>
      <div class="text-center flex-grow-1">
        <!-- Banner personalizado do usuário -->
        <img
          src="/logos/competitions/banner_nacionalidades.png"
          class="nationality-banner"
          alt="Nacionalidades dos Jogadores"
          @error="showFallbackTitle = true"
        >
        <h2 v-if="showFallbackTitle" class="fw-black text-uppercase m-0 ls-2 text-info">
          <i class="bi bi-globe2 me-2"></i>NACIONALIDADES E SELEÇÕES
        </h2>
        <div class="small text-secondary fw-bold text-uppercase mt-2 opacity-75">
          Cadastre novas seleções e bandeiras que não existem nativamente no sistema
        </div>
      </div>
      <LogoFREeFOOT />
    </div>

    <!-- BARRA DE AÇÕES: BUSCA + ADICIONAR -->
    <div class="mb-4">
      <div class="input-group nationality-search-bar">
        <span class="input-group-text bg-black border-secondary border-opacity-25 text-secondary">
          <i class="bi bi-search"></i>
        </span>
        <input
          type="text"
          v-model="searchQuery"
          class="form-control game-input"
          placeholder="BUSCAR PAÍS / NACIONALIDADE..."
        />
        <button class="btn btn-info fw-black" @click="openAddModal">
          <i class="bi bi-plus-lg me-1"></i> ADICIONAR PAÍS
        </button>
      </div>
    </div>

    <!-- CONTADOR -->
    <div class="d-flex align-items-center gap-3 mb-4 px-1">
      <span class="badge-counter">
        <i class="bi bi-flag-fill me-2 text-info"></i>
        {{ filteredNationalities.length }} PAÍSES REGISTRADOS
      </span>
      <span v-if="searchQuery" class="x-small text-secondary opacity-75 fw-bold">
        filtrado de {{ nationalities.length }} total
      </span>
    </div>

    <!-- GRID DE BANDEIRAS (igual ao continent-card da gestão de clubes) -->
    <div v-if="filteredNationalities.length > 0" class="nationality-grid">
      <div
        v-for="nat in filteredNationalities"
        :key="nat.id"
        class="nationality-card"
        :class="{ 'selected': selectedNat?.id === nat.id }"
        @click="selectNat(nat)"
      >
        <!-- Botão de editar (aparece no hover) -->
        <button
          class="btn-edit-nat"
          @click.stop="editNationality(nat)"
          title="Editar país"
        >
          <i class="bi bi-pencil-fill"></i>
        </button>

        <!-- Botão de remover (aparece no hover) -->
        <button
          class="btn-remove-nat"
          @click.stop="removeNationality(nat)"
          title="Remover país"
        >
          <i class="bi bi-x-lg"></i>
        </button>

        <!-- Bandeira grande -->
        <div class="nat-flag-wrapper mb-3">
          <NationalFlag
            :countryName="nat.nome"
            :forceUrl="nat.bandeira_url || ''"
            :size="80"
          />
        </div>

        <!-- Nome do país -->
        <h5 class="m-0 fw-black text-uppercase nat-name">{{ nat.nome }}</h5>

        <!-- Nota opcional -->
        <div v-if="nat.nota" class="nat-nota mt-1">{{ nat.nota }}</div>
      </div>
    </div>

    <!-- ESTADO VAZIO -->
    <div v-else-if="!searchQuery" class="empty-state text-center py-5">
      <i class="bi bi-flag display-1 opacity-10 d-block mb-4"></i>
      <h4 class="fw-black text-uppercase opacity-25">Nenhum país registrado</h4>
      <p class="text-secondary opacity-50 small">
        Clique em "ADICIONAR PAÍS" para registrar as nacionalidades dos seus jogadores.
      </p>
    </div>
    <div v-else class="empty-state text-center py-5">
      <i class="bi bi-search display-1 opacity-10 d-block mb-4"></i>
      <h4 class="fw-black text-uppercase opacity-25">Nenhum resultado para "{{ searchQuery }}"</h4>
    </div>

    <!-- MODAL DE ADIÇÃO DE PAÍS -->
    <div v-if="showModal" class="modal-overlay animated-fade-in" @click.self="closeModal">
      <div class="modal-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="fw-black text-uppercase m-0 text-info">
            <i class="bi bi-pencil-square me-2" v-if="isEditing"></i>
            <i class="bi bi-plus-circle-fill me-2" v-else></i>
            {{ isEditing ? 'EDITAR' : 'ADICIONAR' }} PAÍS
          </h4>
          <button class="btn-close btn-close-white" @click="closeModal"></button>
        </div>

        <!-- Preview da bandeira em tempo real -->
        <div class="flag-preview-box mb-4" v-if="form.nome">
          <NationalFlag
            :countryName="form.nome"
            :forceUrl="form.bandeira_url || ''"
            :size="100"
          />
          <div class="mt-3 fw-black text-uppercase fs-5">{{ form.nome }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label x-small fw-bold text-secondary text-uppercase">Nome do País / Nacionalidade *</label>
          <input
            type="text"
            v-model="form.nome"
            class="form-control game-input"
            placeholder="Ex: Brasil, Argentina, França..."
            @keyup.enter="saveNationality"
            ref="inputNome"
          >
        </div>

        <div class="mb-3">
          <label class="form-label x-small fw-bold text-secondary text-uppercase">URL da Bandeira do País</label>
          <input
            type="text"
            v-model="form.bandeira_url"
            class="form-control game-input"
            placeholder="https://... (PNG ou JPG)"
          >
        </div>

        <div class="mb-3">
          <label class="form-label x-small fw-bold text-secondary text-uppercase">URL do Escudo da Federação (Opcional)</label>
          <input
            type="text"
            v-model="form.escudo_url"
            class="form-control game-input"
            placeholder="https://... (Aparecerá nas tabelas e detalhes)"
          >
        </div>

        <div class="mb-3">
          <label class="form-label x-small fw-bold text-secondary text-uppercase">Continente da Seleção (Opcional)</label>
          <select v-model="form.continente" class="form-select game-input">
            <option value="">-- Nenhum / Desconhecido --</option>
            <option v-for="fed in federationsList" :key="fed.chave" :value="fed.chave">
              {{ fed.chave }} ({{ fed.nome }})
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label class="form-label x-small fw-bold text-secondary text-uppercase">Nota / Observação (opcional)</label>
          <input
            type="text"
            v-model="form.nota"
            class="form-control game-input"
            placeholder="Ex: Naturalizado, Dupla cidadania..."
          >
        </div>

        <div class="d-flex gap-2">
          <button
            class="btn btn-info fw-black flex-grow-1 py-2 text-uppercase"
            @click="saveNationality"
            :disabled="!form.nome.trim() || saving"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-lg me-2"></i>
            SALVAR PAÍS
          </button>
          <button class="btn btn-outline-secondary px-4" @click="closeModal">CANCELAR</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../services/db'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import { refreshCustomNationalities } from '../services/dataSearch.service'
import { FEDERATIONS_DATA } from '../services/federations.data'

// ────────────────────────────────────────────────
// Chave de persistência no localforage
// ────────────────────────────────────────────────
const DB_KEY = 'player_nationalities'

// ────────────────────────────────────────────────
// Estado reativo
// ────────────────────────────────────────────────
const nationalities = ref([])   // Lista de países salvos
const searchQuery   = ref('')   // Texto de busca
const selectedNat   = ref(null) // País selecionado (para destaque)
const showModal     = ref(false)
const saving        = ref(false)
const showFallbackTitle = ref(false)
const inputNome     = ref(null)

const isEditing     = ref(false)

// Formulário de adição
const form = ref({
  id: null,
  nome: '',
  bandeira_url: '',
  escudo_url: '',
  continente: '',
  nota: ''
})

const federationsList = computed(() => {
  const list = []
  for (const [key, value] of Object.entries(FEDERATIONS_DATA)) {
    if (!key.startsWith('Outros') && key !== 'América' && key !== 'Ásia - Oceania' && key !== 'Mundial') {
      list.push({ chave: key, nome: value.nome, logo: value.logo })
    }
  }
  return list
})

// ────────────────────────────────────────────────
// Computed: filtra por busca
// ────────────────────────────────────────────────
const filteredNationalities = computed(() => {
  if (!searchQuery.value.trim()) return nationalities.value
  const q = searchQuery.value.toLowerCase().trim()
  return nationalities.value.filter(n =>
    n.nome.toLowerCase().includes(q) ||
    (n.nota && n.nota.toLowerCase().includes(q))
  )
})

// ────────────────────────────────────────────────
// Ciclo de vida: carrega dados ao montar
// ────────────────────────────────────────────────
onMounted(async () => {
  await loadNationalities()
})

// ────────────────────────────────────────────────
// Carrega lista do banco local
// ────────────────────────────────────────────────
const loadNationalities = async () => {
  const saved = await db.getAll(DB_KEY)
  // Ordena alfabeticamente pelo nome
  nationalities.value = saved.sort((a, b) => a.nome.localeCompare(b.nome))
}

// ────────────────────────────────────────────────
// Abre o modal de adição
// ────────────────────────────────────────────────
const openAddModal = () => {
  isEditing.value = false
  form.value = { id: null, nome: '', bandeira_url: '', escudo_url: '', continente: '', nota: '' }
  showModal.value = true
  // Foca o campo de nome após abrir
  setTimeout(() => inputNome.value?.focus(), 100)
}

const editNationality = (nat) => {
  isEditing.value = true
  form.value = {
    id: nat.id,
    nome: nat.nome,
    bandeira_url: nat.bandeira_url || '',
    escudo_url: nat.escudo_url || '',
    continente: nat.continente || '',
    nota: nat.nota || ''
  }
  showModal.value = true
  setTimeout(() => inputNome.value?.focus(), 100)
}

// ────────────────────────────────────────────────
// Fecha o modal
// ────────────────────────────────────────────────
const closeModal = () => {
  showModal.value = false
}

// ────────────────────────────────────────────────
// Salva um novo país no banco local
// ────────────────────────────────────────────────
const saveNationality = async () => {
  const nomeLimpo = form.value.nome.trim()
  if (!nomeLimpo) return

  // Verifica duplicata (ignora maiúsculas/minúsculas, exceto o atual)
  const jáExiste = nationalities.value.some(
    n => n.nome.toLowerCase() === nomeLimpo.toLowerCase() && n.id !== form.value.id
  )
  if (jáExiste) {
    alert(`O país "${nomeLimpo}" já está registrado!`)
    return
  }

  saving.value = true
  try {
    const novoRegistro = {
      id: form.value.id || Date.now().toString(), // ID único baseado em timestamp
      nome: nomeLimpo,
      bandeira_url: form.value.bandeira_url.trim(),
      escudo_url: form.value.escudo_url?.trim() || '',
      continente: form.value.continente?.trim() || '',
      nota: form.value.nota.trim()
    }

    let lista = [...nationalities.value]
    if (form.value.id) {
       const idx = lista.findIndex(n => n.id === form.value.id)
       if (idx !== -1) lista[idx] = novoRegistro
    } else {
       lista.push(novoRegistro)
    }
    
    lista.sort((a, b) => a.nome.localeCompare(b.nome))

    // Persiste no banco local
    await db.save(DB_KEY, lista)
    nationalities.value = lista
    await refreshCustomNationalities()

    closeModal()
  } finally {
    saving.value = false
  }
}

// ────────────────────────────────────────────────
// Remove um país após confirmação
// ────────────────────────────────────────────────
const removeNationality = async (nat) => {
  if (!confirm(`Deseja remover "${nat.nome}" da lista de nacionalidades?`)) return

  const lista = nationalities.value.filter(n => n.id !== nat.id)
  await db.save(DB_KEY, lista)
  nationalities.value = lista
  await refreshCustomNationalities()

  // Limpa seleção se era o removido
  if (selectedNat.value?.id === nat.id) {
    selectedNat.value = null
  }
}

// ────────────────────────────────────────────────
// Seleciona / deseleciona um card
// ────────────────────────────────────────────────
const selectNat = (nat) => {
  selectedNat.value = selectedNat.value?.id === nat.id ? null : nat
}

// ────────────────────────────────────────────────
// Navegação de volta
// ────────────────────────────────────────────────
const handleBack = () => {
  if (history.length > 1) {
    window.history.back()
  } else {
    location.href = '#/'
  }
}
</script>

<style scoped>
/* ── Banner de Cabeçalho ─────────────────────────── */
.nationality-banner {
  max-height: 80px;
  width: auto;
  max-width: 600px;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(0, 242, 255, 0.3));
}

/* ── Barra de busca ──────────────────────────────── */
.nationality-search-bar .game-input {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border-radius: 0 !important;
}

/* ── Badge contador ──────────────────────────────── */
.badge-counter {
  background: rgba(0, 242, 255, 0.08);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(0, 242, 255, 0.8);
}

/* ── Grid de Nacionalidades ─────────────────────── */
.nationality-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

/* ── Card de Nacionalidade ──────────────────────── */
.nationality-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* Efeito glow de fundo no hover */
.nationality-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(0, 242, 255, 0.06) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
}

.nationality-card:hover {
  background: rgba(0, 242, 255, 0.05);
  transform: translateY(-6px);
  border-color: rgba(0, 242, 255, 0.35);
  box-shadow: 0 12px 30px rgba(0, 242, 255, 0.12);
}

.nationality-card:hover::before {
  opacity: 1;
}

.nationality-card.selected {
  background: rgba(0, 242, 255, 0.08);
  border-color: rgba(0, 242, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.2);
}

/* ── Wrapper da bandeira ────────────────────────── */
.nat-flag-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
  transition: transform 0.3s ease;
}

.nationality-card:hover .nat-flag-wrapper {
  transform: scale(1.08);
}

/* ── Nome do país ───────────────────────────────── */
.nat-name {
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Nota opcional ──────────────────────────────── */
.nat-nota {
  font-size: 0.6rem;
  color: rgba(0, 242, 255, 0.6);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.btn-edit-nat {
  position: absolute;
  top: 8px;
  right: 40px;
  width: 26px;
  height: 26px;
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 50%;
  color: rgba(255, 193, 7, 0.7);
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  z-index: 10;
}

.nationality-card:hover .btn-edit-nat {
  opacity: 1;
  transform: scale(1);
}

.btn-edit-nat:hover {
  background: rgba(255, 193, 7, 0.5);
  border-color: #ffc107;
  color: white;
}

/* ── Botão de remover (oculto, aparece no hover) ── */
.btn-remove-nat {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 50%;
  color: rgba(220, 53, 69, 0.7);
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  z-index: 10;
}

.nationality-card:hover .btn-remove-nat {
  opacity: 1;
  transform: scale(1);
}

.btn-remove-nat:hover {
  background: rgba(220, 53, 69, 0.5);
  border-color: #dc3545;
  color: white;
}

/* ── Estado Vazio ───────────────────────────────── */
.empty-state {
  border: 2px dashed rgba(255, 255, 255, 0.06);
  border-radius: 2rem;
  margin-top: 2rem;
}

/* ── Modal Overlay ──────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Card do Modal ──────────────────────────────── */
.modal-card {
  background: #0a0f1a;
  border: 1px solid rgba(0, 242, 255, 0.25);
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 0 60px rgba(0, 242, 255, 0.15);
}

/* ── Preview da Bandeira no Modal ────────────────── */
.flag-preview-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── Inputs do Modal ─────────────────────────────── */
.game-input {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border-radius: 8px;
}

.game-input:focus {
  border-color: rgba(0, 242, 255, 0.4) !important;
  box-shadow: 0 0 0 3px rgba(0, 242, 255, 0.1) !important;
}

/* ── Utilitários ─────────────────────────────────── */
.ls-2 { letter-spacing: 2px; }
.x-small { font-size: 0.7rem; }
</style>
