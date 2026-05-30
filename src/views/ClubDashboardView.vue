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
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #0066ff; border: 2px solid #0044cc;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série A / Principal</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 12px; height: 12px; border-radius: 4px; background: #00ff44; border: 2px solid #008822;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série B / Acesso</span>
                </div>
                <div class="d-flex align-items-center gap-2" v-if="chartDataPoints.some(p => p.lineColor === '#ffffff')">
                    <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 12px solid #ffffff; filter: drop-shadow(0 0 2px rgba(255,255,255,0.5));"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série C</span>
                </div>
                <div class="d-flex align-items-center gap-2" v-if="chartDataPoints.some(p => p.lineColor === '#00f2ff')">
                    <div style="width: 12px; height: 12px; transform: rotate(45deg); background: #00f2ff; border: 2px solid #00a8ff;"></div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Série D</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 12px; height: 12px; position: relative;">
                         <div style="position: absolute; width: 14px; height: 2px; background: #ff4444; top: 5px; left: -1px; transform: rotate(45deg);"></div>
                         <div style="position: absolute; width: 14px; height: 2px; background: #ff4444; top: 5px; left: -1px; transform: rotate(-45deg);"></div>
                    </div>
                    <span class="x-small fw-bold text-white-50 text-uppercase">Rebaixamento</span>
                </div>
                <!-- Medalhs/Destaques -->
                <div class="d-flex align-items-center gap-2 ms-3 border-start border-secondary ps-4">
                    <div style="display: flex; gap: 15px;">
                       <div class="d-flex align-items-center gap-2">
                           <div style="width: 12px; height: 12px; background: #ffcc00; clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);"></div>
                           <span class="x-small fw-bold text-warning text-uppercase">Campeão (Ouro)</span>
                       </div>
                       <div class="d-flex align-items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                               <path fill="#ff4444" d="M5.8 2L8.5 2 11 10 8.3 10z"/>
                               <path fill="#0055ff" d="M18.2 2L15.5 2 13 10 15.7 10z"/>
                               <circle cx="12" cy="14" r="7" fill="#e0e0e0" stroke="#808080" stroke-width="1.5"/>
                               <text x="12" y="17.5" font-family="Arial" font-size="10" font-weight="bold" fill="#666" text-anchor="middle">2</text>
                           </svg>
                           <span class="x-small fw-bold text-uppercase" style="color: #c0c0c0;">Vice (Prata)</span>
                       </div>
                    </div>
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
                      <div class="d-flex align-items-center gap-2">
                         <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="38" />
                         <div v-else class="text-secondary"><i class="bi bi-globe fs-4"></i></div>
                         <NationalFlag :countryName="rec.pais" :size="18" class="shadow-sm rounded-1" v-if="rec.pais" />
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
                      <div class="d-flex align-items-center gap-2">
                         <TeamShield v-if="contextType === 'clube'" :teamName="rec.timeNome" :size="38" />
                         <div v-else class="text-secondary"><i class="bi bi-globe fs-4"></i></div>
                         <NationalFlag :countryName="rec.pais" :size="18" class="shadow-sm rounded-1" v-if="rec.pais" />
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
        <!-- Artilheiros (Largura Total para caber o formato horizontal) -->
        <div class="col-12">
            <GamePanel>
                <h5 class="text-warning fw-bold text-uppercase mb-3"><i class="bi bi-person-badge-fill"></i> Nossos Maiores Artilheiros</h5>
                <div v-if="myTopScorers.length === 0" class="text-center p-4 opacity-50 small">
                    Nenhum artilheiro registrado nos seus times para esta categoria.
                </div>
                <div class="d-flex flex-wrap gap-3" v-else>
                    <div v-for="(scorer, i) in myTopScorers" :key="'scr'+i" class="col-12 col-xxl-6">
                        <div class="premium-scorer-card-h h-100">
                          <div class="scorer-h-glow"></div>
                          <div class="d-flex align-items-center w-100 h-100 position-relative z-2">
                            <!-- TROFÉU E RANKING -->
                            <div class="scorer-trophy-box-h position-relative text-center d-flex flex-column align-items-center justify-content-center" style="width: 130px;">
                              <h1 class="text-white-50 fw-black opacity-25 m-0 lh-1" style="font-size: 2.5rem; position: absolute; top: 10px; left: 10px;">{{ i + 1 }}º</h1>
                              <img src="/logos/competitions/artilheiro.png" alt="Troféu" style="height: 60px; z-index: 2; margin-top: 15px;">
                            </div>

                            <!-- FOTO -->
                            <div class="scorer-photo-h" :class="{ 'cursor-pointer': scorer.foto }" @click="scorer.foto ? openPhotoZoom(scorer.foto) : null" style="width: 120px;">
                              <img v-if="scorer.foto" :src="getCachedUrl(scorer.foto)" class="player-img">
                              <div v-else class="sc-placeholder-h"><i class="bi bi-person"></i></div>
                            </div>

                            <!-- INFO -->
                            <div class="scorer-info-h pe-2" style="flex: 1; min-width: 0; overflow: hidden;">
                              <div class="d-flex flex-column justify-content-center h-100">
                                <h3 class="scorer-name-h fs-4 text-white text-truncate">{{ scorer.nome }}</h3>
                                <div class="scorer-pos-h">{{ scorer.campeonato }} ({{ normalizeYearStrict(scorer.temporada) }})</div>
                              </div>
                            </div>

                            <!-- NACIONALIDADE E CLUBE -->
                            <div class="scorer-club-h d-none d-md-flex">
                              <div class="v-divider-h"></div>
                              <div class="d-flex align-items-center justify-content-center gap-2 px-3">
                                <NationalFlag v-if="scorer.nacionalidade" :countryName="scorer.nacionalidade" :size="38" class="rounded-circle shadow" />
                                <div class="club-shield-h-wrap d-flex align-items-center justify-content-center" v-if="contextType === 'clube'">
                                  <TeamShield :teamName="scorer.clube" :size="38" borderless />
                                </div>
                              </div>
                            </div>

                            <!-- GOLS -->
                            <div class="scorer-goals-h ms-auto px-4 border-start border-secondary border-opacity-10">
                              <div class="d-flex flex-column align-items-center">
                                <h2 class="m-0 fw-black text-warning" style="font-size: 2.2rem; text-shadow: 0 0 15px rgba(255, 193, 7, 0.4);">{{ scorer.gols }}</h2>
                                <div class="x-small text-white fw-bold ls-1">GOLS</div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            </GamePanel>
        </div>

        <!-- Prêmios Individuais (Melhor do Mundo, Europa, etc) -->
        <div class="col-12">
            <GamePanel>
                <h5 class="text-info fw-bold text-uppercase mb-3"><i class="bi bi-trophy-fill"></i> Prêmios Individuais de Maior Destaque</h5>
                <div v-if="myAwardedPlayers.length === 0" class="text-center p-4 opacity-50 small">
                    Nenhum jogador dos seus elencos recebeu prêmios individuais de Destaque até o momento.
                </div>
                <div class="d-flex flex-wrap gap-3" v-else>
                    <div v-for="(award, i) in myAwardedPlayers" :key="'awd'+i" class="col-12 col-xxl-6">
                        <div class="premium-scorer-card-h h-100" style="border-color: rgba(23, 162, 184, 0.3);">
                          <div class="scorer-h-glow" style="background: radial-gradient(circle at 0% 50%, rgba(23, 162, 184, 0.15) 0%, transparent 70%);"></div>
                          <div class="d-flex align-items-center w-100 h-100 position-relative z-2">
                            <!-- PRÊMIO ICON -->
                            <div class="scorer-trophy-box-h position-relative text-center d-flex flex-column align-items-center justify-content-center" style="width: 130px; background: rgba(23, 162, 184, 0.1);">
                              <img :src="getAwardTrophy(award.tipo)" alt="Troféu" style="max-height: 80px; max-width: 90%; filter: drop-shadow(0 0 15px rgba(23, 162, 184, 0.8));">
                            </div>

                            <!-- FOTO (Se houver futuramente) ou Ícone Genérico -->
                            <div class="scorer-photo-h" :class="{ 'cursor-pointer': award.foto }" @click="award.foto ? openPhotoZoom(award.foto) : null" style="width: 100px; background: rgba(0,0,0,0.6);">
                              <img v-if="award.foto" :src="getCachedUrl(award.foto)" class="player-img">
                              <div v-else class="sc-placeholder-h text-info opacity-25"><i class="bi bi-person-fill"></i></div>
                            </div>

                            <!-- INFO -->
                            <div class="scorer-info-h pe-2" style="flex: 1; min-width: 0; overflow: hidden;">
                              <div class="d-flex flex-column justify-content-center h-100">
                                <h3 class="scorer-name-h fs-4 text-white text-truncate">{{ award.nome }}</h3>
                                <div class="fw-black text-info text-uppercase ls-1" style="font-size: 0.8rem;">{{ award.tipo }} {{ award.posicao !== '1º' ? '('+award.posicao+')' : '' }}</div>
                                <div class="text-white-50 small fw-bold mt-1">{{ normalizeYearStrict(award.season) }}</div>
                              </div>
                            </div>

                            <!-- NACIONALIDADE E CLUBE -->
                            <div class="scorer-club-h d-none d-md-flex">
                              <div class="v-divider-h"></div>
                              <div class="d-flex align-items-center justify-content-center gap-2 px-3">
                                <NationalFlag v-if="award.nacionalidade" :countryName="award.nacionalidade" :size="38" class="rounded-circle shadow" />
                                <div class="club-shield-h-wrap d-flex align-items-center justify-content-center" v-if="contextType === 'clube'">
                                  <TeamShield :teamName="award.clube" :size="38" borderless />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            </GamePanel>
        </div>
      </div>

    </div>

    <!-- PHOTO ZOOM MODAL -->
    <div v-if="showPhotoZoom" class="photo-zoom-overlay" @click.self="showPhotoZoom = false">
      <div class="zoom-content-container">
        <button class="btn-close-zoom" @click="showPhotoZoom = false">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="getCachedUrl(zoomedPhotoUrl)" class="zoomed-image-full">
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

