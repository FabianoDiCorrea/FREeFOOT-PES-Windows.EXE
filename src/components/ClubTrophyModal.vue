<template>
  <div v-if="isVisible" class="form-full-screen-overlay trophy-room-overlay" style="z-index: 9999; display: flex;" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable m-auto" style="width: 90%; max-width: 1200px; max-height: 90vh;">
      <div class="modal-content bg-dark-expert text-white border-gold-glow" style="height: 100%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
        <div class="modal-header border-0 pb-0 pt-3 px-4 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-3">
             <TeamShield :teamName="clubName" :size="50" />
             <div>
               <h3 class="modal-title fw-black text-uppercase ls-1 m-0">{{ clubName }}</h3>
               <div class="text-warning-neon small fw-bold text-uppercase opacity-75 ls-2">SALA DE TROFÉUS</div>
             </div>
          </div>
          <button type="button" class="btn-close btn-close-white" @click="close" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scrollbar p-4" style="flex: 1; overflow-y: auto;">
          
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-warning mb-3"></div>
            <p class="opacity-50">CARREGANDO CONQUISTAS...</p>
          </div>

          <div v-else-if="trophies.length === 0" class="text-center py-5">
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
                   <TeamShield :teamName="clubName" :size="100" />
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
import { ref, watch, onMounted } from 'vue'
import { seasonStore } from '../services/season.store'
import { getTrofeuPath, normalizeString } from '../services/utils'
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
const modalRef = ref(null)

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
  return all.find(c => normalizeString(c.nome) === norm)
}

const loadTrophies = async () => {
  if (!props.clubName) return
  loading.value = true
  
  const allSeasons = seasonStore.list
  const clubNorm = normalizeString(props.clubName)
  
  const grouped = {}
  
  // Cache de metadados para evitar buscas lineares repetitivas
  const metaCache = new Map();

  allSeasons.forEach(s => {
    if (normalizeString(s.campeao || '') === clubNorm) {
      const compName = s.competitionName
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

const isVisible = ref(false)

const open = () => {
    isVisible.value = true
    loadTrophies()
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
