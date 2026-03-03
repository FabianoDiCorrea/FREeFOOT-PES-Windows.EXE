<template>
  <div class="view-container">
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <div class="d-flex align-items-center gap-3">
        <h2 class="m-0"><i class="bi bi-person-badge me-2"></i>MINHA CARREIRA</h2>
        
        <!-- Abas de Navegação -->
        <div class="d-flex gap-2 ms-4">
          <button @click="activeType = 'clube'" class="tab-button" :class="{ active: activeType === 'clube' }">
            <i class="bi bi-shield-shaded me-2"></i>CLUBES
          </button>
          <button @click="activeType = 'selecao'" class="tab-button" :class="{ active: activeType === 'selecao' }">
            <i class="bi bi-globe-americas me-2"></i>SELEÇÕES
          </button>
        </div>

        <GameButton v-if="filteredHistory.length > 0" class="btn-sm" @click="openForm">
          <i class="bi bi-plus-circle me-1"></i> NOVA TEMPORADA
        </GameButton>
      </div>
      <LogoFREeFOOT />
    </div>
  </div>
    <!-- State: No History -->
    <div v-if="filteredHistory.length === 0 && !showForm" class="text-center p-5">
      <GamePanel>
        <div class="py-5">
          <i class="bi bi-controller display-1 opacity-25 mb-4"></i>
          <h3>VOCÊ AINDA NÃO INICIOU SUA CARREIRA</h3>
          <p class="opacity-50 mb-4 text-uppercase">Comece agora registrando sua primeira temporada no comando de um time.</p>
          <GameButton @click="openForm">INICIAR CARREIRA</GameButton>
        </div>
      </GamePanel>
    </div>

    <!-- Active Career View -->
    <div v-else-if="selectedEntry || showForm">
      
      <!-- FORM: Nova Temporada / Editar -->
      <div v-if="showForm" class="mb-5">
        <GamePanel>
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="m-0 text-warning"><i class="bi bi-pencil-square me-2"></i>DADOS DO CONTRATO</h4>
            <button class="btn btn-sm btn-outline-secondary" @click="closeForm">CANCELAR</button>
          </div>
          
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label x-small fw-bold text-secondary">TEMPORADA</label>
              <input v-model="entryForm.temporada" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ex: 2025/2026">
            </div>
            <div class="col-md-3">
              <label class="form-label x-small fw-bold text-secondary">TIME</label>
              <div class="position-relative">
                <input v-model="entryForm.timeNome" @input="showTeams = true" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Nome do time...">
                <div v-if="showTeams && filteredClubs.length > 0" class="search-dropdown">
                  <div v-for="c in filteredClubs" :key="c.id" class="search-item d-flex align-items-center gap-2" @click="selectClub(c)">
                    <img :src="c.escudo_url" width="20"> {{ c.nome }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <label class="form-label x-small fw-bold text-secondary">RANK INÍCIO</label>
              <input v-model="entryForm.rankInicio" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ex: 15º">
            </div>
            <div class="col-md-2">
              <label class="form-label x-small fw-bold text-secondary">RANK FINAL</label>
              <input v-model="entryForm.rankFinal" type="text" class="form-control bg-dark text-white border-secondary" placeholder="Ex: 5º">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <GameButton class="w-100" @click="saveEntry">
                <i class="bi bi-save me-2"></i> SALVAR
              </GameButton>
            </div>
          </div>
        </GamePanel>
      </div>

      <!-- DASHBOARD VISUAL -->
      <div v-if="selectedEntry && !showForm" class="row g-4 m-0 mb-4">
        <!-- HEADER DE IDENTIFICAÇÃO (Premium Design) -->
        <div class="col-12 px-2">
            <div class="contract-banner position-relative d-flex align-items-center justify-content-between p-3 overflow-hidden rounded-3">
                
                <!-- Background: Escudo Marca D'água -->
                <div class="watermark-shield">
                    <template v-if="selectedEntry.tipo === 'clube'">
                        <TeamShield :teamName="selectedEntry.timeNome" :size="300" borderless class="grayscale-shield" />
                    </template>
                    <template v-else-if="selectedNationalTeamData">
                        <img :src="selectedNationalTeamData.escudo_url" class="shield-img" style="height: 90%; transform: translate(40%, 0) rotate(-15deg); filter: contrast(1.1) brightness(0.9); opacity: 0.50;">
                    </template>
                </div>

                <!-- Background: Logo Continental (Direita) -->
                <div class="watermark-flag">
                     <template v-if="selectedEntry.tipo === 'selecao' && selectedNationalTeamData">
                        <img :src="selectedNationalTeamData.continente" class="flag-img opacity-75" style="width: 220px; filter: drop-shadow(0 0 20px rgba(255,255,255,0.1))">
                     </template>
                     <NationalFlag v-else :countryName="selectedEntry.pais" :size="300" class="flag-img" />
                </div>

                <!-- Conteúdo Header -->
                <div class="content z-1 w-100 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-4">
                        <TeamShield 
                            v-if="selectedEntry.tipo === 'clube'"
                            :teamName="selectedEntry.timeNome" 
                            :size="120" 
                            premium 
                            :countryName="selectedEntry.pais" 
                            :season="selectedEntry.temporada"
                        />
                        <div v-else class="shield-wrapper premium-mode d-flex align-items-center justify-content-center" style="width: 180px; height: 180px; background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden;">
                            <div v-if="selectedNationalTeamData?.bandeira_url" class="premium-flag-bg" :style="{ backgroundImage: `url(${selectedNationalTeamData.bandeira_url})`, filter: 'blur(10px) brightness(0.4)', opacity: 0.8, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }"></div>
                            <div class="shield-container d-flex align-items-center justify-content-center" style="width: 100%; height: 100%; position: relative; z-index: 1;">
                                <img :src="selectedNationalTeamData?.escudo_url" style="width: 155px; height: 155px; object-fit: contain; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6))">
                            </div>
                        </div>

                        <div>
                            <div class="text-warning x-small fw-black text-uppercase ls-2 mb-1">Contrato Atual</div>
                            <div class="d-flex align-items-center gap-3">
                                <h1 class="m-0 fw-black text-uppercase d-flex align-items-center gap-2" style="font-size: 2.8rem;">
                                    {{ selectedEntry.timeNome }}
                                    <i v-if="selectedEntry.tipo === 'selecao'" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 0.8em;"></i>
                                </h1>
                                <div v-if="selectedEntry.tipo === 'selecao' && selectedNationalTeamData" class="rounded-circle overflow-hidden border border-2 border-white border-opacity-25 shadow-lg" style="width: 45px; height: 45px;">
                                    <img :src="selectedNationalTeamData.bandeira_url" class="w-100 h-100 object-fit-cover">
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2 mt-2" :class="selectedEntry.tipo === 'selecao' ? 'opacity-100' : 'opacity-75'">
                                <template v-if="selectedEntry.tipo === 'selecao' && selectedNationalTeamData">
                                    <div class="bg-white bg-opacity-10 rounded-pill px-2 py-1 d-flex align-items-center gap-2">
                                        <img :src="selectedNationalTeamData.continente" width="22" style="object-fit: contain">
                                        <span class="fw-black text-uppercase small ls-1">{{ currentFederation?.nome || 'CONMEBOL' }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <NationalFlag :countryName="selectedEntry.pais" :size="20" />
                                    <span class="fw-bold text-uppercase">{{ selectedEntry.pais }}</span>
                                </template>
                             </div>
                        </div>
                    </div>

                    <div class="text-end z-3">
                        <div class="header-main-h3 text-uppercase fw-black mb-2">
                            {{ selectedEntry.temporada }}
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-warning text-uppercase fw-bold x-small" @click="editCurrentEntry">
                                <i class="bi bi-pencil-fill me-1"></i> Editar Dados
                            </button>
                            <button class="btn btn-sm btn-outline-danger text-uppercase fw-bold x-small" @click="confirmDeleteEntry">
                                <i class="bi bi-trash-fill me-1"></i> Excluir Temporada
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation between career seasons -->
        <div v-if="filteredHistory.length > 1" class="col-12 px-2 mb-3">
            <div class="career-nav d-flex gap-2 justify-content-center flex-wrap">
                <button v-for="(h, idx) in filteredHistory" :key="h.id" 
                        class="btn btn-sm" :class="selectedEntry?.id === h.id ? 'btn-warning' : 'btn-outline-secondary'"
                        @click="selectedEntry = h; careerIndex = idx">
                    {{ h.temporada }}
                </button>
            </div>
        </div>

        <!-- LADO ESQUERDO: TABELAS E DADOS (70%) -->
        <div class="col-xl-8 px-2">
            <div class="table-container p-0">
                <!-- Tabela de Temporada -->
                <div class="table-section-header text-center py-1 text-uppercase small fw-bold">{{ selectedEntry.temporada }}</div>
                <table class="career-table">
                    <thead>
                        <tr>
                            <th class="text-start ps-3"><span>{{ selectedEntry.timeNome }}</span></th>
                            <th><span>POS.</span></th>
                            <th><span>PONTOS</span></th>
                            <th><span>JOGOS</span></th>
                            <th><span>VITORIAS</span></th>
                            <th><span>EMPATE</span></th>
                            <th><span>DERROTA</span></th>
                            <th><span>GOLS F</span></th>
                            <th><span>GOLS C</span></th>
                            <th><span>SALDO G</span></th>
                            <th><span>%</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Linha da Liga / Copa Continental ou Mundo (Auto/Sync) -->
                        <tr class="row-liga">
                            <td class="text-start ps-3 fw-bold">
                                <span>{{ currentSeasonData?.nome || (selectedEntry.tipo === 'selecao' ? 'Copa do Mundo / Continental...' : 'Sincronizar Liga...') }}</span>
                            </td>
                            <td class="fw-bold"><span>{{ currentSeasonData?.posicao ? currentSeasonData.posicao + '°' : '---' }}</span></td>
                            <td class="fw-bold text-info"><span>{{ currentSeasonData?.pontos || 0 }}</span></td>
                            <td><span>{{ currentSeasonData?.jogos || 0 }}</span></td>
                            <td><span>{{ currentSeasonData?.vitorias || 0 }}</span></td>
                            <td><span>{{ currentSeasonData?.empates || 0 }}</span></td>
                            <td><span>{{ currentSeasonData?.derrotas || 0 }}</span></td>
                            <td><span>{{ currentSeasonData?.golsPro || 0 }}</span></td>
                            <td><span>{{ currentSeasonData?.golsContra || 0 }}</span></td>
                            <td><span>{{ currentSeasonData?.saldo || 0 }}</span></td>
                            <td class="fw-black"><span>{{ calculateWinRate(currentSeasonData) }}%</span></td>
                        </tr>
                        <!-- Linhas de Copas / Amistosos (Manual Input) -->
                        <tr class="row-copas">
                            <td class="text-start ps-3 fw-bold">
                                <span>{{ selectedEntry.tipo === 'selecao' ? 'AMISTOSOS NA TEMPORADA' : 'TOTAL OUTRAS COMPETIÇÕES' }}</span>
                            </td>
                            <td><span>---</span></td>
                            <td class="fw-bold text-info"><span>{{ copasPontosCalculado }}</span></td>
                            <td class="fw-bold"><span>{{ copasJogosCalculado }}</span></td>
                            <td><input v-model.number="selectedEntry.copas.vitorias" class="table-input"></td>
                            <td><input v-model.number="selectedEntry.copas.empates" class="table-input"></td>
                            <td><input v-model.number="selectedEntry.copas.derrotas" class="table-input"></td>
                            <td><input v-model.number="selectedEntry.copas.golsPro" class="table-input"></td>
                            <td><input v-model.number="selectedEntry.copas.golsContra" class="table-input"></td>
                            <td><span>{{ selectedEntry.copas.golsPro - selectedEntry.copas.golsContra }}</span></td>
                            <td class="fw-bold"><span>{{ calculateWinRate({ pontos: copasPontosCalculado, jogos: copasJogosCalculado }) }}%</span></td>
                        </tr>
                        <!-- Linha de Resultado Total (Soma) -->
                        <tr class="row-total">
                            <td class="text-start ps-3 fw-black"><span>RESULTADO DA TEMPORADA</span></td>
                            <td><span>---</span></td>
                            <td class="fw-bold text-info"><span>{{ totalStats.pontos }}</span></td>
                            <td class="fw-bold"><span>{{ totalStats.jogos }}</span></td>
                            <td class="fw-bold"><span>{{ totalStats.vitorias }}</span></td>
                            <td class="fw-bold"><span>{{ totalStats.empates }}</span></td>
                            <td class="fw-bold"><span>{{ totalStats.derrotas }}</span></td>
                            <td class="fw-bold"><span>{{ totalStats.golsPro }}</span></td>
                            <td class="fw-bold"><span>{{ totalStats.golsContra }}</span></td>
                            <td class="fw-bold"><span>{{ totalStats.saldo }}</span></td>
                            <td class="fw-black"><span>{{ calculateWinRate(totalStats) }}%</span></td>
                        </tr>
                    </tbody>
                </table>
                <div class="p-3">
                   <div class="row g-2">
                       <div class="col-md-4">
                            <div class="rank-card">
                                <div class="rank-label">RANK DE CLUBES</div>
                                <div class="rank-values d-flex align-items-center gap-2">
                                    <!-- Inputs -->
                                    <div class="d-flex align-items-center gap-1"><span class="opacity-50 x-mini fw-bold">INÍCIO:</span><input v-model="selectedEntry.rankInicio" class="rank-mini-input" style="font-size: 1.1rem; width: 40px;" placeholder="---"></div>
                                    <i class="bi bi-arrow-right opacity-50"></i>
                                    <div class="d-flex align-items-center gap-1">
                                        <span class="fw-bold text-warning x-mini">FINAL:</span>
                                        <input v-model="selectedEntry.rankFinal" class="rank-mini-input text-warning fw-black" style="font-size: 1.25rem; width: 45px;" :placeholder="autoRankFinal || '---'">
                                    </div>

                                    <!-- Indicador de Evolução -->
                                    <div v-if="rankEvolution" class="ms-1 d-flex align-items-center gap-1" :class="'evolution-' + rankEvolution.type">
                                        <div class="d-flex align-items-center" style="font-size: 1rem;">
                                            <i v-if="rankEvolution.type === 'up'" class="bi bi-caret-up-fill"></i>
                                            <i v-else-if="rankEvolution.type === 'down'" class="bi bi-caret-down-fill"></i>
                                            <span v-else class="evolution-dash">—</span>
                                            <span v-if="rankEvolution.type !== 'neutral'" class="fw-black ms-1">{{ rankEvolution.value }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                           <div class="obs-card">
                               <div class="rank-label">OBSERVAÇÃO DO CONTRATO</div>
                               <input v-model="selectedEntry.observacao" class="obs-input w-100" placeholder="Digite detalhes do contrato ou metas...">
                           </div>
                       </div>
                   </div>
                </div>
            </div>

            <!-- RESULTADOS DE COMPETIÇÕES -->
            <div class="mt-4">
                <div class="table-section-header text-center py-1 text-uppercase small fw-bold">Resultados de Competições</div>
                <div class="results-container p-3 bg-dark bg-opacity-50 rounded-bottom">
                    <!-- Resultados Automáticos (de temporadas salvas) -->
                    <div v-for="(result, idx) in allCompetitionResults" :key="idx" 
                         class="result-item" :class="{ 'has-champion': result.posicao === 'CAMPEÃO' }">
                        <div class="d-flex align-items-center justify-content-between w-100">
                            <div class="d-flex align-items-center gap-3">
                                <div class="mini-trophy-container">
                                    <img v-if="getCompLogo(result.competicao)" :src="getCompLogo(result.competicao)" class="mini-trophy-img" alt="Troféu">
                                    <i v-else class="bi bi-trophy-fill text-warning" style="font-size: 0.9rem;"></i>
                                </div>
                                <span class="fw-bold text-uppercase">{{ result.competicao }}</span>
                            </div>
                            <span :class="['position-badge', result.posicao === 'CAMPEÃO' ? 'champion' : result.posicao === 'VICE-CAMPEÃO' ? 'vice' : 'other']">{{ result.posicao }}</span>
                        </div>
                    </div>
                    
                    <!-- Resultados Manuais (Títulos adicionados manualmente) -->
                    <div v-for="(t, idx) in selectedEntry.titulos" :key="'manual-' + idx" 
                         class="result-item has-champion">
                        <div class="d-flex align-items-center justify-content-between w-100">
                            <div class="d-flex align-items-center gap-3">
                                <div class="mini-trophy-container">
                                    <img v-if="getCompLogo(t.nome)" :src="getCompLogo(t.nome)" class="mini-trophy-img" alt="Troféu">
                                    <i v-else class="bi bi-trophy-fill text-warning" style="font-size: 0.9rem;"></i>
                                </div>
                                <span class="fw-bold text-uppercase">{{ t.nome }}</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="position-badge champion">CAMPEÃO</span>
                                <button class="btn btn-sm btn-link text-danger p-0" @click="removeTrophy(idx)"><i class="bi bi-x"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mensagem se não houver resultados -->
                    <div v-if="allCompetitionResults.length === 0 && (!selectedEntry.titulos || selectedEntry.titulos.length === 0)" class="text-center opacity-50 py-3">
                        <small>Nenhum resultado registrado para esta temporada</small>
                    </div>
                    
                    <button class="btn btn-sm btn-outline-warning text-uppercase x-small fw-bold mt-2" @click="openTrophyModal">
                        <i class="bi bi-plus"></i> Adicionar Resultado Manual
                    </button>
                </div>
            </div>
        </div>

        <!-- LADO DIREITO: DASHBOARDS (30%) -->
        <div class="col-xl-4 px-2">
            <div class="d-flex flex-column gap-3 h-100">
                <div class="gauge-card-custom theme-liga text-center p-1 flex-fill d-flex flex-column justify-content-center" v-if="currentSeasonData">
                    <div class="text-uppercase fw-bold mb-1 x-small opacity-40">Aproveitamento Liga</div>
                    <CareerGauge :value="calculateWinRate(currentSeasonData)" label="Liga" />
                    <div class="performance-status mt-2 text-uppercase fw-black">{{ getPerformanceStatus(calculateWinRate(currentSeasonData)) }}</div>
                </div>
                <div class="gauge-card-custom theme-total text-center p-1 flex-fill d-flex flex-column justify-content-center">
                    <div class="text-uppercase fw-bold mb-2 x-small opacity-40">Aproveitamento Temporada</div>
                    <CareerGauge :value="calculateWinRate(totalStats)" label="Temporada" />
                    <div class="performance-status mt-2 text-uppercase fw-black">{{ getPerformanceStatus(calculateWinRate(totalStats)) }}</div>
                </div>
            </div>
        </div>
      </div>

      <!-- Orçamento Financeiro -->
      <div v-if="selectedEntry.tipo === 'clube'" class="row m-0 mb-4 px-2">
         <div class="col-12 mt-2">
            <div class="table-section-header text-center py-1 text-uppercase small fw-bold">ORÇAMENTO FINANCEIRO (PRÓX. TEMPORADA)</div>
            
            <div v-if="selectedEntry.orcamento">
                <!-- Exibir Card de Orçamento Gerado -->
                <div class="row g-3 px-3 py-3 bg-dark bg-opacity-50 rounded-bottom m-0">
                    <div class="col-md-4">
                        <div class="budget-card text-center p-3 border border-secondary rounded shadow">
                            <div class="x-small fw-bold text-secondary mb-2">VERBA DE TRANSFERÊNCIAS</div>
                            <h3 class="fw-black text-neon-green m-0">{{ formatCurrency(selectedEntry.orcamento.transferencias) }}</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="budget-card text-center p-3 border border-secondary rounded shadow">
                            <div class="x-small fw-bold text-secondary mb-2">ORÇAMENTO SALARIAL</div>
                            <h3 class="fw-black text-warning m-0">{{ formatCurrency(selectedEntry.orcamento.salarios) }}</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="budget-card text-center p-3 border border-warning rounded shadow bg-warning bg-opacity-10">
                            <div class="x-small fw-bold text-warning mb-2">ORÇAMENTO TOTAL</div>
                            <h3 class="fw-black text-white m-0">{{ formatCurrency(selectedEntry.orcamento.total) }}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="selectedEntry.orcamentoStatus === 'canceled'">
                <div class="text-center p-4 bg-dark bg-opacity-50 rounded-bottom opacity-50">
                    <i class="bi bi-x-circle d-block mb-2" style="font-size: 2rem;"></i>
                    <div class="fw-bold x-small text-uppercase">Orçamento cancelado (Mudança de Clube)</div>
                </div>
            </div>
            <div v-else>
                <!-- Botão para Gerar Orçamento -->
                <div class="text-center p-4 bg-dark bg-opacity-50 rounded-bottom">
                    <p class="small text-secondary fw-bold mb-3">O orçamento da próxima temporada ainda não foi gerado.</p>
                    <button class="btn btn-outline-success btn-lg fw-bold text-uppercase box-shadow" @click="openBudgetModal">
                        <i class="bi bi-cash-coin me-2"></i> GERAR ORÇAMENTO
                    </button>
                </div>
            </div>
         </div>
      </div>

    </div>

    <!-- Budget Modal -->
    <div v-if="showBudgetModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
        <div class="modal-content-custom bg-dark border border-success p-4 rounded shadow-lg text-center" style="width: 450px;">
            <i class="bi bi-question-circle text-success mb-3" style="font-size: 3rem;"></i>
            <h4 class="text-white fw-black mb-3 text-uppercase">Confirmar Permanência?</h4>
            <p class="text-secondary small mb-4">Para gerar o orçamento da próxima temporada, precisamos saber: você vai <strong>continuar comandando o {{ selectedEntry.timeNome }}</strong>?</p>
            
            <div class="d-flex flex-column gap-2">
                <button class="btn btn-success fw-bold p-3 text-uppercase" @click="confirmBudgetGeneration">
                    <i class="bi bi-check-circle me-1"></i> Sim, Continuarei (Gerar)
                </button>
                <button class="btn btn-outline-danger fw-bold p-3 text-uppercase" @click="cancelBudgetGeneration">
                    <i class="bi bi-x-circle me-1"></i> Não, Vou Mudar de Clube
                </button>
            </div>
            <button class="btn btn-link text-secondary text-decoration-none mt-3 x-small" @click="showBudgetModal = false">
                <i class="bi bi-arrow-left"></i> Voltar
            </button>
        </div>
    </div>

    <!-- Trophies Modal -->
    <div v-if="showTrophyModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
        <div class="modal-content-custom bg-dark border border-warning p-4 rounded shadow-lg" style="width: 400px;">
            <h4 class="text-warning mb-3">ADICIONAR TÍTULO</h4>
            <div class="mb-3">
                <label class="form-label x-small fw-bold opacity-50">NOME DA COMPETIÇÃO</label>
                <input v-model="newTrophy.nome" type="text" class="form-control bg-black text-white border-secondary">
            </div>
            <div class="d-flex gap-2">
                <GameButton class="w-100" @click="addTrophy">ADICIONAR</GameButton>
                <button class="btn btn-outline-secondary w-100" @click="showTrophyModal = false">CANCELAR</button>
            </div>
        </div>
    </div>

    <!-- SALA DE TROFÉUS (Link) -->
    <div v-if="filteredHistory.length > 0 && !showForm" class="mt-5 px-2">
        <GamePanel customClass="p-0 overflow-hidden">
            <div class="p-5 text-center bg-black bg-opacity-25 d-flex flex-column align-items-center justify-content-center" style="min-height: 200px;">
                <i class="bi bi-trophy-fill mb-3 text-warning" style="font-size: 3rem; filter: drop-shadow(0 0 15px rgba(255,193,7,0.4));" />
                <h4 class="fw-black text-uppercase ls-2 mb-2">Sua Galeria de Conquistas</h4>
                <p class="text-secondary small text-uppercase ls-1 mb-4">Visualize todos os troféus conquistados na sua carreira</p>
                
                <button @click="$router.push('/sala-de-trofeus')" class="btn btn-outline-warning btn-lg fw-bold text-uppercase px-5 py-3 hover-glow">
                    <i class="bi bi-box-arrow-in-right me-2"></i>ACESSAR SALA DE TROFÉUS
                </button>
            </div>
        </GamePanel>
    </div>


</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import GamePanel from '../components/GamePanel.vue'
import GameButton from '../components/GameButton.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import CareerGauge from '../components/CareerGauge.vue'
import { careerStore } from '../services/career.store'
import { seasonStore } from '../services/season.store'
import { rankingsStore } from '../services/rankings.store'
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data'
import { CLUBS_DATA } from '../data/clubs.data'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { dataSearchService } from '../services/dataSearch.service'
import { getTrofeuPath, normalizeString } from '../services/utils'

const history = computed(() => careerStore.history)
const selectedEntry = ref(null)
const careerIndex = ref(0)
const activeType = ref('clube') // 'clube' | 'selecao'
const showForm = ref(false)
const showTeams = ref(false)
const showTrophyModal = ref(false)
const showBudgetModal = ref(false)

const openBudgetModal = () => {
    showBudgetModal.value = true
}

const cancelBudgetGeneration = async () => {
    selectedEntry.value.orcamentoStatus = 'canceled'
    await careerStore.saveEntry(JSON.parse(JSON.stringify(selectedEntry.value)))
    showBudgetModal.value = false
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

const confirmBudgetGeneration = async () => {
    showBudgetModal.value = false;
    
    let base = 0;
    const ligaNome = currentSeasonData.value?.nome?.toLowerCase() || '';
    
    if (ligaNome.includes('brasil') || ligaNome.includes('brasileirão') || ligaNome.includes('serie')) {
        if (ligaNome.includes('série a') || ligaNome.includes('serie a')) base = 40000000;
        else if (ligaNome.includes('série b') || ligaNome.includes('serie b')) base = 22000000;
        else if (ligaNome.includes('série c') || ligaNome.includes('serie c')) base = 12000000;
        else if (ligaNome.includes('série d') || ligaNome.includes('serie d')) base = 6000000;
        else base = 25000000;
    } else if (ligaNome.includes('argen')) {
        if (ligaNome.includes('segunda') || ligaNome.includes('b nacional')) base = 20000000;
        else base = 45000000;
    } else if (ligaNome.includes('england') || ligaNome.includes('premier') || ligaNome.includes('championship')) {
        if (ligaNome.includes('championship') || ligaNome.includes('segunda')) base = 50000000;
        else base = 80000000;
    } else {
        base = 35000000;
    }

    let posBonus = 0;
    const pos = currentSeasonData.value?.posicao || 0;
    if (pos === 1) posBonus = 0.40;
    else if (pos > 1 && pos <= 4) posBonus = 0.25;
    else if (pos >= 5 && pos <= 12) posBonus = 0.10;
    else if (pos > 12 && pos <= 16) posBonus = 0.00;
    else if (pos > 16) posBonus = -0.15;

    let cupBonus = 0;
    let contBonus = 0;
    
    allCompetitionResults.value.forEach(r => {
        const comp = r.competicao.toLowerCase();
        const p = r.posicao;
        
        if (comp.includes('copa do brasil') || comp.includes('fa cup') || comp.includes('copa argentina') || comp.includes('copa del rey')) {
             if (p === 'CAMPEÃO') cupBonus += 0.10;
             else if (p === 'VICE-CAMPEÃO') cupBonus += 0.06;
             else if (p === 'SEMIFINAL') cupBonus += 0.03;
        }
        
        if (comp.includes('libertadores') || comp.includes('champions league')) {
             if (p === 'CAMPEÃO') contBonus += 20000000;
             else if (p === 'VICE-CAMPEÃO') contBonus += 10000000;
             else if (p === 'SEMIFINAL') contBonus += 5000000;
        } else if (comp.includes('sul-americana') || comp.includes('sudamericana') || comp.includes('europa league')) {
             if (p === 'CAMPEÃO') contBonus += 10000000;
             else if (p === 'VICE-CAMPEÃO') contBonus += 5000000;
             else if (p === 'SEMIFINAL') contBonus += 2500000;
        } else if (comp.includes('mundial de clubes') || comp.includes('club world cup')) {
             if (p === 'CAMPEÃO') contBonus += 15000000;
             else if (p === 'VICE-CAMPEÃO') contBonus += 8000000;
        }
    });

    let budgetTransferencias = (base * (1 + posBonus + cupBonus)) + contBonus;
    
    let wagePerc = 0.55;
    if (base <= 10000000) wagePerc = 0.70;
    else if (base <= 25000000) wagePerc = 0.55;
    else if (base <= 45000000) wagePerc = 0.35;
    else wagePerc = 0.25;
    
    let budgetSalarios = budgetTransferencias * wagePerc;
    let budgetTotal = budgetTransferencias + budgetSalarios;

    selectedEntry.value.orcamento = {
        transferencias: Math.round(budgetTransferencias),
        salarios: Math.round(budgetSalarios),
        total: Math.round(budgetTotal)
    };
    
    selectedEntry.value.orcamentoStatus = 'generated';
    await careerStore.saveEntry(JSON.parse(JSON.stringify(selectedEntry.value)));
}

const filteredHistory = computed(() => {
    return history.value.filter(h => h.tipo === activeType.value)
})

watch(activeType, () => {
    if (filteredHistory.value.length > 0) {
        selectedEntry.value = filteredHistory.value[filteredHistory.value.length - 1]
    } else {
        selectedEntry.value = null
    }
})

const entryForm = ref({
    temporada: '',
    timeNome: '',
    pais: '',
    liga: { nome: '', posicao: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, pontos: 0, saldo: 0 },
    copas: { jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, pontos: 0 },
    titulos: [],
    rankInicio: '',
    rankFinal: '',
    observacao: ''
})

const autoRankFinal = computed(() => {
  if (!selectedEntry.value) return null
  return rankingsStore.getTeamRank(selectedEntry.value.timeNome, selectedEntry.value.temporada)
})

const selectedNationalTeamData = computed(() => {
    if (!selectedEntry.value || selectedEntry.value.tipo !== 'selecao') return null
    return dataSearchService.findNationalTeam(selectedEntry.value.timeNome)
})

const currentFederation = computed(() => {
    if (!selectedNationalTeamData.value) return null
    // continente field in nationalTeams.data.js is already the logo URL
    const logoUrl = selectedNationalTeamData.value.continente
    
    // Find federation name in FEDERATIONS_DATA by logo URL
    return Object.values(FEDERATIONS_DATA).find(f => f.logo === logoUrl)
})

const rankEvolution = computed(() => {
    if (!selectedEntry.value) return null
    
    const start = parseInt(selectedEntry.value.rankInicio)
    const end = parseInt(selectedEntry.value.rankFinal || autoRankFinal.value)
    
    if (isNaN(start) || isNaN(end)) return null
    
    const diff = start - end // Se inicio é 10 e final é 5, subiu 5 (positivo)
    return {
        value: Math.abs(diff),
        type: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
    }
})

const newTrophy = ref({ nome: '' })

watch(() => entryForm.value.temporada, (newVal) => {
    if (newVal && entryForm.value.timeNome) {
        tryLookupLeagueData(entryForm.value.timeNome, newVal)
    }
})

onMounted(async () => {
    await careerStore.loadAll()
    await seasonStore.loadAll() // Carregar temporadas para buscar resultados automáticos
    await rankingsStore.loadAll() // Carregar rankings para sincronização
    if (history.value.length > 0) {
        // Selecionar a última temporada do tipo atual
        const activeHistory = history.value.filter(h => h.tipo === activeType.value)
        if (activeHistory.length > 0) {
            selectedEntry.value = activeHistory[activeHistory.length - 1]
        }
    }
})

const filteredClubs = computed(() => {
    if (!entryForm.value.timeNome || entryForm.value.timeNome.length < 2) return []
    const q = entryForm.value.timeNome.toLowerCase()
    
    if (activeType.value === 'selecao') {
        return NATIONAL_TEAMS_DATA.filter(c => c.nome.toLowerCase().includes(q)).slice(0, 5)
    }
    return CLUBS_DATA.filter(c => c.nome.toLowerCase().includes(q)).slice(0, 5)
})

const openForm = (entry = null) => {
    showForm.value = true
    if (entry && entry.id) {
        // Modo Edição
        entryForm.value = JSON.parse(JSON.stringify(entry))
    } else {
        // Modo Novo
        entryForm.value = {
            temporada: '',
            timeNome: '',
            pais: '',
            tipo: activeType.value,
            liga: { nome: '', posicao: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, pontos: 0, saldo: 0 },
            copas: { jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, pontos: 0 },
            titulos: [],
            rankInicio: '',
            rankFinal: '',
            observacao: ''
        }
    }
}

const editCurrentEntry = () => {
    openForm(selectedEntry.value)
}

const closeForm = () => {
    showForm.value = false
}

const selectClub = (club) => {
    entryForm.value.timeNome = club.nome
    
    if (activeType.value === 'selecao') {
        const fedMap = {
            'https://a.imagem.app/B76yUr.png': 'Europa',
            'https://a.imagem.app/B76ggb.png': 'América do Sul',
            'https://a.imagem.app/B76POt.png': 'América do Norte',
            'https://a.imagem.app/B76a00.webp': 'África',
            'https://a.imagem.app/B76MoQ.png': 'Ásia'
        }
        entryForm.value.pais = fedMap[club.continente] || 'Internacional'
        // Guardar nome original para a bandeira
        entryForm.value.realPais = club.nome 
    } else {
        entryForm.value.pais = club.pais
    }
    
    showTeams.value = false
    tryLookupLeagueData(club.nome, entryForm.value.temporada)
}

const tryLookupLeagueData = async (teamName, seasonYear) => {
    if (!teamName || !seasonYear) return
    
    // Carregar todas as temporadas se necessário
    if (seasonStore.list.length === 0) await seasonStore.loadAll()
    
    // Resetar dados atuais
    entryForm.value.liga = { nome: '', posicao: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, pontos: 0, saldo: 0 }
    entryForm.value.copas = { jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0, pontos: 0 }

    // Buscar temporadas onde esse time aparece na tabela
    const matchingSeasons = seasonStore.list.filter(s => {
        return (s.ano === seasonYear || s.ano.includes(seasonYear)) && 
               s.tabela && s.tabela.toLowerCase().includes(teamName.toLowerCase())
    })

    if (matchingSeasons.length === 0) return

    matchingSeasons.forEach(season => {
        const lines = season.tabela.split('\n')
        const teamLine = lines.find(l => l.toLowerCase().includes(teamName.toLowerCase()))
        
        if (teamLine) {
            let cells = teamLine.split('\t')
            if (cells.length < 5) cells = teamLine.split(/\s{2,}/)

            const stats = {
                jogos: parseInt(cells[1]) || 0,
                pontos: parseInt(cells[2]) || 0,
                vitorias: parseInt(cells[3]) || 0,
                empates: parseInt(cells[4]) || 0,
                derrotas: parseInt(cells[5]) || 0,
                golsPro: parseInt(cells[6]) || 0,
                golsContra: parseInt(cells[7]) || 0,
                saldo: parseInt(cells[8]) || 0
            }

            // Lógica de Detecção de Competição Principal
            let isMainComp = false
            const lowerComp = season.competitionName.toLowerCase()
            
            if (entryForm.value.tipo === 'selecao') {
                // Para seleções, prioridade é Copa do Mundo ou Continental (Euro, Copa América, etc)
                isMainComp = lowerComp.match(/copa do mundo|world cup|euro|copa américa|copa africa|asian cup|gold cup/)
            } else {
                // Para clubes, prioridade é Liga/Campeonato Nacional
                isMainComp = lowerComp.match(/liga|serie|division|ligue|bundesliga|premiership|primera|eredivisie|primeira|campeonato/)
            }
            
            if (isMainComp || entryForm.value.liga.nome === '') {
                if (entryForm.value.liga.nome === '') {
                    entryForm.value.liga = { ...stats, nome: season.competitionName, posicao: lines.indexOf(teamLine) + 1 }
                } else if (isMainComp) {
                    // Se achou uma competição principal e já tinha algo (talvez aleatório), sobrescreve ou soma?
                    // Geralmente queremos a principal. Se for a Copa do Mundo, ela é a principal.
                    entryForm.value.liga = { ...stats, nome: season.competitionName, posicao: lines.indexOf(teamLine) + 1 }
                } else {
                    entryForm.value.liga.jogos += stats.jogos
                    entryForm.value.liga.vitorias += stats.vitorias
                    entryForm.value.liga.empates += stats.empates
                    entryForm.value.liga.derrotas += stats.derrotas
                    entryForm.value.liga.golsPro += stats.golsPro
                    entryForm.value.liga.golsContra += stats.golsContra
                    entryForm.value.liga.pontos += stats.pontos
                    entryForm.value.liga.saldo += stats.saldo
                }
            } else {
                entryForm.value.copas.jogos += stats.jogos
                entryForm.value.copas.vitorias += stats.vitorias
                entryForm.value.copas.empates += stats.empates
                entryForm.value.copas.derrotas += stats.derrotas
                entryForm.value.copas.golsPro += stats.golsPro
                entryForm.value.copas.golsContra += stats.golsContra
                entryForm.value.copas.pontos += stats.pontos
            }
        }
    })
}

/**
 * Percorre todo o histórico de carreira e sincroniza troféus do Universo.
 */
const syncAllTrophies = async () => {
    if (seasonStore.list.length === 0) await seasonStore.loadAll()
    let hasChanges = false

    for (const h of history.value) {
        const teamName = h.timeNome?.toLowerCase()
        const seasonYear = h.temporada?.toString().toLowerCase().trim().replace(/\s/g, '')

        // Buscar temporadas no Universo que batem com Time e Ano
        const universeSeasons = seasonStore.list.filter(s => {
            const sYear = s.ano?.toString().toLowerCase().trim().replace(/\s/g, '')
            return sYear === seasonYear && s.campeao?.toLowerCase() === teamName
        })

        universeSeasons.forEach(s => {
            const alreadyHas = (h.titulos || []).some(t => t.nome.toLowerCase() === s.competitionName.toLowerCase())
            if (!alreadyHas) {
                if (!h.titulos) h.titulos = []
                h.titulos.push({ nome: s.competitionName })
                hasChanges = true
            }
        })

        if (hasChanges) {
            await careerStore.saveEntry(JSON.parse(JSON.stringify(h)))
            hasChanges = false // reset for next entry
        }
    }
}

const saveEntry = async () => {
    if (!entryForm.value.timeNome || !entryForm.value.temporada) {
        alert("Preencha o time e a temporada!")
        return
    }
    const saved = await careerStore.saveEntry(JSON.parse(JSON.stringify(entryForm.value)))
    selectedEntry.value = saved
    showForm.value = false
}

const confirmDeleteEntry = () => {
    if (confirm(`Tem certeza que deseja excluir a temporada ${selectedEntry.value.temporada} no ${selectedEntry.value.timeNome}? Esta ação não pode ser desfeita.`)) {
        deleteCurrentEntry()
    }
}

const deleteCurrentEntry = async () => {
    if (!selectedEntry.value?.id) return
    await careerStore.removeEntry(selectedEntry.value.id)
    
    // Selecionar outra temporada após excluir
    if (filteredHistory.value.length > 0) {
        selectedEntry.value = filteredHistory.value[filteredHistory.value.length - 1]
    } else {
        selectedEntry.value = null
    }
    alert('Temporada removida com sucesso.')
}



// Cálculo automático de JOGOS para Copas/Inter (V + E + D)
const copasJogosCalculado = computed(() => {
    if (!selectedEntry.value) return 0
    const c = selectedEntry.value.copas || {}
    return (c.vitorias || 0) + (c.empates || 0) + (c.derrotas || 0)
})

// Cálculo automático de PONTOS para Copas/Inter (V×3 + E×1)
const copasPontosCalculado = computed(() => {
    if (!selectedEntry.value) return 0
    const c = selectedEntry.value.copas || {}
    return (c.vitorias || 0) * 3 + (c.empates || 0)
})

const totalStats = computed(() => {
    if (!selectedEntry.value || !currentSeasonData.value) return {}
    const l = currentSeasonData.value
    const c = selectedEntry.value.copas || {}
    
    return {
        jogos: (l.jogos || 0) + copasJogosCalculado.value,
        pontos: (l.pontos || 0) + copasPontosCalculado.value,
        vitorias: (l.vitorias || 0) + (c.vitorias || 0),
        empates: (l.empates || 0) + (c.empates || 0),
        derrotas: (l.derrotas || 0) + (c.derrotas || 0),
        golsPro: (l.golsPro || 0) + (c.golsPro || 0),
        golsContra: (l.golsContra || 0) + (c.golsContra || 0),
        saldo: (l.saldo || 0) + ((c.golsPro || 0) - (c.golsContra || 0))
    }
})

const calculateWinRate = (stats) => {
    // NOVA FÓRMULA SOLICITADA: (((Vitórias * 3) + Empates) / (Jogos * 3)) * 100
    if (!stats || !stats.jogos || stats.jogos === 0) return '0.00'
    const pontos = stats.pontos !== undefined && stats.pontos > 0 ? stats.pontos : ((stats.vitorias || 0) * 3) + (stats.empates || 0);
    const pontosMax = stats.jogos * 3;
    const rate = (pontos / pontosMax) * 100;
    return rate.toFixed(2);
}

const getPerformanceStatus = (rate) => {
    if (rate >= 90) return 'Excelente'
    if (rate >= 75) return 'Ótimo'
    if (rate >= 55) return 'Bom'
    if (rate >= 30) return 'Regular'
    return 'Ruim'
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

// Agrupar títulos por competição (incluindo automáticos e manuais)
const groupedTrophies = computed(() => {
    const grouped = {}
    
    // Adicionar títulos manuais
    history.value.forEach(h => {
        if (!h.titulos) return
        h.titulos.forEach(t => {
            if (!grouped[t.nome]) {
                grouped[t.nome] = {
                    nome: t.nome,
                    count: 0,
                    years: [],
                    teamsData: [] // Array de objetos {nome, pais}
                }
            }
            grouped[t.nome].count++
            grouped[t.nome].years.push(h.temporada)
            
            // Adicionar dados completos do time
            const teamExists = grouped[t.nome].teamsData.find(td => td.nome === h.timeNome)
            if (!teamExists) {
                grouped[t.nome].teamsData.push({
                    nome: h.timeNome,
                    pais: h.pais
                })
            }
        })
    })
    
    // Adicionar títulos automáticos (CAMPEÕES detectados)
    history.value.forEach(h => {
        const temporada = h.temporada
        const timeNome = h.timeNome
        
        // Buscar temporadas salvas que correspondem
        const matchingSeasons = seasonStore.list.filter(s => {
            return s.ano === temporada && s.tabela && s.tabela.toLowerCase().includes(timeNome.toLowerCase())
        })
        
        matchingSeasons.forEach(season => {
            const lines = season.tabela.split('\n')
            const teamLine = lines.find(l => l.toLowerCase().includes(timeNome.toLowerCase()))
            
            if (teamLine) {
                const pos = lines.indexOf(teamLine) + 1
                
                // Apenas CAMPEÕES (1º lugar)
                if (pos === 1) {
                    const compName = season.competitionName || 'Liga'
                    
                    if (!grouped[compName]) {
                        grouped[compName] = {
                            nome: compName,
                            count: 0,
                            years: [],
                            teamsData: []
                        }
                    }
                    grouped[compName].count++
                    if (!grouped[compName].years.includes(temporada)) {
                        grouped[compName].years.push(temporada)
                    }
                    
                    // Adicionar dados completos do time
                    const teamExists = grouped[compName].teamsData.find(td => td.nome === timeNome)
                    if (!teamExists) {
                        grouped[compName].teamsData.push({
                            nome: timeNome,
                            pais: h.pais
                        })
                    }
                }
            }
        })
    })
    
    return Object.values(grouped).sort((a, b) => b.count - a.count)
})

// Dados dinâmicos da temporada selecionada (busca SEMPRE da temporada salva)
const currentSeasonData = computed(() => {
    if (!selectedEntry.value) return null
    
    // Tentar buscar liga automática
    const timeNome = selectedEntry.value.timeNome
    const temporada = selectedEntry.value.temporada
    
    // Buscar temporadas que correspondem ao ano e time na tabela
    const matchingSeasons = seasonStore.list.filter(s => {
        return s.ano === temporada && s.tabela && s.tabela.toLowerCase().includes(timeNome.toLowerCase())
    })
    
    // Se não encontrar, mantemos os dados manuais como fallback
    if (matchingSeasons.length === 0) {
        const baseData = selectedEntry.value.liga || {}
        return {
            nome: baseData.nome || 'Sincronizar Liga...',
            posicao: baseData.posicao || 0,
            jogos: baseData.jogos || 0,
            pontos: baseData.pontos || 0,
            vitorias: baseData.vitorias || 0,
            empates: baseData.empates || 0,
            derrotas: baseData.derrotas || 0,
            golsPro: baseData.golsPro || 0,
            golsContra: baseData.golsContra || 0,
            saldo: (baseData.golsPro || 0) - (baseData.golsContra || 0)
        }
    }
    
    // Pegar a temporada com mais times (liga principal)
    const selectedSeason = matchingSeasons.reduce((best, current) => {
        const bestLines = best.tabela.split('\n').length
        const currentLines = current.tabela.split('\n').length
        return currentLines > bestLines ? current : best
    }, matchingSeasons[0])
    
    // Parsear tabela para extrair estatísticas
    const lines = selectedSeason.tabela.split('\n')
    const teamLine = lines.find(l => l.toLowerCase().includes(timeNome.toLowerCase()))
    
    if (!teamLine) return {}
    
    const position = lines.indexOf(teamLine) + 1
    
    // Parsear a linha para extrair números
    // Formato NA IMAGEM: Nome | Pos | P | J | V | E | D | GP | GC | SG | %
    // Exemplo: TIME | 1 | 108 | 42 | 35 | 3 | 4 | 86 | 18 | 68 | 89%
    
    // Remover caracteres não numéricos extras que possam atrapalhar, mantendo espaços
    const cleanLine = teamLine.replace(/[^\w\s\d]/g, ' ').trim();
    const parts = cleanLine.split(/\s+/);
    
    // AQUI MUDOU: Aceitamos o último número como sendo a % se ele estiver lá
    const numbers = parts.filter(p => !isNaN(parseInt(p)) && p !== '').map(p => parseInt(p))
    
    let pontos = 0, jogos = 0, vitorias = 0, empates = 0, derrotas = 0, golsPro = 0, golsContra = 0, saldo = 0
    let percentualTexto = 0

    let idxV = -1;
    let fallbackJ = false;
    
    // 1. Procurar checksum J = V + E + D
    // Procuramos V nas posições 1, 2 e 3
    for (let i = 1; i <= 3; i++) {
        if (numbers.length >= i + 3 && numbers[i-1] === numbers[i] + numbers[i+1] + numbers[i+2]) {
            idxV = i;
            break;
        }
    }
    
    // 2. Procurar checksum P = V*3 + E (se J está faltando)
    if (idxV === -1) {
        for (let i = 1; i <= 2; i++) {
            if (numbers.length >= i + 2 && numbers[i-1] === (numbers[i] * 3) + numbers[i+1]) {
                idxV = i;
                fallbackJ = true;
                break;
            }
        }
    }
    
    // 3. Fallback genérico se a matemática falhar (ex: punição de pontos)
    if (idxV === -1) {
        if (numbers.length >= 9) idxV = 3; // ex: [Pos, P, J, V...] -> V is 3
        else if (numbers.length === 8) idxV = 2; // ex: [P, J, V...] or [Pos, P, V...] -> Assume V is 2
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
    
    // Tentativa de puxar percentual se existir como numérico final (ex: '89%')
    if (numbers.length > 8) {
        let last = numbers[numbers.length - 1];
        if (last > 0 && last <= 100 && last !== saldo && last !== golsContra && last !== golsPro) {
            percentualTexto = last;
        }
    }
    
    return {
        nome: selectedSeason.competitionName || 'Liga',
        posicao: position,
        jogos: jogos,
        pontos: pontos,
        vitorias: vitorias,
        empates: empates,
        derrotas: derrotas,
        golsPro: golsPro,
        golsContra: golsContra,
        saldo: saldo,
        percentual: percentualTexto // Novo campo
    }
})

// Buscar TODOS os resultados automaticamente das temporadas salvas
const allCompetitionResults = computed(() => {
    if (!selectedEntry.value) return []
    
    const results = []
    const resultsSet = new Set() // Para evitar duplicatas internas (ex: achou tabela e campeão)
    const temporada = selectedEntry.value.temporada
    // Normalizar nome do time para comparação segura
    const timeNome = selectedEntry.value.timeNome.toLowerCase().trim()
    
    // Obter lista de títulos manuais para evitar duplicação visual
    const manualTitles = (selectedEntry.value.titulos || []).map(t => t.nome.toLowerCase().trim())
    
    // Buscar todas as temporadas (competições) que aconteceram neste ano
    const matchingSeasons = seasonStore.list.filter(s => s.ano === temporada)
    
    matchingSeasons.forEach(season => {
        let badge = ''
        let ordem = 99
        let found = false
        
        // 1. Verificar se é CAMPEÃO direto (Funciona para Copas e Ligas)
        if (season.campeao && season.campeao.toLowerCase().trim() === timeNome) {
            badge = 'CAMPEÃO'
            ordem = 1
            found = true
        } 
        // 2. Se não for campeão direto, tentar achar na TABELA (apenas Ligas)
        else if (season.tabela && season.tabela.toLowerCase().includes(timeNome)) {
            const lines = season.tabela.split('\n')
            const teamLine = lines.find(l => l.toLowerCase().includes(timeNome))
            
            if (teamLine) {
                const linesRaw = season.tabela.split('\n').filter(l => l.trim());
                const teamLineRaw = linesRaw.find(l => l.toLowerCase().includes(timeNome));
                
                // Tentar extrair 'extra' (colocação)
                let extra = '';
                let cells = teamLineRaw.split('\t');
                if (cells.length === 1) cells = teamLineRaw.split(/\s{2,}/);
                
                if (/^\d+$/.test(cells[0]?.trim()) || /^\d+\.?$/.test(cells[0]?.trim())) {
                    if (cells[2]) extra = cells[2].trim();
                } else if (cells[1]) {
                    extra = cells[1].trim();
                }

                const pos = lines.indexOf(teamLine) + 1
                badge = `${pos}º Lugar`
                ordem = pos
                
                if (extra) {
                    const e = extra.toUpperCase();
                    if (e.includes('CAMPEÃO') || e === 'CAMPEAO') { badge = 'CAMPEÃO'; ordem = 1; }
                    else if (e.includes('VICE') || e.includes('2º')) { badge = 'VICE-CAMPEÃO'; ordem = 2; }
                    else if (e.includes('SEMIFINAL') || e.includes('4º')) { badge = 'SEMIFINAL'; ordem = 4; }
                    else if (e.includes('QUARTAS') || e.includes('8º')) { badge = 'QUARTAS'; ordem = 8; }
                    else if (e.includes('OITAVAS') || e.includes('16º')) { badge = 'OITAVAS'; ordem = 16; }
                    else if (e.includes('16 AVOS')) { badge = '16 AVOS'; ordem = 24; }
                    else if (e.includes('GRUPOS') || e.includes('32º')) { badge = 'GRUPOS'; ordem = 32; }
                } else {
                    if (pos === 1) {
                        badge = 'CAMPEÃO'
                        ordem = 1
                    } else if (pos === 2) {
                        badge = 'VICE-CAMPEÃO'
                        ordem = 2
                    }
                }
                found = true
            }
        }
        
        if (found) {
            const compName = season.competitionName || 'Competição'
            const uniqueKey = compName + badge
            
            // Regra de Duplicidade:
            // 1. Não mostrar se já estiver na lista manual (prioridade manual)
            // 2. Não adicionar se já processamos essa competição (Set)
            if (!manualTitles.includes(compName.toLowerCase().trim()) && !resultsSet.has(uniqueKey)) {
                
                results.push({
                    competicao: compName,
                    posicao: badge,
                    tipo: 'automatico',
                    ordem: ordem
                })
                resultsSet.add(uniqueKey)
            }
        }
    })
    
    // Ordenar por posição (campeões primeiro)
    return results.sort((a, b) => a.ordem - b.ordem)
})

const openTrophyModal = () => {
    newTrophy.value.nome = ''
    showTrophyModal.value = true
}

const addTrophy = () => {
    if (!newTrophy.value.nome) return
    selectedEntry.value.titulos.push({ ...newTrophy.value })
    careerStore.saveEntry(JSON.parse(JSON.stringify(selectedEntry.value)))
    showTrophyModal.value = false
}

const removeTrophy = (idx) => {
    selectedEntry.value.titulos.splice(idx, 1)
    careerStore.saveEntry(JSON.parse(JSON.stringify(selectedEntry.value)))
}

const getCompLogo = (compName) => {
    if (!compName) return null
    
    // 1. Tentar encontrar nos datasets de competições
    const allComps = [
        ...ALL_COMPETITIONS_DATA.flatMap(continent => [
            ...continent.paises.flatMap(p => p.competicoes),
            ...continent.continentais
        ]),
        ...INTERNATIONAL_DATA
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

// Auto-save changes in selectedEntry
watch(selectedEntry, async (newVal) => {
    if (newVal && !showForm.value) {
        await careerStore.saveEntry(JSON.parse(JSON.stringify(newVal)))
    }
}, { deep: true })
</script>

<style scoped>
.career-header-premium {
    background: linear-gradient(90deg, #1a1a1a 0%, #333 100%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.header-tab-neon {
    color: #39ff14;
    font-size: 0.7rem;
    font-weight: 900;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
}

.header-main-h3 {
    color: #eee;
    font-size: 1.8rem;
    line-height: 0.9;
}

.rank-card, .obs-card {
    background: rgba(255,255,255,0.03);
    padding: 10px 15px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    transition: all 0.2s;
}

.rank-card:hover, .obs-card:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.2);
}

.budget-card {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
}
.budget-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    background: rgba(0, 0, 0, 0.5);
}

.rank-label {
    font-size: 0.6rem;
    font-weight: 800;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 5px;
}

.obs-input {
    background: transparent;
    border: none;
    font-size: 0.75rem;
    color: #eee;
}

.rank-mini-input {
    background: transparent;
    border: none;
    font-size: 0.85rem;
    color: #eee;
    width: 50px;
    padding: 0;
    font-weight: 700;
}

.rank-mini-input:focus {
    outline: none;
    color: #fff;
    text-shadow: 0 0 5px rgba(255,255,255,0.3);
}

.rank-mini-input.text-warning::placeholder {
    color: #ffc107;
    opacity: 0.9;
}

.x-mini {
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.5px;
}

/* Evolução Styles */
.evolution-up { color: #00ff88; text-shadow: 0 0 5px rgba(0, 255, 136, 0.4); }
.evolution-down { color: #ff4444; text-shadow: 0 0 5px rgba(255, 68, 68, 0.4); }
.evolution-neutral { color: #4488ff; opacity: 0.8; }
.evolution-dash { font-weight: 900; margin-top: -2px; }

/* Dashboards e Dashcards */
.gauge-card-custom {
    border-radius: 17px;
    background: #181818;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 8px 1px rgba(0,0,0,0.3);
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.gauge-card-custom:hover {
    transform: translateY(-5px);
    background: #202020;
    border-color: rgba(255,255,255,0.1);
}

.theme-liga { border-left: 20px solid #0d3b2e !important; }
.theme-liga:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(40, 167, 69, 0.2); }

.theme-total { border-left: 20px solid #d35400 !important; }
.theme-total:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(255, 165, 0, 0.2); }

/* --- DEFINITIVE TABLE STYLES (No clipping, No extra borders) --- */
.table-container {
    background: #181818;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    overflow: hidden;
    position: relative;
}

.table-section-header {
    background: rgba(255,255,255,0.05);
    color: #ffd700;
    letter-spacing: 2px;
    border-bottom: 2px solid #000;
    padding: 10px;
    font-size: 0.8rem;
    font-weight: 900;
    text-align: center;
}

.career-table {
    width: calc(100% - 60px); /* ESPAÇO GENEROSO PARA O SLANT RESPIRAR */
    margin: 8px auto; /* CENTRALIZA E DÁ DISTÂNCIA DAS BORDAS */
    border-collapse: separate;
    border-spacing: 0;
    transform: skewX(-17deg); /* INCLINA A TABELA TODA */
}

.career-table th {
    background: #111;
    color: #888;
    padding: 8px;
    border-right: 1px solid rgba(255,255,255,0.1);
    border-bottom: 5px solid #000;
    font-size: 0.65rem;
    letter-spacing: px;
    text-transform: uppercase;
    font-weight: 900;
}

.career-table td {
    padding: 12px 8px;
    border-right: 1px solid rgba(255,255,255,0.1);
    border-bottom: 1px solid rgba(0,0,0,0.2);
    vertical-align: middle;
    text-align: center;
}

.career-table td span, .career-table th span {
    display: inline-block;
    transform: skewX(15deg); /* DES-INCLINA O TEXTO */
}

/* Rows (Solid Colors) */
.row-liga { background: #0d3b2e !important; color: white !important; }
.row-liga:hover { background: #125240 !important; }

.row-copas { background: #497c63 !important; color: white !important; }
.row-copas:hover { background: #368d62 !important; }

.row-total { background: #bd5b1a !important; color: white !important; }
.row-total:hover { background: #e67e22 !important; }

.row-total td { font-size: 1rem; font-weight: 900; }

.career-table td:last-child {
    background: rgba(0,0,0,0.2);
    font-weight: 900;
}

.slanted-text { display: inline-block; transform: skewX(15deg); }

.table-input {
    width: 40px;
    background: rgba(255,255,255,0.3);
    border: none;
    text-align: center;
    font-weight: bold;
    border-radius: 4px;
    padding: 2px;
}

.performance-status {
    font-size: 1.2rem;
    letter-spacing: 2px;
}

/* Fix Badge overlap & Improvements */
.result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.03);
    border-left: 4px solid rgba(255,255,255,0.1);
    padding: 12px 15px;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.result-item:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(5px);
}

/* Hover dourado para campeões */
.result-item.has-champion:hover {
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.05) 0%, rgba(0,0,0,0) 100%);
}

.position-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    margin-left: 10px;
}

.position-badge.champion {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #000;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.position-badge.vice {
    background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    color: #000;
    box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.position-badge.other {
    background: rgba(100, 100, 100, 0.3);
    color: #fff;
}

/* Mini Troféu nos Resultados */
.mini-trophy-container {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mini-trophy-img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3));
}

.position-badge.pos-1 {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #000;
}

.position-badge.pos-2 {
    background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    color: #000;
}

.position-badge.pos-3 {
    background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%);
    color: #000;
}

.position-badge[class*="pos-"] {
    background: rgba(100, 100, 100, 0.3);
    color: #fff;
}

.big-shield-display {
    background: rgba(0,0,0,0.4);
    border-radius: 12px;
}

.shield-flag-bg {
    position: relative;
    padding: 40px;
    border-radius: 8px;
    border: 4px solid white;
}

.shield-star-top {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    text-shadow: 0 0 10px rgba(0,0,0,0.8);
}

.search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #1a1a1a;
    border: 1px solid #333;
    z-index: 100;
}

.search-item {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #222;
}

.search-item:hover {
    background: #333;
}

.trophy-item-mini {
    background: #000;
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #444;
}

.modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
    z-index: 2000;
}

/* TROPHY ROOM STYLES */
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
}

.trophy-card {
    min-height: 380px;
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

.tc-year {
    font-size: 0.65rem;
    font-weight: 700;
    opacity: 0.5;
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

.tc-trophy-box {
    width: 120px;
    height: 120px;
    z-index: 2;
}

.trophy-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 5px 15px rgba(255,193,7,0.3));
}

.tc-shield-box {
    position: absolute;
    bottom: 5px;
    right: 5px;
    opacity: 0.8;
}

.tc-footer {
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 10px;
}

/* Novos estilos para sistema de estrelas */
.tc-stars {
    text-align: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
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
    font-size: 0.85rem;
    font-weight: 900;
    color: var(--color-accent);
    text-transform: uppercase;
    line-height: 1.2;
    text-align: center;
    margin-top: 8px;
    margin-bottom: 4px;
}

.tc-count-badge {
    display: inline-block;
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tc-years {
    font-size: 0.65rem;
    line-height: 1.4;
    max-height: 40px;
    overflow-y: auto;
    margin-bottom: 5px;
}

.tc-teams {
    font-size: 0.7rem;
    color: var(--color-accent);
}

/* Lista de Times com Escudo GRANDE e Bandeira */
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
    gap: 6px;
    background: rgba(255, 255, 255, 0.05);
    padding: 10px;
    border-radius: 12px;
    transition: all 0.3s ease;
    min-width: 100px;
}

.team-badge-large:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

.team-shield-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.team-flag-below {
    margin-top: 4px;
}

.team-name-large {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.2;
    max-width: 100px;
    word-wrap: break-word;
}

.tc-team-name {
    font-size: 0.85rem;
    font-weight: 900;
    text-transform: uppercase;
}

.empty-slot .trophy-card-inner {
    border: 2px dashed rgba(255,255,255,0.1);
    background: transparent;
    cursor: pointer;
}

.empty-slot:hover .trophy-card-inner {
    border-style: solid;
    background: rgba(255,255,255,0.02);
}

.text-neon-green {
  color: #39ff14;
  text-shadow: 0 0 8px rgba(57, 255, 20, 0.8);
}

.pulse-neon {
  animation: pulse-neon-anim 2s infinite;
  display: inline-block;
}

@keyframes pulse-neon-anim {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.7; transform: scale(1); }
}

/* Contract Banner Styles */
.contract-banner {
    background: linear-gradient(135deg, #181818 0%, #252525 100%);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.05);
    min-height: 120px;
    transition: all 0.3s ease;
}

.contract-banner:hover {
    border-color: rgba(255,255,255,0.1);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}


.watermark-shield {
    position: absolute;
    left: 30%;
    height: 160%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-10deg);
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
}

.grayscale-shield {
    filter: grayscale(100%) contrast(1.2);
    width: auto;
    height: 100%;
}

.watermark-flag {
    position: absolute;
    right: 20%;
    top: 50%;
    height: 160%;
    width: auto; /* Deixar auto para manter proporção */
    min-width: 300px;
    transform: translate(50%, -50%) rotate(10deg);
    opacity: 0.15; /* Aumentar um pouco a opacidade */
    z-index: 0;
    pointer-events: none;
    mask-image: linear-gradient(to left, transparent, black 80%);
    -webkit-mask-image: linear-gradient(to left, transparent, black 80%);
}

/* Forçando estilo no componente NationalFlag via deep selector */
.watermark-flag :deep(.flag-container) {
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    display: block;
}

.watermark-flag :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Mudado para contain para ver a bandeira toda */
    border-radius: 0 !important;
}

.obs-input-transparent {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    outline: none;
    color: rgba(255,255,255,0.95);
    font-size: 1.1rem;
    padding: 5px 0;
    transition: border-color 0.3s;
}

.obs-input-transparent:focus {
    border-bottom-color: rgba(255,255,255,0.3);
}

.obs-input-transparent::placeholder {
    color: rgba(255,255,255,0.3);
    font-weight: 400;
    font-style: italic;
}

.letter-spacing-2 {
    letter-spacing: 2px;
}

.tab-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 8px 24px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(5px);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
}

.tab-button.active {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #000;
  border-color: #ffc107;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
}
</style>


