<template>
  <div class="view-container">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-outline-secondary btn-sm" @click="$router.back()">
          <i class="bi bi-arrow-left"></i> VOLTAR
        </button>
        <h2 class="m-0 text-info"><i class="bi bi-bar-chart-fill me-2"></i>ESTATÍSTICAS: {{ clubName }}</h2>

        <!-- Aba extraída -->
      </div>
      <LogoFREeFOOT />
    </div>

    <div v-if="processedSeasons.length === 0" class="text-center p-5 opacity-50">
      <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
      <h4>Nenhum dado encontrado para {{ clubName }}</h4>
      <p>Nenhuma temporada com dados deste clube foi localizada no Universo atual.</p>
    </div>

    <div v-else class="dashboard-wrapper">
      <!-- Abas Internas -->
      <div class="d-flex gap-3 mb-4 px-2 tab-navigation flex-wrap">
        <button class="nav-btn" :class="{ active: activeTab === 'timeline' }" @click="activeTab = 'timeline'">
          <i class="bi bi-graph-up me-2"></i>LIGAS (POSIÇÕES)
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'timeline-copas' }" @click="activeTab = 'timeline-copas'">
          <i class="bi bi-trophy-fill me-2"></i>COPAS NACIONAIS
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'timeline-inter' }" @click="activeTab = 'timeline-inter'">
          <i class="bi bi-globe-americas me-2"></i>COMPETIÇÕES INT.
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'records' }" @click="activeTab = 'records'">
          <i class="bi bi-star-fill me-2"></i>RECORDES & CAMPANHAS
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'awards' }" @click="activeTab = 'awards'">
          <i class="bi bi-award-fill me-2"></i>DESTAQUES & PRÊMIOS
        </button>
      </div>

      <!-- ABA: TIMELINE -->
      <div v-if="activeTab === 'timeline'" class="row g-4 px-2">
        <div class="col-12">
          <GamePanel>
            <h4 class="text-warning text-uppercase fw-bold mb-4">
              <i class="bi bi-bezier2"></i> Histórico de Posições (Apenas Ligas / Divisões)
            </h4>
            
            <!-- Altura ajustada de 400 para 450 para caber os 20 números com folga e padding -->
            <div class="chart-scroll-wrapper custom-scrollbar" style="overflow-x: auto; width: 100%; height: 450px; position: relative;">
              <div class="mx-auto" style="min-width: 100%; height: 100%;" v-if="chartData.labels.length > 0">
                <Line :data="chartData" :options="chartOptions" />
              </div>
            </div>

            <!-- Legenda de Cores -->
            <div class="d-flex justify-content-center gap-4 mt-3 flex-wrap">
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffcc00; border: 2px solid #d4af37;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série A / Principal</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #00ff44; border: 2px solid #008822;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série B / Acesso</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff4444; border: 2px solid #aa0000;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Rebaixamento</span>
                </div>
                <div class="d-flex align-items-center gap-2" v-if="chartDataPoints.some(p => p.lineColor === '#0033ff')">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #0033ff; border: 2px solid #0011aa;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série C</span>
                </div>
                <div class="d-flex align-items-center gap-2" v-if="chartDataPoints.some(p => p.lineColor === '#00f2ff')">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #00f2ff; border: 2px solid #00a8ff;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série D</span>
                </div>
            </div>
            <div v-if="chartData.labels.length === 0" class="text-center p-5 opacity-50">
              Gerando gráfico...
            </div>
          </GamePanel>
        </div>
      </div>

      <!-- ABA: TIMELINE COPAS NACIONAIS -->
      <div v-if="activeTab === 'timeline-copas'" class="row g-4 px-2 animate-slide-up">
        <div class="col-12">
          <GamePanel>
            <h4 class="text-info text-uppercase fw-bold mb-4">
              <i class="bi bi-trophy-fill"></i> Histórico de Copas (Apenas Copas Nacionais)
            </h4>
            
            <!-- Altura ajustada de 400 para 450 para caber os 8 números com folga e padding -->
            <div class="chart-scroll-wrapper custom-scrollbar" style="overflow-x: auto; width: 100%; height: 450px; position: relative;">
              <div class="mx-auto" style="min-width: 100%; height: 100%;" v-if="chartDataCopas.labels.length > 0">
                <Line :data="chartDataCopas" :options="chartOptionsCopas" />
              </div>
            </div>
            <div v-if="chartDataCopas.labels.length === 0" class="text-center p-5 opacity-50">
              Sem dados de copas encontrados nesta carreira.
            </div>
          </GamePanel>
        </div>
      </div>

      <!-- ABA: TIMELINE INTERNACIONAIS -->
      <div v-if="activeTab === 'timeline-inter'" class="row g-4 px-2 animate-slide-up">
        <div v-if="interCharts.length === 0" class="col-12 text-center p-5 opacity-50">
          <GamePanel>
            Sem participações em torneios internacionais nesta carreira.
          </GamePanel>
        </div>
        <div v-for="(chart, idx) in interCharts" :key="idx" class="col-12">
          <GamePanel>
            <h4 class="text-white text-uppercase fw-bold mb-4">
              <i class="bi bi-globe-americas" :style="{ color: chart.color }"></i> {{ chart.title }}
            </h4>
            
            <div class="chart-scroll-wrapper custom-scrollbar" style="overflow-x: auto; width: 100%; height: 450px; position: relative;">
              <div class="mx-auto" style="min-width: 100%; height: 100%;">
                <Line :data="chart.data" :options="chart.options" />
              </div>
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
import { useRoute } from 'vue-router';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import GamePanel from '../components/GamePanel.vue';
import GameButton from '../components/GameButton.vue';
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue';
import TeamShield from '../components/TeamShield.vue';
import NationalFlag from '../components/NationalFlag.vue';
import { awardsStore } from '../services/awards.store';
import { seasonStore } from '../services/season.store';
import { clubStore } from '../services/club.store';

