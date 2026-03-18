<template>
  <div class="view-container">
    <!-- Overlay de Erro Crítico -->
    <div v-if="renderError" class="alert alert-danger m-3 d-flex flex-column align-items-center p-5 rounded-4 shadow-lg animated-fade-in" style="z-index: 9999; position: relative;">
      <i class="bi bi-exclamation-triangle-fill display-1 mb-4"></i>
      <h2 class="fw-black text-uppercase">Opa! Algo deu errado.</h2>
      <p class="fs-5 text-center mt-2">Um erro de renderização impediu o carregamento completo desta página.</p>
      <div class="bg-black bg-opacity-25 p-3 rounded-3 w-100 my-4">
        <code>{{ renderError }}</code>
      </div>
      <div class="d-flex gap-3">
        <button class="btn btn-light fw-bold px-4 py-2" @click="recoverFromError">TENTAR RECUPERAR</button>
        <button class="btn btn-outline-light fw-bold px-4 py-2" @click="resetNavigation(); renderError = null">VOLTAR AO INÍCIO</button>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-4 px-2">
      <div class="d-flex align-items-center gap-3">
          <h2 class="m-0"><i class="bi bi-globe-americas me-2"></i>UNIVERSO DO FUTEBOL</h2>
          <button @click="$router.push('/checklist')" class="btn btn-outline-warning btn-sm fw-bold text-uppercase" style="letter-spacing: 1px; font-size: 0.7rem;">
            <i class="bi bi-list-check me-1"></i> Checklist
          </button>
          <button @click="$router.push('/clubes')" class="btn btn-outline-info btn-sm fw-bold text-uppercase" style="letter-spacing: 1px; font-size: 0.7rem;">
            <i class="bi bi-shield-shaded me-1"></i> Gestão de Clubes
          </button>
      </div>
      <LogoFREeFOOT />
    </div>

    <!-- Tabs de Navegação -->
    <div class="d-flex justify-content-center gap-4 mb-4">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'clubes' }"
        @click="activeTab = 'clubes'; resetNavigation()"
      >
        <i class="bi bi-shield-shaded me-2"></i>MUNDO DOS CLUBES
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'selecoes' }"
        @click="activeTab = 'selecoes'; resetNavigation()"
      >
        <i class="bi bi-flag-fill me-2"></i>MUNDO DAS SELEÇÕES
      </button>
    </div>

    <!-- Breadcrumb -->
    <div class="mb-4 d-flex gap-2 align-items-center flex-wrap px-2">
      <button @click="resetNavigation" class="breadcrumb-btn" :class="{ active: !selectedContinent }">
        {{ activeTab === 'clubes' ? 'MUNDO DOS CLUBES' : 'MUNDO DAS SELEÇÕES' }}
      </button>
      <i class="bi bi-chevron-right opacity-25" v-if="selectedContinent"></i>
      <button v-if="selectedContinent" @click="backToCountries" class="breadcrumb-btn" :class="{ active: selectedContinent && !selectedCountry && (activeTab === 'clubes' || !selectedCompetition) }">
        {{ selectedContinent.continente }}
      </button>
      <i class="bi bi-chevron-right opacity-25" v-if="selectedCountry"></i>
      <button v-if="selectedCountry" @click="backToCompetitions" class="breadcrumb-btn" :class="{ active: selectedCountry && !selectedCompetition }">
        {{ selectedCountry.nome }}
      </button>
    </div>

    <div class="row g-4 m-0">
      <!-- NÍVEL 4: DETALHES E TEMPORADAS (30/70 Layout) -->
      <div v-if="selectedCompetition" class="col-12 px-2">
        <div class="row g-4 m-0">
          <!-- Sidebar: Info da Competio (30%) -->
          <div class="col-xl-3">
            <GamePanel :customClass="getFederationColorClass(selectedCompetition.continente || (selectedContinent ? getFederation(selectedContinent.continente).nome : ''))">
              <div class="text-center p-3">
                <div class="d-flex align-items-center justify-content-center gap-3 mb-4">
                  <div class="comp-sidebar-logo-highlight">
                    <img v-if="selectedCompetition.logo" :src="getCachedLogo(selectedCompetition.logo)" @error="(e) => e.target.style.display='none'" class="comp-sidebar-logo">
                    <i class="bi bi-trophy fs-1 text-dark opacity-50" v-if="!selectedCompetition.logo"></i>
                  </div>
                  
                  <div v-if="selectedCompetition.trofeu" class="comp-sidebar-logo-highlight">
                    <img :src="getTrofeuPath(selectedCompetition.trofeu)" 
                         class="comp-sidebar-logo"
                         alt="Troféu"
                         @error="e => e.target.parentElement.style.display='none'">
                  </div>
                </div>
                <h4 class="fw-bold text-uppercase">{{ selectedCompetition.nome }}</h4>
                <div v-if="selectedCountry" class="d-flex justify-content-center align-items-center gap-2 mb-3">
                  <NationalFlag :countryName="selectedCountry.nome" :forceUrl="selectedCountry.bandeira" :size="20" />
                  <span class="text-secondary small fw-bold text-uppercase opacity-75">{{ selectedCountry.nome }}</span>
                </div>
                
                <hr class="border-secondary opacity-25">
                
                <div class="d-flex flex-column gap-2">
                  <GameButton class="w-100 py-3" @click="openForm">
                    <i class="bi bi-plus-circle me-2"></i> REGISTRAR TEMPORADA
                  </GameButton>
                  
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-info flex-grow-1 py-2 fw-bold text-uppercase small" @click="$router.push(`/competicao/${selectedCompetition.id}/historico`)">
                      <i class="bi bi-trophy me-1"></i> 🏆 HISTÓRICO
                    </button>
                    <button class="btn btn-outline-warning py-2 fw-bold text-uppercase small" @click="importFromIMLPES" title="Importar dados do extrator iMLPES">
                      <i class="bi bi-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            </GamePanel>

          </div>

          <!-- Main: Lista de Temporadas (70%) -->
          <div class="col-xl-9">
            <GamePanel customClass="h-100">
              <h4 class="mb-4 text-secondary d-flex justify-content-between align-items-center">
                <span><i class="bi bi-calendar-event me-2"></i>TEMPORADAS REGISTRADAS</span>
                <span class="badge bg-primary fs-6">{{ seasonStore.list.length }}</span>
              </h4>

              <div class="table-responsive">
                <table class="table table-dark table-hover align-middle">
                  <thead>
                    <tr class="text-secondary opacity-50 x-small text-uppercase border-bottom border-secondary border-opacity-25">
                      <th style="width: 100px">TEMPORADA</th>
                      <th>CAMPEÃO</th>
                      <th>VICE</th>
                      <th class="text-center" style="width: 80px">STATUS</th>
                      <th class="text-center" style="width: 180px">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="s in seasonStore.list" :key="s.id">
                      <tr class="border-bottom border-secondary border-opacity-10">
                      <td class="fw-bold fs-5 text-nowrap">{{ s.ano }}</td>
                      <td class="text-nowrap">
                        <div class="d-flex align-items-center gap-2">
                          <TeamShield :teamName="s.campeao" :isNational="activeTab === 'selecoes'" :size="36" :season="s.ano" />
                          <div class="d-flex flex-column">
                            <div class="d-flex align-items-center gap-1 no-wrap">
                              <span class="fw-bold text-uppercase name-cell">{{ s.campeao }}</span>
                              <img v-if="isFromLib(s.campeao)" src="/logos/competitions/classdaliberta.png" class="lib-indicator-mini ms-1" title="Vindo da Libertadores">
                              <i v-if="careerStore.isUserTeam(s.campeao, s.ano)" class="bi bi-controller ms-1 text-neon-green pulse-neon"></i>
                              
                              <!-- identificação de País e federação (Mundial - Mesma Linha) -->
                              <template v-if="(selectedCompetition?.modoRegistro === 'mundial' || selectedCompetition?.nome === 'Mundial de Clubes') && getClubInfo(s.campeao)">
                                <div class="d-flex align-items-center gap-1 ms-2 opacity-50 border-start border-secondary border-opacity-25 ps-2">
                                  <NationalFlag :countryName="getClubInfo(s.campeao).pais" :forceUrl="getClubInfo(s.campeao).bandeira" :size="14" />
                                  <span class="x-small fw-bold text-uppercase">{{ getClubInfo(s.campeao).pais }}</span>
                                </div>
                                <div class="d-flex align-items-center gap-1 ms-1">
                                  <img v-if="getClubInfo(s.campeao).federacaoLogo" :src="getCachedLogo(getClubInfo(s.campeao).federacaoLogo)" style="height: 12px; width: fit-content;">
                                  <span class="x-small fw-bold text-uppercase">{{ getClubInfo(s.campeao).federacao }}</span>
                                </div>
                              </template>

                              <!-- identificação de País (Comum - Mesma Linha) -->
                              <div v-else-if="selectedCompetition?.tipo === 'internacional' && getClubInfo(s.campeao)" class="d-flex align-items-center gap-1 ms-1">
                                <NationalFlag :countryName="getClubInfo(s.campeao).pais" :forceUrl="getClubInfo(s.campeao).bandeira" :size="16" />
                                <span class="x-small fw-bold text-uppercase">{{ getClubInfo(s.campeao).pais }}</span>
                              </div>

                              <div class="stars-display d-flex align-items-center gap-1 ms-1">
                                <span class="stars-individual text-warning lh-1">{{ getIndividualStars(countTitles(s.campeao, s.ano)) }}</span>
                                <span v-if="getGroupedStars(countTitles(s.campeao, s.ano))" class="text-secondary opacity-50 x-small fw-bold">+</span>
                                <div v-if="getGroupedStars(countTitles(s.campeao, s.ano))" class="group-star-badge">
                                  ⭐ {{ getGroupedStars(countTitles(s.campeao, s.ano)) }}
                                </div>
                              </div>
                            </div>
                            
                            <small class="text-secondary x-small fw-bold mt-1">
                              {{ countTitles(s.campeao, s.ano) }} TÍTULOS
                            </small>
                          </div>
                        </div>
                      </td>
                      <td class="text-nowrap">
                        <div class="d-flex align-items-center gap-2">
                          <TeamShield :teamName="s.vice" :isNational="activeTab === 'selecoes'" :size="28" :season="s.ano" />
                          <div class="d-flex flex-column">
                            <div class="d-flex align-items-center gap-1 no-wrap">
                              <span class="small text-uppercase name-cell-vice">{{ s.vice || '-' }}</span>
                              <img v-if="s.vice && isFromLib(s.vice)" src="/logos/competitions/classdaliberta.png" class="lib-indicator-mini ms-1" title="Vindo da Libertadores">
                              <i v-if="s.vice && careerStore.isUserTeam(s.vice, s.ano)" class="bi bi-controller ms-1 text-neon-green pulse-neon"></i>
                              
                              <!-- identificação de País e federação (Mundial - Mesma Linha - Vice) -->
                              <template v-if="(selectedCompetition?.modoRegistro === 'mundial' || selectedCompetition?.nome === 'Mundial de Clubes') && s.vice && getClubInfo(s.vice)">
                                <div class="d-flex align-items-center gap-1 ms-2 border-start border-secondary border-opacity-25 ps-2">
                                  <NationalFlag :countryName="getClubInfo(s.vice).pais" :forceUrl="getClubInfo(s.vice).bandeira" :size="12" />
                                  <span style="font-size: 0.6rem;" class="fw-bold text-uppercase">{{ getClubInfo(s.vice).pais }}</span>
                                </div>
                                <div class="d-flex align-items-center gap-1 ms-1">
                                  <img v-if="getClubInfo(s.vice).federacaoLogo" :src="getCachedLogo(getClubInfo(s.vice).federacaoLogo)" style="height: 10px; width: fit-content;">
                                  <span style="font-size: 0.6rem;" class="fw-bold text-uppercase">{{ getClubInfo(s.vice).federacao }}</span>
                                </div>
                              </template>

                              <!-- identificação de País (Comum - Mesma Linha - Vice) -->
                              <div v-else-if="selectedCompetition?.tipo === 'internacional' && s.vice && getClubInfo(s.vice)" class="d-flex align-items-center gap-1 ms-1">
                                <NationalFlag :countryName="getClubInfo(s.vice).pais" :forceUrl="getClubInfo(s.vice).bandeira" :size="14" />
                                <span class="x-small fw-bold text-uppercase">{{ getClubInfo(s.vice).pais }}</span>
                              </div>

                              <div v-if="s.vice" class="vices-display d-flex align-items-center gap-1 ms-1 opacity-50">
                                <span class="vices-individual lh-1">{{ getIndividualVices(countVices(s.vice, s.ano)) }}</span>
                                <span v-if="getGroupedVices(countVices(s.vice, s.ano))" class="text-secondary opacity-50 x-small fw-bold">+</span>
                                <div v-if="getGroupedVices(countVices(s.vice, s.ano))" class="group-star-badge" style="background: rgba(192, 192, 192, 0.1); border-color: rgba(192, 192, 192, 0.2); color: #a0a0a0;">
                                  🥈 {{ getGroupedVices(countVices(s.vice, s.ano)) }}
                                </div>
                              </div>
                            </div>

                            <small v-if="s.vice" class="text-secondary x-small fw-bold mt-1">
                              {{ countVices(s.vice, s.ano) }} VICES
                            </small>
                          </div>
                        </div>
                      </td>
                       <td class="text-center">
                        <div class="d-flex justify-content-center align-items-center gap-3">
                           <span v-if="(s.topScorers && s.topScorers.length > 0) || (s.artilheiro && s.artilheiro.nome)" 
                                 class="text-warning fs-4" title="Tem Artilheiro" style="text-shadow: 0 0 10px rgba(255,193,7,0.4)">⚽</span>
                           <!-- O ícone de tabela agora aparece se houver tabela TEXTUAL ou PRINTS na galeria -->
                           <span v-if="s.tabela || (s.printsUrls && s.printsUrls.some(u => u))" 
                                 class="text-info fs-4" title="Tabela ou Prints Inseridos" style="text-shadow: 0 0 10px rgba(0,242,255,0.4)">📋</span>
                        </div>
                      </td>
                      <td class="text-center text-nowrap">
                        <!-- ABRIR TEMPORADA -->
                        <button class="btn btn-sm btn-info border-0 me-1 p-2 rounded-3 text-dark" @click="$router.push('/season/' + s.id)" title="Ver Página Individual">
                          <i class="bi bi-list-ul fs-6"></i>
                        </button>
                        <!-- EDITAR -->
                        <button class="btn btn-sm btn-primary border-0 me-1 p-2 rounded-3" @click="prepareEdit(s)" title="Editar Temporada">
                          <i class="bi bi-pencil-square fs-6"></i>
                        </button>
                        <!-- EXCLUIR -->
                        <button class="btn btn-sm btn-danger border-0 p-2 rounded-3" @click="confirmDelete(s)" title="Excluir Temporada">
                          <i class="bi bi-trash fs-6"></i>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="s.tabela">
                      <td colspan="5" class="p-0">
                        <LeagueTable 
                          :data="s.tabela" 
                          :promotedCount="s.promovidos"
                          :relegationCount="s.rebaixados"
                          :playoffPromotedTeams="s.promovidosPlayoff || []"
                          :season="s.ano"
                          :country="selectedCountry?.nome"
                        />
                      </td>
                    </tr>
                    </template>
                    <tr v-if="seasonStore.list.length === 0">
                      <td colspan="4" class="text-center py-5 opacity-25">
                        <i class="bi bi-info-circle fs-1 d-block mb-3"></i>
                        Nenhuma temporada registrada ainda.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GamePanel>
          </div>
        </div>
      </div>

      <!-- NÍVEL 3: COMPETIÇÕES -->
      <div v-else-if="selectedCountry && !selectedCompetition" class="col-12 px-2">
         <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
            <h4 class="text-white m-0 text-uppercase fw-black">
              <i class="bi bi-trophy-fill me-2 text-warning"></i>Competições - {{ selectedCountry.nome }}
            </h4>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-info fw-bold text-uppercase small" @click="$router.push(`/pais/${selectedCountry.nome}/historico`)">
                <i class="bi bi-table me-2"></i> VER HISTÓRICO GERAL
              </button>
              <button class="btn btn-info fw-black text-uppercase small text-dark" style="background: #00f2ff;" @click="$router.push(`/pais/${selectedCountry.nome}/matriz`)">
                <i class="bi bi-calendar3 me-2"></i> VER MATRIZ EXPERT
              </button>
              <button class="btn btn-warning fw-black text-uppercase small text-dark" @click="$router.push(`/pais/${selectedCountry.nome}/trofeus`)">
                <i class="bi bi-trophy-fill me-2"></i> SALA DE TROFÉUS
              </button>
            </div>
         </div>

        <div class="game-grid-auto">
          <div v-for="comp in selectedCountry.competicoes" :key="comp.nome">
            <GamePanel 
              :customClass="'comp-card-premium position-relative h-100 cursor-pointer ' + getFederationColorClass(comp.continente || (selectedContinent ? getFederation(selectedContinent.continente).nome : ''))"
              @click="selectCompetition(comp)"
            >
              <div v-if="getCompCount(comp) > 0" class="position-absolute top-0 end-0 m-2 badge bg-info text-dark rounded-pill border border-info shadow-sm fw-black" style="font-size: 0.65rem; z-index: 10;">
                {{ getCompCount(comp) }} TEMPS
              </div>
              <div class="d-flex align-items-center gap-3">
                <div class="comp-items-horizontal d-flex gap-2">
                  <div class="comp-logo-container-highlight">
                    <img v-if="comp.logo" :src="getCachedLogo(comp.logo)" @error="(e) => e.target.style.display='none'" class="comp-logo-premium">
                    <i class="bi bi-trophy fs-4 text-dark opacity-50" v-if="!comp.logo"></i>
                  </div>
                  
                  <!-- Troféu Real (Lado a Lado) -->
                  <div v-if="comp.trofeu" class="comp-logo-container-highlight">
                    <img :src="getTrofeuPath(comp.trofeu)" 
                         class="comp-logo-premium"
                         alt="Troféu"
                         @error="e => e.target.parentElement.style.display='none'">
                  </div>
                </div>

                <div class="flex-grow-1 min-w-0">
                  <h5 class="mb-2 fw-bold text-uppercase competition-title">{{ comp.nome }}</h5>
                  <span class="badge badge-game-type" :class="'badge-' + comp.tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')">
                    {{ comp.tipo }}
                  </span>
                </div>
              </div>
            </GamePanel>
          </div>
        </div>
      </div>

      <!-- NÍVEL 2: PAÍSES (CLUBES) ou COMPETIÇÕES (SELEÇÕES) -->
      <div v-else-if="selectedContinent && !selectedCountry" class="col-12 px-2">
        
        <!-- MODO CLUBES: LISTA DE PAÍSES -->
        <div v-if="activeTab === 'clubes'" class="game-grid-auto">
          <div v-for="pais in selectedContinent.paises" :key="pais.nome">
            <GamePanel 
              :customClass="'h-100 cursor-pointer country-card-modern ' + getFederationColorClass(selectedContinent ? getFederation(selectedContinent.continente).nome : '')"
              @click="selectCountry(pais)"
            >
              <div class="country-glass-overlay"></div>
              <img v-if="pais.bandeira" :src="getCachedLogo(pais.bandeira)" @error="(e) => e.target.style.display='none'" class="country-bg-flag" alt="">
              <div class="country-iso-bg">{{ getISOCode(pais) }}</div>
              
              <div class="text-center py-4 position-relative z-1">
                <div class="mb-3 d-inline-block position-relative">
                  <NationalFlag :countryName="pais.nome" :forceUrl="pais.bandeira" :size="70" class="shadow-sm" />
                </div>
                <h4 class="m-0 fw-bold text-uppercase name-cell">{{ pais.nome }}</h4>
                <div class="country-accent-line"></div>
              </div>
            </GamePanel>
          </div>
        </div>

        <!-- MODO SELEÇÕES: LISTA DE COMPETIÇÕES (DIRETO) -->
        <div v-else-if="activeTab === 'selecoes'" class="animated-fade-in">
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
             <h4 class="text-white m-0 text-uppercase fw-black">
               <i class="bi bi-globe2 me-2 text-info"></i>Competições - {{ selectedContinent.continente }}
             </h4>
             <div class="d-flex gap-2">
               <button class="btn btn-outline-info fw-bold text-uppercase small" @click="$router.push(`/selecao/${selectedContinent.continente}/historico`)">
                 <i class="bi bi-table me-2"></i> VER HISTÓRICO GERAL
               </button>
               <button class="btn btn-info fw-black text-uppercase small text-dark" style="background: #00f2ff;" @click="$router.push(`/selecao/${selectedContinent.continente}/matriz`)">
                 <i class="bi bi-calendar3 me-2"></i> VER MATRIZ EXPERT
               </button>
             </div>
          </div>
          
          <div class="game-grid-auto">
            <div v-for="comp in selectedContinent.competicoes" :key="comp.id">
              <GamePanel 
                  :customClass="'comp-card-premium position-relative h-100 cursor-pointer ' + getFederationColorClass(selectedContinent.continente === 'Mundial' ? 'FIFA' : getFederation(selectedContinent.continente).nome)"
                  @click="selectCompetition(comp)"
                >
                  <div v-if="getCompCount(comp) > 0" class="position-absolute top-0 end-0 m-2 badge bg-info text-dark rounded-pill border border-info shadow-sm fw-black" style="font-size: 0.65rem; z-index: 10;">
                    {{ getCompCount(comp) }} TEMPS
                  </div>
                  <div class="d-flex align-items-center gap-3">
                    <div class="comp-items-horizontal d-flex gap-2">
                      <div class="comp-logo-container-highlight">
                        <img v-if="comp.logo" :src="getCachedLogo(comp.logo)" @error="(e) => e.target.style.display='none'" class="comp-logo-premium">
                        <img v-else-if="selectedContinent && getFederation(selectedContinent.continente).logo" :src="getCachedLogo(getFederation(selectedContinent.continente).logo)" class="comp-logo-premium p-1" title="Competição Oficial">
                        <i v-else class="bi bi-trophy fs-4 text-dark opacity-50"></i>
                      </div>
                      
                      <div v-if="comp.trofeu" class="comp-logo-container-highlight">
                        <img :src="getTrofeuPath(comp.trofeu)" class="comp-logo-premium">
                      </div>
                    </div>

                    <div class="flex-grow-1 min-w-0">
                      <h5 class="mb-2 fw-bold text-uppercase competition-title">{{ comp.nome }}</h5>
                      <span class="badge badge-game-type" :class="'badge-' + (comp.tipo ? comp.tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : 'copa')">
                        {{ comp.tipo }}
                      </span>
                    </div>
                  </div>
                </GamePanel>
            </div>
          </div>
        </div>
      </div>

      <!-- NÍVEL 1: MUNDO (Internacionais + Continentes) -->
      <div v-else class="col-12 px-2">
        <!-- SEÇÃO: COMPETIÇÕES INTERNACIONAIS (CLUBES) -->
        <div v-if="activeTab === 'clubes'" class="mb-5 animated-fade-in">
          <h3 class="mb-4 text-warning fw-bold"><i class="bi bi-trophy me-2"></i>COMPETIÇÕES INTERNACIONAIS</h3>
          <div class="international-grid">
            <div v-for="comp in INTERNATIONAL_DATA" :key="comp.id" class="col">
              <GamePanel 
                :customClass="'comp-card-premium position-relative h-100 cursor-pointer ' + getFederationColorClass(comp.continente)"
                @click="selectCompetition(comp)"
              >
                <div v-if="getCompCount(comp) > 0" class="position-absolute top-0 end-0 m-2 badge bg-info text-dark rounded-pill border border-info shadow-sm fw-black" style="font-size: 0.65rem; z-index: 10;">
                  {{ getCompCount(comp) }} TEMPS
                </div>
                <div class="d-flex align-items-center gap-3">
                  <div class="comp-items-horizontal d-flex gap-2">
                    <div class="comp-logo-container-highlight">
                      <img v-if="comp.logo" :src="getCachedLogo(comp.logo)" @error="(e) => e.target.style.display='none'" class="comp-logo-premium">
                      <i class="bi bi-trophy fs-4 text-dark opacity-50" v-if="!comp.logo"></i>
                    </div>
                    
                    <!-- Troféu Real (Lado a Lado) -->
                    <div v-if="comp.trofeu" class="comp-logo-container-highlight">
                      <img :src="getTrofeuPath(comp.trofeu)" 
                           class="comp-logo-premium"
                           alt="Troféu"
                           @error="e => e.target.parentElement.style.display='none'">
                    </div>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <h5 class="mb-1 fw-bold text-uppercase competition-title">{{ comp.nome }}</h5>
                    <div class="d-flex align-items-center gap-1 opacity-75">
                      <img v-if="getFederationLogo(comp.continente)" :src="getCachedLogo(getFederationLogo(comp.continente))" @error="(e) => e.target.style.display='none'" class="fed-mini-logo" alt="Fed Logo">
                      <span class="text-secondary x-small fw-bold text-uppercase">{{ comp.continente }}</span>
                    </div>
                  </div>
                </div>
              </GamePanel>
            </div>
          </div>
        </div>

        <hr class="border-secondary opacity-10 mb-5">

        <h3 class="mb-4 text-secondary fw-bold"><i class="bi bi-map me-2"></i>CONTINENTES</h3>
        
        <!-- CONTINENTES (CLUBES) -->
        <div v-if="activeTab === 'clubes'" class="game-grid-auto">
          <div v-for="cont in ALL_COMPETITIONS_DATA" :key="cont.continente">
            <GamePanel 
              :customClass="'h-100 cursor-pointer card-hover ' + getFederationColorClass(getFederation(cont.continente).nome)"
              @click="selectContinent(cont)"
            >
              <div class="text-center py-4">
                <img v-if="cont.logo_continente" :src="getCachedLogo(cont.logo_continente)" @error="(e) => e.target.style.display='none'" class="fed-logo mb-3" alt="Logo Continente">
                <i v-else class="bi bi-map fs-1 text-secondary mb-3"></i>
                <h3 class="mb-1">{{ cont.continente }}</h3>
                <p class="small text-secondary fw-bold">{{ getFederation(cont.continente).nome }}</p>
                <p class="opacity-75 small">{{ cont.paises.length }} Países</p>
              </div>
            </GamePanel>
          </div>
        </div>

        <!-- CONTINENTES (SELEÇÕES) -->
        <div v-if="activeTab === 'selecoes'" class="game-grid-auto">
          <div v-for="cont in NATIONAL_COMPETITIONS_STRUCTURE" :key="cont.id">
            <GamePanel 
              :customClass="'h-100 cursor-pointer card-hover ' + getFederationColorClass(cont.continente === 'Mundial' ? 'FIFA' : getFederation(cont.continente).nome)"
              @click="selectContinent(cont)"
            >
              <div class="text-center py-4">
                <img v-if="cont.logo_continente" :src="getCachedLogo(cont.logo_continente)" class="mb-3 fed-logo" alt="">
                <img v-else-if="getFederation(cont.continente).logo" :src="getCachedLogo(getFederation(cont.continente).logo)" class="mb-3 fed-logo">
                <i v-else class="bi bi-globe2 fs-1 text-info mb-3 d-block"></i>

                <h3 class="mb-1 fw-bold text-uppercase">
                  {{ cont.continente === 'Mundial' ? 'MUNDIAL' : getFederation(cont.continente).nome }}
                </h3>
                <div class="mt-2 text-secondary small opacity-50 fw-bold">{{ cont.continente }}</div>
              </div>
            </GamePanel>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Gerenciamento de Artilheiros -->
    <div v-if="showScorerModal" class="game-modal-overlay animated-fade-in" @click.self="showScorerModal = false">
      <GamePanel class="modal-content-panel scorer-mgmt-modal" :customClass="'neon-fifa'">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="m-0 text-warning">
            <i class="bi bi-person-badge-fill me-2"></i>ARTILHEIROS  {{ selectedSeasonForScorer.ano }}
          </h3>
          <button class="btn-close btn-close-white" @click="showScorerModal = false"></button>
        </div>

        <div class="row g-4">
          <!-- Coluna 1: Lista de Artilheiros (Horizontal Full Width) -->
          <div class="col-md-12 border-bottom border-secondary border-opacity-25 pb-4">
            <h6 class="text-secondary fw-bold mb-3 text-uppercase small">Lista Horizontal de Artilheiros</h6>
            <div class="scorer-list-container custom-scrollbar d-flex flex-column gap-2">
              <div v-if="selectedSeasonForScorer.topScorers.length === 0" class="text-center py-4 opacity-25">
                <i class="bi bi-person-dash fs-2 d-block mb-2"></i>
                <span class="small">Nenhum artilheiro registrado.</span>
              </div>
              <div v-for="(sc, index) in selectedSeasonForScorer.topScorers" :key="index" class="scorer-item-card-horizontal rounded-3 bg-black bg-opacity-40 d-flex align-items-center gap-3 w-100">
                <!-- CHUTEIRA DOURADA (Imagem Artilheiro) -->
                <div class="sc-item-pos">
                  <img v-if="index === 0" src="/logos/competitions/artilheiro.png" class="artilheiro-icon-lg highlight-glow">
                  <span v-else class="opacity-25 fw-black">{{ index + 1 }}</span>
                </div>



                <!-- FOTO (ENTRE TROFU E NOME) -->
                <div class="sc-item-photo-xl cursor-zoom-in" @click="openPhotoZoom(sc.fotoUrl)">
                   <img v-if="sc.fotoUrl" :src="getCachedLogo(sc.fotoUrl)" class="img-fluid rounded-2 shadow-lg">
                   <div v-else class="sc-photo-placeholder"><i class="bi bi-person"></i></div>
                </div>

                <!-- NOME E POSIÇÃO EM CAMPO -->
                <div style="min-width: 250px;">
                  <div class="fw-black text-uppercase fs-3 ls-1 mb-0">{{ sc.nome }}</div>
                  <div class="fs-6 text-info text-uppercase fw-black opacity-75 ls-1">{{ sc.posicaoCampo || 'ATACANTE' }}</div>
                </div>

                <!-- NACIONALIDADE -->
                <div class="d-flex align-items-center gap-2 px-3 border-start border-secondary border-opacity-25" style="min-width: 180px;">
                  <NationalFlag :countryName="sc.nacionalidade" :forceUrl="getNationalityFlag(sc.nacionalidade)" :size="36" />
                  <span class="fs-6 fw-black text-uppercase truncate text-secondary ls-1">{{ sc.nacionalidade }}</span>
                </div>

                <!-- CLUBE + ESCUDO + BANDEIRA PAS -->
                <div class="d-flex align-items-center gap-3 px-3 border-start border-secondary border-opacity-25 flex-grow-1">
                  <TeamShield :teamName="sc.clube" :size="64" />
                  <div class="d-flex flex-column">
                    <span class="fw-black text-uppercase truncate ls-1" style="font-size: 1.25rem;">{{ sc.clube }}</span>
                    <div v-if="getClubInfo(sc.clube)" class="d-flex align-items-center gap-1 opacity-75">
                       <NationalFlag :countryName="getClubInfo(sc.clube).pais" :forceUrl="getClubInfo(sc.clube).bandeira" :size="20" />
                       <span class="small fw-bold text-uppercase ls-1">{{ getClubInfo(sc.clube).pais }}</span>
                    </div>
                  </div>
                </div>

                <!-- GOLS (DESTAQUE) -->
                <div class="text-center px-4 border-start border-secondary border-opacity-25">
                   <div class="badge bg-warning text-dark fw-black px-3 py-2 goal-badge-premium">{{ sc.gols }}</div>
                   <div class="fw-black text-warning opacity-50 mt-1 ls-1" style="font-size: 0.8rem;">GOLS</div>
                </div>


                <!-- AÇÕES -->
                <div class="d-flex gap-2 ms-auto border-start border-secondary border-opacity-25 ps-3 flex-shrink-0">
                  <button class="btn btn-outline-primary btn-sm p-2" @click="editScorer(sc, index)"><i class="bi bi-pencil-fill"></i></button>
                  <button class="btn btn-outline-danger btn-sm p-2" @click="deleteScorer(index)"><i class="bi bi-trash-fill"></i></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Formulrio Add/Edit (Horizontal Form) -->
          <div class="col-md-12 pt-2">
            <h6 class="text-warning fw-bold mb-3 text-uppercase small d-flex align-items-center gap-2">
              <i class="bi bi-plus-circle-fill"></i>
              {{ isEditingScorer ? 'EDITAR DADOS DO ARTILHEIRO' : 'ADICIONAR NOVO ARTILHEIRO' }}
            </h6>
            <form @submit.prevent="saveScorer" class="scorer-inner-form h-form-remix p-3 rounded-4 bg-black bg-opacity-20">
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Nome do Jogador</label>
                  <input type="text" v-model="scorerForm.nome" class="form-control game-input py-2" placeholder="Nome Completo" required>
                </div>
                <div class="col-md-2">
                  <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Pos. Campo</label>
                  <input type="text" v-model="scorerForm.posicaoCampo" class="form-control game-input py-2" placeholder="Ex: ATACANTE">
                </div>
                <div class="col-md-2">
                  <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Nacionalidade</label>
                  <div class="d-flex align-items-center gap-2">
                    <input type="text" v-model="scorerForm.nacionalidade" class="form-control game-input py-2" placeholder="PAS">
                    <NationalFlag v-if="scorerForm.nacionalidade" :countryName="scorerForm.nacionalidade" :forceUrl="getNationalityFlag(scorerForm.nacionalidade)" :size="24" />
                  </div>
                </div>
                <div class="col-md-2">
                  <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Clube</label>
                  <div class="d-flex align-items-center gap-2">
                    <input type="text" v-model="scorerForm.clube" class="form-control game-input py-2" placeholder="Clube">
                    <TeamShield v-if="scorerForm.clube" :teamName="scorerForm.clube" :size="24" />
                  </div>
                </div>
                <div class="col-md-1">
                  <label class="x-small text-uppercase opacity-50 fw-bold mb-1">Gols</label>
                  <input type="number" v-model="scorerForm.gols" class="form-control game-input py-2" required>
                </div>
                <div class="col-md-2">
                  <div 
                    class="player-photo-upload-zone scorer-upload-h"
                    tabindex="0"
                    @paste="handlePasteScorerPhoto"
                  >
                    <template v-if="playerPhotoPreview">
                       <img :src="getCachedLogo(playerPhotoPreview)" class="h-photo-preview">
                       <div class="change-photo-overlay-small" @click="$refs.scorerPhotoInput.click()"><i class="bi bi-camera"></i></div>
                    </template>
                    <div v-else class="text-center py-1 opacity-50" @click="$refs.scorerPhotoInputModal.click()">
                      <i class="bi bi-image x-small"></i>
                      <div style="font-size: 0.5rem; line-height: 1;">FOTO CTRL+V</div>
                    </div>
                  </div>
                                    <input type="file" ref="scorerPhotoInputModal" class="d-none" @change="handleFileScorerPhoto" accept="image/*">
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button type="button" @click="resetScorerForm" class="btn btn-outline-secondary px-4 fw-bold">LIMPAR</button>
                <button type="submit" class="btn btn-warning px-5 fw-black shadow-lg">
                  {{ isEditingScorer ? 'ATUALIZAR REGISTRO' : 'CONFIRMAR E ADICIONAR' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <hr class="border-secondary opacity-25 my-4">

        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-secondary fw-bold" @click="showScorerModal = false">CANCELAR</button>
          <GameButton @click="persistScorers">SALVAR TODOS OS DADOS</GameButton>
        </div>
      </GamePanel>
    </div>
    <!-- FORMULRIO FULL SCREEN UNIFICADO -->
    <div v-if="viewMode === 'form'" class="form-full-screen-overlay animated-fade-in">
      <div class="form-full-screen-content custom-scrollbar">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <h1 class="fw-black text-uppercase m-0 ls-2">
            <i class="bi" :class="isEditing ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
            {{ isEditing ? 'EDITAR' : 'REGISTRAR' }} TEMPORADA
          </h1>
          <button class="btn-close-large" @click="viewMode = 'list'"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="row g-5">
          <!-- SEÇÃO 1: DADOS BSICOS (CAMPEÃO / VICE) -->
          <div class="col-xl-7">
            <div class="form-section-premium mb-5">
              <h4 class="text-warning fw-black mb-3 text-uppercase"><i class="bi bi-trophy-fill me-2"></i>DADOS DA TEMPORADA</h4>
              
              <div class="mb-4">
                <label class="form-label fw-bold text-secondary text-uppercase small">Temporada</label>
                <input type="text" v-model="newSeason.ano" class="form-control game-input text-center fs-3 fw-black text-warning" placeholder="EX: 2026 / 2027 = 2027" style="height: 60px;">
              </div>

              <div class="row g-4">
                <div class="col-md-6 position-relative">
                  <label class="form-label fw-bold text-secondary text-uppercase small">Campeão</label>
                  <div class="d-flex gap-2 align-items-center mb-2">
                    <input type="text" v-model="newSeason.campeao" 
                           @focus="showTeamResults.campeao = true"
                           class="form-control game-input" placeholder="Buscar time...">
                    <TeamShield :teamName="newSeason.campeao" :isNational="activeTab === 'selecoes'" :size="48" />
                  </div>
                  <!-- Dropdown de Busca -->
                  <div v-if="showTeamResults.campeao && filteredTeams(newSeason.campeao).length > 0" class="team-search-dropdown shadow-lg">
                    <div v-for="t in filteredTeams(newSeason.campeao)" :key="t.nome" 
                         @click="selectTeam('campeao', t.nome)"
                         class="team-search-item">
                      <TeamShield :teamName="t.nome" :size="24" />
                      <span class="fw-bold">{{ t.nome }}</span>
                      <small class="ms-auto opacity-50">{{ t.pais }}</small>
                    </div>
                  </div>
                  <div v-if="getClubInfo(newSeason.campeao)" class="d-flex align-items-center gap-2 mt-2 ps-2 opacity-75">
                    <NationalFlag :countryName="getClubInfo(newSeason.campeao).pais" :forceUrl="getClubInfo(newSeason.campeao).bandeira" :size="16" />
                    <span class="x-small fw-bold text-uppercase">{{ getClubInfo(newSeason.campeao).pais }}</span>
                    <span class="mx-1 opacity-25">|</span>
                    <span class="x-small fw-bold text-uppercase text-secondary">{{ getClubInfo(newSeason.campeao).federacao }}</span>
                  </div>
                </div>

                <div class="col-md-6 position-relative">
                  <label class="form-label fw-bold text-secondary text-uppercase small">Vice-Campeão</label>
                  <div class="d-flex gap-2 align-items-center mb-2">
                    <input type="text" v-model="newSeason.vice" 
                           @focus="showTeamResults.vice = true"
                           class="form-control game-input" placeholder="Buscar time...">
                    <TeamShield :teamName="newSeason.vice" :isNational="activeTab === 'selecoes'" :size="48" />
                  </div>
                  <!-- Dropdown de Busca -->
                  <div v-if="showTeamResults.vice && filteredTeams(newSeason.vice).length > 0" class="team-search-dropdown shadow-lg">
                    <div v-for="t in filteredTeams(newSeason.vice)" :key="t.nome" 
                         @click="selectTeam('vice', t.nome)"
                         class="team-search-item">
                      <TeamShield :teamName="t.nome" :size="24" />
                      <span class="fw-bold">{{ t.nome }}</span>
                      <small class="ms-auto opacity-50">{{ t.pais }}</small>
                    </div>
                  </div>
                  <div v-if="getClubInfo(newSeason.vice)" class="d-flex align-items-center gap-2 mt-2 ps-2 opacity-75">
                    <NationalFlag :countryName="getClubInfo(newSeason.vice).pais" :forceUrl="getClubInfo(newSeason.vice).bandeira" :size="16" />
                    <span class="x-small fw-bold text-uppercase">{{ getClubInfo(newSeason.vice).pais }}</span>
                  </div>
                </div>
              </div>
            </div>
 
            <!-- SEÇÃO 1.5: PARTICIPANTES (SOLO PARA COMPETIÇÕES ESPECÍFICAS) -->
            <div v-if="selectedCompetition?.modoRegistro === 'participantes' || selectedCompetition?.tipo === 'Copa'" class="form-section-premium mb-5">
              <h4 class="text-success fw-black mb-3 text-uppercase"><i class="bi bi-people-fill me-2"></i>PARTICIPANTES</h4>
              
              <div class="row g-4 align-items-end mb-4">
                <div class="col-md-10 position-relative">
                  <label class="form-label fw-bold text-secondary text-uppercase small">Adicionar Time</label>
                  <input type="text" v-model="teamSearchQuery.participantes" 
                         @focus="showTeamResults.participantes = true"
                         class="form-control game-input" placeholder="Buscar time para adicionar...">
                         
                  <!-- Dropdown de Busca Participantes -->
                  <div v-if="showTeamResults.participantes && filteredTeams(teamSearchQuery.participantes).length > 0" class="team-search-dropdown shadow-lg">
                    <div v-for="t in filteredTeams(teamSearchQuery.participantes)" :key="t.nome" 
                         @click="selectTeam('participantes', t.nome)"
                         class="team-search-item">
                      <TeamShield :teamName="t.nome" :isNational="activeTab === 'selecoes'" :size="24" />
                      <span class="fw-bold">{{ t.nome }}</span>
                      <small class="ms-auto opacity-50">{{ t.pais }}</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-2">
                   <button type="button" class="btn btn-success w-100 fw-black py-2" @click="addParticipant(teamSearchQuery.participantes)">
                     <i class="bi bi-plus-lg"></i>
                   </button>
                </div>
              </div>

              <!-- NOVO: ENTRADA EM MASSA -->
              <div class="mb-4">
                <label class="form-label fw-bold text-secondary text-uppercase small">Importação em Massa (Lista de Nomes)</label>
                <textarea v-model="teamSearchQuery.participantesTexto" class="form-control game-textarea mb-2" rows="3" placeholder="Cole uma lista de nomes aqui (um por linha)..."></textarea>
                <button type="button" class="btn btn-outline-success btn-sm fw-black" @click="convertTextToList">
                  <i class="bi bi-arrow-repeat me-1"></i> CONVERTER LISTA
                </button>
              </div>

              <!-- Lista de Participantes -->
              <div class="participant-list-compact-grid">
                <div v-for="(p, idx) in newSeason.participantes" :key="p.clubeId" class="participant-item-card">
                   <div class="d-flex align-items-center gap-2">
                     <TeamShield :teamName="p.nome" :isNational="activeTab === 'selecoes'" :size="20" borderless />
                     <div class="flex-grow-1 min-w-0">
                       <div class="fw-bold text-uppercase x-small text-truncate">{{ p.nome }}</div>
                       <div class="x-small opacity-50 text-uppercase" style="font-size: 0.6rem;">{{ p.pais }}</div>
                     </div>
                     <button type="button" @click="removeParticipant(idx)" class="btn-remove-p">
                       <i class="bi bi-x"></i>
                     </button>
                   </div>
                </div>
              </div>
              <div v-if="newSeason.participantes.length === 0" class="text-center py-4 opacity-25 border border-secondary border-dashed rounded-3 small fw-bold">
                NENHUM PARTICIPANTE ADICIONADO AINDA.
              </div>
            </div>

            <!-- SEÇÃO 1.8: CLASSIFICAÇÃO FINAL DE COPA -->
            <div class="form-section-premium mb-5">
              <h4 class="text-primary fw-black mb-1 text-uppercase d-flex align-items-center justify-content-between">
                <span><i class="bi bi-diagram-3-fill me-2"></i>CLASSIFICAÇÃO DE COPA</span>
                <span v-if="newSeason.participantes && newSeason.participantes.length > 0" class="text-success animated-fade-in">✅ {{ newSeason.participantes.length }} times</span>
              </h4>
              <p class="text-secondary small mb-3">Cole a classificação final (Nome&nbsp;&nbsp;Fase) — um time por linha. O sistema detecta a fase automaticamente.</p>
              <p class="x-small opacity-50 mb-3 font-monospace">Ex: "River Plate Campeão" / "Aldosivi Semi" / "Instituto ACC Quartas"</p>

              <textarea 
                v-model="newSeason.classificacaoCopaTxt"
                class="form-control game-textarea mb-3"
                rows="8"
                placeholder="River Plate  Campeão&#10;Rosario Central  Vice&#10;Aldosivi  Semi&#10;Central Córdoba  Semi&#10;Instituto ACC  Quartas&#10;Banfield  Quartas&#10;Racing Club  Oitavas&#10;Patronato  16 Avos&#10;Arsenal de Sarandí  Pré-Copa"
              ></textarea>

              <!-- AJUSTE MANUAL DE POSIÇÕES (FALLBACK) -->
              <div class="mt-4 pt-4 border-top border-white border-opacity-5">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h6 class="text-warning fw-black text-uppercase small mb-0"><i class="bi bi-pencil-square me-2"></i>Ajuste Manual de Posições</h6>
                </div>

                <div v-if="newSeason.participantes && newSeason.participantes.length > 0" class="table-responsive rounded-3 border border-secondary border-opacity-10">
                  <table class="table table-dark table-hover mb-0 align-middle">
                    <thead class="bg-black bg-opacity-50">
                      <tr>
                        <th class="x-small fw-black text-secondary ps-3">TIME</th>
                        <th class="x-small fw-black text-secondary">POSIÇÃO / FASE</th>
                        <th class="x-small fw-black text-secondary text-center" style="width: 50px;"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, idx) in newSeason.participantes" :key="idx" class="border-bottom border-white border-opacity-5">
                        <td class="ps-3 py-2">
                          <div class="d-flex align-items-center gap-2">
                            <TeamShield :teamName="p.nome" :size="20" borderless :filterCountry="newSeason.pais" />
                            <span class="fw-bold small">{{ p.nome }}</span>
                          </div>
                        </td>
                        <td>
                          <select v-model="p.colocacao" 
                                  class="form-select form-select-sm fw-black x-small border-0 rounded-pill px-3" 
                                  :class="getCopaBadgeClass(p.colocacao)"
                                  @change="updateChampViceFromManual(p)">
                            <option v-for="opt in PLACEMENTS_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
                          </select>
                        </td>
                        <td class="text-center">
                          <button class="btn btn-link btn-sm text-danger opacity-50 hover-opacity-100 p-0" @click="removeParticipant(idx)">
                            <i class="bi bi-trash-fill"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center py-4 opacity-25 border border-secondary border-dashed rounded-3 small fw-bold">
                  USE O TEXTAREA ACIMA OU ADICIONE TIMES PARA DEFINIR A CLASSIFICAÇÃO.
                </div>
              </div>
            </div>

            <!-- SEÇÃO 2: TABELA (OPCIONAL) -->
            <div class="form-section-premium">
              <h4 class="text-info fw-black mb-3 text-uppercase d-flex align-items-center justify-content-between">
                <span><i class="bi bi-list-ol me-2"></i>TABELA FINAL (OPCIONAL)</span>
                <span v-if="newSeason.tabela" class="text-success animated-fade-in" title="Tabela Inserida">✅</span>
              </h4>
              
              <!-- NOVO: CHAVEAMENTO MUNDIAL (Componente Premium) -->
              <div v-if="selectedCompetition?.modoRegistro === 'mundial' || selectedCompetition?.nome === 'Mundial de Clubes'" class="mb-4">
                <MundialBracket 
                  v-if="newSeason?.mundial"
                  :mundial="newSeason.mundial" 
                  :isEditable="true" 
                />
              </div>

              <p class="text-secondary small mb-3">Cole aqui o conteúdo da tabela final da competição.</p>
              <textarea v-model="newSeason.tabela" class="form-control game-textarea" rows="8" placeholder="Cole a tabela aqui..."></textarea>
              
              <!-- SEÇÃO ESPECIAL: PROMOÇÃO PLAYOFF (BRASILEIRÃO SÉRIE B) -->
              <div v-if="hasPlayoffPromotion" class="mt-4 p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3">
                <h6 class="text-success fw-black text-uppercase small mb-2"><i class="bi bi-arrow-up-circle-fill me-2"></i>Promoção via Playoff (3 ao 6)</h6>
                <p class="x-small opacity-75 mb-3">Selecione os 2 times que subiram via Playoff:</p>
                
                <div class="d-flex flex-wrap gap-2">
                   <div v-for="team in playoffCandidates" :key="team" class="form-check form-check-inline">
                      <input class="form-check-input cursor-pointer" type="checkbox" :value="team" v-model="newSeason.promovidosPlayoff" :id="'playoff-'+team">
                      <label class="form-check-label fw-bold x-small cursor-pointer text-uppercase" :for="'playoff-'+team">{{ team }}</label>
                   </div>
                </div>
                <div v-if="playoffCandidates.length === 0" class="x-small text-warning opacity-75">
                   Cole a tabela acima para carregar os candidatos.
                </div>
              </div>
            </div>
          </div>

          <!-- SEÇÃO 3: ARTILHEIRO (OPCIONAL) -->
          <div class="col-xl-5">
            <div class="form-section-premium h-100">
              <h4 class="text-warning fw-black mb-3 text-uppercase"><i class="bi bi-person-badge-fill me-2"></i>ARTILHEIRO (OPCIONAL)</h4>
              
                <div 
                class="player-photo-upload-full mb-3 mx-auto"
                style="max-width: 250px; aspect-ratio: 3/4;"
                tabindex="0"
                @paste="handlePasteScorerPhoto"
              >
                <template v-if="playerPhotoPreview || scorerForm.fotoUrl">
                   <img :src="getCachedLogo(playerPhotoPreview || scorerForm.fotoUrl)" class="img-fluid rounded-4 shadow-lg w-100 h-100" style="object-fit: cover;">
                     <div class="change-photo-overlay-large" @click="$refs.scorerPhotoInput.click()">
                       <i class="bi bi-camera shadow"></i>
                       <span>Alterar Foto</span>
                     </div>
                     <button 
                        v-if="playerPhotoPreview || scorerForm.fotoUrl" 
                        @click.stop="removeScorerPhoto"
                        class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow-lg"
                        style="width: 32px; height: 32px; z-index: 10;"
                        title="Remover Foto"
                     >
                       <i class="bi bi-trash-fill"></i>
                     </button>
                </template>
                <div v-else class="text-center py-4 opacity-50" @click="$refs.scorerPhotoInput.click()">
                  <i class="bi bi-person-bounding-box display-6 d-block mb-2"></i>
                  <div class="fw-bold small">UPLOAD OU CTRL+V</div>
                  <div class="x-small mt-1 opacity-75">Foto do Jogador</div>
                </div>
              </div>
                                <input type="file" ref="scorerPhotoInput" class="d-none" @change="handleFileScorerPhoto" accept="image/*">

              <div class="mb-3">
                <label class="form-label fw-bold text-secondary text-uppercase small">Nome do Jogador</label>
                <input type="text" v-model="scorerForm.nome" class="form-control game-input" placeholder="Ex: Erling Haaland">
              </div>

              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label class="form-label fw-bold text-secondary text-uppercase small">Posição</label>
                  <input type="text" v-model="scorerForm.posicaoCampo" class="form-control game-input" placeholder="Ex: Atacante">
                </div>
                <div class="col-6">
                  <label class="form-label fw-bold text-secondary text-uppercase small">Gols</label>
                  <input type="number" v-model="scorerForm.gols" class="form-control game-input">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold text-secondary text-uppercase small">Nacionalidade</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="text" v-model="scorerForm.nacionalidade" class="form-control game-input" placeholder="Ex: Noruega">
                  <NationalFlag v-if="scorerForm.nacionalidade" :countryName="scorerForm.nacionalidade" :forceUrl="getNationalityFlag(scorerForm.nacionalidade)" :size="24" />
                </div>
              </div>

              <div class="position-relative">
                <label class="form-label fw-bold text-secondary text-uppercase small">Clube</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="text" v-model="scorerForm.clube" 
                         @focus="showTeamResults.clubeArtilheiro = true"
                         class="form-control game-input" placeholder="Ex: Manchester City">
                  <TeamShield v-if="scorerForm.clube" :teamName="scorerForm.clube" :size="32" />
                </div>
                <!-- Dropdown de Busca -->
                <div v-if="showTeamResults.clubeArtilheiro && filteredTeams(scorerForm.clube).length > 0" class="team-search-dropdown shadow-lg">
                  <div v-for="t in filteredTeams(scorerForm.clube)" :key="t.nome" 
                       @click="selectTeam('clubeArtilheiro', t.nome)"
                       class="team-search-item">
                    <TeamShield :teamName="t.nome" :isNational="activeTab === 'selecoes'" :size="20" />
                    <span class="fw-bold">{{ t.nome }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-3 mt-5 pb-5">
          <button class="btn btn-lg btn-outline-secondary px-5 fw-bold" @click="viewMode = 'list'">CANCELAR</button>
          <GameButton @click="saveNewSeason(true)">SALVAR E FECHAR</GameButton>
          <button class="btn btn-lg btn-warning px-5 fw-black shadow-lg" @click="saveNewSeason(false)">SALVAR</button>
        </div>

        <!-- SEÇÃO 4: GALERIA DE PRINTS (COPAS) -->
        <div v-if="selectedCompetition?.tipo === 'Copa' || selectedCompetition?.tipo === 'internacional'" class="row mt-4">
          <div class="col-12">
            <div class="form-section-premium">
              <h4 class="text-info fw-black mb-3 text-uppercase d-flex align-items-center justify-content-between">
                <span><i class="bi bi-images me-2"></i>GALERIA DE PRINTS (MAX 3)</span>
                <span v-if="newSeason.printsUrls && newSeason.printsUrls.some(u => u)" class="text-success animated-fade-in">✅</span>
              </h4>
              <p class="text-secondary small mb-4">Adicione prints de chaveamentos, resultados ou fases prévias. Clique no slot e use CTRL+V para colar.</p>
              
              <div class="d-flex flex-wrap gap-3">
                <div v-for="(url, idx) in newSeason.printsUrls" :key="idx" 
                     class="print-upload-slot"
                     :class="{ 'has-image': url }"
                     @paste="(e) => handlePastePrint(e, idx)"
                     tabindex="0"
                >
                  <template v-if="url">
                    <img :src="getCachedLogo(url)" class="print-preview-img" @click="openPhotoZoom(url)">
                    <div class="print-slot-overlay">
                       <button class="btn btn-danger btn-sm rounded-circle" @click.stop="removePrint(idx)">
                         <i class="bi bi-trash"></i>
                       </button>
                    </div>
                  </template>
                  <div v-else class="print-slot-empty" @click="$refs['printInput'+idx][0].click()">
                    <i class="bi bi-plus-lg d-block mb-1"></i>
                    <span class="x-small fw-bold">PRINT {{ idx + 1 }}</span>
                    <span v-if="url" class="text-success ms-1">✅</span>
                  </div>
                  <input type="file" :ref="'printInput'+idx" class="d-none" @change="(e) => handleFilePrint(e, idx)" accept="image/*">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Nome necessário para o keep-alive identificar o componente -->
<script>
export default { name: 'UniversoView' }
</script>

<script setup>
import { ref, onMounted, onActivated, watch, computed, onErrorCaptured } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GamePanel from '../components/GamePanel.vue'
import GameButton from '../components/GameButton.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { NATIONAL_COMPETITIONS_STRUCTURE } from '../services/national.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { seasonStore } from '../services/season.store'
import { clubStore } from '../services/club.store'
import { getSeasonFinalYear, getTrofeuPath, getNextSeasonYear, normalizeCountry } from '../services/utils'
import { CLUBS_DATA } from '../data/clubs.data'
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data'
import { db } from '../services/db'
import { imageCacheService } from '../services/imageCache.service'
import MundialBracket from '../components/MundialBracket.vue'
import { careerStore } from '../services/career.store'
import { seasonService } from '../services/season.service'

const globalCompCounts = ref({})
const renderError = ref(null)

onErrorCaptured((err, component, info) => {
  console.error("CAPTURADO NO UNIVERSOVIEW:", err, info)
  renderError.value = `Erro no componente: ${err.message}`
  return false // Impede que o erro suba e quebre o App.vue
})

const recoverFromError = async () => {
  renderError.value = null
  viewMode.value = 'list'
  isEditing.value = false
  await refreshCompCounts()
  if (selectedCompetition.value) {
    await selectCompetition(selectedCompetition.value)
  }
}

const refreshCompCounts = async () => {
   try {
     const allSeasons = await seasonService.getAll()
     const counts = {}
     allSeasons.forEach(s => {
       // Tentar contar pelo ID primeiro, depois pelo nome
       if (s.competitionId) {
         counts[s.competitionId] = (counts[s.competitionId] || 0) + 1
       }
       if (s.competitionName) {
         counts[s.competitionName] = (counts[s.competitionName] || 0) + 1
       }
     })
     globalCompCounts.value = counts
   } catch(e) {
     console.error("Erro ao contar competições globais:", e)
   }
}

onMounted(async () => {
   await refreshCompCounts()
})

const getCompCount = (comp) => {
  if (!comp) return 0
  // Tentar buscar por ID primeiro (mais preciso), depois por nome
  if (comp.id && globalCompCounts.value[comp.id]) return globalCompCounts.value[comp.id]
  return globalCompCounts.value[comp.nome] || 0
}

const showNewSeasonForm = ref(false)

const route = useRoute()
const router = useRouter()

const resetNavigation = () => {
  selectedContinent.value = null
  selectedCountry.value = null
  selectedCompetition.value = null
  showNewSeasonForm.value = false
  isEditing.value = false
  localStorage.removeItem('freefoot_universo_nav')
}

const backToCountries = () => {
  selectedCountry.value = null
  selectedCompetition.value = null
  showNewSeasonForm.value = false
  isEditing.value = false
}

const backToCompetitions = () => {
  selectedCompetition.value = null
  showNewSeasonForm.value = false
  isEditing.value = false
}

const restoreNavigation = () => {
  if (route.query.compId) {
    const compId = parseInt(route.query.compId)
    let foundComp = null, foundCountry = null, foundContinent = null
    for (const cont of ALL_COMPETITIONS_DATA) {
      if (cont.paises) {
        for (const p of cont.paises) {
          const c = p.competicoes.find(item => item.id === compId)
          if (c) { foundComp = c; foundCountry = p; foundContinent = cont; break }
        }
      }
      if (foundComp) break
      if (cont.continentais) {
        const c = cont.continentais.find(item => item.id === compId)
        if (c) { foundComp = c; foundContinent = cont; break }
      }
    }
    if (!foundComp) foundComp = INTERNATIONAL_DATA.find(c => c.id === compId)
    if (foundComp) {
      selectedContinent.value = foundContinent; selectedCountry.value = foundCountry; selectedCompetition.value = foundComp;
      // NÃO chamar loadSeasons() aqui — sem await neste contexto causa race condition.
      // O onMounted aguarda corretamente e chama loadSeasons() após restaurar o estado.
      router.replace({ query: {} })
      return
    }
  }

  if (route.query.reset === 'true') {
    resetNavigation()
    router.replace({ query: {} })
    return
  }
  
  const savedNav = localStorage.getItem('freefoot_universo_nav')
  if (savedNav) {
    try {
      const state = JSON.parse(savedNav)
      if (state.activeTab) activeTab.value = state.activeTab
      if (state.continent) selectedContinent.value = state.continent
      if (state.country) selectedCountry.value = state.country
      if (state.competition && state.competition.nome) {
        const allComps = [
          ...ALL_COMPETITIONS_DATA.flatMap(c => c.paises?.flatMap(p => p.competicoes) || []),
          ...ALL_COMPETITIONS_DATA.flatMap(c => c.continentais || []),
          ...NATIONAL_COMPETITIONS_STRUCTURE.flatMap(c => c.competicoes || []),
          ...INTERNATIONAL_DATA
        ]
        const foundComp = allComps.find(c => c.id === state.competition.id) || allComps.find(c => c.nome === state.competition.nome)
        if (foundComp) {
          selectedCompetition.value = foundComp
          // NÃO chamar loadSeasons() aqui — sem await neste contexto causa race condition.
          // O onMounted aguarda corretamente e chama loadSeasons() após restaurar o estado.
        }
      }
    } catch (e) { console.error("Erro ao restaurar navegação:", e) }
  }
}

// Watch para reset de navegação via Menu
watch(() => route.query.reset, (newVal) => {
  if (newVal === 'true') {
    resetNavigation()
    router.replace({ query: {} })
  } 
})

const isEditing = ref(false)
const currentEditId = ref(null)

// 0. Pré-carregar estado de navegação para evitar flash visual
const getSavedNav = () => {
  try {
    const saved = localStorage.getItem('freefoot_universo_nav')
    return saved ? JSON.parse(saved) : null
  } catch (e) { return null }
}
const initialNav = getSavedNav()

const activeTab = ref(initialNav?.activeTab || 'clubes') // 'clubes' | 'selecoes'
const selectedContinent = ref(initialNav?.continent || null)
const selectedCountry = ref(initialNav?.country || null)
const selectedCompetition = ref(null) // Será restaurado via restoreNavigation()
const viewMode = ref('list') // 'list' ou 'form'
const teamSearchQuery = ref({ 
  campeao: '', vice: '', clubeArtilheiro: '', participantes: '', participantesTexto: '',
  semi1t1: '', semi1t2: '', semi2t1: '', semi2t2: '',
  finalt1: '', finalt2: '', terceirot1: '', terceirot2: ''
})
const showTeamResults = ref({ 
  campeao: false, vice: false, clubeArtilheiro: false, participantes: false,
  semi1t1: false, semi1t2: false, semi2t1: false, semi2t2: false,
  finalt1: false, finalt2: false, terceirot1: false, terceirot2: false
})

const libTeamsCurrentSeason = ref([])

const loadLibTeams = async (year) => {
  if (!year) return
  try {
    const allSeasons = await seasonService.getAll()
    const libS = allSeasons.find(s => (s.competitionName === 'Libertadores' || s.competitionName === 'Copa Libertadores') && s.ano === year)
    if (libS) {
      const teams = []
      if (libS.tabela) {
         libS.tabela.split('\n').filter(l => l.trim()).forEach(line => {
           let cells = line.split('\t')
           if (cells.length === 1) cells = line.split(/\s{2,}/)
           if (cells[0]) teams.push(cells[0].replace(/^\d+[\s.]*/, '').trim())
         })
      }
      if (libS.participantes) libS.participantes.forEach(p => teams.push(p.nome))
      libTeamsCurrentSeason.value = [...new Set(teams)]
    } else {
      libTeamsCurrentSeason.value = []
    }
  } catch (e) {
    console.error("Erro ao carregar times da Libertadores:", e)
    libTeamsCurrentSeason.value = []
  }
}

const isFromLib = (teamName) => {
  if (!teamName || selectedCompetition.value?.nome !== 'Sul-Americana') return false
  return libTeamsCurrentSeason.value.some(t => t.toLowerCase().trim() === teamName.toLowerCase().trim())
}

// Restaurar competição e outros estados complexos imediatamente
try {
  restoreNavigation()
} catch (e) {
  console.error("Erro na restauração síncrona:", e)
}

const newSeason = ref({
  id: null,
  ano: '',
  campeao: '',
  vice: '',
  competitionName: '',
  topScorers: [],
  participantes: [],
  promovidosPlayoff: [],
  tabela: '',
  printsUrls: ['', '', ''], // Novo: Suporte para até 3 prints
  mundial: {
    semi1: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
    semi2: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
    final: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
    terceiro: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 }
  }
})

const showScorerModal = ref(false)
const selectedSeasonForScorer = ref(null)
const isEditingScorer = ref(false)
const currentScorerIndex = ref(null)
const showPhotoZoom = ref(false)
const zoomedPhotoUrl = ref('')
const scorerForm = ref({
  nome: '',
  posicaoCampo: '',
  nacionalidade: '',
  clube: '',
  gols: '',
  fotoUrl: ''
})

const playerPhotoPreview = ref(null)

const filteredTeams = (query) => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  if (activeTab.value === 'selecoes') {
    return NATIONAL_TEAMS_DATA.filter(c => c.nome.toLowerCase().includes(q)).slice(0, 10);
  }
  // Usar a lista do store que contém os times novos/customizados
  return clubStore.list.filter(c => c.nome.toLowerCase().includes(q)).slice(0, 10);
}

