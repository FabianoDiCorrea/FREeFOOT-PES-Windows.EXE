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
  season: String, // Necessário para marcar o time do usuário
  country: String // Novo: Para restringir destaque de rebaixamento
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

const isRelegationCountry = computed(() => {
  if (!props.country) return false
  const c = props.country.toLowerCase().trim()
  return c === 'brasil' || c === 'argentina' || c === 'inglaterra' || c === 'brazil' || c === 'england'
})

// --- NOVA LÓGICA DE EXTRAÇÃO IMUNE A ERROS (CHECKSUM) ---
const parsedRow = (row) => {
  if (!row || row.length < 2) return { pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, saldo: 0 };
  
  // Ignorar o primeiro item (nome) e converter o resto para números
  const numbers = row.slice(1).map(x => parseInt(String(x).replace(/[^\d-]/g, ''))).filter(x => !isNaN(x));
  
  let pontos = 0, jogos = 0, vitorias = 0, empates = 0, derrotas = 0, golsPro = 0, golsContra = 0, saldo = 0;
  let bestIdxV = -1;
  let bestScore = -1;
  
  /**
   * SISTEMA DE PONTUAÇÃO DE JANELA (VOTO)
   * Tentamos encontrar o índice de 'Vitórias' que melhor se ajusta aos dados.
   * i é o índice sugerido para Vitórias no array 'numbers'.
   */
  for (let i = 0; i < numbers.length; i++) {
    let score = 0;
    
    // Verificamos se os campos necessários existem nesta janela [i-2, i+5]
    // P (i-2), J (i-1), V (i), E (i+1), D (i+2), GP (i+3), GC (i+4), SG (i+5)
    
    const p = numbers[i - 2];
    const j = numbers[i - 1];
    const v = numbers[i];
    const e = numbers[i + 1];
    const d = numbers[i + 2];
    
    if (v !== undefined && e !== undefined && d !== undefined) {
      // 1. Checksum de Jogos: J = V + E + D
      if (j !== undefined && j === v + e + d) {
        score += 10;
        // Se J é razoável para uma liga (ex: 0-80)
        if (j >= 0 && j <= 82) score += 5;
      }
      
      // 2. Checksum de Pontos: P = 3*V + E
      if (p !== undefined && p === (v * 3) + e) {
        score += 10;
        // Se P é razoável
        if (p >= 0 && p <= 150) score += 5;
      }

      // 3. Checksum de Saldo: SG = GP - GC
      const gp = numbers[i + 3];
      const gc = numbers[i + 4];
      const sg = numbers[i + 5];
      if (gp !== undefined && gc !== undefined && sg !== undefined && sg === gp - gc) {
        score += 8;
      }
      
      // Bônus por posição esperada (Geralmente P é a 2ª ou 1ª coluna numérica)
      if (i === 2) score += 2; // Formato padrão: Nome, P, J, V...
      if (i === 1) score += 1; // Formato: Nome, J, V...
    }

    if (score > bestScore) {
      bestScore = score;
      bestIdxV = i;
    }
  }

  // Se não achamos nada bom (bestScore baixo), usamos um fallback seguro
  if (bestScore < 5) {
    bestIdxV = numbers.length >= 8 ? 2 : 1;
  }

  // Extração final baseada no melhor índice de Vitórias encontrado
  vitorias = numbers[bestIdxV] || 0;
  empates = numbers[bestIdxV + 1] || 0;
  derrotas = numbers[bestIdxV + 2] || 0;
  
  // Pontos e Jogos podem estar antes ou ausentes
  const pRaw = numbers[bestIdxV - 2]; 
  const jRaw = numbers[bestIdxV - 1];

  // Se pontos ou jogos não faziam parte da janela indexada, ou falharam no checksum, recalculamos
  pontos = (pRaw !== undefined && pRaw === (vitorias * 3) + empates) ? pRaw : (vitorias * 3) + empates;
  jogos = (jRaw !== undefined && jRaw === vitorias + empates + derrotas) ? jRaw : (vitorias + empates + derrotas);
  
  golsPro = numbers[bestIdxV + 3] || 0;
  golsContra = numbers[bestIdxV + 4] || 0;
  saldo = numbers[bestIdxV + 5] !== undefined ? numbers[bestIdxV + 5] : (golsPro - golsContra);

  return { pontos, jogos, vitorias, empates, derrotas, golsPro, golsContra, saldo };
}

const getStat = (row, field) => {
  return parsedRow(row)[field];
}

const calculateAproveitamento = (row) => {
  const stats = parsedRow(row);
  if (!stats.jogos || stats.jogos === 0) return '0.00';
  
  // NOVA FÓRMULA SOLICITADA: % de aproveitamento (jogos em que pontuou)
  // (Vitórias + Empates) / Total de Jogos
  const totalPontuados = stats.vitorias + stats.empates;
  const rate = (totalPontuados / stats.jogos) * 100;
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
               'linha-rebaixado': isRelegationCountry && props.relegationCount > 0 && idx >= data.length - props.relegationCount,
               'row-alt-v2': idx % 2 !== 0
             }">

          
          <!-- Rank Inclinado -->
           <div class="rank-slant-v2" :class="{ 
            'bg-champion': idx === 0, 
            'bg-relegation': isRelegationCountry && props.relegationCount > 0 && idx >= data.length - props.relegationCount 
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
