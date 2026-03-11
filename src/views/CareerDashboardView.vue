<template>
  <div class="view-container">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/carreira')">
          <i class="bi bi-arrow-left"></i> VOLTAR
        </button>
        <h2 class="m-0 text-info"><i class="bi bi-bar-chart-fill me-2"></i>MINHAS ESTATÍSTICAS</h2>

        <!-- Abas de Filtro de Contexto (Global) -->
        <div class="bg-dark rounded p-1 ms-3 d-flex gap-1 border border-secondary border-opacity-50">
          <button @click="contextType = 'clube'" class="btn btn-sm" :class="contextType === 'clube' ? 'btn-light fw-bold text-dark' : 'btn-dark text-white-50'">CLUBES</button>
          <button @click="contextType = 'selecao'" class="btn btn-sm" :class="contextType === 'selecao' ? 'btn-light fw-bold text-dark' : 'btn-dark text-white-50'">SELEÇÕES</button>
        </div>
      </div>
      <LogoFREeFOOT />
    </div>

    <div v-if="filteredHistory.length === 0" class="text-center p-5 opacity-50">
      <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
      <h4>Nenhum dado encontrado para {{ contextType === 'clube' ? 'Clubes' : 'Seleções' }}</h4>
      <p>Você precisa registrar temporadas na sua carreira para ver os gráficos e recordes aqui.</p>
    </div>

    <div v-else class="dashboard-wrapper">
      <!-- Abas Internas -->
      <div class="d-flex gap-3 mb-4 px-2 tab-navigation">
        <button class="nav-btn" :class="{ active: activeTab === 'timeline' }" @click="activeTab = 'timeline'">
          <i class="bi bi-graph-up me-2"></i>LINHA DO TEMPO
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'records' }" @click="activeTab = 'records'">
          <i class="bi bi-trophy me-2"></i>RECORDES & CAMPANHAS
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'awards' }" @click="activeTab = 'awards'">
          <i class="bi bi-star me-2"></i>DESTAQUES & PRÊMIOS
        </button>
      </div>

      <!-- ABA: TIMELINE -->
      <div v-if="activeTab === 'timeline'" class="row g-4 px-2">
        <div class="col-12">
          <GamePanel>
            <h4 class="text-warning text-uppercase fw-bold mb-4">
              <i class="bi bi-bezier2"></i> Histórico de Posições (Ligas / Copas do Mundo)
            </h4>
            
            <div style="height: 400px; width: 100%; position: relative;" v-if="chartData.labels.length > 0">
              <Line :data="chartData" :options="chartOptions" />
            </div>
            <div v-else class="text-center p-5 opacity-50">
              Gerando gráfico...
            </div>
          </GamePanel>
        </div>
      </div>

      <!-- ABA: RECORDES (TOP 3) -->
      <div v-if="activeTab === 'records'" class="row g-4 px-2">
        <!-- Melhores Campanhas -->
        <div class="col-md-6">
          <GamePanel>
             <h5 class="text-success fw-bold text-uppercase mb-3"><i class="bi bi-graph-up-arrow"></i> Maiores Aproveitamentos</h5>
             <div class="d-flex flex-column gap-2">
                <div v-for="(rec, i) in top3WinRates" :key="'win'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-4 border-success">
                   <div class="d-flex align-items-center gap-3">
                      <div class="fw-black text-white px-2">{{ i + 1 }}º</div>
                      <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="30" />
                      <div v-else class="text-secondary"><i class="bi bi-globe"></i></div>
                      <div class="d-flex flex-column">
                        <span class="fw-bold">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary">{{ rec.temporada }}</span>
                      </div>
                   </div>
                   <h4 class="m-0 fw-black text-success">{{ rec.rate }}%</h4>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Piores Campanhas -->
        <div class="col-md-6">
          <GamePanel>
             <h5 class="text-danger fw-bold text-uppercase mb-3"><i class="bi bi-graph-down-arrow"></i> Piores Aproveitamentos</h5>
             <div class="d-flex flex-column gap-2">
                <div v-for="(rec, i) in bottom3WinRates" :key="'loss'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-4 border-danger opacity-75">
                   <div class="d-flex align-items-center gap-3">
                      <div class="fw-black text-white px-2">{{ i + 1 }}º</div>
                      <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="30" />
                      <div v-else class="text-secondary"><i class="bi bi-globe"></i></div>
                      <div class="d-flex flex-column">
                        <span class="fw-bold">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary">{{ rec.temporada }}</span>
                      </div>
                   </div>
                   <h4 class="m-0 fw-black text-danger">{{ rec.rate }}%</h4>
                </div>
             </div>
          </GamePanel>
        </div>
        
        <!-- Melhores Ataques -->
        <div class="col-md-4">
          <GamePanel>
             <h6 class="text-info fw-bold text-uppercase mb-3"><i class="bi bi-bullseye"></i> Máquina de Gols (Ataque)</h6>
             <div class="d-flex flex-column gap-2">
                <div v-for="(rec, i) in top3Ataques" :key="'atk'+i" class="record-item d-flex justify-content-between bg-black p-2 rounded small">
                   <span class="text-truncate" style="max-width: 140px;">{{ rec.timeNome }} ({{rec.anoCortado}})</span>
                   <span class="fw-black text-info">{{ rec.golsPro }} <small>Gols</small></span>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Melhores Defesas -->
        <div class="col-md-4">
          <GamePanel>
             <h6 class="text-primary fw-bold text-uppercase mb-3"><i class="bi bi-shield-check"></i> Muralha (Menos Gols Sof.)</h6>
             <div class="d-flex flex-column gap-2">
                <div v-for="(rec, i) in top3Defesas" :key="'def'+i" class="record-item d-flex justify-content-between bg-black p-2 rounded small">
                   <span class="text-truncate" style="max-width: 140px;">{{ rec.timeNome }} ({{rec.anoCortado}})</span>
                   <span class="fw-black text-primary">{{ rec.golsContra }} <small>Gols</small></span>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Piores Defesas -->
        <div class="col-md-4">
          <GamePanel>
             <h6 class="text-warning fw-bold text-uppercase mb-3"><i class="bi bi-shield-x"></i> Peneira (Mais Gols Sof.)</h6>
             <div class="d-flex flex-column gap-2">
                <div v-for="(rec, i) in worst3Defesas" :key="'wdef'+i" class="record-item d-flex justify-content-between bg-black p-2 rounded small">
                   <span class="text-truncate" style="max-width: 140px;">{{ rec.timeNome }} ({{rec.anoCortado}})</span>
                   <span class="fw-black text-warning">{{ rec.golsContra }} <small>Gols</small></span>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Menos Derrotas -->
        <div class="col-md-6">
          <GamePanel>
             <h6 class="text-success fw-bold text-uppercase mb-3"><i class="bi bi-shield-fill-check"></i> Intransponíveis (Menos Derrotas)</h6>
             <div class="d-flex flex-column gap-2">
                <div v-for="(rec, i) in top3MenosDerrotas" :key="'mdef'+i" class="record-item d-flex justify-content-between bg-dark border-start border-4 border-success p-2 rounded small">
                   <span class="text-truncate" style="max-width: 140px;">{{ rec.timeNome }} ({{rec.anoCortado}})</span>
                   <span class="fw-black text-success">{{ rec.derrotas }} <small>Derrotas</small> em {{ rec.jogos }} J</span>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Mais Derrotas -->
        <div class="col-md-6">
          <GamePanel>
             <h6 class="text-danger fw-bold text-uppercase mb-3"><i class="bi bi-exclamation-triangle-fill"></i> Saco de Pancadas (Mais Derrotas)</h6>
             <div class="d-flex flex-column gap-2">
                <div v-for="(rec, i) in top3MaisDerrotas" :key="'mder'+i" class="record-item d-flex justify-content-between bg-dark border-start border-4 border-danger p-2 rounded small opacity-75">
                   <span class="text-truncate" style="max-width: 140px;">{{ rec.timeNome }} ({{rec.anoCortado}})</span>
                   <span class="fw-black text-danger">{{ rec.derrotas }} <small>Derrotas</small> em {{ rec.jogos }} J</span>
                </div>
             </div>
          </GamePanel>
        </div>
      </div>
      
      <!-- ABA: AWARDS -->
      <div v-if="activeTab === 'awards'" class="row g-4 px-2">
        <!-- Artilheiros -->
        <div class="col-md-6">
            <GamePanel>
                <h5 class="text-warning fw-bold text-uppercase mb-3"><i class="bi bi-person-badge-fill"></i> Nossos Maiores Artilheiros</h5>
                <div v-if="myTopScorers.length === 0" class="text-center p-4 opacity-50 small">
                    Nenhum artilheiro registrado nos seus times para esta categoria.
                </div>
                <div class="d-flex flex-column gap-2" v-else>
                    <div v-for="(scorer, i) in myTopScorers" :key="'scr'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-4 border-warning">
                        <div class="d-flex align-items-center gap-3">
                            <div class="fw-black text-white px-1">{{ i + 1 }}º</div>
                            <div class="d-flex flex-column">
                                <span class="fw-bold text-uppercase">{{ scorer.nome }}</span>
                                <span class="x-small text-secondary">{{ scorer.clube }} • {{ scorer.temporada }} ({{ scorer.campeonato }})</span>
                            </div>
                        </div>
                        <h4 class="m-0 fw-black text-warning">{{ scorer.gols }} <span class="small opacity-50 fs-6">Gols</span></h4>
                    </div>
                </div>
            </GamePanel>
        </div>

        <!-- Prêmios Individuais (Melhor do Mundo, Europa, etc) -->
        <div class="col-md-6">
            <GamePanel>
                <h5 class="text-info fw-bold text-uppercase mb-3"><i class="bi bi-trophy-fill"></i> Jogadores Premiados Sob Seu Comando</h5>
                <div v-if="myAwardedPlayers.length === 0" class="text-center p-4 opacity-50 small">
                    Nenhum jogador dos seus elencos recebeu prêmios individuais de Destaque até o momento.
                </div>
                <div class="d-flex flex-column gap-2" v-else>
                    <div v-for="(award, i) in myAwardedPlayers" :key="'awd'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-4 border-info">
                        <div class="d-flex align-items-center gap-3">
                            <div class="d-flex flex-column">
                                <span class="fw-bold text-uppercase">{{ award.nome }}</span>
                                <span class="x-small text-info fw-black">{{ award.tipo }} {{ award.posicao !== '1º' ? '('+award.posicao+')' : '' }}</span>
                                <span class="x-small text-secondary">{{ award.season }}</span>
                            </div>
                        </div>
                        <div>
                         <TeamShield v-if="contextType === 'clube'" :teamName="award.clube" :size="30" borderless />
                         <NationalFlag v-if="contextType === 'selecao' || award.nacionalidade" :countryName="award.nacionalidade" :size="30" class="rounded-circle shadow" />
                        </div>
                    </div>
                </div>
            </GamePanel>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import GamePanel from '../components/GamePanel.vue';