const updateMundialPositions = (phase, field, value) => {
  if (!newSeason.value.mundial) return;
  newSeason.value.mundial[phase][field] = value;
  
  // Recalcular Campeão e Vice se a final estiver preenchida
  const m = newSeason.value.mundial;
  if (m.final.time1 && m.final.time2 && (m.final.placar1 !== '' || m.final.placar2 !== '')) {
    const p1 = parseInt(m.final.placar1) || 0;
    const p2 = parseInt(m.final.placar2) || 0;
    const pn1 = parseInt(m.final.pen1) || 0;
    const pn2 = parseInt(m.final.pen2) || 0;

    if (p1 > p2 || (p1 === p2 && pn1 > pn2)) {
      newSeason.value.campeao = m.final.time1;
      newSeason.value.vice = m.final.time2;
    } else if (p2 > p1 || (p2 === p1 && pn2 > pn1)) {
      newSeason.value.campeao = m.final.time2;
      newSeason.value.vice = m.final.time1;
    }
  }
}

const selectTeam = (type, teamName) => {
  if (type === 'campeao') {
    newSeason.value.campeao = teamName;
    showTeamResults.value.campeao = false;
  } else if (type === 'vice') {
    newSeason.value.vice = teamName;
    showTeamResults.value.vice = false;
  } else if (type === 'clubeArtilheiro') {
    scorerForm.value.clube = teamName;
    showTeamResults.value.clubeArtilheiro = false;
  } else if (type === 'participantes') {
    addParticipant(teamName);
    teamSearchQuery.value.participantes = '';
    showTeamResults.value.participantes = false;
  } else if (type.startsWith('mundial_')) {
    const slot = type.replace('mundial_', ''); // ex: semi1t1
    const parts = slot.match(/([a-z]+)(\d)t(\d)/); // [match, phase, num, team]
    if (parts) {
      const field = `semi${parts[2]}`;
      const teamField = `time${parts[3]}`;
      updateMundialPositions(field, teamField, teamName);
    } else if (slot.startsWith('finalt')) {
      const teamNum = slot.replace('finalt', '');
      updateMundialPositions('final', `time${teamNum}`, teamName);
    } else if (slot.startsWith('terceirot')) {
      const teamNum = slot.replace('terceirot', '');
      updateMundialPositions('terceiro', `time${teamNum}`, teamName);
    }
    teamSearchQuery.value[slot] = '';
    showTeamResults.value[slot] = false;
  }
}