import { dataSearchService } from '../services/dataSearch.service';
import { FEDERATIONS_DATA } from '../services/federations.data';
import { normalizeYearStrict, normalizeString, clubSmartNormalize } from '../services/utils';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const route = useRoute();
const clubName = ref(decodeURIComponent(route.params.id || ''));
const contextType = ref('clube');
const activeTab = ref('timeline');

// Configuração do Gráfico
// Definição Customizada do Tooltip para ser reaproveitado em ambos os gráficos
const customTooltipExternal = function(context) {
    let tooltipEl = document.getElementById('chartjs-tooltip');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.innerHTML = '<table></table>';
        document.body.appendChild(tooltipEl);
    }

    const tooltipModel = context.tooltip;
    if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltipModel.yAlign) {
        tooltipEl.classList.add(tooltipModel.yAlign);
    } else {
        tooltipEl.classList.add('no-transform');
    }

    if (tooltipModel.body) {
        const titleLines = tooltipModel.title || [];
        const dataPoint = tooltipModel.dataPoints[0].raw;
        const country = dataPoint.pais;
        const teamName = dataPoint.time;
        const fullSeason = normalizeYearStrict(dataPoint.temporadaLonga);
        
        let flagUrl = '';
        let shieldUrl = '';
        const searchCountry = country?.trim() || '';
        
        const club = dataSearchService.findClub(teamName);
        if (club?.escudo_url) shieldUrl = club.escudo_url;

        if (searchCountry) {
            let fed = FEDERATIONS_DATA[searchCountry];
            if (!fed) fed = Object.values(FEDERATIONS_DATA).find(f => f.nome === searchCountry);
            
            if (fed) {
                flagUrl = fed.logo;
            } else {
                const nameForSearch = searchCountry === 'Estados Unidos' ? 'USA' : searchCountry;
                const nt = dataSearchService.findNationalTeam(nameForSearch);
                if (nt?.bandeira_url) {
                    flagUrl = nt.bandeira_url;
                } else {
                    const club = dataSearchService.findClub(teamName);
                    if (club?.bandeira_url) flagUrl = club.bandeira_url;
                }
            }
        }

        const pos = parseInt(dataPoint.y);
        const isRebaixado = dataPoint.isRebaixado;
        
        let rankIcon = '⚽';
        let rankColor = '#ffcc00';
        
        if (pos === 1) {
            rankIcon = '🏆';
            rankColor = '#ffcc00'; // Dourado
        } else if (pos === 2) {
            rankIcon = '🥈';
            rankColor = '#c0c0c0'; // Prata
        } else if (isRebaixado) {
            rankIcon = '🔴';
            rankColor = '#ff4444'; // Vermelho
        } else {
            rankIcon = '⚽';
            rankColor = '#ffffff'; // Branco/Normal
        }

        const rankText = dataPoint.faseLabel ? dataPoint.faseLabel : (pos + 'º');

        let innerHtml = '<div class="premium-tooltip">';

        titleLines.forEach(function(title) {
            innerHtml += `<div class="tooltip-title" style="border-color: ${rankColor}44">${fullSeason}</div>`;
        });

        innerHtml += '<div class="tooltip-content">';
        
        innerHtml += `
            <div class="tooltip-row">
                <span class="tooltip-icon">${rankIcon}</span>
                <span class="tooltip-label">POSIÇÃO:</span>
                <span class="tooltip-value highlight" style="font-size: 1.1rem; color: ${rankColor}">${rankText.toUpperCase()}</span>
            </div>
            <div class="tooltip-row align-items-center">
                <span class="tooltip-icon" style="min-width: 52px">
                    ${shieldUrl ? '<img src="' + shieldUrl + '" class="tooltip-shield">' : (flagUrl ? '<img src="' + flagUrl + '" class="tooltip-flag-round" style="width: 48px; height: 48px;">' : '⚽')}
                </span>
                <div class="d-flex flex-column" style="margin-left: 8px">
                    <span class="tooltip-label x-small" style="font-size: 0.6rem; opacity: 0.6">TIME:</span>
                    <span class="tooltip-value" style="font-size: 1.1rem; line-height: 1">${dataPoint.time} </span>
                    ${country && flagUrl ? '<div class="d-flex align-items-center gap-1 mt-1"><img src="' + flagUrl + '" class="tooltip-flag-round" style="width:20px; height:20px"> <span class="x-small opacity-50 text-uppercase fw-bold" style="font-size: 0.65rem">' + country + '</span></div>' : ''}
                </div>
            </div>
            <div class="tooltip-row mt-2" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px">
                <span class="tooltip-icon">📊</span>
                <span class="tooltip-label">COMPETIÇÃO:</span>
                <span class="tooltip-value" style="color: ${rankColor}; font-weight: 900; text-transform: uppercase;">${dataPoint.compName}</span>
            </div>
            <div class="tooltip-glow" style="background: radial-gradient(circle at top right, ${rankColor}15 0%, transparent 70%)"></div>
        `;

        innerHtml += '</div></div>';

        tooltipEl.innerHTML = innerHtml;
    }

    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = 'absolute';
    
    const position = context.chart.canvas.getBoundingClientRect();
    const tooltipWidth = 280; 
    const viewportWidth = window.innerWidth;
    
    let left = position.left + window.pageXOffset + tooltipModel.caretX;
    
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
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  clip: false, // Impede que os pontos cortem a bolinha no limite do chart
  layout: {
    padding: { top: 30, bottom: 20, left: 10, right: 10 }
  },
  scales: {
    y: {
      reverse: true, // 1º lugar no topo
      min: 1,
      // Se a pior posição for maior que 20, o Chart.js ajusta, senão fica no máximo 20 para visual limpo
      suggestedMax: 20,
      ticks: {
        color: '#aaaaaa',
        stepSize: 1,
        autoSkip: false, // Força a exibir sempre todos os números de 1 a 20 e não pular (2,4,6)
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
      offset: true,
      ticks: { 
        color: '#eeeeee', 
        font: { size: 10, weight: 'bold' },
        maxRotation: 45,
        minRotation: 45
      },
      grid: { 
         display: true,
         color: (context) => {
            if (context.tick && typeof context.tick.label === 'string' && context.tick.label.trim() === '') {
                return 'transparent';
            }
            return 'rgba(255, 255, 255, 0.1)';
         }
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false, // Desabilitar o padrão para usar o customizado HTML
      external: customTooltipExternal
    }
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
    axis: 'x'
  },
};

const chartOptionsCopas = {
  responsive: true,
  maintainAspectRatio: false,
  clip: false,
  layout: {
    padding: { top: 30, bottom: 30, left: 10, right: 10 }
  },
  scales: {
    y: {
      reverse: true,
      min: 1,
      suggestedMax: 8,
      ticks: {
        color: '#00f2ff', // Cyan theme for Cups
        stepSize: 1,
        autoSkip: false,
        font: { size: 10, weight: 'bold' },
        callback: function(value) {
          const map = { 1: '🏆 CAMPEÃO', 2: '🥈 VICE', 3: 'SEMI', 4: 'QUARTAS', 5: 'OITAVAS', 6: '16 AVOS', 7: 'GRUPOS', 8: 'PRÉ-COPA' };
          return map[value] || '';
        }
      },
      grid: { 
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      }
    },
    x: {
      offset: true,
      ticks: { 
        color: '#eeeeee', 
        font: { size: 10, weight: 'bold' },
        maxRotation: 45,
        minRotation: 45
      },
      grid: { 
         display: true,
         color: (context) => {
            if (context.tick && typeof context.tick.label === 'string' && context.tick.label.trim() === '') return 'transparent';
            return 'rgba(255, 255, 255, 0.1)';
         }
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
      external: customTooltipExternal
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
const chartDataPointBackgrounds = ref([]);
const chartDataPointBorders = ref([]);
const chartDataPointsCopas = ref([]);

const getLeagueColors = (ligaName, isRebaixado = false) => {
    if (isRebaixado) return { bg: '#ff4444', border: '#aa0000' }; // Vermelho para rebaixados
    if (!ligaName || ligaName === 'Sem Liga') return { bg: '#fff', border: '#ffcc00' };
    
    const name = ligaName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Divisões Inferiores (Série C, D, League One, League Two, etc)
    if (name.includes('serie d') || name.includes('4a') || name.includes('quarta') || name.includes('league two') || name.includes('division 4') || name.endsWith(' d')) {
        return { bg: '#00f2ff', border: '#00a8ff' }; // Azul Claro
    }
    if (name.includes('serie c') || name.includes('3a') || name.includes('terceira') || name.includes('league one') || name.includes('division 3') || name.includes('national') || name.endsWith(' c')) {
        return { bg: '#0033ff', border: '#0011aa' }; // Azul Escuro
    }
    
    // Segunda Divisão (Série B, Primera Nacional, Championship, etc)
    if (name.includes('serie b') || name.includes('2a') || name.includes('segunda') || name.includes('nacional') || name.includes('championship') || name.includes('2. bundesliga') || name.includes('division 2') || name.includes('ligue 2') || name.endsWith(' b')) {
        return { bg: '#00ff44', border: '#008822' }; // Verde
    }
    
    // Primeira Divisão / Padrão
    return { bg: '#ffcc00', border: '#d4af37' }; // Amarelo/Dourado
}

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Posição na Liga',
      data: chartDataPoints.value,
      borderColor: (context) => {
          // No Chart.js 4, para Line chart, o borderColor pode ser uma função de segmento
          return '#ffcc00';
      },
      segment: {
        borderColor: (ctx) => {
            const p1 = ctx.p1.raw;
            return p1.isRebaixado ? '#ff4444' : p1.lineColor || '#ffcc00';
        },
        backgroundColor: (ctx) => {
            const p1 = ctx.p1.raw;
            return p1.isRebaixado ? 'rgba(255, 68, 68, 0.15)' : (p1.lineColor ? p1.lineColor + '26' : 'rgba(255, 204, 0, 0.15)');
        }
      },
      borderWidth: 5,
      pointBackgroundColor: chartDataPointBackgrounds.value.length ? chartDataPointBackgrounds.value : '#fff',
      pointBorderColor: chartDataPointBorders.value.length ? chartDataPointBorders.value : '#ffcc00',
      pointRadius: 8,
      pointHoverRadius: 10,
      pointHoverBackgroundColor: (ctx) => ctx.raw.pointColor || '#fff',
      pointHoverBorderColor: (ctx) => ctx.raw.lineColor || '#fff',
      pointHoverBorderWidth: 4,
      fill: true,
      tension: 0.3,
      spanGaps: true
    }
  ]
}));



