<template>
  <div class="shield-wrapper" :class="{ 'premium-mode': premium }">
    <!-- Fundo de Bandeira Desfocada (Modo Premium) -->
    <div v-if="premium && countryName" class="premium-flag-bg" :style="flagBgStyle"></div>
    
    <div class="shield-container" :class="{ 'borderless': borderless }" :style="{ width: size + 'px', height: size + 'px' }">
      <img 
        v-if="shieldUrl" 
        :src="shieldUrl" 
        :alt="teamName"
        class="shield-img"
        loading="lazy"
        decoding="async"
        @error="handleError"
      >
      <div v-else class="shield-fallback">
        <i class="bi bi-shield text-secondary"></i>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { dataSearchService } from '../services/dataSearch.service'
import { imageCacheService } from '../services/imageCache.service'
import { careerStore } from '../services/career.store'

const props = defineProps({
  teamName: String,
  size: {
    type: Number,
    default: 40
  },
  forceUrl: String, 
  borderless: Boolean,
  season: String,
  premium: Boolean, // Ativa o fundo de bandeira desfocada
  countryName: String, // Necessário para o fundo premium
  isNational: Boolean, // Força a busca apenas em seleções
  filterCountry: String // Se passado, prioriza busca de escudo pelo país exato
})

const hasError = ref(false)
const cachedUrl = ref(null)

const sourceUrl = computed(() => {
  if (props.forceUrl) return props.forceUrl
  if (!props.teamName || hasError.value) return null
  
  const type = props.isNational ? 'selecao' : null
  
  // Se filterCountry foi passado, tenta primeiro busca exata no país correto
  if (props.filterCountry && !props.isNational) {
    const team = dataSearchService.findClubByCountry(props.teamName, props.filterCountry)
    if (team) return team?.escudo_url || team?.bandeira_url || null
  }
  
  const team = dataSearchService.search(props.teamName, type)
  return team?.escudo_url || team?.bandeira_url || null
})

const shieldUrl = computed(() => cachedUrl.value || sourceUrl.value)

const isUserControlled = computed(() => {
  if (!props.teamName) return false
  // Se a season for passada, usa ela (mais preciso)
  if (props.season) {
    return careerStore.isUserTeam(props.teamName, props.season)
  }
  // Fallback: Se não houver season, verifica se o time consta em qualquer contrato da carreira
  return careerStore.history.some(h => h.timeNome?.toLowerCase().trim() === props.teamName.toLowerCase().trim())
})

const badgeStyles = computed(() => {
  const badgeSize = Math.max(14, props.size * 0.45)
  return {
    fontSize: (badgeSize * 0.9) + 'px'
  }
})

const flagBgStyle = computed(() => {
  if (!props.countryName) return {}
  const data = dataSearchService.findNationalTeam(props.countryName)
  const url = data?.bandeira_url || null
  return url ? { backgroundImage: `url(${url})` } : {}
})

watch(() => sourceUrl.value, async (newUrl) => {
  if (newUrl && !newUrl.startsWith('data:')) {
    const base64 = await imageCacheService.getOrCache(newUrl)
    if (base64 && base64.startsWith('data:')) {
      cachedUrl.value = base64
    }
  } else if (!newUrl) {
    cachedUrl.value = null
  }
}, { immediate: true })

const handleError = () => {
  hasError.value = true
  cachedUrl.value = null
}

// Reset erro se o nome mudar
watch(() => props.teamName, () => {
  hasError.value = false
  cachedUrl.value = null
})
</script>

<style scoped>
.shield-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: visible;
  border: none;
  transition: all 0.3s ease;
}

.shield-container.borderless {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  overflow: visible !important;
}

.shield-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0;
}

.user-control-badge-neon i {
  font-size: 110%;
}

.shield-fallback {
  font-size: 1.2rem;
  opacity: 0.6;
}

.shield-wrapper.premium-mode {
  position: relative;
  padding: 15px;
  background: rgba(0,0,0,0.5);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
  display: inline-block;
}

.premium-flag-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(8px) brightness(0.4);
  opacity: 0.6;
  z-index: 0;
}

.premium-mode .shield-container {
  position: relative;
  z-index: 1;
}
</style>