import GameButton from '../components/GameButton.vue';
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue';
import TeamShield from '../components/TeamShield.vue';
import NationalFlag from '../components/NationalFlag.vue';
import { awardsStore } from '../services/awards.store';
import { careerStore } from '../services/career.store';
import { seasonStore } from '../services/season.store';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const contextType = ref('clube');
const activeTab = ref('timeline');

const history = computed(() => careerStore.history)

// Configuração do Gráfico
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      reverse: true, // 1º lugar no topo
      min: 1,
      ticks: {
        color: '#aaaaaa',
        stepSize: 1,
        font: { size: 12, weight: 'bold' }
      },
      grid: { color: 'rgba(255, 255, 255, 0.05)' }
    },
    x: {
      ticks: { color: '#eeeeee', font: { size: 11 } },
      grid: { display: false }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      padding: 10,
      displayColors: false,
      callbacks: {
        label: function(context) {
          const point = context.raw;
          return `Pos. ${point.y}º | ${point.time}`;
        }
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
};

const labels = ref([]);
const chartDataPoints = ref([]);

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Posição na Liga',
      data: chartDataPoints.value,
      borderColor: '#39ff14', // Neon Green
      backgroundColor: 'rgba(57, 255, 20, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#39ff14',
      pointRadius: 6,
      pointHoverRadius: 8,
      fill: true,
      tension: 0.3 // Curva suave
    }
  ]
}));