const baseInterOptions = {
  responsive: true,
  maintainAspectRatio: false,
  clip: false,
  layout: { padding: { top: 30, bottom: 30, left: 10, right: 10 } },
  scales: {
    y: {
      reverse: true, min: 1, suggestedMax: 8,
      ticks: {
        color: '#ffffff', stepSize: 1, autoSkip: false, font: { size: 10, weight: 'bold' },
        callback: function(value) {
          const map = { 1: '🏆 CAMPEÃO', 2: '🥈 VICE', 3: 'SEMI', 4: 'QUARTAS', 5: 'OITAVAS', 6: '16 AVOS', 7: 'GRUPOS', 8: 'PRÉ-COPA' };
          return map[value] || '';
        }
      },
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
    },
    x: {
      offset: true,
      ticks: { color: '#eeeeee', font: { size: 10, weight: 'bold' }, maxRotation: 45, minRotation: 45 },
      grid: { 
         display: true,
         color: (context) => {
            if (context.tick && typeof context.tick.label === 'string' && context.tick.label.trim() === '') return 'transparent';
            return 'rgba(255, 255, 255, 0.1)';
         }
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false, external: customTooltipExternal }
  },
  interaction: { mode: 'nearest', intersect: false, axis: 'x' }
};

const interCharts = computed(() => {
    // 1. Sort processed seasons to match other charts
    const sorted = [...(processedSeasons.value || [])].sort((a,b) => {
        return parseInt(a.anoCortado) - parseInt(b.anoCortado);
    });
    const normalizedLabels = sorted.map(s => normalizeYearStrict(s.temporada));

    // Collect all inter competitions found
    const compsFound = {};

    sorted.forEach((s, idx) => {
        const normYear = normalizedLabels[idx];
        const hYearNorm = normalizeYearStrict(s.temporada);
        const hTimeNorm = normalizeString(s.timeNome);

        const interDaTemporada = seasonStore.list.filter(season => {
            const sYearNorm = normalizeYearStrict(season.ano);
            if (sYearNorm !== hYearNorm) return false;
            const cName = (season.competitionName || '').toLowerCase();
            return cName.includes('libertadores') || cName.includes('sul-americana') || cName.includes('champions') || cName.includes('europa') || cName.includes('concacaf') || cName.includes('mundial') || cName.includes('recopa') || cName.includes('supercopa da uefa');
        });

        for (const inter of interDaTemporada) {
            let extra = '';
            let intFaseStr = '';
            let intPos = null;
            let played = false;

            if (inter.campeao && normalizeString(inter.campeao) === hTimeNorm) {
                intFaseStr = 'Campeão';
                intPos = 1;
                played = true;
            } 
            else if (inter.participantes && inter.participantes.some(p => normalizeString(p.nome) === hTimeNorm)) {
                const part = inter.participantes.find(p => normalizeString(p.nome) === hTimeNorm);
                const rank = getCupRank(part.colocacao);
                if (rank) {
                    intFaseStr = part.colocacao;
                    intPos = rank;
                    played = true;
                }
            }
            else if (inter.tabela && normalizeString(inter.tabela).includes(hTimeNorm)) {
                const lines = inter.tabela.split('\n');
                const teamLineRaw = lines.find(l => normalizeString(l).includes(hTimeNorm));
                if (teamLineRaw) {
                    let cells = teamLineRaw.split('\t');
                    if (cells.length === 1) cells = teamLineRaw.split(/\s{2,}/);
                    
                    if (/^\d+$/.test(cells[0]?.trim()) || /^\d+\.?$/.test(cells[0]?.trim())) {
                        if (cells[2]) extra = cells[2].trim();
                    } else if (cells[1]) {
                        extra = cells[1].trim();
                    }

                    if (extra) {
                        const rank = getCupRank(extra);
                        if (rank) {
                            intFaseStr = extra;
                            intPos = rank;
                            played = true;
                        }
                    }
                }
            }

            if (played) {
                const compName = inter.competitionName || 'Internacional';
                if (!compsFound[compName]) compsFound[compName] = [];
                compsFound[compName].push({
                    idx: idx,
                    x: normYear,
                    y: intPos,
                    time: s.timeNome,
                    compName: compName,
                    pais: s.pais,
                    faseLabel: intFaseStr,
                    temporadaLonga: s.temporada
                });
            }
        }
    });

    const charts = [];
    const colors = ['#0d6efd', '#d63384', '#198754', '#ffc107', '#0dcaf0', '#fd7e14'];
    let colorIndex = 0;

    for (const [compName, dataPoints] of Object.entries(compsFound)) {
        const fullDataArray = Array(sorted.length).fill(null);
        dataPoints.forEach(dp => fullDataArray[dp.idx] = dp);
        
        const color = colors[colorIndex % colors.length];
        colorIndex++;

        // clone base options to set dynamic y-axis color
        const options = JSON.parse(JSON.stringify(baseInterOptions));
        options.scales.y.ticks.color = color;
        // Need to re-attach external tooltip because JSON stringify removes functions
        options.plugins.tooltip.external = customTooltipExternal;
        options.scales.y.ticks.callback = function(value) {
          const map = { 1: '🏆 CAMPEÃO', 2: '🥈 VICE', 3: 'SEMI', 4: 'QUARTAS', 5: 'OITAVAS', 6: '16 AVOS', 7: 'GRUPOS', 8: 'PRÉ-COPA' };
          return map[value] || '';
        };
        options.scales.x.grid.color = (context) => {
            if (context.tick && typeof context.tick.label === 'string' && context.tick.label.trim() === '') return 'transparent';
            return 'rgba(255, 255, 255, 0.1)';
        };

        charts.push({
            title: compName,
            color: color,
            data: {
                labels: labels.value,
                datasets: [{
                    label: compName,
                    data: fullDataArray,
                    borderColor: color,
                    backgroundColor: color + '22', // transparent version
                    borderWidth: 5,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: color,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    pointHoverBackgroundColor: color,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 4,
                    fill: true,
                    tension: 0.3,
                    spanGaps: true
                }]
            },
            options: options
        });
    }

    // Sort charts
    return charts.sort((a, b) => a.title.localeCompare(b.title));
});

const chartDataCopas = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Fase da Copa',
      data: chartDataPointsCopas.value,
      borderColor: '#00f2ff', // Cyan Neon
      backgroundColor: 'rgba(0, 242, 255, 0.15)',
      borderWidth: 5,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#00f2ff',
      pointRadius: 8,
      pointHoverRadius: 12,
      pointHoverBackgroundColor: '#00f2ff',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 4,
      fill: true,
      tension: 0.3,
      spanGaps: true
    }
  ]
}));


