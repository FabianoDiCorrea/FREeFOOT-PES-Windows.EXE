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
              <i class="bi bi-bezier2"></i> Histórico de Posições (Apenas Ligas / Divisões)
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
                      <div class="fw-black text-white-50 small pe-1">{{ i + 1 }}º</div>
                      <div class="position-relative">
                         <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="38" />
                         <div v-else class="text-secondary"><i class="bi bi-globe fs-4"></i></div>
                         <NationalFlag :countryName="rec.pais" :size="14" class="position-absolute bottom-0 end-0 border border-dark rounded-circle" v-if="rec.pais" />
                      </div>
                      <div class="d-flex flex-column" style="line-height: 1.2">
                        <span class="fw-bold text-white fs-6">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary fw-bold text-uppercase">{{ normalizeYearStrict(rec.temporada) }}</span>
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
                      <div class="fw-black text-white-50 small pe-1">{{ i + 1 }}º</div>
                      <div class="position-relative">
                         <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="38" />
                         <div v-else class="text-secondary"><i class="bi bi-globe fs-4"></i></div>
                         <NationalFlag :countryName="rec.pais" :size="14" class="position-absolute bottom-0 end-0 border border-dark rounded-circle" v-if="rec.pais" />
                      </div>
                      <div class="d-flex flex-column" style="line-height: 1.2">
                        <span class="fw-bold text-white fs-6">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary fw-bold text-uppercase">{{ normalizeYearStrict(rec.temporada) }}</span>
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
             <div class="d-flex flex-column gap-1">
                <div v-for="(rec, i) in top3Ataques" :key="'atk'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-3 border-info">
                   <div class="d-flex align-items-center gap-2">
                      <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="24" />
                      <NationalFlag :countryName="rec.pais" :size="18" class="shadow-sm rounded-1" />
                      <div class="d-flex flex-column" style="line-height: 1.1">
                        <span class="fw-bold small text-white">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary">{{ normalizeYearStrict(rec.temporada) }}</span>
                      </div>
                   </div>
                   <div class="text-end">
                      <span class="fw-black text-info h5 m-0">{{ rec.golsPro }}</span>
                      <div class="x-small text-secondary fw-bold opa-50" style="font-size: 0.5rem">GOLS</div>
                   </div>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Melhores Defesas -->
        <div class="col-md-4">
          <GamePanel>
             <h6 class="text-primary fw-bold text-uppercase mb-3"><i class="bi bi-shield-check"></i> Muralha (Menos Gols Sof.)</h6>
             <div class="d-flex flex-column gap-1">
                <div v-for="(rec, i) in top3Defesas" :key="'def'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-3 border-primary">
                   <div class="d-flex align-items-center gap-2">
                      <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="24" />
                      <NationalFlag :countryName="rec.pais" :size="18" class="shadow-sm rounded-1" />
                      <div class="d-flex flex-column" style="line-height: 1.1">
                        <span class="fw-bold small text-white">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary">{{ normalizeYearStrict(rec.temporada) }}</span>
                      </div>
                   </div>
                   <div class="text-end">
                      <span class="fw-black text-primary h5 m-0">{{ rec.golsContra }}</span>
                      <div class="x-small text-secondary fw-bold opa-50" style="font-size: 0.5rem">SOFRIDOS</div>
                   </div>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Piores Defesas -->
        <div class="col-md-4">
          <GamePanel>
             <h6 class="text-warning fw-bold text-uppercase mb-3"><i class="bi bi-shield-x"></i> Peneira (Mais Gols Sof.)</h6>
             <div class="d-flex flex-column gap-1">
                <div v-for="(rec, i) in worst3Defesas" :key="'wdef'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-3 border-warning opacity-75">
                   <div class="d-flex align-items-center gap-2">
                      <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="24" />
                      <NationalFlag :countryName="rec.pais" :size="18" class="shadow-sm rounded-1" />
                      <div class="d-flex flex-column" style="line-height: 1.1">
                        <span class="fw-bold small text-white">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary">{{ normalizeYearStrict(rec.temporada) }}</span>
                      </div>
                   </div>
                   <div class="text-end">
                      <span class="fw-black text-warning h5 m-0">{{ rec.golsContra }}</span>
                      <div class="x-small text-secondary fw-bold opa-50" style="font-size: 0.5rem">SOFRIDOS</div>
                   </div>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Menos Derrotas -->
        <div class="col-md-6">
          <GamePanel>
             <h6 class="text-success fw-bold text-uppercase mb-3"><i class="bi bi-shield-fill-check"></i> Intransponíveis (Menos Derrotas)</h6>
             <div class="d-flex flex-column gap-1">
                <div v-for="(rec, i) in top3MenosDerrotas" :key="'mdef'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-3 border-success">
                   <div class="d-flex align-items-center gap-2">
                      <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="24" />
                      <NationalFlag :countryName="rec.pais" :size="18" class="shadow-sm rounded-1" />
                      <div class="d-flex flex-column" style="line-height: 1.1">
                        <span class="fw-bold small text-white">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary">{{ normalizeYearStrict(rec.temporada) }}</span>
                      </div>
                   </div>
                   <div class="text-end">
                      <span class="fw-black text-success h5 m-0">{{ rec.derrotas }}</span>
                      <div class="x-small text-secondary fw-bold opa-50" style="font-size: 0.5rem">D em {{ rec.jogos }} J</div>
                   </div>
                </div>
             </div>
          </GamePanel>
        </div>

        <!-- Mais Derrotas -->
        <div class="col-md-6">
          <GamePanel>
             <h6 class="text-danger fw-bold text-uppercase mb-3"><i class="bi bi-exclamation-triangle-fill"></i> Saco de Pancadas (Mais Derrotas)</h6>
             <div class="d-flex flex-column gap-1">
                <div v-for="(rec, i) in top3MaisDerrotas" :key="'mder'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-3 border-danger opacity-75">
                   <div class="d-flex align-items-center gap-2">
                      <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="24" />
                      <NationalFlag :countryName="rec.pais" :size="18" class="shadow-sm rounded-1" />
                      <div class="d-flex flex-column" style="line-height: 1.1">
                        <span class="fw-bold small text-white">{{ rec.timeNome }}</span>
                        <span class="x-small text-secondary">{{ normalizeYearStrict(rec.temporada) }}</span>
                      </div>
                   </div>
                   <div class="text-end">
                      <span class="fw-black text-danger h5 m-0">{{ rec.derrotas }}</span>
                      <div class="x-small text-secondary fw-bold opa-50" style="font-size: 0.5rem">D em {{ rec.jogos }} J</div>
                   </div>
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
                <div class="d-flex flex-column gap-1" v-else>
                    <div v-for="(scorer, i) in myTopScorers" :key="'scr'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-3 border-warning">
                        <div class="d-flex align-items-center gap-3">
                            <div class="fw-black text-white-50 small pe-1">{{ i + 1 }}º</div>
                            <div class="position-relative">
                               <TeamShield v-if="contextType === 'clube'" :teamName="scorer.clube" :size="32" borderless />
                               <div v-else class="text-secondary"><i class="bi bi-person-badge fs-4"></i></div>
                               <NationalFlag :countryName="scorer.pais" :size="12" class="position-absolute bottom-0 end-0 border border-dark rounded-circle" v-if="scorer.pais" />
                            </div>
                            <div class="d-flex flex-column" style="line-height: 1.1">
                                <span class="fw-bold text-white fs-6 uppercase">{{ scorer.nome }}</span>
                                <span class="x-small text-secondary fw-bold text-uppercase">{{ scorer.clube }} • {{ scorer.campeonato }} ({{ normalizeYearStrict(scorer.temporada) }})</span>
                            </div>
                        </div>
                        <div class="text-end">
                            <h4 class="m-0 fw-black text-warning">{{ scorer.gols }}</h4>
                            <div class="x-small text-secondary fw-bold opa-50" style="font-size: 0.5rem">GOLS</div>
                        </div>
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
                <div class="d-flex flex-column gap-1" v-else>
                    <div v-for="(award, i) in myAwardedPlayers" :key="'awd'+i" class="record-item d-flex align-items-center justify-content-between p-2 rounded bg-dark border-start border-3 border-info">
                        <div class="d-flex align-items-center gap-3">
                            <div class="position-relative">
                               <TeamShield v-if="contextType === 'clube'" :teamName="award.clube" :size="32" borderless />
                               <NationalFlag v-if="contextType === 'selecao' || award.nacionalidade" :countryName="award.nacionalidade" :size="12" class="position-absolute bottom-0 end-0 border border-dark rounded-circle" />
                            </div>
                            <div class="d-flex flex-column" style="line-height: 1.1">
                                <span class="fw-bold text-white fs-6 uppercase">{{ award.nome }}</span>
                                <span class="x-small text-info fw-black text-uppercase">{{ award.tipo }} {{ award.posicao !== '1º' ? '('+award.posicao+')' : '' }}</span>
                                <span class="x-small text-secondary fw-bold">{{ normalizeYearStrict(award.season) }}</span>
                            </div>
                        </div>
                        <div class="text-end text-info opacity-75">
                           <i class="bi bi-award fs-3"></i>
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
import { clubStore } from '../services/club.store';