import { imageCacheService } from '../services/imageCache.service';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const route = useRoute();
const clubName = ref(decodeURIComponent(route.params.id || ''));
const contextType = ref('clube');
const activeTab = ref('timeline');

// Modal de Foto
const showPhotoZoom = ref(false);
const zoomedPhotoUrl = ref('');
const cachedPhotos = ref({});

const openPhotoZoom = (url) => {
  if (!url) return;
  zoomedPhotoUrl.value = url;
  showPhotoZoom.value = true;
};

const getCachedUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  if (!cachedPhotos.value[url]) {
      imageCacheService.getOrCache(url).then(b64 => {
         if (b64) cachedPhotos.value[url] = b64;
      });
  }
  return cachedPhotos.value[url] || url;
};

import imgMelhorMundo from '../assets/trofeus/individuais/melhor_do_mundo.png'
import imgMelhorTecnico from '../assets/trofeus/individuais/melhor_tecnico_mundo.png'
import imgMelhorEuropa from '../assets/trofeus/individuais/melhor_da_europa.png'
import imgMelhorAmerica from '../assets/trofeus/individuais/melhor_da_america.png'
import imgMelhorConcacaf from '../assets/trofeus/individuais/melhor_da_concacaf.png'

const trophyMap = {
  'Melhor do Mundo': imgMelhorMundo,
  'Melhor do Mundo (Técnico)': imgMelhorTecnico,
  'Melhor da Europa': imgMelhorEuropa,
  'Melhor da CONMEBOL (Rei da América)': imgMelhorAmerica,
  'Melhor da CONCACAF': imgMelhorConcacaf,
  'Bola de Ouro': imgMelhorMundo,
  'Chuteira de Ouro': './logos/competitions/chuteira-de-ouro.png',
  'Luva de Ouro': './logos/competitions/luva-de-ouro.png'
}

