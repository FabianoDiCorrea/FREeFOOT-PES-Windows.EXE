<template>
  <div class="flag-container" :style="{ width: size + 'px' }">
    <img 
      v-if="flagUrl" 
      :src="flagUrl" 
      :alt="countryName"
      class="flag-img"
      loading="lazy"
      decoding="async"
      @error="handleError"
    >
    <div v-else class="flag-placeholder">
      <i class="bi bi-flag-fill opacity-50"></i>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { dataSearchService } from '../services/dataSearch.service'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { imageCacheService } from '../services/imageCache.service'

const props = defineProps({
  countryName: String,
  size: {
    type: Number,
    default: 24
  },
  forceUrl: String
})

const hasError = ref(false)
const cachedUrl = ref(null)

const flagUrl = computed(() => {
  if (cachedUrl.value) return cachedUrl.value
  if (props.forceUrl) return props.forceUrl
  // Normalização para casos específicos
  if (!props.countryName || hasError.value) return null
  const name = props.countryName.trim()
  
  // 1. Suporte especial para logos de federação (CONMEBOL, UEFA, etc.)
  // Tenta pelo nome da chave (ex: "América do Sul") ou pelo nome da federação (ex: "CONMEBOL")
  let fed = FEDERATIONS_DATA[name]
  if (!fed) {
      fed = Object.values(FEDERATIONS_DATA).find(f => f.nome === name)
  }
  if (fed) return fed.logo

  // 2. Tentar encontrar seleção/clube (Bandeira)
  // Se for "Estados Unidos", o sistema pode estar usando "USA" ou outro nome internamente
  const searchName = name === 'Estados Unidos' ? 'USA' : name
  const data = dataSearchService.findNationalTeam(searchName) || dataSearchService.findClub(searchName)
  
  // Fallback para bandeira
  return data?.bandeira_url || null
})

// Sistema de Cache

watch(() => flagUrl.value, async (newUrl) => {
  if (newUrl && !newUrl.startsWith('data:')) {
    const base64 = await imageCacheService.getOrCache(newUrl)
    if (base64 && base64.startsWith('data:')) {
      cachedUrl.value = base64
    }
  }
}, { immediate: true })

const handleError = () => {
  hasError.value = true
  cachedUrl.value = null
}

watch(() => props.countryName, () => {
  hasError.value = false
  cachedUrl.value = null
})
</script>

<style scoped>
.flag-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
}

.flag-img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 50%;
  border: none;
  box-shadow: none;
}

.flag-placeholder {
  width: 100%;
  aspect-ratio: 1/1;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}
</style>