// Retorna apenas a história do tipo ativo
const filteredHistory = computed(() => {
    return (history.value || []).filter(h => h && h.tipo === contextType.value)
})

// Calcula e processa todos os dados das temporadas
const processedSeasons = computed(() => {
    return filteredHistory.value.map(entry => {
        const h = JSON.parse(JSON.stringify(entry));
        
        // Vamos tentar extrair dados exatos (tentiva basica, deve ser aprimorada 
        // usando a mesma lógica de leitura de tabela do CarreiraView se não tiver salvo na hora do entryForm).
        // Se h.liga.jogos for zero, a gente pode extrair da tabela da SeasonStore, mas pra não
        // travar tudo, vamos usar o que tem em h.liga se tiver valor, senao os defaults.
        
        let j = h.liga?.jogos || 0;
        let v = h.liga?.vitorias || 0;
        let e = h.liga?.empates || 0;
        let p = h.liga?.posicao || 0;
        
        const winRate = j > 0 ? (((v + e) / j) * 100).toFixed(1) : 0;
        
        // Posição para Timeline (Fallback agressivo se não achar a posição da liga)
        let posFinal = p;
        if (!posFinal) {
            // Tenta pegar do rankInicio / rankFinal se houver formato numero
            const rfInt = parseInt(h.rankFinal);
            if (!isNaN(rfInt)) posFinal = rfInt;
            else posFinal = 20; // Fallback extremo
        }
        
        // Extrai apenas o ano (ex: "2026") de strings longas
        let shortYear = h.temporada;
        if (shortYear.includes('=')) {
           shortYear = shortYear.split('=')[1].trim()
        } else if (shortYear.includes('/')) {
           shortYear = shortYear.split('/')[1].trim()
        }

        return {
            ...h,
            id: h.id,
            anoCortado: shortYear,
            rate: parseFloat(winRate),
            jogos: j,
            derrotas: h.liga?.derrotas || 0,
            posicaoTimeline: posFinal,
            golsPro: h.liga?.golsPro || 0,
            golsContra: h.liga?.golsContra || 0
        }
    });
});

