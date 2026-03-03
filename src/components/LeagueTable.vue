<script setup>
import { computed } from 'vue'
import TeamShield from './TeamShield.vue'
import { careerStore } from '../services/career.store'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  promotedCount: {
    type: Number,
    default: 0
  },
  relegationCount: {
    type: Number,
    default: 0
  },
  fullWidth: {
    type: Boolean,
    default: true
  },
  playoffPromotedTeams: {
    type: Array,
    default: () => []
  },
  season: String // Necessário para marcar o time do usuário
})

// Computar Mínimo e Máximo de GP/GC Dinamicamente com a Lógica Certa
const statsExtremes = computed(() => {
  if (!props.data || props.data.length === 0) return {}
  const parsed = props.data.map(r => parsedRow(r));
  const gpValues = parsed.map(p => p.golsPro);
  const gcValues = parsed.map(p => p.golsContra);
  
  return {
    maxGP: Math.max(...gpValues),
    minGP: Math.min(...gpValues),
    minGC: Math.min(...gcValues),
    maxGC: Math.max(...gcValues)
  }
})

const isBestAttack = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.maxGP > 0 && v === statsExtremes.value.maxGP
}
const isWorstAttack = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.minGP !== undefined && v === statsExtremes.value.minGP
}
const isBestDefense = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.minGC !== undefined && v === statsExtremes.value.minGC
}
const isWorstDefense = (val) => {
  const v = parseInt(val)
  return statsExtremes.value.maxGC > 0 && v === statsExtremes.value.maxGC
}

const isAccessRow = (idx, teamName) => {
  if (idx === 0) return false // Campeão tem cor própria
  
  if (props.promotedCount <= 0) return false
  
  // Se está na lista manual de playoffs, é acesso com certeza
  if (props.playoffPromotedTeams.includes(teamName)) return true
  
  // Cálculo de vagas diretas restantes
  // Ex: PromovidosTotal=4, PromovidosPlayoff=2. Diretos = 4 - 2 = 2.
  // Então indices 1 e 2 sobem. Indice 3 (4º lugar) não.
  const directSpots = Math.max(0, props.promotedCount - props.playoffPromotedTeams.length)
  
  if (directSpots === 0) return false
  
  // Se não está no playoff manual, verificamos se cabe nas vagas diretas
  // Lembrando que idx 0 é o campeão (vaga 1).
  // Se directSpots = 2, então indices 0 e 1 sobem.
  // Mas como a função é chamada para idx > 0 (pois idx 0 é campeão),
  // Precisamos ver se o índice está dentro do limite.
  // Ex: Se directSpotos = 2.
  // idx 0 (Campeão/Direct1) -> False pq é campeão.
  // idx 1 (Vice/Direct2) -> True.
  // idx 2 (3º lugar) -> False (pois só tinham 2 diretas).
  return idx < directSpots
}

// --- NOVA LÓGICA DE EXTRAÇÃO IMUNE A ERROS (CHECKSUM) ---
const parsedRow = (row) => {
  // Ignorar o primeiro item (nome)
  const numbers = row.slice(1).map(x => parseInt(x)).filter(x => !isNaN(x));
  
  let pontos = 0, jogos = 0, vitorias = 0, empates = 0, derrotas = 0, golsPro = 0, golsContra = 0, saldo = 0;
  let idxV = -1;
  let fallbackJ = false;
  
  // 1. Procurar J = V + E + D
  for (let i = 1; i <= Math.min(3, numbers.length - 3); i++) {
      if (numbers[i-1] === numbers[i] + numbers[i+1] + numbers[i+2]) {
          idxV = i;
          break;
      }
  }
  
  // 2. Procurar P = V*3 + E (se J sumiu)
  if (idxV === -1) {
      for (let i = 1; i <= Math.min(2, numbers.length - 2); i++) {
          if (numbers[i-1] === (numbers[i] * 3) + numbers[i+1]) {
              idxV = i;
              fallbackJ = true;
              break;
          }
      }
  }
  
  // 3. Fallback genérico
  if (idxV === -1) {
      if (numbers.length >= 8) idxV = 2; // Assume P, J, V...
      else idxV = 1;
  }
  
  if (fallbackJ) {
      pontos = numbers[idxV - 1] || 0;
      vitorias = numbers[idxV] || 0;
      empates = numbers[idxV + 1] || 0;
      derrotas = numbers[idxV + 2] || 0;
      golsPro = numbers[idxV + 3] || 0;
      golsContra = numbers[idxV + 4] || 0;
      saldo = numbers[idxV + 5] || 0;
      jogos = vitorias + empates + derrotas;
  } else {
      pontos = numbers[idxV - 2] || 0;
      jogos = numbers[idxV - 1] || 0;
      vitorias = numbers[idxV] || 0;
      empates = numbers[idxV + 1] || 0;
      derrotas = numbers[idxV + 2] || 0;
      golsPro = numbers[idxV + 3] || 0;
      golsContra = numbers[idxV + 4] || 0;
      saldo = numbers[idxV + 5] || 0;
  }
  
  return { pontos, jogos, vitorias, empates, derrotas, golsPro, golsContra, saldo };
}

