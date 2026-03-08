<template>
  <div class="view-container animated-fade-in">
    <!-- Header com Voltar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="$router.push('/carreira')" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>VOLTAR
      </button>
      <LogoFREeFOOT />
    </div>

    <!-- Título Principal -->
    <div class="trophy-room-header text-center mb-5">
      <h2 class="text-warning fw-black text-uppercase ls-2 mb-2">
        <i class="bi bi-trophy-fill me-2"></i>Sala de Troféus
      </h2>
      <div class="header-line"></div>
      <p class="text-secondary opacity-75 small text-uppercase ls-1">Galeria de Conquistas da Carreira</p>
    </div>

    <!-- Conteúdo Principal -->
    <div class="container-fluid px-4">
      
      <!-- Se não houver troféus -->
      <div v-if="!hasTrophies" class="text-center py-5">
        <i class="bi bi-trophy opacity-25" style="font-size: 4rem;"></i>
        <p class="mt-3 text-secondary">Nenhum troféu conquistado ainda.</p>
      </div>

      <!-- Galeria de Troféus -->
      <div v-else class="trophy-gallery">
        
        <div v-for="(trophy, name) in groupedTrophies" :key="name" class="trophy-card">
          <div class="trophy-card-inner">
            <!-- Top: Título e Estrelas -->
            <div class="tc-header">
              <!-- Sistema de Estrelas -->
              <div class="tc-stars">
                <div class="stars-display">{{ formatStars(trophy.count) }}</div>
              </div>
            </div>

            <!-- Middle: Imagem do Troféu -->
            <div class="tc-main">
              <!-- Caixa do Troféu -->
              <div class="tc-trophy-box d-flex align-items-center justify-content-center">
                <img v-if="getCompLogo(trophy.nome)" :src="getCompLogo(trophy.nome)" class="trophy-img" alt="Troféu" @error="(e) => e.target.style.display='none'">
                <i v-else class="bi bi-trophy-fill fs-1 text-warning opacity-75"></i>
              </div>
              
              <div class="tc-comp-name-large">
                {{ trophy.nome }}
                <NationalFlag v-if="trophy.pais" :countryName="trophy.pais" :size="16" class="ms-1 align-text-top opacity-75" />
              </div>
              <div class="text-center mb-2">
                <span class="tc-count-badge">{{ trophy.count }} {{ trophy.count === 1 ? 'Título' : 'Títulos' }}</span>
              </div>

              <!-- Bottom: Anos e Times -->
              <div class="tc-footer">
                <div class="tc-dates-list custom-scrollbar mb-3">
                  <div v-for="year in trophy.years" :key="year" class="tc-date-item">
                    {{ year }}
                  </div>
                </div>
                
                <!-- Lista de Times com Escudo GRANDE e APENAS NOME -->
                <div class="tc-teams-list-v2">
                  <div v-for="(team, tidx) in trophy.teamsData" :key="tidx" class="team-badge-large">
                    <div class="team-shield-container">
                      <TeamShield :teamName="team.nome" :size="80" borderless />
                    </div>
                    <span class="team-name-large mt-2">{{ team.nome }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { careerStore } from '../services/career.store'
import { seasonStore } from '../services/season.store'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import { getTrofeuPath, normalizeString } from '../services/utils'
import { SOUTH_AMERICA_COMPETITIONS, UEFA_COMPETITIONS, CONCACAF_COMPETITIONS, INTERNATIONAL_COMPETITIONS } from '../data/competitions.data'

const history = computed(() => careerStore.history)

onMounted(async () => {
    if (careerStore.history.length === 0) {
        await careerStore.loadAll()
    }
    // IMPORTANTE: Carregar temporadas para detectar títulos automáticos
    if (seasonStore.list.length === 0) {
        await seasonStore.loadAll()
    }
})

const hasTrophies = computed(() => {
    return Object.keys(groupedTrophies.value).length > 0
})

/**
 * Retorna o LOGO/TROFÉU da competição
 * 1. Procura na lista oficial de competições (para pegar ID correto se houver)
 * 2. Tenta imagem de troféu
 * 3. Tenta logo
 * 4. Fallback por nome
 */
const getCompLogo = (compName) => {
    if (!compName) return ''
    
    // 1. Buscar nos dados oficiais (Flattened)
    const allComps = [
        ...SOUTH_AMERICA_COMPETITIONS,
        ...UEFA_COMPETITIONS,
        ...CONCACAF_COMPETITIONS,
        ...INTERNATIONAL_COMPETITIONS
    ]

    const normSearch = normalizeString(compName)
    const found = allComps.find(c => normalizeString(c.nome) === normSearch)
    
    if (found?.trofeu) return getTrofeuPath(found.trofeu)
    if (found?.logo) return found.logo

    // 2. Fallback por nome de arquivo comum
    const slug = compName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
    
    return `logos/competitions/${slug}.png`
}

// Formatar estrelas baseado no número de títulos
const formatStars = (count) => {
    const tens = Math.floor(count / 10)
    const fives = Math.floor((count % 10) / 5)
    const ones = count % 5
    
    let result = ''
    if (tens > 0) result += `${tens * 10}x⭐ `
    if (fives > 0) result += `${fives * 5}x⭐ `
    if (ones > 0) result += '⭐'.repeat(ones)
    
    return result.trim()
}

// Agrupar títulos por competição
const groupedTrophies = computed(() => {
    const grouped = {}
    
    // 1. Adicionar títulos manuais
    history.value.forEach(h => {
        if (h.titulos) {
            h.titulos.forEach(t => {
                if (!grouped[t.nome]) {
                    grouped[t.nome] = {
                        nome: t.nome,
                        count: 0,
                        years: [],
                        pais: h.pais, // Capturando país da entrada
                        teamsData: []
                    }
                }
                grouped[t.nome].count++
                if (!grouped[t.nome].years.includes(h.temporada)) {
                    grouped[t.nome].years.push(h.temporada)
                }
                
                const teamExists = grouped[t.nome].teamsData.find(td => td.nome === h.timeNome)
                if (!teamExists) {
                    grouped[t.nome].teamsData.push({ nome: h.timeNome, pais: h.pais })
                }
            })
        }
    })

    // 2. Adicionar títulos automáticos (CAMPEÕES detectados na seasonStore)
    history.value.forEach(h => {
        const teamName = h.timeNome?.toLowerCase()
        const seasonYear = h.temporada?.toString().toLowerCase().trim().replace(/\s/g, '')

        // Buscar temporadas no Universo que batem com Time e Ano e onde o time foi CAMPEÃO
        const universeSeasons = seasonStore.list.filter(s => {
            const sYear = s.ano?.toString().toLowerCase().trim().replace(/\s/g, '')
            return sYear === seasonYear && s.campeao?.toLowerCase() === teamName
        })

        universeSeasons.forEach(s => {
            const compName = s.competitionName
            
            // Verificar se já não foi contado como título manual
            const alreadyCountedAsManual = (h.titulos || []).some(t => t.nome.toLowerCase() === compName.toLowerCase())
            
            // Verificar se já contamos nesta iteração (para não duplicar se tiver bug de dados)
            const alreadyInGroup = grouped[compName] && grouped[compName].years.includes(h.temporada)

            if (!alreadyCountedAsManual && !alreadyInGroup) {
                if (!grouped[compName]) {
                    grouped[compName] = {
                        nome: compName,
                        count: 0,
                        years: [],
                        pais: h.pais, // Capturando país
                        teamsData: []
                    }
                }
                grouped[compName].count++
                grouped[compName].years.push(h.temporada)
                
                const teamExists = grouped[compName].teamsData.find(td => td.nome === h.timeNome)
                if (!teamExists) {
                    grouped[compName].teamsData.push({ nome: h.timeNome, pais: h.pais })
                }
            }
        })
    })

    // Ordena os anos internamente de forma decrescente (mais recente no topo)
    Object.values(grouped).forEach(g => {
        g.years.sort((a, b) => {
            const yearA = parseInt(a.split('/')[0]) || 0;
            const yearB = parseInt(b.split('/')[0]) || 0;
            return yearB - yearA;
        });
    });

    // Convert to array and sort by earliest year
    return Object.values(grouped).sort((a, b) => {
        const minYearA = Math.min(...a.years.map(y => parseInt(y.split('/')[0])))
        const minYearB = Math.min(...b.years.map(y => parseInt(y.split('/')[0])))
        return minYearA - minYearB
    })
})
</script>

<style scoped>
.animated-fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* TROPHY ROOM STYLES (Copiados de CarreiraView) */
.trophy-room-header {
    position: relative;
    padding-bottom: 10px;
}

.header-line {
    width: 100px;
    height: 4px;
    background: var(--color-accent);
    margin: 10px auto;
    border-radius: 2px;
}

.trophy-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Um pouco mais largo para melhor visualização */
    gap: 24px;
    padding-bottom: 40px;
}