import { dataSearchService } from '../services/dataSearch.service';
import { FEDERATIONS_DATA } from '../services/federations.data';
import { normalizeYearStrict, normalizeString, clubSmartNormalize } from '../services/utils';

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
      // Se a pior posição for maior que 20, o Chart.js ajusta, senão fica no máximo 20 para visual limpo
      suggestedMax: 20,
      ticks: {
        color: '#aaaaaa',
        stepSize: 1,
        font: { size: 12, weight: 'bold' },
        callback: function(value) {
          return value + 'º';
        }
      },
      grid: { 
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      }
    },
    x: {
      ticks: { 
        color: '#eeeeee', 
        font: { size: 10, weight: 'bold' },
        maxRotation: 45,
        minRotation: 45
      },
      grid: { display: false }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false, // Desabilitar o padrão para usar o customizado HTML
      external: function(context) {
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');

        // Create element on first render
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<table></table>';
            document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        const tooltipModel = context.tooltip;
        if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        // Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
            tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
            return bodyItem.lines;
        }

        // Set Text
        if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const dataPoint = tooltipModel.dataPoints[0].raw;
            const country = dataPoint.pais;
            const teamName = dataPoint.time;
            const fullSeason = normalizeYearStrict(dataPoint.temporadaLonga);
            
            // Busca a bandeira e o escudo
            let flagUrl = '';
            let shieldUrl = '';
            const searchCountry = country?.trim() || '';
            
            const club = dataSearchService.findClub(teamName);
            if (club?.escudo_url) shieldUrl = club.escudo_url;

            if (searchCountry) {
                // 1. Tenta Federação
                let fed = FEDERATIONS_DATA[searchCountry];
                if (!fed) fed = Object.values(FEDERATIONS_DATA).find(f => f.nome === searchCountry);
                
                if (fed) {
                    flagUrl = fed.logo;
                } else {
                    // 2. Tenta pela Seleção
                    const nameForSearch = searchCountry === 'Estados Unidos' ? 'USA' : searchCountry;
                    const nt = dataSearchService.findNationalTeam(nameForSearch);
                    if (nt?.bandeira_url) {
                        flagUrl = nt.bandeira_url;
                    } else {
                        // 3. Tenta pelo Clube se for o time do ponto
                        const club = dataSearchService.findClub(teamName);
                        if (club?.bandeira_url) flagUrl = club.bandeira_url;
                    }
                }
            }

            let innerHtml = '<div class="premium-tooltip">';

            titleLines.forEach(function(title) {
                innerHtml += `<div class="tooltip-title">${fullSeason}</div>`;
            });

            innerHtml += '<div class="tooltip-content">';
            
            // Layout Premium com Escudo (LIVRE) e Bandeira (REDONDA)
            innerHtml += `
                <div class="tooltip-row">
                    <span class="tooltip-icon">🏆</span>
                    <span class="tooltip-label">POSIÇÃO:</span>
                    <span class="tooltip-value highlight">${dataPoint.y}º</span>
                </div>
                <div class="tooltip-row align-items-center">
                    <span class="tooltip-icon" style="min-width: 52px">
                        ${shieldUrl ? `<img src="${shieldUrl}" class="tooltip-shield">` : (flagUrl ? `<img src="${flagUrl}" class="tooltip-flag-round" style="width: 48px; height: 48px;">` : '⚽')}
                    </span>
                    <div class="d-flex flex-column" style="margin-left: 8px">
                        <span class="tooltip-label x-small" style="font-size: 0.6rem; opacity: 0.6">TIME:</span>
                        <span class="tooltip-value" style="font-size: 1.1rem; line-height: 1">${dataPoint.time} </span>
                        ${country && flagUrl ? `<div class="d-flex align-items-center gap-1 mt-1"><img src="${flagUrl}" class="tooltip-flag-round" style="width:20px; height:20px"> <span class="x-small opacity-50 text-uppercase fw-bold" style="font-size: 0.65rem">${country}</span></div>` : ''}
                    </div>
                </div>
                <div class="tooltip-row mt-2" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px">
                    <span class="tooltip-icon">📊</span>
                    <span class="tooltip-label">COMPETIÇÃO:</span>
                    <span class="tooltip-value" style="color: #ffcc00; font-weight: 900; text-transform: uppercase;">${dataPoint.compName}</span>
                </div>
                <div class="tooltip-glow"></div>
            `;

            innerHtml += '</div></div>';

            tooltipEl.innerHTML = innerHtml;
        }

        tooltipEl.style.opacity = 1;
        tooltipEl.style.position = 'absolute';
        
        const position = context.chart.canvas.getBoundingClientRect();
        const tooltipWidth = 280; // Aumentado para acomodar nomes de ligas longos
        const viewportWidth = window.innerWidth;
        
        let left = position.left + window.pageXOffset + tooltipModel.caretX;
        
        // Ajuste inteligente para evitar cortes nas bordas (Left/Right)
        if (left < (tooltipWidth / 2) + 20) {
            left = (tooltipWidth / 2) + 20;
        } else if (left > viewportWidth - (tooltipWidth / 2) - 20) {
            left = viewportWidth - (tooltipWidth / 2) - 20;
        }

        tooltipEl.style.left = left + 'px';
        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
        tooltipEl.style.fontFamily = tooltipModel.options.bodyFont.family;
        tooltipEl.style.fontSize = tooltipModel.options.bodyFont.size + 'px';
        tooltipEl.style.fontStyle = tooltipModel.options.bodyFont.style;
        tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.zIndex = '9999';
        tooltipEl.style.transform = 'translate(-50%, -105%)';
        tooltipEl.style.transition = 'all 0.1s ease';
      }
    }
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
    axis: 'x'
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
      borderColor: '#ffcc00', // Yellow Neon / Gold
      backgroundColor: 'rgba(255, 204, 0, 0.15)',
      borderWidth: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#ffcc00',
      pointRadius: 6,
      pointHoverRadius: 10,
      pointHoverBackgroundColor: '#ffcc00',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3,
      fill: true,
      tension: 0.4,
      spanGaps: true
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
        
        let j = h.liga?.jogos || 0;
        let v = h.liga?.vitorias || 0;
        let e = h.liga?.empates || 0;
        let p = h.liga?.posicao || 0;
        let gp = h.liga?.golsPro || 0;
        let gc = h.liga?.golsContra || 0;

        // Busca agressiva pelo nome real da competição (mesmo que j > 0)
        let realCompName = h.liga?.nome || '';
        const searchYear = h.temporada; // ex: "2027" ou "2026 / 2027 = 2027"

        if ((!realCompName || realCompName.toLowerCase() === 'liga') && seasonStore.list.length > 0) {
            const hYearNorm = normalizeYearStrict(h.temporada);
            const hTimeNorm = normalizeString(h.timeNome);

            const matching = seasonStore.list.find(s => {
                const sYearNorm = normalizeYearStrict(s.ano);
                if (sYearNorm !== hYearNorm) return false;

                const sTabelaNorm = normalizeString(s.tabela || '');
                return sTabelaNorm.includes(hTimeNorm);
            });
            
            if (matching) {
                realCompName = matching.competitionName;
                if (!h.liga) h.liga = {};
                h.liga.nome = matching.competitionName;
            }
        }

        // Tentar preencher estatísticas se estiverem vazias
        if (j === 0 && seasonStore.list.length > 0) {
            const timeNome = h.timeNome;
            const temporada = h.temporada;
            const matching = seasonStore.list.find(s => 
                (normalizeYearStrict(s.ano) === normalizeYearStrict(temporada)) && 
                s.tabela && s.tabela.toLowerCase().includes(timeNome.toLowerCase())
            );
            if (matching) {
                const lines = matching.tabela.split('\n');
                const teamLine = lines.find(l => l.toLowerCase().includes(timeNome.toLowerCase()));
                if (teamLine) {
                    const parts = teamLine.replace(/[^\w\s\d]/g, ' ').trim().split(/\s+/);
                    const numbers = parts.filter(p => !isNaN(parseInt(p)) && p !== '').map(p => parseInt(p));
                    if (numbers.length >= 8) {
                        p = lines.indexOf(teamLine) + 1;
                        for (let i = 1; i < numbers.length - 2; i++) {
                             if (numbers[i-1] === numbers[i] + numbers[i+1] + (numbers[i+2] || 0)) {
                                 j = numbers[i-1];
                                 v = numbers[i];
                                 e = numbers[i+1];
                                 // Extração de Gols (GP e GC costumam vir após D nos datasets padrão)
                                 // Buscamos GP e GC (dois números seguintes após Derrotas)
                                 if (numbers[i+3] !== undefined) gp = numbers[i+3];
                                 if (numbers[i+4] !== undefined) gc = numbers[i+4];
                                 break;
                             }
                        }
                        // Fallback se não achou GP/GC via checksum J=V+E+D
                        if (gp === 0 && gc === 0 && numbers.length >= 8) {
                            gp = numbers[numbers.length - 4] || 0;
                            gc = numbers[numbers.length - 3] || 0;
                        }
                    }
                }
            }
        }

        // Lookup de País automático se estiver vazio
        let finalPais = h.pais || '';
        if (!finalPais && clubStore.list.length > 0) {
            const clubInfo = clubStore.list.find(c => c.nome.toLowerCase() === h.timeNome.toLowerCase());
            if (clubInfo) finalPais = clubInfo.pais;
        }

        const winRate = j > 0 ? (((v + e) / j) * 100).toFixed(1) : 0;
        
        // Posição: Sincronizada > Rank Final manual
        const finalP = p || parseInt(h.rankFinal) || 0;

        // Verificar se a competição é realmente uma liga/divisão
        const compNome = (realCompName || h.liga?.nome || (finalP ? 'Liga' : '')).toLowerCase();
        const isLiga = compNome.match(/liga|serie|série|division|ligue|bundesliga|premiership|primera|eredivisie|primeira|campeonato|eliminatórias|brasileirão|camp/);
        
        let posFinal = (isLiga && finalP) ? finalP : null; 
        
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
            pais: finalPais,
            anoCortado: shortYear,
            rate: parseFloat(winRate),
            jogos: j,
            derrotas: h.liga?.derrotas || (j - v - e) || 0,
            posicaoTimeline: posFinal,
            golsPro: gp,
            golsContra: gc
        }
    });
});