const getStat = (row, field) => {
  return parsedRow(row)[field];
}

const calculateAproveitamento = (row) => {
  const stats = parsedRow(row);
  if (!stats.jogos || stats.jogos === 0) return '0.00';
  
  // NOVA FÓRMULA SOLICITADA: (((Vitórias * 3) + Empates) / (Jogos * 3)) * 100
  const pontos = stats.pontos !== undefined && stats.pontos > 0 ? stats.pontos : (stats.vitorias * 3) + stats.empates;
  const pontosMax = stats.jogos * 3;
  const rate = (pontos / (pontosMax || 1)) * 100; // Evita divisão por zero se houver falha no parser
  return rate.toFixed(2);
}
</script>

<template>
  <div class="tv-table-wrapper" :class="{ 'full-width': fullWidth }">
    <div class="table-responsive custom-scrollbar">
      <div class="tv-league-table-v2">
        
        <!-- Cabeçalho (Inclinado) -->
        <div class="tv-header-v2">
          <div class="h-main-v2">
            <div class="h-pos-v2">#</div>
            <div class="h-team-v2">CLASSIFICAÇÃO</div>
          </div>
          <div class="h-stats-v2">
            <div class="h-slant pts">P</div>
            <div class="h-slant">J</div>
            <div class="h-slant">V</div>
            <div class="h-slant">E</div>
            <div class="h-slant">D</div>
            <div class="h-slant gp">GP</div>
            <div class="h-slant gc">GC</div>
            <div class="h-slant sg">SG</div>
            <div class="h-slant perc">%</div>
          </div>
        </div>

        <!-- Linhas (Ultra-Compactas 30px) -->
        <div v-for="(row, idx) in data" :key="idx" 
             class="tv-row-v2"
             :class="{
               'linha-campeao': idx === 0,
               'linha-acesso': isAccessRow(idx, row[0]),
               'linha-rebaixado': relegationCount > 0 && idx >= data.length - relegationCount,
               'row-alt-v2': idx % 2 !== 0
             }">

          
          <!-- Rank Inclinado -->
          <div class="rank-slant-v2" :class="{ 
            'bg-champion': idx === 0, 
            'bg-relegation': relegationCount > 0 && idx >= data.length - relegationCount 
          }">
            <span>{{ idx + 1 }}</span>
          </div>

          <!-- Escudo e Nome -->
          <div class="team-info-v2">
            <TeamShield :teamName="row[0]" :size="24" borderless :season="season" />
            <span class="team-name-v2 text-truncate">{{ row[0] }}</span>
            <i v-if="careerStore.isUserTeam(row[0], season)" class="bi bi-controller ms-1 text-neon-green pulse-neon"></i>
          </div>

          <!-- Estatísticas (Juntas e Inclinadas) -->
          <div class="stats-group-v2">
            <!-- P -->
            <div class="stat-slant-v2 pts-v2"><span>{{ getStat(row, 'pontos') }}</span></div>
            <!-- J -->
            <div class="stat-slant-v2"><span>{{ getStat(row, 'jogos') }}</span></div>
            <!-- V -->
            <div class="stat-slant-v2"><span>{{ getStat(row, 'vitorias') }}</span></div>
            <!-- E -->
            <div class="stat-slant-v2"><span>{{ getStat(row, 'empates') }}</span></div>
            <!-- D -->
            <div class="stat-slant-v2"><span>{{ getStat(row, 'derrotas') }}</span></div>
            
            <!-- Ataque (GP) -->
            <div class="stat-slant-v2 gp" 
                 :class="{ 
                   'best-stat': isBestAttack(getStat(row, 'golsPro')), 
                   'worst-stat': isWorstAttack(getStat(row, 'golsPro')) 
                 }">
              <span>{{ getStat(row, 'golsPro') }}</span>
            </div>
            
            <!-- Defesa (GC) -->
            <div class="stat-slant-v2 gc"
                 :class="{ 
                   'best-stat': isBestDefense(getStat(row, 'golsContra')), 
                   'worst-stat': isWorstDefense(getStat(row, 'golsContra')) 
                 }">
              <span>{{ getStat(row, 'golsContra') }}</span>
            </div>
            
            <!-- SG -->
            <div class="stat-slant-v2 sg"><span>{{ getStat(row, 'saldo') }}</span></div>
            <!-- % (Aproveitamento ou Calculado) -->
            <div class="stat-slant-v2 perc">
              <span>
                {{ calculateAproveitamento(row) }}%
              </span>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.tv-table-wrapper {
  padding: 0.2rem 0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #fff;
  display: block;
  width: 100%;
}