const addParticipant = (teamName) => {
  if (!teamName) return;
  const q = teamName.toLowerCase().trim();
  const alreadyAdded = newSeason.value.participantes.some(p => p.nome.toLowerCase().trim() === q);
  if (alreadyAdded) return;

  if (activeTab.value === 'selecoes') {
    const nation = NATIONAL_TEAMS_DATA.find(n => n.nome.toLowerCase().trim() === q);
    if (nation) {
      newSeason.value.participantes.push({
        clubeId: nation.id,
        nome: nation.nome,
        escudo: nation.bandeira_url,
        pais: nation.pais,
        federacao: getFederation(nation.continente).nome,
        colocacao: null
      });
      return;
    }
  }

  const club = clubStore.getClub(teamName);
  
  if (club) {
    const fed = getFederation(club.continente);
    newSeason.value.participantes.push({
      clubeId: club.id,
      nome: club.nome,
      escudo: club.escudo_url,
      pais: club.pais,
      federacao: fed.nome,
      colocacao: null
    });
  } else {
    newSeason.value.participantes.push({
      clubeId: Date.now() + Math.random(),
      nome: teamName,
      escudo: '',
      pais: '',
      federacao: '',
      colocacao: null
    });
  }
}

const convertTextToList = () => {
  if (!teamSearchQuery.value.participantesTexto) return;
  
  const names = teamSearchQuery.value.participantesTexto
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);
    
  names.forEach(name => {
    addParticipant(name);
  });
  
  teamSearchQuery.value.participantesTexto = '';
}