// Atualiza o Gráfico sempre que a View, Store ou Qualquer dado de Universo mudar
watch([processedSeasons, () => seasonStore.list], ([newList, seasonList]) => {
    // Ordenar a lista cronologicamente
    const sorted = [...newList].sort((a,b) => {
        return parseInt(a.anoCortado) - parseInt(b.anoCortado)
    });

    const normalizedLabels = sorted.map(s => normalizeYearStrict(s.temporada));
    labels.value = normalizedLabels;
    chartDataPoints.value = sorted.map((s, idx) => {
        // Encontrar o nome real da competição se o store estiver vivo
        let realCompName = s.liga?.nome;
        const normYear = normalizedLabels[idx];
        
        if (!realCompName || realCompName.toLowerCase() === 'liga') {
            const hYearNorm = normalizeYearStrict(s.temporada);
            const hTimeNorm = normalizeString(s.timeNome);

            const match = seasonStore.list.find(season => {
                const sYearNorm = normalizeYearStrict(season.ano);
                if (sYearNorm !== hYearNorm) return false;

                // Match de Time: Busca exata ou parcial normalizada na tabela
                const sTabelaNorm = normalizeString(season.tabela || '');
                return sTabelaNorm.includes(hTimeNorm);
            });
            if (match) realCompName = match.competitionName;
        }

        return {
            x: normYear,
            y: s.posicaoTimeline,
            time: s.timeNome,
            compName: realCompName || s.liga?.nome || 'Liga',
            pais: s.pais,
            temporadaLonga: s.temporada
        };
    });
}, { immediate: true });