.tv-table-wrapper.full-width { width: auto; }

.table-responsive {
  width: 100%;
  overflow: hidden;
  padding-bottom: 5px;
}

.tv-league-table-v2 {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* HEADER STYLE */
.tv-header-v2 {
  display: flex;
  align-items: flex-end;
  margin-bottom: 3px;
}

.h-main-v2 {
  display: flex;
  flex: 1;
  min-width: 220px;
  font-weight: 900;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.h-pos-v2 { width: 40px; text-align: center; }
.h-team-v2 { padding-left: 10px; }

.h-stats-v2 {
  display: flex;
  gap: 1.5px;
}

.h-slant {
  width: 32px; /* Reduzido de 36px */
  height: 18px;
  background: rgba(255, 255, 255, 0.05);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.5);
}

.h-slant.pts { width: 40px; background: rgba(88, 204, 255, 0.1); } /* Reduzido de 45 */
.h-slant.gp, .h-slant.gc, .h-slant.sg { width: 30px; } /* Reduzido de 34 */
.h-slant.perc { width: 42px; } /* Aumentado de 36 para não colar no border */

/* ROW STYLE */
.tv-row-v2 {
  display: flex;
  align-items: stretch;
  background: rgba(15, 25, 40, 0.85);
  height: 30px;
  position: relative;
  transition: all 0.2s;
}

.tv-row-v2:hover {
  background: rgba(30, 50, 90, 0.9) !important;
}

/* NOVOS ESTILOS DE DESTAQUE */
.linha-campeao {
  background: linear-gradient(90deg, rgba(255,215,0,0.15), transparent) !important;
  border-left: 3px solid #FFD700;
}

.linha-acesso {
  background: linear-gradient(90deg, rgba(0,255,150,0.12), transparent) !important;
  border-left: 3px solid #00ff95;
}

.linha-rebaixado {
  background: linear-gradient(90deg, rgba(255,0,0,0.15), transparent) !important;
  border-left: 3px solid #ff2b2b;
}

/* HOVER PARA LINHAS DESTACADAS */
.linha-campeao:hover,
.linha-acesso:hover,
.linha-rebaixado:hover {
  transform: scale(1.01);
  filter: brightness(1.15);
  z-index: 10;
}

.row-alt-v2 {
  background: rgba(10, 18, 30, 0.5);
}

/* RANK SLANT */
.rank-slant-v2 {
  width: 40px;
  background: rgba(0, 0, 0, 0.4);
  transform: skewX(-20deg);
  margin-left: -7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
}

.rank-slant-v2 span {
  transform: skewX(20deg);
}

/* TEAM IDENT */
.team-info-v2 {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 15px;
  flex: 1;
  min-width: 180px;
  z-index: 1;
}

.team-name-v2 {
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* STATS GROUP */
.stats-group-v2 {
  display: flex;
  gap: 1.5px;
  margin-right: -10px;
}

.stat-slant-v2 {
  width: 32px; /* Compatível com h-slant */
  background: rgba(0, 0, 0, 0.2);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
}

.stat-slant-v2 span {
  transform: skewX(20deg);
  display: block;
}

/* PTS */
.pts-v2 {
  width: 40px; /* Compatível com h-slant.pts */
  background: rgba(0, 0, 0, 0.4);
  color: #58ccff;
  font-size: 1.1rem;
  font-weight: 900;
}

/* STATUS COLORS FOR NUMBERS */
.best-stat span { color: #00ff88 !important; text-shadow: 0 0 10px rgba(0, 255, 136, 0.4); }
.worst-stat span { color: #ff4444 !important; text-shadow: 0 0 10px rgba(255, 68, 68, 0.4); }

/* Ajuste de cor para rebaixados no PTS */
.linha-rebaixado .pts-v2 {
  color: #ff9999;
}

.stat-slant-v2.gp, .stat-slant-v2.gc, .stat-slant-v2.sg { width: 30px; font-size: 0.75rem; }
.stat-slant-v2.perc { width: 42px; font-size: 0.75rem; opacity: 0.7; }

.text-neon-green {
  color: #39ff14;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8), 0 0 18px rgba(57, 255, 20, 0.4);
  font-size: 1.1rem;
}

.pulse-neon {
  animation: pulse-neon-anim 2s infinite;
}

@keyframes pulse-neon-anim {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.7; transform: scale(1); }
}

/* ESPECIAL HIGHLIGHTS (Fundos originais para os ranks) */
.bg-champion {
  background: linear-gradient(135deg, #ffc107 0%, #b8860b 100%) !important;
  color: #000 !important;
}

.bg-relegation {
  background: linear-gradient(135deg, #cc1111 0%, #550000 100%) !important;
  color: #fff !important;
}

/* CUSTOM SCROLLBAR */
.custom-scrollbar::-webkit-scrollbar { height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
</style>