const removeParticipant = (index) => {
  newSeason.value.participantes.splice(index, 1);
}

const hasPlayoffPromotion = computed(() => {
  const name = selectedCompetition.value?.nome;
  return (name === 'Brasileirão Série B'); 
})

const playoffCandidates = computed(() => {
  if (!newSeason.value.tabela) return []
  const lines = newSeason.value.tabela.split('\n').filter(l => l.trim())
  const teams = []
  
  lines.forEach((line, idx) => {
    if (idx >= 2 && idx <= 5) {
      let cells = line.split('\t')
      if (cells.length === 1) cells = line.split(/\s{2,}/)
      if (cells.length === 1) {
         const match = line.match(/^([^\d]+)(.*)$/)
         if (match) cells = [match[1].trim()]
      }
      if (cells[0]) teams.push(cells[0].trim())
    }
  })
  return teams
})

const getRelegatedTeams = (season) => {
  if (!season.tabela) return []

  const allComps = [
    ...ALL_COMPETITIONS_DATA.flatMap(continent => [
      ...continent.paises.flatMap(p => p.competicoes),
      ...continent.continentais
    ]),
    ...INTERNATIONAL_DATA
  ]
  
  let comp = allComps.find(c => c.nome.toLowerCase().trim() === season.competitionName.toLowerCase().trim())

  if (!comp) {
    if (season.competitionName === 'Liga Argentina Série B') {
       comp = allComps.find(c => c.nome === 'Primera Nacional') || { nome: 'Primera Nacional', rebaixados: 0 }
    } else if (season.competitionName === 'Liga Argentina') {
       comp = allComps.find(c => c.nome === 'Liga Profissional') || { nome: 'Liga Profissional', rebaixados: 4 }
    }
  }

  let count = comp?.rebaixados || 0
  const name = comp ? comp.nome : season.competitionName
  if (name === 'Liga Profissional' || name === 'Primera División' || name === 'Liga Argentina') count = 4

  if (count === 0) return []

  const lines = season.tabela.split('\n').filter(l => l.trim())
  const teams = []
  
  lines.forEach(line => {
      let cells = line.split('\t')
      if (cells.length === 1) cells = line.split(/\s{2,}/)
      if (cells.length === 1) {
         const match = line.match(/^([^\d]+)(.*)$/)
         if (match) cells = [match[1].trim()]
      }
      if (cells[0]) teams.push(cells[0].trim())
  })

  if (teams.length >= count) {
    return teams.slice(-count)
  }
  return []
}