// Top 3 Calculators
const top3WinRates = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => b.rate - a.rate).slice(0,3);
});

const bottom3WinRates = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => a.rate - b.rate).slice(0,3);
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
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => a.derrotas - b.derrotas).slice(0,3);
});

const top3MaisDerrotas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => b.derrotas - a.derrotas).slice(0,3);
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
            const managerEntry = historyEntries.find(h => {
                const sameSeason = (h.temporada.includes(season.ano) || season.ano.includes(h.temporada));
                const sameTeam = h.timeNome.toLowerCase().trim() === scorerTeam?.toLowerCase().trim();
                return sameSeason && sameTeam;
            });

            if (managerEntry) {
                results.push({
                    nome: scorer.nome,
                    gols: scorer.gols || '?',
                    clube: scorerTeam,
                    pais: managerEntry.pais,
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
    await clubStore.init(); // O método correto é init(), não loadAll()
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

<style>
/* Custom Tooltip Styles (Global for ChartJS) */
#chartjs-tooltip {
    pointer-events: none;
    z-index: 10000;
    transition: opacity 0.2s ease;
}

.premium-tooltip {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%);
    border: 1px solid rgba(255, 204, 0, 0.4);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 204, 0, 0.1);
    border-radius: 8px;
    min-width: 220px;
    max-width: 300px;
    overflow: hidden;
    color: #fff;
    backdrop-filter: blur(5px);
}