// Calcula e processa todos os dados das temporadas específicos para este Clube
const isClubMatch = (target, searchNorm, searchSmart) => {
    if (!target) return false;
    const targetNorm = normalizeString(target);
    if (targetNorm === searchNorm) return true;
    const targetSmart = clubSmartNormalize(target);
    if (searchSmart && targetSmart === searchSmart) return true;
    return false;
}

const parseTable = (tableStr) => {
    if (!tableStr) return [];
    return tableStr.split('\n').filter(l => l.trim()).map((line, idx) => {
        let cells = line.split('\t');
        if (cells.length === 1) cells = line.split(/\s{2,}/);
        
        if (cells.length === 1) {
            const match = line.match(/^(\d+)?\.?\s*([^\d]+)(.*)$/);
            if (match) {
                cells = [match[2].trim(), ...match[3].trim().split(/\s+/)];
            }
        }
        
        let time = cells[0];
        let posFromLine = null;
        
        // Tentar extrair posição do início da linha (ex: "20. Talleres")
        const posMatch = line.match(/^(\d+)/);
        if (posMatch) posFromLine = parseInt(posMatch[1]);

        if (time && /^\d+/.test(time) && cells.length > 1) {
            time = cells[1];
        }
        if (time) time = time.replace(/^\d+[\s.-]*/, '').trim();

        return { 
            time: time || '', 
            position: posFromLine || (idx + 1),
            lineRaw: line
        };
    }).filter(x => x.time);
}