const getFederation = (continentName) => {
  if (!continentName) return { nome: 'federação', logo: '' };
  
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const normalizedKey = normalize(continentName);
  
  const key = Object.keys(FEDERATIONS_DATA).find(k => normalize(k) === normalizedKey);
  
  return FEDERATIONS_DATA[key] || { nome: 'federação', logo: '' };
}

const getFederationLogo = (continente) => {
  if (!continente) return '';
  const fedMap = {
    'CONMEBOL': 'América do Sul',
    'UEFA': 'Europa',
    'CONCACAF': 'América do Norte',
    'FIFA': 'FIFA'
  }
  const mappedName = fedMap[continente] || continente;
  return getFederation(mappedName).logo;
}

const getFederationColorClass = (fedName) => {
  if (!fedName) return '';
  const name = fedName.toUpperCase();
  if (name.includes('CONMEBOL')) return 'neon-conmebol';
  if (name.includes('UEFA')) return 'neon-uefa';
  if (name.includes('CONCACAF')) return 'neon-concacaf';
  if (name.includes('FIFA')) return 'neon-fifa';
  if (name.includes('CAF')) return 'neon-caf';
  if (name.includes('AFC')) return 'neon-afc';
  return '';
}

const getISOCode = (pais) => {
  if (!pais || !pais.bandeira) return '';
  const match = pais.bandeira.match(/\/([a-z]{2,3})\.png/);
  if (match) return match[1].toUpperCase();
  return pais.nome.substring(0, 3).toUpperCase();
}

const getClubInfo = (clubName) => {
  if (!clubName) return null;
  const club = clubStore.getClub(clubName);
  if (!club) return null;
  
  const fed = getFederation(club.continente);
  
  return {
    pais: club.pais,
    bandeira: club.bandeira_url,
    federacao: fed.nome,
    federacaoLogo: fed.logo
  };
}

const getNationalityFlag = (nationality) => {
  if (!nationality) return '';
  const nation = NATIONAL_TEAMS_DATA.find(n => n.nome.toLowerCase().trim() === nationality.toLowerCase().trim());
  return nation ? nation.bandeira_url : '';
}

const handlePasteScorerPhoto = async (event) => {
  const items = event.clipboardData.items;
  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        playerPhotoPreview.value = base64;
        scorerForm.value.fotoUrl = base64;
        
        if (newSeason.value.artilheiro) {
          newSeason.value.artilheiro.fotoUrl = base64;
        }
      };
      reader.readAsDataURL(blob);
    }
  }
}

const handleFileScorerPhoto = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      playerPhotoPreview.value = base64;
      scorerForm.value.fotoUrl = base64;
      
      if (newSeason.value.artilheiro) {
        newSeason.value.artilheiro.fotoUrl = base64;
      }
    };
    reader.readAsDataURL(file);
  }
}

const removeScorerPhoto = () => {
  playerPhotoPreview.value = null;
  scorerForm.value.fotoUrl = '';
  
  if (isEditingScorer.value && selectedSeasonForScorer.value && currentScorerIndex.value !== null) {
      if (selectedSeasonForScorer.value.topScorers[currentScorerIndex.value]) {
          selectedSeasonForScorer.value.topScorers[currentScorerIndex.value].fotoUrl = '';
      }
  }

  if (newSeason.value.artilheiro) {
     newSeason.value.artilheiro.fotoUrl = '';
  }
  if (newSeason.value.topScorers && newSeason.value.topScorers.length > 0) {
     newSeason.value.topScorers[0].fotoUrl = ''; 
  }
}

const selectContinent = (cont) => {
  selectedContinent.value = cont
}

const selectCountry = (pais) => {
  selectedCountry.value = pais
}

const selectCompetition = async (comp) => {
  if (comp.tipo === 'internacional') {
    const fedMap = {
      'CONMEBOL': 'América do Sul',
      'UEFA': 'Europa',
      'CONCACAF': 'América do Norte',
      'FIFA': 'FIFA'
    }
    const fedKey = fedMap[comp.continente]
    selectedCountry.value = {
      nome: comp.continente,
      bandeira: FEDERATIONS_DATA[fedKey]?.logo || ''
    }
  }
  selectedCompetition.value = comp
  await seasonStore.loadSeasons(comp.nome, comp.pais || selectedCountry.value?.nome)
  
  if (comp.nome === 'Sul-Americana') {
    const lastSeason = seasonStore.list[0];
    if (lastSeason) loadLibTeams(lastSeason.ano);
  }

  for (const s of seasonStore.list) {
    const scorers = s.topScorers || (s.artilheiro && s.artilheiro.nome ? [s.artilheiro] : [])
    for (const sc of scorers) {
      if (sc.fotoUrl && !sc.fotoUrl.startsWith('http') && !sc.fotoUrl.startsWith('data:') && !cachedLogos.value[sc.fotoUrl]) {
        const b64 = await imageCacheService.getLogo(sc.fotoUrl)
        if (b64) cachedLogos.value[sc.fotoUrl] = b64
      }
    }
  }
}



const countTitles = (teamName, seasonStr) => {
  if (!teamName || !selectedCompetition.value || !seasonStr) return 0
  const currentYear = getSeasonFinalYear(seasonStr)
  
  const matches = seasonStore.list.filter(s => {
    const isSameComp = s.competitionName === selectedCompetition.value.nome
    const isSameTeam = s.campeao.toLowerCase().trim() === teamName.toLowerCase().trim()
    const isPastOrPresent = getSeasonFinalYear(s.ano) <= currentYear
    return isSameComp && isSameTeam && isPastOrPresent
  })

  // Usar Set de anos para garantir que não contemos títulos duplicados no mesmo ano
  return new Set(matches.map(s => getSeasonFinalYear(s.ano))).size
}

const getIndividualStars = (titles) => {
  const remaining = titles % 5
  return '⭐'.repeat(remaining)
}

const getGroupedStars = (titles) => {
  const groups = Math.floor(titles / 5)
  return groups > 0 ? `x${groups * 5}` : ''
}

const countVices = (teamName, seasonStr) => {
  if (!teamName || !selectedCompetition.value || !seasonStr) return 0
  const currentYear = getSeasonFinalYear(seasonStr)
  
  const matches = seasonStore.list.filter(s => {
    const isSameComp = s.competitionName === selectedCompetition.value.nome
    const hasVice = s.vice && s.vice.toLowerCase().trim() === teamName.toLowerCase().trim()
    const isPastOrPresent = getSeasonFinalYear(s.ano) <= currentYear
    return isSameComp && hasVice && isPastOrPresent
  })

  return new Set(matches.map(s => getSeasonFinalYear(s.ano))).size
}

const getIndividualVices = (vices) => {
  const remaining = vices % 5
  return '🥈'.repeat(remaining)
}

const getGroupedVices = (vices) => {
  const groups = Math.floor(vices / 5)
  return groups > 0 ? `x${groups * 5}` : ''
}