.tooltip-title {
    background: rgba(255, 204, 0, 0.1);
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 204, 0, 0.2);
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 1px;
    color: #ffcc00;
    text-transform: uppercase;
    font-family: 'Outfit', 'Inter', sans-serif;
}

.tooltip-content {
    padding: 12px;
    position: relative;
    font-family: 'Outfit', 'Inter', sans-serif;
}

.tooltip-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.tooltip-row:last-child {
    margin-bottom: 0;
}

.tooltip-icon {
    width: 20px;
    display: flex;
    justify-content: center;
    font-size: 1.1rem;
}

.tooltip-shield {
    width: 48px;
    height: 48px;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));
}

.tooltip-flag-round {
    width: 20px;
    height: 20px;
    object-fit: cover;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
}

.tooltip-label {
    font-size: 0.65rem;
    color: #888;
    font-weight: 800;
    text-transform: uppercase;
    white-space: nowrap;
}

.tooltip-value {
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tooltip-value.highlight {
    color: #ffcc00;
    font-size: 1.1rem;
    font-weight: 900;
    text-shadow: 0 0 8px rgba(255, 204, 0, 0.3);
}

.tooltip-glow {
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: radial-gradient(circle at top right, rgba(255, 204, 0, 0.08) 0%, transparent 70%);
}
</style>