const processedSeasons = computed(() => {
    const searchName = normalizeString(clubName.value);
    const searchSmart = clubSmartNormalize(clubName.value);
    const byYear = {};
    
    seasonStore.list.forEach(s => {
        const year = s.ano;
        const normalizedYear = normalizeYearStrict(year);
        if (!byYear[normalizedYear]) {
            byYear[normalizedYear] = { 
                anoCortado: normalizedYear, 
                temporada: year, 
                timeNome: clubName.value, 
                pais: '', 
                posicoesLiga: [],
                hasAnyData: false,
                jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0
            };
        }
        
        // Match club in this competition
        let playedHere = false;
        let pos = null;
        let j=0, v=0, e=0, d=0, gp=0, gc=0;
        
        if (isClubMatch(s.campeao, searchName, searchSmart)) {
            pos = 1; playedHere = true;
        } else if (isClubMatch(s.vice, searchName, searchSmart)) {
            pos = 2; playedHere = true;
        } 
        
        if (s.tabela && normalizeString(s.tabela).includes(searchName)) {
            const tableData = parseTable(s.tabela);
            const foundIdx = tableData.findIndex(t => isClubMatch(t.time, searchName, searchSmart));
            
            if (foundIdx !== -1) {
                playedHere = true;
                const row = tableData[foundIdx];
                if (!pos) pos = row.position;
                
                // Extrair estatísticas da linha bruta (fallback se houver dados numéricos)
                const parts = row.lineRaw.replace(/[^\w\s\d]/g, ' ').trim().split(/\s+/);
                const numbers = parts.filter(p => !isNaN(parseInt(p)) && p !== '').map(p => parseInt(p));
                
                if (numbers.length >= 8) {
                    for (let i = 1; i < numbers.length - 2; i++) {
                         if (numbers[i-1] === numbers[i] + numbers[i+1] + (numbers[i+2] || 0)) {
                             j = numbers[i-1]; v = numbers[i]; e = numbers[i+1]; d = numbers[i+2] || 0;
                             if (numbers[i+3] !== undefined) gp = numbers[i+3];
                             if (numbers[i+4] !== undefined) gc = numbers[i+4];
                             break;
                         }
                    }
                }
                
                // Fallback Agressivo: Se a tabela tiver formatação corrompida / Sem coluna J
                if (j === 0 && numbers.length >= 4) {
                    // Padrão Brasileiro: Pos, Pts, J, V, E, D, GP, GC, SG
                    // OU: Pos, J, V, E, D, GP, GC, SG, Pts
                    // Vamos deduzir V, E, D pelas posições 2, 3 e 4 da linha
                    if (numbers.length >= 6) {
                        const sumOfPos234 = numbers[2] + numbers[3] + numbers[4];
                        if (numbers[1] === sumOfPos234 || numbers[1] > sumOfPos234) {
                            // Assumimos que Pos 1 é Pontos/Jogos e Pos 2, 3, 4 são V,E,D
                            j = numbers[1] >= sumOfPos234 ? numbers[1] : sumOfPos234;
                            v = numbers[2]; e = numbers[3]; d = numbers[4];
                            gp = numbers[5] || 0; gc = numbers[6] || 0;
                        } else {
                            // Chute cego no padrão cru V, E, D
                            v = numbers[1]; e = numbers[2]; d = numbers[3];
                            j = v + e + d;
                            gp = numbers[4] || 0; gc = numbers[5] || 0;
                        }
                    } else {
                        v = numbers[1] || 0; e = numbers[2] || 0; d = numbers[3] || 0;
                        j = v + e + d;
                    }
                }
            }
        }
        
        if (playedHere) {
             byYear[normalizedYear].hasAnyData = true;
             
             const cNameLower = (s.competitionName || '').toLowerCase();
             const isInter = cNameLower.includes('libertadores') || cNameLower.includes('sul-americana') || cNameLower.includes('champions') || cNameLower.includes('europa') || cNameLower.includes('concacaf') || cNameLower.includes('mundial') || cNameLower.includes('recopa') || cNameLower.includes('supercopa da uefa');
             
             if (!s.isCup && !isInter) {
                 byYear[normalizedYear].posicoesLiga.push({ pos, ligaNome: s.competitionName || 'Liga' });
                 if(!byYear[normalizedYear].pais && s.pais) byYear[normalizedYear].pais = s.pais;
                 
                 byYear[normalizedYear].jogos += j;
                 byYear[normalizedYear].vitorias += v;
                 byYear[normalizedYear].empates += e;
                 byYear[normalizedYear].derrotas += d;
                 byYear[normalizedYear].golsPro += gp;
                 byYear[normalizedYear].golsContra += gc;
             }
        }
    });

    const result = [];
    for (const key of Object.keys(byYear).sort((a,b) => parseInt(a) - parseInt(b))) {
        const yData = byYear[key];
        if (yData.hasAnyData) {
            let finalPos = null;
            let finalLiga = 'Sem Liga';
            if (yData.posicoesLiga.length > 0) {
                 finalPos = yData.posicoesLiga[0].pos;
                 finalLiga = yData.posicoesLiga[0].ligaNome;
            }
            
            let finalPais = yData.pais;
            if (!finalPais) {
                 const clubMatch = clubStore.list.find(c => c.nome.toLowerCase() === clubName.value.toLowerCase());
                 if (clubMatch) finalPais = clubMatch.pais;
            }
            
            const winRate = yData.jogos > 0 ? (((yData.vitorias + yData.empates) / yData.jogos) * 100).toFixed(2) : 0;
            
            // Heurística de rebaixamento para o Dashboard:
            // Vamos herdar do CountryHistoryView se possível, mas aqui vamos detectar pela posição e liga
            let isRebaixado = false;
            if (yData.posicoesLiga.length > 0) {
                const liga = yData.posicoesLiga[0];
                const compData = dataSearchService.findCompetition(liga.ligaNome);
                if (compData && compData.rebaixados > 0) {
                    // Se for uma liga de maior divisão (A/B) e estiver na zona
                    // Vamos simplificar: se a posição for alta e a liga tiver rebaixados
                    // (O ideal seria ter a flag persistida, mas vamos usar a posição detectada)
                    // Para Talleres 20º, com Argentino A tendo rebaixados, é true.
                    if (liga.pos >= 20 || (compData.rebaixados >= 4 && liga.pos >= 17)) isRebaixado = true;
                }
                // Fallback para nomes de liga B que rebaixam por padrão no PES (ex: 4 times)
                if (liga.pos >= 17 && (liga.ligaNome.toLowerCase().includes('serie a') || liga.ligaNome.toLowerCase().includes('premier') || liga.ligaNome.toLowerCase().includes('liga profissional'))) {
                    isRebaixado = true;
                }
            }

            result.push({
                id: 'club_' + key,
                anoCortado: yData.anoCortado,
                temporada: yData.temporada,
                timeNome: yData.timeNome,
                pais: finalPais || 'Desconhecido',
                posicaoTimeline: finalPos,
                ligaNome: finalLiga,
                rate: parseFloat(winRate),
                jogos: yData.jogos,
                derrotas: yData.derrotas,
                golsPro: yData.golsPro,
                golsContra: yData.golsContra,
                isRebaixado: isRebaixado
            });
        }
    }
    return result;
});