const prepareEdit = async (s) => {
  try {
    isEditing.value = true
    currentEditId.value = s.id
    
    // Clone profundo para não afetar a store antes do save
    const clone = JSON.parse(JSON.stringify(s))
    
    newSeason.value = {
      ...clone,
      printsUrls: clone.printsUrls || ['', '', ''],
      topScorers: clone.topScorers || (clone.artilheiro && clone.artilheiro.nome ? [clone.artilheiro] : []),
      participantes: clone.participantes || [],
      classificacaoCopaTxt: clone.classificacaoCopaTxt || '',
      promovidosPlayoff: clone.promovidosPlayoff || [],
      mundial: {
        semi1: clone.mundial?.semi1 || { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
        semi2: clone.mundial?.semi2 || { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
        final: clone.mundial?.final || { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
        terceiro: clone.mundial?.terceiro || { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 }
      }
    }

    // Carregar o primeiro artilheiro no formulário unificado (opcional no form)
    if (newSeason.value.topScorers && newSeason.value.topScorers.length > 0) {
      scorerForm.value = JSON.parse(JSON.stringify(newSeason.value.topScorers[0]))
      
      // Carregar foto do cache/banco para pré-visualização
      if (scorerForm.value.fotoUrl) {
        const b64 = await imageCacheService.getLogo(scorerForm.value.fotoUrl)
        if (b64) {
          playerPhotoPreview.value = b64
          cachedLogos.value[scorerForm.value.fotoUrl] = b64
        } else {
          playerPhotoPreview.value = scorerForm.value.fotoUrl
        }
      }
    } else {
      resetScorerForm()
    }
    
    viewMode.value = 'form'
    // Carregar times da lib para este ano
    loadLibTeams(newSeason.value.ano)
  } catch (e) {
    console.error("Erro ao preparar edição:", e)
    renderError.value = "Erro ao abrir o formulário de edição. Dados corrompidos ou incompletos."
  }
}

const handlePastePrint = async (event, index) => {
  const items = event.clipboardData.items;
  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = async (e) => {
        newSeason.value.printsUrls[index] = e.target.result;
      };
      reader.readAsDataURL(blob);
    }
  }
}

const handleFilePrint = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      newSeason.value.printsUrls[index] = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

const removePrint = (index) => {
  newSeason.value.printsUrls[index] = '';
}

const resetScorerForm = () => {
  scorerForm.value = {
    nome: '',
    posicaoCampo: '',
    nacionalidade: '',
    clube: '',
    gols: '',
    fotoUrl: ''
  }
  playerPhotoPreview.value = null
  isEditingScorer.value = false
  currentScorerIndex.value = null
}

const openForm = () => {
  isEditing.value = false
  currentEditId.value = null

  // Identificar o último ano registrado para esta competição
  let lastYear = ''
  if (seasonStore.list.length > 0) {
    // seasonStore.list geralmente está ordenado ou podemos pegar o de maior ano
    const sorted = [...seasonStore.list].sort((a, b) => getSeasonFinalYear(b.ano) - getSeasonFinalYear(a.ano))
    lastYear = sorted[0].ano
  }

  newSeason.value = {
    id: null,
    ano: lastYear ? getNextSeasonYear(lastYear) : '',
    campeao: '',
    vice: '',
    competitionName: selectedCompetition.value.nome,
    topScorers: [],
    participantes: [],
    tabela: '',
    classificacaoCopaTxt: '',
    printsUrls: ['', '', ''], // Inicializado para garantir visibilidade da galeria
    promovidosPlayoff: [],
    mundial: {
      semi1: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
      semi2: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
      final: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 },
      terceiro: { time1: '', time2: '', placar1: 0, placar2: 0, pen1: 0, pen2: 0 }
    }
  }
  resetScorerForm()
  viewMode.value = 'form'
}

// Fases de copa conhecidas (da mais específica para a mais genérica, para matching em cascata)
// Fases de copa conhecidas com tokens específicos para match exato
const CUP_PHASES = [
  { tokens: ['campeao', 'campea', 'champion'], label: 'Campeão', priority: 1 },
  { tokens: ['vice', 'finalista', 'runner-up', 'segundo'], label: 'Vice', priority: 2 },
  { tokens: ['semi', 'semifinal', 'semi-final', '3', '4'], label: 'Semifinal', priority: 3 },
  { tokens: ['quartas', 'quarta', 'quartas de final', '8'], label: 'Quartas', priority: 4 },
  { tokens: ['oitavas', 'oitava', 'oitavas de final', '16'], label: 'Oitavas', priority: 5 },
  { tokens: ['elim. 16 avos', '16 avos', 'avos', '32'], label: '16 Avos', priority: 6 },
  { tokens: ['pre-copa', 'pré-copa', 'elim. pre', 'elim. pré', 'pre'], label: 'Pré-Copa', priority: 7 },
  { tokens: ['elim.', 'eliminado', 'fase de grupos', 'grupos', 'grupo'], label: 'Eliminado', priority: 8 },
  { tokens: ['participante', 'participant'], label: 'Participante', priority: 9 },
]

const PLACEMENTS_OPTIONS = ['Campeão', 'Vice', 'Semifinal', 'Quartas', 'Oitavas', '16 Avos', 'Pré-Copa', 'Eliminado', 'Participante']

const safeNormalize = (str) => {
  if (!str) return ''
  return str.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[.]/g, '') // remove pontos para facilitar (ex: Elim. -> Elim)
}

const detectCupPhase = (phaseStr) => {
  if (!phaseStr) return null
  const norm = safeNormalize(phaseStr)
  
  for (const phase of CUP_PHASES) {
    if (phase.tokens.some(t => {
      const tNorm = safeNormalize(t)
      return norm === tNorm
    })) {
      return phase.label
    }
  }
  return null
}

const getCopaBadgeClass = (colocacao) => {
  if (!colocacao) return 'bg-secondary text-white'
  const n = colocacao.toLowerCase()
  if (n.includes('campe')) return 'bg-warning text-dark'
  if (n.includes('vice') || n.includes('final')) return 'bg-light text-dark'
  if (n.includes('semi')) return 'bg-success text-white'
  if (n.includes('quart')) return 'bg-info text-dark'
  if (n.includes('oitav') || n.includes('16')) return 'bg-primary text-white'
  if (n.includes('elim') || n.includes('pre') || n.includes('pré')) return 'bg-secondary text-white'
  return 'bg-secondary text-white'
}

const updateChampViceFromManual = (p) => {
  if (!p || !p.colocacao) return
  if (p.colocacao === 'Campeão') {
    newSeason.value.campeao = p.nome
  } else if (p.colocacao === 'Vice') {
    newSeason.value.vice = p.nome
  }
}