// Atualiza o Gráfico sempre que a View, Store ou ContextType mudar
watch(processedSeasons, (newList) => {
    // Ordenar a lista cronologicamente
    const sorted = [...newList].sort((a,b) => {
        return parseInt(a.anoCortado) - parseInt(b.anoCortado)
    });

    labels.value = sorted.map(s => s.anoCortado);
    chartDataPoints.value = sorted.map(s => ({
        x: s.anoCortado,
        y: s.posicaoTimeline,
        time: s.timeNome
    }));
}, { immediate: true });


// Top 3 Calculators
const top3WinRates = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 5).sort((a,b) => b.rate - a.rate).slice(0,3);
});

const bottom3WinRates = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 5).sort((a,b) => a.rate - b.rate).slice(0,3);
});

const top3Ataques = computed(() => {
    return [...processedSeasons.value].filter(s => s.golsPro > 0).sort((a,b) => b.golsPro - a.golsPro).slice(0,3);
});

const top3Defesas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos > 0).sort((a,b) => a.golsContra - b.golsContra).slice(0,3);
});

const worst3Defesas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos > 0).sort((a,b) => b.golsContra - a.golsContra).slice(0,3);
});

const top3MenosDerrotas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 5).sort((a,b) => a.derrotas - b.derrotas).slice(0,3);
});

const top3MaisDerrotas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 5).sort((a,b) => b.derrotas - a.derrotas).slice(0,3);
});

const myTopScorers = computed(() => {
    let results = [];
    const historyEntries = filteredHistory.value;
    
    seasonStore.list.forEach(season => {
        // Obter artilheiros da temporada
        const scorers = season.topScorers || (season.artilheiro && season.artilheiro.nome ? [season.artilheiro] : []);
        scorers.forEach(scorer => {
            const scorerTeam = scorer.clube || scorer.clubeArtilheiro;
            
            // Verifica se o user estava gerenciando na mesma temporada e mesmo clube/seleção
            const wasManaging = historyEntries.some(h => {
                const sameSeason = (h.temporada.includes(season.ano) || season.ano.includes(h.temporada));
                const sameTeam = h.timeNome.toLowerCase().trim() === scorerTeam?.toLowerCase().trim();
                return sameSeason && sameTeam;
            });

            if (wasManaging) {
                results.push({
                    nome: scorer.nome,
                    gols: scorer.gols || '?',
                    clube: scorerTeam,
                    temporada: season.ano,
                    campeonato: season.nome // Nome da liga/copa
                });
            }
        });
    });
    
    // Sort by gols descending (limit 5)
    return results.sort((a,b) => (parseInt(b.gols) || 0) - (parseInt(a.gols) || 0)).slice(0, 5);
});

const myAwardedPlayers = computed(() => {
    const historyEntries = filteredHistory.value;
    return awardsStore.list.filter(award => {
        return historyEntries.some(h => {
            // Separa os anos para dar match exato ou flexível
            const hYear = h.temporada;
            const aYear = award.season;
            const sameSeason = (hYear.includes(aYear) || aYear.includes(hYear));
            
            const isTargetTeam = contextType.value === 'clube' ? 
                h.timeNome.toLowerCase().trim() === award.clube?.toLowerCase().trim() : 
                h.timeNome.toLowerCase().trim() === award.nacionalidade?.toLowerCase().trim();

            return sameSeason && isTargetTeam;
        });
    }).sort((a, b) => b.season.localeCompare(a.season));
});

onMounted(async () => {
    await careerStore.loadAll();
    await seasonStore.loadAll();
    await awardsStore.loadAll();
});
</script>

<style scoped>
.tab-navigation .nav-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #888;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-navigation .nav-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.tab-navigation .nav-btn.active {
    background: #17a2b8; /* Info Bootstap */
    color: #000;
    border-color: #17a2b8;
    box-shadow: 0 0 15px rgba(23, 162, 184, 0.4);
}

.record-item {
    transition: transform 0.2s;
}
.record-item:hover {
    transform: translateX(5px);
}
</style>