.trophy-card {
    min-height: 480px; /* Aumentado por causa do troféu maior */
    height: auto;
    perspective: 1000px;
    cursor: default;
}

.trophy-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 15px;
    transition: all 0.4s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
}

.trophy-card:hover .trophy-card-inner {
    border-color: var(--color-accent);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.tc-header {
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 5px;
}

.tc-comp-name {
    font-size: 0.75rem;
    font-weight: 900;
    color: var(--color-accent);
    text-transform: uppercase;
    line-height: 1.2;
}

.tc-main {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
}

/* AJUSTE DE TAMANHO DE TROFÉU - AUMENTADO */
.tc-trophy-box {
    width: 100%;        
    height: 220px;      /* Aumentado de 160px para 220px */
    margin-bottom: 15px;
    padding: 5px;       /* Menos padding para imagem maior */
}

.trophy-img {
    width: auto;
    height: 100%;       
    object-fit: contain; 
    filter: drop-shadow(0 5px 15px rgba(255,193,7,0.3));
    padding: 15px; /* Adicionado padding interno na imagem para garantir respiro */
    transition: transform 0.3s ease;
}

.trophy-card:hover .trophy-img {
    transform: scale(1.1); /* Zoom leve e seguro ao passar o mouse */
}

.tc-footer {
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 15px;
    width: 100%;
}

.tc-stars {
    text-align: center;
    padding: 5px 0;
}

.stars-display {
    font-size: 1.5rem;
    line-height: 1;
    animation: star-glow 2s ease-in-out infinite;
}

@keyframes star-glow {
    0%, 100% { filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5)); }
    50% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)); }
}

.tc-comp-name-large {
    font-size: 0.95rem; 
    font-weight: 900;
    color: var(--color-accent);
    text-transform: uppercase;
    line-height: 1.2;
    text-align: center;
    margin-top: 8px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.tc-count-badge {
    display: inline-block;
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tc-dates-list {
    max-height: 100px;
    overflow-y: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem 0;
}

.tc-date-item {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 800;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tc-date-item:last-child {
    border-bottom: none;
}

/* Lista de Times */
.tc-teams-list-v2 {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
}

.team-badge-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px;
    border-radius: 12px;
    transition: all 0.3s ease;
    min-width: 110px; /* Aumentado largura mínima */
}

.team-badge-large:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
}

.team-shield-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px; /* Aumentado de 60px para 80px */
}

.team-name-large {
    font-size: 0.9rem; /* Aumentado de 0.7rem */
    font-weight: 800;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.2;
    max-width: 140px; /* Mais espaço para texto */
    word-wrap: break-word;
}
</style>