// Agrupa participantes de copa por fase, ordenados por prioridade de eliminação
const getCopaPhasesGrouped = (participantes) => {
  if (!participantes) return []
  const phaseMap = new Map()
  
  participantes.forEach(p => {
    const colocacao = p.colocacao || 'Participante'
    if (!phaseMap.has(colocacao)) {
      phaseMap.set(colocacao, { label: colocacao, teams: [], badgeClass: getCopaBadgeClass(colocacao) })
    }
    phaseMap.get(colocacao).teams.push(p)
  })
  
  // Ordenar de acordo com a prioridade das fases
  const phaseOrder = ['Campeão', 'Vice', 'Semifinal', 'Quartas', 'Oitavas', '16 Avos', 'Pré-Copa', 'Eliminado', 'Participante']
  return Array.from(phaseMap.values()).sort((a, b) => {
    const ia = phaseOrder.findIndex(x => a.label.toLowerCase().includes(x.toLowerCase().split(' ')[0]))
    const ib = phaseOrder.findIndex(x => b.label.toLowerCase().includes(x.toLowerCase().split(' ')[0]))
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

// Watcher para parsear automaticamente a Classificação de Copa ao colar o texto
watch(() => newSeason.value.classificacaoCopaTxt, (txt) => {
  if (!txt || !txt.trim()) return

  const lines = txt.split('\n').filter(l => l.trim())
  const participantes = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    let teamName = ''
    let phase = ''

    // 1. Tentar separar por Tab ou Separadores explícitos (2+ espaços, " - ", " : ")
    let parts = trimmed.split('\t')
    if (parts.length < 2) parts = trimmed.split(/  +/)
    if (parts.length < 2) parts = trimmed.split(' - ')
    if (parts.length < 2) parts = trimmed.split(' : ')

    if (parts.length >= 2) {
      phase = parts[parts.length - 1].trim()
      teamName = parts.slice(0, parts.length - 1).join(' ').trim()
      phase = detectCupPhase(phase) || phase
    } else {
      // 2. Fallback: Busca reversa por tokens EXATOS (para espaços simples)
      const tokens = trimmed.split(/\s+/)
      let foundPhaseIdx = -1
      
      if (tokens.length >= 2) {
        // Tenta casar blocos de 1 a 4 palavras no FINAL da linha
        for (let len = 4; len >= 1; len--) {
          if (tokens.length <= len) continue
          const candidate = tokens.slice(-len).join(' ')
          const detected = detectCupPhase(candidate)
          if (detected) {
            foundPhaseIdx = tokens.length - len
            phase = detected
            break
          }
        }
      }

      if (foundPhaseIdx !== -1) {
        teamName = tokens.slice(0, foundPhaseIdx).join(' ').trim()
      } else {
        // Se nada for detectado de forma estruturada, verifica se a última palavra parece uma fase
        if (tokens.length >= 2) {
          const lastWord = tokens[tokens.length - 1]
          const lastWordDetected = detectCupPhase(lastWord)
          if (lastWordDetected) {
             phase = lastWordDetected
             teamName = tokens.slice(0, tokens.length - 1).join(' ').trim()
          } else {
             // Caso desesperador: assume que é apenas o nome do time
             teamName = trimmed
             phase = 'Participante'
          }
        } else {
          teamName = trimmed
          phase = 'Participante'
        }
      }
    }

    if (!teamName) continue
    
    // Normalizar a fase detectada
    const finalPhase = CUP_PHASES.some(cp => cp.label === phase) ? phase : (detectCupPhase(phase) || phase)
    
    participantes.push({ nome: teamName, colocacao: finalPhase })

    // Auto-preencher Campeão e Vice caso detectado
    if (finalPhase === 'Campeão') newSeason.value.campeao = teamName
    if (finalPhase === 'Vice') newSeason.value.vice = teamName
  }

  if (participantes.length > 0) {
    newSeason.value.participantes = participantes
  }
}, { deep: true })


// Watcher para detectar Campeão e Vice automaticamente ao colar a tabela e realizar Parse
watch(() => newSeason.value.tabela, (newTable) => {
  if (!newTable) return

  let hasModifications = false;
  const tLines = newTable.split('\n');
  const processedLines = tLines.map(line => {
    if (!line.trim()) return line;
    let cells = line.split('\t');
    if (cells.length === 1) {
      // Tentar identificar o bloco de estatísticas (sequência de números no final)
      const parts = line.trim().split(/\s{2,}/); // Tentar por múltiplos espaços primeiro
      if (parts.length > 3) {
        cells = parts;
      } else {
        // Fallback: Busca manual por números de trás para frente
        const allTokens = line.trim().split(/\s+/);
        let firstStatIdx = -1;
        // Procuramos o primeiro número que inicia a sequência de stats (P, J, V...)
        // Geralmente há pelo menos 5-6 números seguidos no final
        for (let i = allTokens.length - 1; i >= 0; i--) {
          if (!isNaN(allTokens[i]) || /^-?\d+$/.test(allTokens[i])) {
            firstStatIdx = i;
          } else {
            // Se achamos um não-número, o bloco de stats acabou (indo de trás pra frente)
            if (firstStatIdx !== -1 && (allTokens.length - firstStatIdx) >= 5) {
              break;
            }
          }
        }
        
        if (firstStatIdx !== -1 && firstStatIdx > 0) {
          const teamName = allTokens.slice(0, firstStatIdx).join(' ').replace(/^\d+[\s.]*/, '').trim();
          const stats = allTokens.slice(firstStatIdx);
          cells = [teamName, ...stats];
        }
      }
    }
    
    // Se a primeira célula for apenas um número (Posição), removemos para normalizar
    if (cells.length > 2 && /^\d+$/.test(cells[0]) && cells[0].length < 3) {
       cells.shift();
    }

    // Formato colado 9 células: "Time P J V E D GP GC SG" -> Adicionamos apenas o %
    if (cells.length === 9) {
       const isNumbers = !isNaN(cells[1]) && !isNaN(cells[2]) && !isNaN(cells[3]);
       if (isNumbers) {
          const p = parseInt(cells[1]) || 0;
          const j = parseInt(cells[2]) || 0;
          const v = parseInt(cells[3]) || 0;
          const e = parseInt(cells[4]) || 0;
          const d = parseInt(cells[5]) || 0;
          const gp = parseInt(cells[6]) || 0;
          const gc = parseInt(cells[7]) || 0;
          const sg = parseInt(cells[8]) || 0;
          
          // Validação tripla para evitar colisão
          const pontos = (p === (v * 3) + e) ? p : (v * 3) + e;
          const pontosMax = j * 3;
          let perc = '0.00';
          if (pontosMax > 0) perc = ((pontos / pontosMax) * 100).toFixed(2);
          
          hasModifications = true;
          return `${cells[0]}\t${pontos}\t${j}\t${v}\t${e}\t${d}\t${gp}\t${gc}\t${sg}\t${perc}`;
       }
    }
    
    // Formato colado 8 células: "Time P V E D GP GC SG" -> Injetamos o J e o %
    if (cells.length === 8) {
       const isNumbers = !isNaN(cells[1]) && !isNaN(cells[2]) && !isNaN(cells[3]) && !isNaN(cells[4]);
       if (isNumbers) {
          const p = parseInt(cells[1]) || 0;
          const v = parseInt(cells[2]) || 0;
          const e = parseInt(cells[3]) || 0;
          const d = parseInt(cells[4]) || 0;
          const gp = parseInt(cells[5]) || 0;
          const gc = parseInt(cells[6]) || 0;
          const sg = parseInt(cells[7]) || 0;
          
          const j = v + e + d;
          const pontos = (p === (v * 3) + e) ? p : (v * 3) + e;
          const pontosMax = j * 3;
          let perc = '0.00';
          if (pontosMax > 0) perc = ((pontos / pontosMax) * 100).toFixed(2);
          
          hasModifications = true;
          return `${cells[0]}\t${pontos}\t${j}\t${v}\t${e}\t${d}\t${gp}\t${gc}\t${sg}\t${perc}`;
       }
    }
    return line;
  });

  if (hasModifications) {
     newSeason.value.tabela = processedLines.join('\n');
     return; // O watcher será ativado novamente com o texto modificado
  }

  if (isEditing.value) return; // Evitar apagar dados já salvos de campeão/vice na edição

  const filteredLines = processedLines.filter(l => l.trim() && !l.toUpperCase().startsWith('TIME') && !l.toUpperCase().startsWith('EQUIPE'));
  if (filteredLines.length >= 2) {
    const parseLine = (line) => {
      let cells = line.split('\t')
      if (cells.length === 1) cells = line.split(/\s{2,}/)
      if (cells.length === 1) {
        const match = line.match(/^([^\d]+)(.*)$/)
        if (match) return match[1].trim()
      }
      return cells[0] ? cells[0].replace(/^\d+[\s.]*/, '').trim() : ''
    }

    const champ = parseLine(filteredLines[0])
    const vice = parseLine(filteredLines[1])

    if (champ && !newSeason.value.campeao) newSeason.value.campeao = champ
    if (vice && !newSeason.value.vice) newSeason.value.vice = vice
  }
})

// NOVO: Watcher para detectar Campeão e Vice do Mundial a partir do chaveamento (Restaurado)
watch(() => newSeason.value.mundial.final, (final) => {
  if (!final.time1 || !final.time2) return
  if (final.placar1 === 0 && final.placar2 === 0 && !isEditing.value) return

  let champ = ''
  let vice = ''

  if (final.placar1 > final.placar2) {
    champ = final.time1
    vice = final.time2
  } else if (final.placar2 > final.placar1) {
    champ = final.time2
    vice = final.time1
  } else if (final.pen1 || final.pen2) {
    if (final.pen1 > final.pen2) {
      champ = final.time1
      vice = final.time2
    } else if (final.pen2 > final.pen1) {
      champ = final.time2
      vice = final.time1
    }
  }

  if (champ) newSeason.value.campeao = champ
  if (vice) newSeason.value.vice = vice
}, { deep: true })

// NOVO: Watcher para progressão automática de Semi para Final/3º Lugar
watch([() => newSeason.value.mundial.semi1, () => newSeason.value.mundial.semi2], ([s1, s2]) => {
  if (isEditing.value) return

  // Semi 1 -> Final/3º
  if (s1.time1 && s1.time2) {
    if (s1.placar1 > s1.placar2 || (s1.placar1 === s1.placar2 && s1.pen1 > s1.pen2)) {
      newSeason.value.mundial.final.time1 = s1.time1
      newSeason.value.mundial.terceiro.time1 = s1.time2
    } else if (s1.placar2 > s1.placar1 || (s1.placar2 === s1.placar1 && s1.pen2 > s1.pen1)) {
      newSeason.value.mundial.final.time1 = s1.time2
      newSeason.value.mundial.terceiro.time1 = s1.time1
    }
  }

  // Semi 2 -> Final/3º
  if (s2.time1 && s2.time2) {
    if (s2.placar1 > s2.placar2 || (s2.placar1 === s2.placar2 && s2.pen1 > s2.pen2)) {
      newSeason.value.mundial.final.time2 = s2.time1
      newSeason.value.mundial.terceiro.time2 = s2.time2
    } else if (s2.placar2 > s2.placar1 || (s2.placar2 === s2.placar1 && s2.pen2 > s2.pen1)) {
      newSeason.value.mundial.final.time2 = s2.time2
      newSeason.value.mundial.terceiro.time2 = s2.time1
    }
  }
}, { deep: true })

const importFromIMLPES = () => {
  const jsonInput = prompt("Cole aqui o conteúdo do arquivo 'latest_ml_save.json' gerado pelo iMLPES:");
  if (!jsonInput) return;

  try {
    const data = JSON.parse(jsonInput);
    
    // 1. Abrir o formulário
    openForm();

    // 2. Preencher tabela formatada
    if (data.formattedTable) {
      newSeason.value.tabela = data.formattedTable;
    }

    // 3. Tentar mapear Campeão e Vice (Assumindo que estão na standings)
    if (data.standings && data.standings.length >= 2) {
      const champId = data.standings[0].teamId;
      const viceId = data.standings[1].teamId;

      // Mapear pelo ID do clube na CLUBS_DATA (se disponível)
      const champ = CLUBS_DATA.find(c => c.pesId == champId || c.id == champId);
      const vice = CLUBS_DATA.find(c => c.pesId == viceId || c.id == viceId);

      if (champ) newSeason.value.campeao = champ.nome;
      if (vice) newSeason.value.vice = vice.nome;
      
      console.log(`Mapeamento iMLPES: Campeão=${newSeason.value.campeao}, Vice=${newSeason.value.vice}`);
    }

    // 4. Tentar detectar o ano (se disponível no fileName ex: ML00000005)
    const now = new Date();
    const currentYear = now.getFullYear();
    newSeason.value.ano = `${currentYear} / ${currentYear + 1} = ${currentYear + 1}`;

    alert("Dados importados com sucesso! Verifique se o Campeão e o Vice foram reconhecidos corretamente.");
    
  } catch (e) {
    console.error("Erro ao importar JSON:", e);
    alert("Erro ao processar o JSON. Certifique-se de que copiou o conteúdo completo do arquivo.");
  }
}

const openScorerModal = (season) => {
  selectedSeasonForScorer.value = JSON.parse(JSON.stringify(season))
  if (!selectedSeasonForScorer.value.topScorers) {
    selectedSeasonForScorer.value.topScorers = season.artilheiro && season.artilheiro.nome ? [season.artilheiro] : []
  }
  showScorerModal.value = true
  resetScorerForm()
}


const openPhotoZoom = (url) => {
  if (!url) return
  zoomedPhotoUrl.value = url
  showPhotoZoom.value = true
}

const editScorer = (scorer, index) => {
  scorerForm.value = { ...scorer }
  playerPhotoPreview.value = scorer.fotoUrl
  isEditingScorer.value = true
  currentScorerIndex.value = index
}

const deleteScorer = (index) => {
  if (confirm('Remover este artilheiro?')) {
    selectedSeasonForScorer.value.topScorers.splice(index, 1)
  }
}

const saveScorer = async () => {
  if (!scorerForm.value.nome) return

  // Criar uma cpia para evitar problemas de referncia
  const scorerToSave = { ...scorerForm.value }

  // Persistir foto se for base64
  if (scorerToSave.fotoUrl && scorerToSave.fotoUrl.startsWith('data:')) {
    const imageId = `artilheiro_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await db.saveImage(imageId, scorerToSave.fotoUrl);
    // Alimentar cache para exibio imediata
    cachedLogos.value[imageId] = scorerToSave.fotoUrl;
    scorerToSave.fotoUrl = imageId;
  }

  if (isEditingScorer.value) {
    selectedSeasonForScorer.value.topScorers[currentScorerIndex.value] = scorerToSave
  } else {
    selectedSeasonForScorer.value.topScorers.push(scorerToSave)
  }

  // Ordenar por gols
  selectedSeasonForScorer.value.topScorers.sort((a, b) => b.gols - a.gols)
  
  resetScorerForm()
}

const persistScorers = async () => {
  if (!selectedSeasonForScorer.value || !selectedSeasonForScorer.value.id) {
    console.error('Falha ao persistir: Temporada selecionada ou ID ausente', selectedSeasonForScorer.value);
    alert('Erro: ID da temporada no encontrado. Tente reabrir o modal de artilheiros.');
    return;
  }

  console.log('Persisting scorers for season ID:', selectedSeasonForScorer.value.id);
  
  try {
    // Limpeza profunda para garantir que nada estranho v para o storage
    const topScorersClean = JSON.parse(JSON.stringify(selectedSeasonForScorer.value.topScorers));
    
    await seasonStore.updateSeason(selectedSeasonForScorer.value.id, { 
      topScorers: topScorersClean 
    });
    
    console.log('Artilheiros salvos com sucesso!');
    showScorerModal.value = false;
  } catch (error) {
    console.error('Erro ao salvar artilheiros:', error);
    alert('Não foi possvel salvar os artilheiros.\nMotivo: ' + (error.message || 'Erro de persistncia no banco de dados.'));
  }
}

const confirmDelete = async (season) => {
  if (confirm(`Excluir permanentemente o registro de ${season.ano}?`)) {
    await seasonStore.removeSeason(season.id)
    await refreshCompCounts()
  }
}



const saveNewSeason = async (shouldClose = true) => {
  if (!selectedCompetition.value) return
  
  // Garantir que os artilheiros sejam processados se preenchidos no form nico
  if (scorerForm.value.nome) {
    // Se houver dados no form de artilheiro, vamos "salvar" ele no array topScorers antes de persistir a temporada
    const scorerToSave = JSON.parse(JSON.stringify(scorerForm.value));
    
    // Persistir foto se for base64
    if (scorerToSave.fotoUrl && scorerToSave.fotoUrl.startsWith('data:')) {
      const imageId = `artilheiro_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await db.saveImage(imageId, scorerToSave.fotoUrl);
      cachedLogos.value[imageId] = scorerToSave.fotoUrl;
      scorerToSave.fotoUrl = imageId;
    }

    // Se já existia esse artilheiro (edio), poderamos ter lgica aqui, 
    // mas o requisito diz "adicionar uma temporada completa em UMA nica tela".
    // Ento assumimos que se o form est preenchido, ele  o artilheiro principal.
    newSeason.value.topScorers = [scorerToSave];
  } else {
    // Se o nome estiver vazio no form, entendemos que o usurio quer remover o artilheiro
    newSeason.value.topScorers = [];
    newSeason.value.artilheiro = {};
  }

  try {
    if (isEditing.value) {
      await seasonStore.updateSeason(currentEditId.value, { ...newSeason.value })
    } else {
      await seasonStore.addSeason({
        ...newSeason.value,
        competitionName: selectedCompetition.value.nome,
        competitionId: selectedCompetition.value.id,
        pais: selectedCountry.value?.nome || selectedCompetition.value.pais || 'Internacional'
      })
    }
    
    // Atualizar contador global
    await refreshCompCounts()
    
    // Reset form e estado
    if (shouldClose) {
      viewMode.value = 'list';
      resetScorerForm();
    }
    
    // Alerta de sucesso silencioso ou log
    console.log('Temporada salva com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar temporada:', error);
    alert('Erro ao salvar: ' + error.message);
  }
}

// Sistema de Cache de Imagens
const cachedLogos = ref({})

const getCachedLogo = (url) => {
  if (!url) return null
  if (url.startsWith('data:')) return url
  return cachedLogos.value[url] || url
}

const cacheImages = async (data) => {
  // Cachear competições internacionais
  for (const comp of INTERNATIONAL_DATA) {
    if (comp.logo) {
      const b64 = await imageCacheService.getOrCache(comp.logo)
      if (b64) cachedLogos.value[comp.logo] = b64
    }
  }

  // Cachear logos de federaes
  for (const fed of Object.values(FEDERATIONS_DATA)) {
    if (fed.logo && (fed.logo.startsWith('http') || fed.logo.startsWith('/'))) {
      const b64 = await imageCacheService.getOrCache(fed.logo)
      if (b64) cachedLogos.value[fed.logo] = b64
    }
  }

  for (const cont of data) {
    if (cont.logo_continente) {
      const b64 = await imageCacheService.getOrCache(cont.logo_continente)
      if (b64) cachedLogos.value[cont.logo_continente] = b64
    }
    for (const pais of cont.paises) {
      for (const comp of pais.competicoes) {
        if (comp.logo) {
          const b64 = await imageCacheService.getOrCache(comp.logo)
          if (b64) cachedLogos.value[comp.logo] = b64
        }
      }
    }
  }
}

// Persistncia de navegação
watch([selectedContinent, selectedCountry, selectedCompetition, activeTab], () => {
  const state = {
    activeTab: activeTab.value,
    continent: selectedContinent.value,
    country: selectedCountry.value,
    competition: selectedCompetition.value ? { nome: selectedCompetition.value.nome } : null
  }
  localStorage.setItem('freefoot_universo_nav', JSON.stringify(state))
}, { deep: true })



onMounted(async () => {
  await careerStore.loadAll()

  // 1. Sincronizar com parâmetros da URL (Navegação facilitada solicitada pelo usuário)
  if (route.query.pais) {
    const pNome = route.query.pais;
    for (const cont of ALL_COMPETITIONS_DATA) {
      const p = cont.paises.find(p => p.nome === pNome);
      if (p) {
        selectedContinent.value = cont;
        selectedCountry.value = p;
        break;
      }
    }
  }

  // CORREÇÃO DE PISCADA: Se já há uma competição selecionada (restaurada do localStorage),
  // NÃO chamamos loadAll() — isso evita o flash de ver todas as ligas misturadas.
  // Vamos direto para loadSeasons() que carrega apenas a lista filtrada da competição.
  // O loadAll() só é necessário quando não há competição selecionada (primeira visita).
  if (selectedCompetition.value) {
    const targetCountry = selectedCompetition.value.pais || selectedCountry.value?.nome
    await seasonStore.loadSeasons(selectedCompetition.value.nome, targetCountry)
    if (selectedCompetition.value.nome === 'Sul-Americana' && seasonStore.list[0]) {
      loadLibTeams(seasonStore.list[0].ano)
    }
  } else {
    // Sem competição selecionada: carregar tudo para ter dados disponíveis para
    // histórico de carreira e outros cálculos que dependem de todas as temporadas.
    await seasonStore.loadAll()
  }

  // 2. Restaurar estado de navegação com segurança (removido do onMounted para rodar no setup)

  // 3. Carregar Cache de Imagens Geral em background
  try {
    await cacheImages(ALL_COMPETITIONS_DATA)
    
    // Carregar fotos artilheiros se já tiver competição selecionada
    if (seasonStore.list.length > 0) {
        for (const s of seasonStore.list) {
          const scorers = s.topScorers || (s.artilheiro && s.artilheiro.nome ? [s.artilheiro] : [])
          for (const sc of scorers) {
            if (sc.fotoUrl && !sc.fotoUrl.startsWith('http') && !sc.fotoUrl.startsWith('data:') && !cachedLogos.value[sc.fotoUrl]) {
              const b64 = await imageCacheService.getLogo(sc.fotoUrl)
              if (b64) cachedLogos.value[sc.fotoUrl] = b64
            }
          }
        }
    }
  } catch (e) {
    console.error("Error in onMounted UniversoView images:", e)
  }
})

// onActivated é chamado toda vez que o componente keep-alive volta ao foco (ao navegar de volta).
// Aqui apenas recarregamos as temporadas da competição selecionada para garantir dados atualizados,
// sem remontagem, sem piscada — o restante do estado já está preservado.
onActivated(async () => {
  if (selectedCompetition.value) {
    const targetCountry = selectedCompetition.value.pais || selectedCountry.value?.nome
    await seasonStore.loadSeasons(selectedCompetition.value.nome, targetCountry)
    if (selectedCompetition.value.nome === 'Sul-Americana' && seasonStore.list[0]) {
      loadLibTeams(seasonStore.list[0].ano)
    }
  }
})
</script>

<style scoped>
.international-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 1200px) {
  .international-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .international-grid {
    grid-template-columns: 1fr;
  }
}

/* Estilos Artilheiro */
.player-photo-upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.2);
}

.player-photo-upload-zone:hover {
  border-color: var(--bs-primary);
  background: rgba(var(--bs-primary-rgb), 0.05);
}

.player-photo-upload-zone:focus {
  outline: none;
  border-color: var(--bs-info);
  box-shadow: 0 0 10px rgba(var(--bs-info-rgb), 0.2);
}

.player-photo-preview-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.change-photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.player-photo-upload-zone:hover .change-photo-overlay {
  opacity: 1;
}

.scorer-row {
  transition: all 0.2s;
}

.scorer-row:hover {
  background: rgba(255, 215, 0, 0.02) !important;
}

.scorer-pos {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 1.1rem;
  color: var(--bs-warning);
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
}

.scorer-name {
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  min-width: 140px;
}

.scorer-photo-container {
  width: 42px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.scorer-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scorer-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.2;
}

.scorer-name-cell {
  color: #fff;
  text-shadow: 0 0 5px rgba(255,255,255,0.1);
}

.game-grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.breadcrumb-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 116, 217, 0.2);
  color: #a0aec0;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.breadcrumb-btn.active {
  background-color: var(--color-primary);
  color: var(--color-secondary);
  border-color: var(--color-secondary);
}