const getCupRank = (fase) => {
    if (!fase) return null;
    const e = fase.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (e.includes('CAMPEAO') || e === '1º') return 1;
    if (e.includes('VICE') || e === '2º') return 2;
    if (e.includes('SEMI') || e === '3º' || e === '4º') return 3;
    if (e.includes('QUARTA') || e.includes('8º')) return 4;
    if (e.includes('OITAVA') || e.includes('16º')) return 5;
    if (e.includes('16 AVOS')) return 6;
    if (e.includes('GRUPOS')) return 7;
    if (e.includes('PRE')) return 8;
    return null;
}

// Atualiza o Gráfico sempre que a View, Store ou Qualquer dado de Universo mudar
watch([processedSeasons, () => seasonStore.list], ([newList, seasonList]) => {
    // Ordenar a lista cronologicamente
    const sorted = [...newList].sort((a,b) => {
        return parseInt(a.anoCortado) - parseInt(b.anoCortado)
    });

    const normalizedLabels = sorted.map(s => normalizeYearStrict(s.temporada));
    
    // Agrupa temporadas à ESQUERDA (início) inserindo rótulos em branco no final
    let finalLabels = [];
    finalLabels.push(...normalizedLabels);

    let padCount = 0;
    if (sorted.length <= 2) padCount = 6;
    else if (sorted.length <= 4) padCount = 4;
    else if (sorted.length <= 5) padCount = 2;

    for (let i = 0; i < padCount; i++) finalLabels.push(' '.repeat(i + 1));

    labels.value = finalLabels;

    const bgs = [];
    const borders = [];

    chartDataPoints.value = sorted.map((s, idx) => {
        // Detectar rebaixamento (heuristicamente se no Raio-X aparecer "Rebaixado")
        // Como o Raio-X processa separadamente, vamos usar o isRebaixado do processamento local
        const yearDataMatch = newList.find(nl => nl.temporada === s.temporada);
        const isRebaixadoYear = yearDataMatch?.isRebaixado || false;

        const colors = getLeagueColors(s.ligaNome || 'Liga', isRebaixadoYear);
        bgs.push(isRebaixadoYear ? '#ff4444' : colors.bg);
        borders.push(isRebaixadoYear ? '#aa0000' : colors.border);
        
        return {
            x: normalizedLabels[idx],
            y: s.posicaoTimeline,
            time: s.timeNome,
            compName: s.ligaNome || 'Liga',
            pais: s.pais,
            temporadaLonga: s.temporada,
            isRebaixado: isRebaixadoYear,
            lineColor: colors.bg === '#fff' ? '#ffcc00' : colors.bg,
            pointColor: isRebaixadoYear ? '#ff4444' : colors.bg
        };
    });
    
    chartDataPointBackgrounds.value = bgs;
    chartDataPointBorders.value = borders;

    chartDataPointsCopas.value = sorted.map((s, idx) => {
        const normYear = normalizedLabels[idx];
        
        let copaFaseStr = '';
        let copaName = 'Copa Nacional';
        let copaPos = null;

        const hYearNorm = normalizeYearStrict(s.temporada);
        const hTimeNorm = normalizeString(s.timeNome);

        // Buscar competições do tipo Copa nesta temporada no Universo
        const copasDaTemporada = seasonStore.list.filter(season => {
            const sYearNorm = normalizeYearStrict(season.ano);
            if (sYearNorm !== hYearNorm) return false;
            const cName = (season.competitionName || '').toLowerCase();
            return cName.includes('copa') && !cName.includes('supercopa') && !cName.includes('libertadores') && !cName.includes('sul-americana') && !cName.includes('champions') && !cName.includes('mundial de clubes');
        });

        for (const copa of copasDaTemporada) {
            let extra = '';

            if (copa.campeao && normalizeString(copa.campeao) === hTimeNorm) {
                copaFaseStr = 'Campeão';
                copaName = copa.competitionName;
                copaPos = 1;
                break;
            } 
            else if (copa.participantes && copa.participantes.some(p => normalizeString(p.nome) === hTimeNorm)) {
                const part = copa.participantes.find(p => normalizeString(p.nome) === hTimeNorm);
                const rank = getCupRank(part.colocacao);
                if (rank) {
                    copaFaseStr = part.colocacao;
                    copaName = copa.competitionName;
                    copaPos = rank;
                    break;
                }
            }
            else if (copa.tabela && normalizeString(copa.tabela).includes(hTimeNorm)) {
                const lines = copa.tabela.split('\n');
                const teamLineRaw = lines.find(l => normalizeString(l).includes(hTimeNorm));
                if (teamLineRaw) {
                    let cells = teamLineRaw.split('\t');
                    if (cells.length === 1) cells = teamLineRaw.split(/\s{2,}/);
                    
                    if (/^\d+$/.test(cells[0]?.trim()) || /^\d+\.?$/.test(cells[0]?.trim())) {
                        if (cells[2]) extra = cells[2].trim();
                    } else if (cells[1]) {
                        extra = cells[1].trim();
                    }

                    if (extra) {
                        const rank = getCupRank(extra);
                        if (rank) {
                            copaFaseStr = extra;
                            copaName = copa.competitionName;
                            copaPos = rank;
                            break;
                        }
                    }
                }
            }
        }

        return {
            x: normYear,
            y: copaPos,
            time: s.timeNome,
            compName: copaName,
            pais: s.pais,
            faseLabel: copaFaseStr,
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
    const searchName = clubName.value.toLowerCase().trim();
    
    seasonStore.list.forEach(season => {
        const scorers = season.topScorers || (season.artilheiro && season.artilheiro.nome ? [season.artilheiro] : []);
        scorers.forEach(scorer => {
            const scorerTeam = (scorer.clube || scorer.clubeArtilheiro || '').toLowerCase().trim();
            if (scorerTeam === searchName) {
                results.push({
                    nome: scorer.nome,
                    gols: scorer.gols || '?',
                    clube: scorer.clube || scorer.clubeArtilheiro,
                    pais: clubStore.list.find(c => c.nome.toLowerCase() === searchName)?.pais || '',
                    temporada: season.ano,
                    campeonato: season.nome || season.competitionName
                });
            }
        });
    });
    
    return results.sort((a,b) => (parseInt(b.gols) || 0) - (parseInt(a.gols) || 0)).slice(0, 5);
});

const myAwardedPlayers = computed(() => {
    const searchName = clubName.value.toLowerCase().trim();
    return awardsStore.list.filter(award => {
        return (award.clube || award.nacionalidade || '').toLowerCase().trim() === searchName;
    }).sort((a, b) => b.season.localeCompare(a.season));
});

onMounted(async () => {
    
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
    /* Removido nowrap e ellipsis para não cortar o nome do torneio */
    word-break: break-word;
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