const getAwardTrophy = (awardType) => {
  if (!awardType) return imgMelhorMundo;
  for (const key in trophyMap) {
      if (awardType.includes(key) || key.includes(awardType)) {
          return trophyMap[key];
      }
  }
  if (awardType.includes('Técnico')) return imgMelhorTecnico;
  if (awardType.includes('América')) return imgMelhorAmerica;
  if (awardType.includes('Europa')) return imgMelhorEuropa;
  return imgMelhorMundo; // fallback padrão
}

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
                <span class="tooltip-value" style="color: ${dataPoint.lineColor || rankColor}; font-weight: 900; text-transform: uppercase;">${dataPoint.compName}</span>
            </div>
            <div class="tooltip-glow" style="background: radial-gradient(circle at top right, ${dataPoint.lineColor || rankColor}15 0%, transparent 70%)"></div>
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
const chartDataPointStyles = ref([]);
const chartDataPointRadii = ref([]);
const chartDataPointsCopas = ref([]);

const starImgObj = new Image(32, 32);
const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#ffcc00" stroke="#b8860b" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
starImgObj.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(starSvg);

const viceImgObj = new Image(36, 36);
const viceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="#ff4444" d="M5.8 2L8.5 2 11 10 8.3 10z"/><path fill="#0055ff" d="M18.2 2L15.5 2 13 10 15.7 10z"/><circle cx="12" cy="14" r="7" fill="#e0e0e0" stroke="#808080" stroke-width="1.5"/><text x="12" y="17.5" font-family="Arial" font-size="10" font-weight="bold" fill="#666" text-anchor="middle">2</text></svg>`;
viceImgObj.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(viceSvg);

const getLeagueColors = (ligaName, isRebaixado = false) => {
    if (isRebaixado) return { bg: '#ff4444', border: '#aa0000', style: 'crossRot' }; // Vermelho para rebaixados
    if (!ligaName || ligaName === 'Sem Liga') return { bg: '#0066ff', border: '#0044cc', style: 'circle' };
    
    const name = ligaName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Divisões Inferiores (Série C, D, League One, League Two, etc)
    if (name.includes('serie d') || name.includes('4a') || name.includes('quarta') || name.includes('league two') || name.includes('division 4') || name.endsWith(' d')) {
        return { bg: '#00f2ff', border: '#00a8ff', style: 'rectRot' }; // Ciano
    }
    if (name.includes('serie c') || name.includes('3a') || name.includes('terceira') || name.includes('league one') || name.includes('division 3') || name.includes('national') || name.endsWith(' c')) {
        return { bg: '#ffffff', border: '#dddddd', style: 'triangle' }; // Branco
    }
    
    // Segunda Divisão (Série B, Primera Nacional, Championship, etc)
    if (name.includes('serie b') || name.includes('2a') || name.includes('segunda') || name.includes('nacional') || name.includes('championship') || name.includes('2. bundesliga') || name.includes('division 2') || name.includes('ligue 2') || name.endsWith(' b')) {
        return { bg: '#00ff44', border: '#008822', style: 'rectRounded' }; // Verde
    }
    
    // Primeira Divisão / Padrão
    return { bg: '#0066ff', border: '#0044cc', style: 'circle' }; // Azul Escuro Principal
}

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Posição na Liga',
      data: chartDataPoints.value,
      borderColor: '#0066ff',
      segment: {
        borderColor: (ctx) => {
            const p1 = ctx.p1.raw;
            return p1.isRebaixado ? '#ff4444' : p1.lineColor || '#0066ff';
        },
        backgroundColor: (ctx) => {
            const p1 = ctx.p1.raw;
            return p1.isRebaixado ? 'rgba(255, 68, 68, 0.15)' : (p1.lineColor ? p1.lineColor + '26' : 'rgba(0, 102, 255, 0.15)');
        },
        borderDash: (ctx) => {
            const p0 = ctx.p0.raw;
            const p1 = ctx.p1.raw;
            if (p0 && p1 && p0.compName !== p1.compName) {
                return [6, 6];
            }
            return undefined;
        }
      },
      borderWidth: 5,
      pointBackgroundColor: chartDataPointBackgrounds.value.length ? chartDataPointBackgrounds.value : '#fff',
      pointBorderColor: chartDataPointBorders.value.length ? chartDataPointBorders.value : '#0066ff',
      pointStyle: chartDataPointStyles.value.length ? chartDataPointStyles.value : 'circle',
      pointRadius: chartDataPointRadii.value.length ? chartDataPointRadii.value : 8,
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
        const fullDataArray = sorted.map((s, idx) => {
            const found = dataPoints.find(dp => dp.idx === idx);
            if (found) return found;
            return {
                x: normalizedLabels[idx],
                y: null,
                time: s.timeNome,
                compName: compName,
                pais: s.pais,
                temporadaLonga: s.temporada
            };
        });
        
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
             const isSupercopa = cNameLower.includes('supercopa') && !cNameLower.includes('supercopa da uefa');
             
             if (!s.isCup && !isInter && !isSupercopa) {
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
    const styles = [];
    const radii = [];

    chartDataPoints.value = sorted.map((s, idx) => {
        const yearDataMatch = newList.find(nl => nl.temporada === s.temporada);
        const isRebaixadoYear = yearDataMatch?.isRebaixado || false;

        const colors = getLeagueColors(s.ligaNome || 'Liga', isRebaixadoYear);
        
        let finalBg = isRebaixadoYear ? '#ff4444' : colors.bg;
        let finalBorder = isRebaixadoYear ? '#aa0000' : colors.border;
        let finalStyle = isRebaixadoYear ? 'crossRot' : colors.style;
        let finalRadius = 8;
        
        if (s.posicaoTimeline === 1) {
             finalBg = '#ffcc00'; // Ouro/Dourado (Campeão)
             finalBorder = '#d4af37';
             finalStyle = starImgObj;
             finalRadius = 20;
        } else if (s.posicaoTimeline === 2) {
             finalBg = '#c0c0c0'; // Prata/Medalha de 2
             finalBorder = '#808080';
             finalStyle = viceImgObj;
             finalRadius = 13;
        }

        bgs.push(finalBg);
        borders.push(finalBorder);
        styles.push(finalStyle);
        radii.push(finalRadius);
        
        return {
            x: normalizedLabels[idx],
            y: s.posicaoTimeline,
            time: s.timeNome,
            compName: s.ligaNome || 'Liga',
            pais: s.pais,
            temporadaLonga: s.temporada,
            isRebaixado: isRebaixadoYear,
            lineColor: colors.bg === '#fff' ? '#0066ff' : colors.bg,
            pointColor: finalBg,
            pointStyle: finalStyle
        };
    });
    
    chartDataPointBackgrounds.value = bgs;
    chartDataPointBorders.value = borders;
    chartDataPointStyles.value = styles;
    chartDataPointRadii.value = radii;

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
                    foto: scorer.fotoUrl || scorer.foto || scorer.fotoJogador || null,
                    gols: scorer.gols || '?',
                    clube: scorer.clube || scorer.clubeArtilheiro,
                    nacionalidade: scorer.nacionalidade || scorer.paisJogador || '',
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
    })
    .map(award => ({
        ...award,
        foto: award.fotoUrl || award.fotoJogador || award.foto || null
    }))
    .sort((a, b) => b.season.localeCompare(a.season));
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

/* PREMIUM SCORER CARD CSS */
.premium-scorer-card-h {
  height: 110px;
  background: rgba(10, 15, 25, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;
  box-shadow: 0 5px 20px rgba(0,0,0,0.5);
}

.scorer-h-glow {
  position: absolute;
  top: 0; left: 0; bottom: 0; width: 300px;
  background: radial-gradient(circle at 0% 50%, rgba(255, 193, 7, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.scorer-trophy-box-h {
  height: 100%;
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.05);
}

.scorer-photo-h {
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  flex-shrink: 0;
  overflow: hidden;
}

.player-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center 20%;
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));
}

.sc-placeholder-h {
  font-size: 3rem;
  opacity: 0.1;
  margin-bottom: 5px;
}

.scorer-name-h {
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.5px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  text-transform: uppercase;
}

.scorer-pos-h {
  font-weight: 900;
  font-size: 0.75rem;
  color: #58ccff;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.v-divider-h {
  width: 1px;
  height: 60px;
  background: rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.scorer-nat-h, .scorer-club-h {
  display: flex;
  align-items: center;
  height: 100%;
}

.club-name-h {
  font-weight: 900;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.club-shield-h-wrap {
  background: rgba(255,255,255,0.03);
  padding: 5px;
  border-radius: 10px;
}

/* Photo Zoom Modal */
.photo-zoom-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(15px);
  z-index: 3000;
  display: flex; align-items: center; justify-content: center; padding: 40px;
}

.zoom-content-container {
  position: relative;
  max-width: 90vw; max-height: 90vh;
  box-shadow: 0 0 50px rgba(0,0,0,0.8);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px; overflow: hidden; background: #000;
}

.zoomed-image-full {
  max-width: 100%; max-height: 90vh; object-fit: contain;
}

.btn-close-zoom {
  position: absolute; top: 20px; right: 20px;
  background: rgba(255,255,255,0.1); border: none; color: white;
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; z-index: 3010;
}
.btn-close-zoom:hover { background: #ff4136; transform: rotate(90deg); }

.cursor-pointer { cursor: pointer; }
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