.card-hover {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.card-hover:hover {
  transform: translateY(-5px) scale(1.02);
  filter: brightness(1.1);
}

.comp-card-premium {
  background: linear-gradient(145deg, #0f2a44, #0a1f33) !important;
  border: 1px solid rgba(0, 150, 255, 0.15) !important;
  box-shadow: 0 0 12px rgba(0, 150, 255, 0.1) !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.comp-card-premium:hover {
  transform: translateY(-8px) scale(1.02);
  border-width: 2px !important;
  border-color: rgba(0, 150, 255, 0.8) !important;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.3), 0 0 25px rgba(0, 150, 255, 0.2) !important;
  background-color: rgba(0, 150, 255, 0.03) !important;
  filter: brightness(1.05);
}

/* Neon Colors by Federation */
.neon-conmebol {
  border-color: rgba(46, 204, 64, 0.3) !important;
  box-shadow: 0 0 12px rgba(46, 204, 64, 0.15) !important;
}
.neon-conmebol:hover {
  border-width: 2px !important;
  border-color: rgba(46, 204, 64, 0.8) !important;
  box-shadow: 0 0 15px rgba(46, 204, 64, 0.3), 0 0 25px rgba(46, 204, 64, 0.2) !important;
  background-color: rgba(46, 204, 64, 0.03) !important;
}

.neon-uefa {
  border-color: rgba(0, 116, 217, 0.3) !important;
  box-shadow: 0 0 12px rgba(0, 116, 217, 0.15) !important;
}
.neon-uefa:hover {
  border-width: 2px !important;
  border-color: rgba(0, 116, 217, 0.8) !important;
  box-shadow: 0 0 15px rgba(0, 116, 217, 0.3), 0 0 25px rgba(0, 116, 217, 0.2) !important;
  background-color: rgba(0, 116, 217, 0.03) !important;
}

.neon-concacaf {
  border-color: rgba(255, 100, 0, 0.3) !important;
  box-shadow: 0 0 12px rgba(255, 100, 0, 0.15) !important;
}
.neon-concacaf:hover {
  border-width: 2px !important;
  border-color: rgba(255, 100, 0, 0.8) !important;
  box-shadow: 0 0 15px rgba(255, 100, 0, 0.3), 0 0 25px rgba(255, 100, 0, 0.2) !important;
  background-color: rgba(255, 100, 0, 0.03) !important;
}

.neon-fifa {
  border-color: rgba(255, 220, 0, 0.3) !important;
  box-shadow: 0 0 12px rgba(255, 220, 0, 0.15) !important;
}
.neon-fifa:hover {
  border-width: 2px !important;
  border-color: rgba(255, 220, 0, 0.8) !important;
  box-shadow: 0 0 15px rgba(255, 220, 0, 0.3), 0 0 25px rgba(255, 220, 0, 0.2) !important;
  background-color: rgba(255, 220, 0, 0.03) !important;
}

/* Modern Country Cards */
.country-card-modern {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(15, 42, 68, 0.9), rgba(10, 31, 51, 0.95)) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
  z-index: 1;
}

.country-card-modern:hover {
  transform: scale(1.05) translateY(-5px);
  filter: brightness(1.05);
}

.country-bg-flag {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.5);
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.2;
  filter: blur(8px);
  z-index: -1;
  pointer-events: none;
}

.country-glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
}

.country-iso-bg {
  position: absolute;
  bottom: -10px;
  right: -5px;
  font-size: 4rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.03);
  letter-spacing: -2px;
  user-select: none;
  z-index: -1;
}

.country-accent-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: var(--color-accent);
  border-radius: 3px 3px 0 0;
  opacity: 0.5;
  transition: width 0.3s ease;
}

.country-card-modern:hover .country-accent-line {
  width: 80%;
  opacity: 1;
}

.comp-logo-container-highlight {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #f1f3f5 0%, #cfd8dc 100%);
  padding: 8px;
  border-radius: 12px;
  transition: transform 0.4s ease;
  flex-shrink: 0;
}

.comp-card-premium:hover .comp-logo-container-highlight {
  transform: scale(1.1) rotate(3deg);
}

.comp-logo-premium {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.competition-title {
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-game-type {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 5px 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-liga { background-color: #0074d9; }
.badge-copa { background-color: #2ecc40; }
.badge-supercopa { background-color: #ffdc00; color: #000; }

.fed-logo {
  height: 80px;
  width: 100%;
  object-fit: contain;
}

.fed-mini-logo {
  height: 14px;
  width: auto;
  object-fit: contain;
  filter: brightness(1.2);
}

.game-input {
  background-color: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.2s;
}

.game-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.game-input:focus {
  border-color: #ffc107 !important;
  background-color: rgba(0, 0, 0, 0.6) !important;
  box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.1) !important;
  color: white !important;
}

.cursor-pointer {
  cursor: pointer;
}

.x-small { font-size: 0.65rem; }

.animated-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.stars-individual {
  font-size: 0.9rem;
  letter-spacing: -2px;
}

.group-star-badge {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #000;
  padding: 1px 6px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 900;
  border: 1px solid #fff;
  line-height: 1;
  display: flex;
  align-items: center;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.name-cell {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.name-cell-vice {
  font-size: 0.85rem;
  font-weight: 600;
}

.comp-sidebar-logo-highlight {
  height: 120px;
  width: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #f1f3f5 0%, #cfd8dc 100%);
  padding: 15px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3), 0 0 20px rgba(0, 150, 255, 0.2);
  transition: transform 0.3s ease;
}

.comp-sidebar-logo-highlight:hover {
  transform: scale(1.05);
}

.comp-sidebar-logo {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.vices-individual {
  font-size: 0.75rem;
  letter-spacing: -2px;
}

.no-wrap {
  white-space: nowrap;
}

.table-dark {
  --bs-table-bg: transparent;
}

/* Modal Simple Style */
.game-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content-panel {
  max-width: 600px;
  width: 100%;
  border-color: var(--color-secondary);
}

/* Scorer Management Modal Styles */
.scorer-mgmt-modal {
  max-width: 1350px !important; /* Aumentado para acomodar elementos gigantes */
}

.scorer-list-container {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.scorer-item-card-horizontal {
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.45) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1rem 1.5rem !important;
  margin-bottom: 0.75rem;
  overflow: visible; /* Mudar para visible para no cortar efeitos de brilho se necessrio, ou manter hidden se preferir */
}

.scorer-item-card-horizontal:hover {
  border-color: rgba(255, 193, 7, 0.6);
  background: rgba(255, 215, 0, 0.08) !important;
  transform: scale(1.005);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.sc-item-photo-lg {
  width: 50px;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
}

.sc-item-photo-xl {
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255,255,255,0.2);
  transition: all 0.3s;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(0,0,0,0.4);
}

.sc-item-photo-xl img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Garantir que preencha o card quadrado */
  background: rgba(0,0,0,0.3);
}

.sc-item-photo-xl:hover {
  transform: scale(1.08);
  border-color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
}

.cursor-zoom-in {
  cursor: zoom-in;
}

.artilheiro-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5));
}

.artilheiro-icon-lg {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.goal-badge-premium {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%) !important;
  box-shadow: 0 0 25px rgba(255, 193, 7, 0.5);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
  font-size: 3rem !important; /* Super destaque */
  padding: 0.5rem 1.5rem !important;
  border-radius: 12px;
}

.highlight-glow {
  filter: drop-shadow(0 0 8px rgba(255, 193, 7, 0.8));
  animation: pulse-gold 2s infinite;
}

@keyframes pulse-gold {
  0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5)); }
  50% { transform: scale(1.1); filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.9)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5)); }
}

.ls-1 { letter-spacing: 1px; }

/* Horizontal Form */
.h-form-remix {
  border: 1px solid rgba(255,255,255,0.1);
}

.scorer-upload-h {
  height: 48px;
  background: rgba(0,0,0,0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.h-photo-preview {
  height: 100%;
  width: auto;
  object-fit: cover;
}

.change-photo-overlay-small {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  padding: 2px 5px;
  font-size: 0.6rem;
  cursor: pointer;
}

.scorer-item-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.scorer-item-card:hover {
  border-color: rgba(255, 193, 7, 0.3);
  transform: translateX(5px);
  background: rgba(255, 215, 0, 0.05) !important;
}

.sc-item-pos, .scorer-pos {
  width: 110px; /* Definido para evitar sobreposio do trofu de 100px */
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sc-item-pos .bi-award-fill, .scorer-pos .bi-award-fill {
  color: #ffc107;
  filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5));
  font-size: 1.5rem;
}

/* Photo Zoom Modal */
.photo-zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(15px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.zoom-content-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 50px rgba(0,0,0,0.8);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.zoomed-image-full {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.btn-close-zoom {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 3010;
}

.btn-close-zoom:hover {
  background: #ff4136;
  transform: rotate(90deg);
}

.sc-item-photo {
  width: 35px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sc-photo-placeholder {
  font-size: 1.2rem;
  opacity: 0.3;
}

.scorer-upload-compact {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
}

.player-photo-preview-img-compact {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: cover;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Estilos Formulrio Full Screen */
.form-full-screen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(25px);
  z-index: 5000; /* Acima de tudo */
  display: flex;
  justify-content: center;
  overflow: hidden;
  padding: 5vh 5vw;
}

.form-full-screen-content {
  width: 100%;
  max-width: 1400px;
  max-height: 100%;
  overflow-y: auto;
  padding-right: 2rem;
}

.form-section-premium {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 0.3s;
}

.form-section-premium:hover {
  border-color: rgba(255, 193, 7, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.game-input-large {
  background: rgba(0, 0, 0, 0.5) !important;
  border: 2px solid rgba(255, 255, 255, 0.1) !important;
  color: #ffc107 !important;
  padding: 1.5rem !important;
  font-size: 3rem !important;
  font-weight: 900 !important;
  border-radius: 1.5rem !important;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
}

.game-textarea {
  background: rgba(0, 0, 0, 0.5) !important;
  border: 2px solid rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  font-family: 'Consolas', monospace;
  font-size: 1rem;
  border-radius: 1.5rem !important;
  padding: 2rem !important;
  line-height: 1.6;
}

.btn-close-large {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-close-large:hover {
  background: #ff4136;
  transform: rotate(180deg) scale(1.1);
  border-color: white;
}

.team-search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 60px; /* Alinhado com o input que tem  shield do lado */
  z-index: 6000;
  background: #151515;
  border: 2px solid var(--bs-warning);
  border-top: none;
  border-radius: 0 0 1.5rem 1.5rem;
  max-height: 350px;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.8);
}

.team-search-item {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.team-search-item:hover {
  background: rgba(255, 193, 7, 0.1);
  padding-left: 2rem;
}

.player-photo-upload-full {
  aspect-ratio: 1/1;
  background: rgba(255, 255, 255, 0.05);
  border: 3px dashed rgba(255, 255, 255, 0.1);
  border-radius: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s;
}

.player-photo-upload-full:hover {
  border-color: var(--bs-warning);
  background: rgba(255, 193, 7, 0.03);
  transform: scale(1.02);
}

.change-photo-overlay-large {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  opacity: 0;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.player-photo-upload-full:hover .change-photo-overlay-large {
  opacity: 1;
}

.change-photo-overlay-large i {
  font-size: 4rem;
  color: var(--bs-warning);
}

.text-warning-glow {
  color: var(--bs-warning);
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

.whitespace-pre {
  white-space: pre-wrap;
}

.badge-liga { background: #007bff; }
.badge-copa { background: #28a745; }
.badge-supercopa { background: #fd7e14; }
.badge-continental { background: #6f42c1; }
.badge-mundial { background: #e83e8c; }

.sc-photo-placeholder-lg {
  font-size: 5rem;
  opacity: 0.15;
}

.shadow-inset-left {
  box-shadow: inset 15px 0 30px -15px rgba(0,0,0,0.6);
}
/* Estilos Participantes */
.participant-list-compact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}

.participant-item-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
  transition: all 0.2s;
}

.participant-item-card:hover {
  background: rgba(40, 167, 69, 0.1);
  border-color: rgba(40, 167, 69, 0.3);
}

.btn-remove-p {
  background: none;
  border: none;
  color: #ff5858;
  padding: 0 4px;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.participant-item-card:hover .btn-remove-p {
  opacity: 1;
}

.border-dashed {
  border-style: dashed !important;
}

.text-neon-green {
  color: #39ff14;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8), 0 0 18px rgba(57, 255, 20, 0.4);
  font-size: 1.1rem;
}

/* Troféus Overlays */
/* Estilo para múltiplos itens na sidebar (Logo + Troféu) */
.comp-sidebar-logo-highlight {
  height: 100px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #f1f3f5 0%, #cfd8dc 100%);
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: transform 0.3s ease;
}

/* Layout Lado a Lado (Logo + Troféu) nos Cards */
.comp-items-horizontal {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Ajuste sutil para quando há dois itens lado a lado */
.comp-items-horizontal .comp-logo-container-highlight {
  width: 60px;
  height: 60px;
  padding: 6px;
  border-radius: 10px;
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


.tab-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 12px 30px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  letter-spacing: 1.5px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  backdrop-filter: blur(5px);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.tab-button.active {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #000;
  border-color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
  transform: translateY(-2px);
}

.tab-button.active i {
  color: #000;
}

.neon-caf {
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.3);
}
.neon-caf:hover {
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.6), inset 0 0 10px rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.neon-afc {
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
}
.neon-afc:hover {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.6), inset 0 0 10px rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
}


.competition-title {
  font-size: 0.85rem; /* Reduced slightly more to fit long names */
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* Standard property */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.5em; 
  display: flex; /* Fallback for alignment */ 
  align-items: center;
}

.lib-indicator-mini {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  filter: drop-shadow(0 0 5px rgba(57, 255, 20, 0.8));
  transition: all 0.3s ease;
  cursor: help;
  vertical-align: middle;
}

.lib-indicator-mini:hover {
  transform: scale(1.3);
  filter: drop-shadow(0 0 10px rgba(57, 255, 20, 1));
}

.mundial-registration-grid {
  border: 1px solid rgba(0, 242, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
}

.match-reg-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.match-reg-card:focus-within {
  border-color: rgba(0, 242, 255, 0.3);
  background: rgba(255, 255, 255, 0.08) !important;
}

.game-input-sm {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  height: 28px;
}

.game-input-sm:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00f2ff;
  outline: none;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
}
.print-upload-slot {
  width: 140px;
  height: 180px;
  border: 2px dashed rgba(255,255,255,0.1);
  border-radius: 12px;
  background: rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.print-upload-slot:hover, .print-upload-slot:focus {
  border-color: var(--game-info);
  background: rgba(var(--game-info-rgb), 0.1);
  outline: none;
}

.print-upload-slot.has-image {
  border: 2px solid rgba(var(--game-info-rgb), 0.3);
}

.print-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.print-upload-slot:hover .print-preview-img {
  transform: scale(1.05);
}

.print-slot-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.print-upload-slot:hover .print-slot-overlay {
  opacity: 1;
}

.print-slot-empty {
  text-align: center;
  opacity: 0.4;
}

.print-slot-empty i {
  font-size: 1.5rem;
}

/* == CHIPS DE COPA == */
.copa-ranking-preview {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.copa-participant-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 0.75rem;
  max-width: 200px;
  transition: all 0.2s;
}

.copa-participant-chip:hover {
  border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.1);
}

/* == CLASSIFICAÇÃO DE COPA NA TELA DO CAMPEONATO == */
.copa-classification-table {
  background: rgba(0,0,0,0.15);
  border-top: 1px solid rgba(255,255,255,0.05);
}

.copa-phases-wrapper { display: flex; flex-direction: column; gap: 4px; }

.copa-phase-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.copa-phase-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 20px;
  min-width: 120px;
  text-align: center;
}

.copa-team-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.72rem;
  transition: all 0.2s;
}

.copa-team-chip:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.2);
}

.hover-opacity-100:hover {
  opacity: 1 !important;
}

.form-select.x-small {
  font-size: 0.65rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

</style>

