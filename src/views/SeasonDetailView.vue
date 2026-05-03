<template>
  <div class="view-container animated-fade-in" v-if="season">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex gap-2">
        <button @click="$router.push('/universo')" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>VOLTAR
        </button>
        <button v-if="competitionInfo" 
                @click="$router.push(`/competicao/${competitionInfo.id}/historico`)" 
                class="btn btn-outline-info fw-bold">
          🏆 HISTÓRICO DO {{ competitionInfo.nome }}
        </button>
      </div>
      <LogoFREeFOOT />
    </div>

    <!-- CABEÇALHO RESUMO -->
    <div class="row g-2 mb-2">
      <div class="col-12">
        <GamePanel customClass="p-0 overflow-hidden">
          <div class="season-detail-header-compact p-2 text-center position-relative d-flex align-items-center justify-content-center">
            <div class="bg-blur-shield" :style="headerBgStyle"></div>
            <div class="position-relative z-1 d-flex align-items-center gap-4">
              <h2 class="fw-black text-uppercase m-0" style="font-size: 1.8rem; letter-spacing: 1px;">{{ season.ano }}</h2>
              <router-link v-if="competitionInfo" 
                           :to="`/competicao/${competitionInfo.id}/historico`" 
                           class="text-decoration-none">
                <div class="text-warning fw-black text-uppercase m-0 hvr-underline-gold" style="font-size: 1.1rem; letter-spacing: 2px;">
                  {{ season.competitionName }}
                </div>
              </router-link>
              <div v-else class="text-warning fw-black text-uppercase m-0" style="font-size: 1.1rem; letter-spacing: 2px;">{{ season.competitionName }}</div>
            </div>
          </div>

          <div class="row g-0 border-top border-secondary border-opacity-10">
            <!-- CAMPEÃO -->
            <div class="col-md-6 border-end border-secondary border-opacity-10 p-2 text-center bg-transparent">
              <div class="mb-1 text-warning lh-1" style="font-size: 1.3rem;">
                {{ '★'.repeat(seasonCountTitles) }}
              </div>

              <!-- BLOCO CAMPEÃO PADRONIZADO -->
              <div class="bloco-campeao position-relative d-flex align-items-center justify-content-center mt-1">
                <!-- Partículas de Confete -->
                <div v-for="n in 10" :key="n" class="confetti-p"></div>

                <div class="position-relative d-flex align-items-center">
                  <!-- Logo Libertadores (Indicador) -->
                  <img v-if="season.competitionName === 'Sul-Americana' && isFromLibertadores(season.campeao)" 
                       src="/logos/competitions/classdaliberta.png" 
                       class="lib-indicator-large me-3" 
                       title="Vindo da Libertadores" />
                    <!-- EXIBIÇÃO DUPLA PARA SELEÇÕES NO CAMPEÃO -->
                    <div v-if="isNationalCompetition" class="d-flex align-items-center me-3 border-end border-white border-opacity-10 pe-3">
                      <NationalFlag :countryName="season.campeao" :size="50" class="rounded-circle shadow-lg" />
                    </div>
                    <TeamShield :teamName="season.campeao" :size="100" borderless class="escudo-campeao" :season="season.ano" :isNational="isNationalCompetition" />
                 </div>

                 <div class="text-start info-campeao">
                   <h5 class="fw-black text-uppercase mb-0 lh-1 d-flex align-items-center gap-2" style="font-size: 1.4rem;">
                     {{ season.campeao }}
                     <transition name="pulse" appear>
                       <i v-if="careerStore.isUserTeam(season.campeao, season.ano, season.competitionName)" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 1.2rem;"></i>
                     </transition>
                   </h5>
                   <div class="text-secondary small fw-bold text-uppercase mt-1" style="font-size: 0.8rem;">CAMPEÃO — {{ season.ano }}</div>
                 </div>
               </div>

               <!-- Remover info extra de clubes se for seleção -->
               <div v-if="!isNationalCompetition && isInternational && getClubInfo(season.campeao)" class="d-flex justify-content-center align-items-center gap-2 mt-2">
                 <template v-if="competitionInfo?.modoRegistro === 'mundial'">
                    <img :src="getClubInfo(season.campeao).federacaoLogo" style="height: 14px; width: auto; object-fit: contain;" />
                    <span class="fw-bold x-small">{{ getClubInfo(season.campeao).federacao }}</span>
                    <span class="opacity-25 mx-1">|</span>
                 </template>
                 <NationalFlag :countryName="getClubInfo(season.campeao).pais" :forceUrl="getClubInfo(season.campeao).bandeira" :size="14" />
                 <span class="fw-bold x-small">{{ getClubInfo(season.campeao).pais }}</span>
               </div>
            </div>

            <!-- VICE -->
            <div class="col-md-6 p-2 text-center bg-transparent shadow-inset-left">
              <div class="mb-1 d-inline-block pt-1 d-flex align-items-center justify-content-center gap-3">
                <img v-if="season.competitionName === 'Sul-Americana' && isFromLibertadores(season.vice)" 
                     src="/logos/competitions/classdaliberta.png" 
                     class="lib-indicator-medium" 
                     title="Vindo da Libertadores" />
              <!-- EXIBIÇÃO DUPLA PARA SELEÇÕES NO VICE -->
                <div v-if="isNationalCompetition" class="d-flex align-items-center me-2">
                  <NationalFlag :countryName="season.vice" :size="40" class="rounded-circle shadow" />
                </div>
                <TeamShield :teamName="season.vice" :size="80" borderless :season="season.ano" :isNational="isNationalCompetition" />
              </div>
              <h6 class="fw-bold text-uppercase text-secondary mb-0 small d-flex align-items-center justify-content-center gap-2">
                {{ season.vice || 'SEM VICE' }}
                <i v-if="season.vice && careerStore.isUserTeam(season.vice, season.ano, season.competitionName)" class="bi bi-controller text-neon-green pulse-neon" style="font-size: 1rem;"></i>
              </h6>
              
              <!-- Remover info extra de clubes se for seleção -->
              <div v-if="!isNationalCompetition && isInternational && season.vice && getClubInfo(season.vice)" class="d-flex justify-content-center align-items-center gap-2">
                <template v-if="competitionInfo?.modoRegistro === 'mundial'">
                   <img :src="getClubInfo(season.vice).federacaoLogo" style="height: 12px; width: auto; object-fit: contain;" />
                   <span class="fw-bold x-small">{{ getClubInfo(season.vice).federacao }}</span>
                   <span class="opacity-25 mx-1">|</span>
                </template>
                <NationalFlag :countryName="getClubInfo(season.vice).pais" :forceUrl="getClubInfo(season.vice).bandeira" :size="12" />
                <span class="fw-bold x-small">{{ getClubInfo(season.vice).pais }}</span>
              </div>
              <div class="mt-1 small opacity-50 lh-1 d-flex gap-1 justify-content-center flex-wrap">
                <svg v-for="i in seasonCountVices" :key="'v'+i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"><path fill="#ff4444" d="M5.8 2L8.5 2 11 10 8.3 10z"/><path fill="#0055ff" d="M18.2 2L15.5 2 13 10 15.7 10z"/><circle cx="12" cy="14" r="7" fill="#e0e0e0" stroke="#808080" stroke-width="1.5"/><text x="12" y="17.5" font-family="Arial" font-size="10" font-weight="bold" fill="#666" text-anchor="middle">2</text></svg>
              </div>
            </div>
          </div>
        </GamePanel>
      </div>
    </div>


    <!-- CHAVEAMENTO MUNDIAL DE CLUBES (Componente Novo) -->
    <div v-if="competitionInfo?.modoRegistro === 'mundial' || season.competitionName === 'Mundial de Clubes'" class="row g-2 mb-4">
      <div class="col-12">
        <GamePanel customClass="p-3 overflow-hidden border border-primary border-opacity-10">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="m-0 fw-black text-info text-uppercase ls-1">
              <i class="bi bi-diagram-3 me-2"></i>CHAVEAMENTO MUNDIAL
            </h5>
            <button class="btn btn-sm btn-outline-primary fw-bold px-3" @click="showMundialModal = true">
              <i class="bi bi-pencil-square me-2"></i>EDITAR CHAVEAMENTO
            </button>
          </div>
          <MundialBracket 
            :mundial="season.mundial" 
            :isEditable="false" 
          />
        </GamePanel>
      </div>
    </div>

    <!-- GALERIA DE PRINTS (COPAS / INTERNACIONAIS) -->
    <div v-if="season.printsUrls && season.printsUrls.filter(u => u).length > 0" class="row g-2 mb-4">
      <div class="col-12">
        <GamePanel customClass="p-3 border border-info border-opacity-10 overflow-hidden">
          <h5 class="m-0 fw-black text-info text-uppercase ls-1 mb-3">
            <i class="bi bi-images me-2"></i>GALERIA DE PRINTS
          </h5>
          
          <div class="prints-gallery-container" :class="'prints-count-' + season.printsUrls.filter(u => u).length">
            <div v-for="(url, idx) in season.printsUrls.filter(u => u)" 
                 :key="idx" 
                 class="print-item-wrapper"
                 @click="openPhotoZoom(url)"
            >
              <img :src="getCachedLogo(url)" class="print-img-detail" />
              <div class="print-zoom-hint">
                <i class="bi bi-zoom-in"></i>
              </div>
            </div>
          </div>
        </GamePanel>
      </div>
    </div>

    <!-- CLASSIFICAÇÃO FINAL DE COPA (quando há participantes com colocacao) -->
    <div v-if="season.participantes && season.participantes.length > 0 && season.participantes.some(p => p.colocacao)" class="row g-2 mb-4">
      <div class="col-12">
        <GamePanel customClass="p-3 border border-warning border-opacity-10">
          <div class="d-flex align-items-center gap-2 mb-3">
            <i class="bi bi-diagram-3-fill text-warning"></i>
            <h6 class="m-0 fw-black text-uppercase text-warning ls-1">CLASSIFICAÇÃO FINAL</h6>
            <span class="badge bg-warning text-dark rounded-pill">{{ season.participantes.length }} times</span>
          </div>
          <div class="copa-phases-wrapper">
            <template v-for="phase in getCopaPhasesGrouped(season.participantes)" :key="phase.label">
              <div class="copa-phase-row mb-2">
                <span class="copa-phase-badge me-2" :class="phase.badgeClass">{{ phase.label }}</span>
                <span v-for="(p, pi) in phase.teams" :key="pi" class="copa-team-chip me-1 mb-1">
                  <div v-if="isNationalCompetition" class="d-flex align-items-center me-1">
                    <NationalFlag :countryName="p.nome" :size="16" class="rounded-circle" />
                  </div>
                  <TeamShield :teamName="p?.nome || p" :size="18" borderless :filterCountry="season.pais" :isNational="isNationalCompetition" noFlagFallback />
                  <span class="x-small fw-bold">{{ p?.nome || p }}</span>
                  <i v-if="careerStore.isUserTeam(p?.nome || p, season.ano, season.competitionName)" class="bi bi-controller text-neon-green ms-1" style="font-size: 0.65rem;"></i>
                </span>
              </div>
            </template>
          </div>
        </GamePanel>
      </div>
    </div>

    <!-- CONTEÚDO PRINCIPAL: TABELA + ARTILHARIA (SIDE-BY-SIDE SEM VÁCUO) -->
    <div class="d-flex gap-2 align-items-start flex-nowrap w-100 overflow-x-auto overflow-y-hidden">
      
      <!-- LADO ESQUERDO: TABELA -->
      <div v-if="(competitionInfo?.modoRegistro === 'liga' && season.tabela) || competitionInfo?.modoRegistro === 'participantes'" 
           class="flex-shrink-0" 
           :style="{ 
             width: 'fit-content', 
             minWidth: season.competitionName === 'Sul-Americana' ? '700px' : 'auto', 
             maxWidth: season.competitionName === 'Sul-Americana' ? '900px' : '750px'
           }">
        
        <!-- Caso Liga -->
        <GamePanel v-if="competitionInfo?.modoRegistro === 'liga'" customClass="p-0 overflow-hidden">
          <div class="px-3 py-2 bg-black bg-opacity-30 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10">
             <h6 class="m-0 text-info fw-black x-small text-uppercase ls-1"><i class="bi bi-list-ol me-2"></i>Classificação Final</h6>
             <span class="badge bg-info text-dark" style="font-size: 0.6rem;">{{ parsedTable.length }} TIMES</span>
          </div>
          <LeagueTable 
            :data="parsedTable" 
            :promotedCount="competitionStats.promoted"
            :relegationCount="competitionStats.relegated"
            :qualifiedCount="competitionStats.qualified"
            :playoffPromotedTeams="season.promovidosPlayoff || []"
            :season="season.ano"
            :country="season.pais"
          />
        </GamePanel>

        <!-- Caso Participantes (Copa) -->
        <GamePanel v-if="competitionInfo?.modoRegistro === 'participantes'" customClass="p-0 overflow-hidden">
          <div class="px-3 py-2 bg-success bg-opacity-10 d-flex justify-content-between align-items-center border-bottom border-success border-opacity-20 gap-3">
            <h6 class="m-0 text-success fw-black x-small text-uppercase ls-1 flex-shrink-0">
              <i class="bi bi-people-fill me-2"></i>Classificação Final (Copa)
            </h6>
            
            <!-- SELETOR DE ORDENAÇÃO -->
            <div class="d-flex align-items-center gap-2 ms-auto overflow-hidden">
              <span class="text-success opacity-50 x-small fw-bold text-uppercase d-none d-lg-inline">Ordenar por:</span>
              <select v-model="cupSortBy" class="form-select form-select-sm expert-sort-select">
                <option value="POS">COLOCAÇÃO</option>
                <option value="PAIS">PAÍS</option>
                <option value="CONT">CONTINENTE</option>
                <option value="NOME">NOME</option>
              </select>
            </div>

            <button class="btn btn-sm btn-success fw-black x-small flex-shrink-0 shadow-sm px-3" @click="saveClassification" style="min-width: fit-content;">SALVAR CLASSIFICAÇÃO</button>
          </div>
          
          <div class="px-2 pb-3">
            <div class="cup-table-v2 custom-scrollbar">
              <!-- CABEÇALHO -->
              <div class="cup-header-v2" :class="{ 'is-sul-americana': season.competitionName === 'Sul-Americana' }">
                <div class="h-main">
                  <div class="h-team">EQUIPE</div>
                </div>
                <div class="h-stats">
                  <div v-if="!isNationalCompetition" class="h-slant country">PAÍS</div>
                  <div class="h-slant pos">POSIÇÃO</div>
                </div>
              </div>

              <!-- LINHAS -->
              <div v-for="(p, idx) in sortedParticipantes" :key="p.clubeId || p.nome" 
                   class="cup-row-v2"
                   :class="[
                     { 'row-alt': idx % 2 !== 0 },
                     { 'is-sul-americana': season.competitionName === 'Sul-Americana' }
                   ]">
                

                <!-- INFO EQUIPE (REORDENADO) -->
                <div class="team-info-cup d-flex align-items-center gap-2">
                  <!-- 1. Ícone de Troféu/Medalha -->
                  <div class="trophy-icon-container">
                    <span v-if="p.colocacao === 'CAMPEÃO'" class="trophy-icon gold">🏆</span>
                    <span v-else-if="p.colocacao === 'VICE'" class="trophy-icon silver d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#ff4444" d="M5.8 2L8.5 2 11 10 8.3 10z"/><path fill="#0055ff" d="M18.2 2L15.5 2 13 10 15.7 10z"/><circle cx="12" cy="14" r="7" fill="#e0e0e0" stroke="#808080" stroke-width="1.5"/><text x="12" y="17.5" font-family="Arial" font-size="10" font-weight="bold" fill="#666" text-anchor="middle">2</text></svg>
                    </span>
                  </div>
                  
                  <!-- 2. Logo Libertadores (Indicador) -->
                  <div class="lib-indicator-container">
                    <img v-if="season.competitionName === 'Sul-Americana' && isFromLibertadores(p.nome)" 
                         src="/logos/competitions/classdaliberta.png" 
                         class="lib-indicator-small" 
                         title="Vindo da Libertadores" />
                  </div>

                  <!-- EXIBIÇÃO DUPLA PARA SELEÇÕES: BANDEIRA + ESCUDO -->
                  <template v-if="isNationalCompetition">
                    <NationalFlag :countryName="p.nome" :size="22" class="rounded-circle shadow-sm" />
                    <div class="shield-container">
                      <TeamShield :teamName="p.nome" :size="24" :season="season.ano" isNational borderless noFlagFallback />
                    </div>
                  </template>

                  <!-- 3. Escudo (Clubes) -->
                  <div v-else class="shield-container">
                    <TeamShield :teamName="p.nome" :size="24" :season="season.ano" />
                  </div>

                  <!-- 4. Nome do Time -->
                  <span class="team-name flex-grow-1 d-flex align-items-center gap-1">
                    {{ p.nome }}
                    <i v-if="careerStore.isUserTeam(p.nome, season.ano, season.competitionName)" class="bi bi-controller text-neon-green pulse-neon ms-1" style="font-size: 0.9rem;"></i>
                  </span>
                </div>

                <!-- STATS / DADOS -->
                <div class="stats-group-cup">
                  <div v-if="!isNationalCompetition" class="stat-slant-cup country" :class="getFedColorClass(p.federacao)">
                    <!-- NOVO: BANDEIRA DO PAÍS COM BLUR (IGUAL AOS CARDS) -->
                    <img v-if="p.pais && getSlantFlagUrl(p.pais)" 
                         :src="getCachedLogo(getSlantFlagUrl(p.pais))" 
                         class="country-slant-bg-flag">
                    
                    <div class="country-bg-glass"></div>
                    
                    <div class="d-flex align-items-center justify-content-start w-100 slant-content gap-2">
                      <div class="flag-align-container d-flex justify-content-center" style="width: 32px; flex-shrink: 0;">
                        <NationalFlag v-if="p.pais" :countryName="p.pais" :size="26" class="position-relative z-3 shadow-lg" />
                      </div>
                      <span class="text-uppercase fw-black text-truncate" style="font-size: 0.7rem; letter-spacing: 0.5px;">{{ p.pais || '-' }}</span>
                    </div>
                  </div>

                  <div class="stat-slant-cup select-col" :class="getPlacementColorClass(p.colocacao)">
                    <div class="slant-content">
                      <select v-model="p.colocacao" 
                              class="form-select cup-input-select fw-black"
                              :class="getPlacementColorClass(p.colocacao)">
                         <option :value="null" class="bg-dark text-white">SELECIONAR</option>
                         <option v-for="opt in dynamicPlacements" 
                                 :key="opt" 
                                 :value="opt"
                                 :class="getPlacementColorClass(opt) + '-option'">
                           {{ opt }}
                         </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!season.participantes || season.participantes.length === 0" class="text-center py-5 opacity-25 fw-black ls-1">
                NENHUM PARTICIPANTE CADASTRADO.
              </div>
            </div>
          </div>
        </GamePanel>
      </div>

      <!-- LADO DIREITO: ARTILHARIA PREMIUM (COMPACTA SÓ NA SUL-AMERICANA) -->
      <div v-if="hasScorers" class="flex-grow-1" :style="{ minWidth: season.competitionName === 'Sul-Americana' ? '320px' : '400px' }">
        <GamePanel customClass="h-100 p-0 overflow-hidden">
          <div class="p-2 px-3 bg-black bg-opacity-30 border-bottom border-secondary border-opacity-10">
            <h6 class="m-0 text-warning fw-black x-small text-uppercase ls-1">
              <i class="bi bi-person-badge me-2"></i>ARTILHEIRO — {{ season.ano }}
            </h6>
          </div>
          
          <div class="scorers-horizontal-container">
            <div v-for="(sc, idx) in allScorers" :key="idx" class="premium-scorer-card-h">
              
              <!-- DECORATION -->
              <div class="scorer-h-glow"></div>
              
              <div class="d-flex align-items-center w-100 h-100 position-relative z-2">
                <!-- TROFÉU DESTAQUE (ESPAÇO DEDICADO) -->
                <div class="scorer-trophy-box-h">
                  <img src="/logos/competitions/artilheiro.png" alt="Troféu">
                </div>

                <!-- FOTO -->
                <div class="scorer-photo-h" @click="openPhotoZoom(sc.fotoUrl)" :class="{ 'cursor-pointer': sc.fotoUrl }">
                  <img v-if="sc.fotoUrl" :src="getCachedLogo(sc.fotoUrl)" class="player-img">
                  <div v-else class="sc-placeholder-h"><i class="bi bi-person"></i></div>
                </div>

                <!-- INFO (NOME E POSIÇÃO) -->
                <div class="scorer-info-h">
                  <div class="d-flex flex-column">
                    <h3 class="scorer-name-h">{{ sc.nome }}</h3>
                    <div class="scorer-pos-h">{{ sc.posicaoCampo || 'CA' }}</div>
                  </div>
                </div>

                <!-- NACIONALIDADE -->
                <div class="scorer-nat-h">
                   <div class="v-divider-h"></div>
                   <div class="d-flex align-items-center gap-2 px-3">
                     <NationalFlag :countryName="sc.nacionalidade" :size="32" class="rounded-circle shadow" />
                     <span class="text-uppercase fw-black" style="font-size: 0.8rem; letter-spacing: 1px;">{{ sc.nacionalidade }}</span>
                   </div>
                </div>

                <!-- CLUBE -->
                <div class="scorer-club-h">
                  <div class="v-divider-h"></div>
                  <div class="d-flex align-items-center gap-2 px-3">
                    <div class="club-shield-h-wrap">
                      <TeamShield :teamName="sc.clube" :size="48" borderless :season="season.ano" />
                    </div>
                    <div class="d-flex flex-column">
                      <span class="club-name-h">{{ sc.clube }}</span>
                      <div class="d-flex align-items-center gap-1" style="font-size: 0.65rem;">
                        <NationalFlag :countryName="getClubInfo(sc.clube)?.pais" :size="10" />
                        <span class="fw-bold">{{ getClubInfo(sc.clube)?.pais }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- GOLS (COMPACTO) -->
                <div class="scorer-goals-h ms-auto">
                  <div class="goals-box-h">
                    <div class="val" style="font-size: 1.5rem;">{{ sc.gols }}</div>
                    <div class="lbl">GOLS</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </GamePanel>
      </div>

    </div>



    <!-- PHOTO ZOOM MODAL -->
    <div v-if="showPhotoZoom" class="photo-zoom-overlay" @click.self="showPhotoZoom = false">
      <div class="zoom-content-container">
        <button class="btn-close-zoom" @click="showPhotoZoom = false">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="getCachedLogo(zoomedPhotoUrl)" class="zoomed-image-full">
      </div>
    </div>

    <!-- MODAIS -->
    <!-- Modal Mundial de Clubes -->
    <div v-if="showMundialModal" class="form-full-screen-overlay">
       <div class="form-full-screen-content custom-scrollbar">
           <div class="d-flex justify-content-between align-items-center mb-4">
               <h2 class="text-warning fw-black m-0">EDITAR CHAVEAMENTO MUNDIAL</h2>
               <button class="btn-close-large" @click="showMundialModal = false">×</button>
           </div>
           
           <div class="row">
               <div class="col-12">
                   <div class="p-4 rounded-4 bg-black bg-opacity-40 border border-primary border-opacity-20 shadow-2xl">
                       <MundialBracket 
                          :mundial="season.mundial" 
                          :isEditable="true"
                          @updateMatch="updateMundialField"
                       />
                   </div>
               </div>
           </div>

           <div class="d-flex justify-content-center mt-5 mb-5 pb-5">
               <button class="btn btn-lg btn-warning fw-black px-5 py-3 shadow-lg hover-glow" @click="saveMundialBracket">
                   <i class="bi bi-check-circle-fill me-2"></i>SALVAR CHAVEAMENTO DO MUNDIAL
               </button>
           </div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { seasonStore } from '../services/season.store'
import { careerStore } from '../services/career.store'
import { seasonService } from '../services/season.service'
import { CLUBS_DATA } from '../data/clubs.data'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { getSeasonFinalYear, getTrofeuPath } from '../services/utils'
import GamePanel from '../components/GamePanel.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import LeagueTable from '../components/LeagueTable.vue'
import { dataSearchService } from '../services/dataSearch.service'
import { imageCacheService } from '../services/imageCache.service'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import MundialBracket from '../components/MundialBracket.vue'
import { NATIONAL_COMPETITIONS_STRUCTURE } from '../services/national.data'
import { clubStore } from '../services/club.store'

// == Funções de Copa ==
const getPlacementColorClass = (colocacao) => {
    if (!colocacao) return ''
    const n = colocacao.toLowerCase()
    if (n.includes('campe')) return 'bg-pos-gold'
    if (n.includes('vice')) return 'bg-pos-silver'
    if (n.includes('3') || n.includes('4') || n.includes('terceiro') || n.includes('quarto')) return 'bg-pos-bronze'
    if (n.includes('semi')) return 'bg-pos-bronze'
    if (n.includes('quart')) return 'bg-pos-green'
    if (n.includes('oitav')) return 'bg-pos-blue-lib'
    if (n.includes('16 avos')) return 'bg-pos-blue-sula'
    if (n.includes('grupo') || n.includes('eliminado')) return 'bg-pos-red-group'
    if (n.includes('pre') || n.includes('pré')) return 'bg-pos-red-pre'
    return 'bg-pos-gray'
}

const getCopaBadgeClass = (colocacao) => {
  return getPlacementColorClass(colocacao)
}

const getCopaPhasesGrouped = (participantes) => {
  if (!participantes) return []
  const phaseMap = new Map()
  
  participantes.forEach(p => {
    let colocacao = p.colocacao || 'Participante'
    // Normalização agressiva para labels curtas (Ex: "Oitavas de Final" -> "Oitavas")
    const norm = colocacao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.]/g, '')
    
    if (norm.includes('campe')) colocacao = 'Campeão'
    else if (norm.includes('vice')) colocacao = 'Vice'
    else if (norm.includes('3') || norm.includes('terceiro')) colocacao = '3º COLOCADO'
    else if (norm.includes('4') || norm.includes('quarto')) colocacao = '4º COLOCADO'
    else if (norm.includes('semi')) colocacao = 'Semifinal'
    else if (norm.includes('quart')) colocacao = 'Quartas'
    else if (norm.includes('oitav') || norm === '16') colocacao = 'Oitavas'
    else if (norm.includes('16') || norm.includes('avos')) colocacao = '16 Avos'
    else if (norm.includes('libertadores') && (norm.includes('pre') || norm.includes('pré'))) colocacao = 'Pré-Libertadores'
    else if (norm.includes('champions') && (norm.includes('pre') || norm.includes('pré'))) colocacao = 'Pré-Champions'
    else if (norm.includes('pre') || norm.includes('pré')) colocacao = (season.value?.competitionName?.includes('Libertadores')) ? 'Pré-Libertadores' : (season.value?.competitionName?.includes('Champions') ? 'Pré-Champions' : 'Pré-Copa')
    else if (norm.includes('grupos') || norm.includes('grupo')) colocacao = 'Fase de Grupos'
    
    if (!phaseMap.has(colocacao)) {
      phaseMap.set(colocacao, { label: colocacao, teams: [], badgeClass: getCopaBadgeClass(colocacao) })
    }
    phaseMap.get(colocacao).teams.push(p)
  })
  
  const phaseOrder = ['Campeão', 'Vice', '3º COLOCADO', '4º COLOCADO', 'Semifinal', 'Quartas', 'Oitavas', '16 Avos', 'Fase de Grupos', 'Pré-Libertadores', 'Pré-Copa', 'Pré-Champions', 'Eliminado', 'Participante']
  return Array.from(phaseMap.values()).sort((a, b) => {
    const ia = phaseOrder.indexOf(a.label)
    const ib = phaseOrder.indexOf(b.label)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

const dynamicPlacements = computed(() => {
  return [
    'CAMPEÃO', 'VICE', '3º COLOCADO', '4º COLOCADO', 'SEMIFINAL', 
    'QUARTAS', 'OITAVAS', '16 AVOS', 'FASE DE GRUPOS', 'PRÉ-COPA', 'PRÉ-LIBERTADORES', 'PRÉ-CHAMPIONS', 'ELIMINADO', 'PARTICIPANTE'
  ]
})

const libertadoresTeams = ref([])

const loadLibertadoresTeams = async () => {
  if (!season.value) return
  if (season.value.competitionName !== 'Sul-Americana') return
  
  try {
    const allSeasons = await seasonService.getAll()
    const libSeason = allSeasons.find(s => 
      s.competitionName === 'Libertadores' && 
      s.ano === season.value.ano
    )
    
    if (libSeason) {
      const teams = []
      if (libSeason.tabela) {
        const lines = libSeason.tabela.split('\n').filter(l => l?.trim())
        lines.forEach(line => {
          let cells = line.split('\t')
          if (cells.length === 1) cells = line.split(/\s{2,}/)
          if (cells[0]) teams.push(cells[0].replace(/^\d+[\s.]*/, '').trim())
        })
      }
      if (libSeason.participantes) {
        libSeason.participantes.forEach(p => teams.push(p.nome))
      }
      libertadoresTeams.value = [...new Set(teams)]
    }
  } catch (e) {
    console.error("Erro ao carregar times da Libertadores:", e)
  }
}

const isFromLibertadores = (teamName) => {
  if (!teamName) return false
  return libertadoresTeams.value.some(t => t.toLowerCase().trim() === teamName.toLowerCase().trim())
}

const route = useRoute()
const season = ref(null)
const cachedLogos = ref({})
const showPhotoZoom = ref(false)
const zoomedPhotoUrl = ref('')

const openPhotoZoom = (url) => {
  if (!url) return
  zoomedPhotoUrl.value = url
  showPhotoZoom.value = true
}

const getCachedLogo = (url) => {
  if (!url) return null
  if (url.startsWith('data:')) return url
  return cachedLogos.value[url] || url
}

const showMundialModal = ref(false)

const updateMundialField = (phase, field, value) => {
  if (!season.value?.mundial) return
  season.value.mundial[phase][field] = value
}

const phaseOrder = ['Campeão', 'Vice', '3º COLOCADO', '4º COLOCADO', 'Semifinal', 'Quartas', 'Oitavas', '16 Avos', 'Fase de Grupos', 'Pré-Libertadores', 'Pré-Copa', 'Pré-Champions', 'Eliminado', 'Participante']

const getPhaseRank = (coloc) => {
  if (!coloc) return 99
  const norm = coloc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.]/g, '')
  if (norm.includes('campe')) return 0
  if (norm.includes('vice')) return 1
  if (norm.includes('3') || norm.includes('terceiro')) return 2
  if (norm.includes('4') || norm.includes('quarto')) return 3
  if (norm.includes('semi')) return 4
  if (norm.includes('quart')) return 5
  if (norm.includes('oitav') || norm === '16') return 6
  if (norm.includes('16') || norm.includes('avos')) return 7
  if (norm.includes('grupo')) return 8
  if (norm.includes('pre') || norm.includes('pré')) return 9
  return 10
}

const cupSortBy = ref('POS')

const sortedParticipantes = computed(() => {
  if (!season.value?.participantes) return []
  const list = [...season.value.participantes]
  
  if (cupSortBy.value === 'PAIS') {
    return list.sort((a, b) => (a.pais || '').localeCompare(b.pais || ''))
  }
  
  if (cupSortBy.value === 'NOME') {
    return list.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
  }
  
  if (cupSortBy.value === 'CONT') {
    return list.sort((a, b) => (a.federacao || '').localeCompare(b.federacao || ''))
  }
  
  // Default: POS (Colocação seguindo phaseOrder)
  return list.sort((a, b) => getPhaseRank(a.colocacao) - getPhaseRank(b.colocacao))
})

const computeMundialResults = () => {
  const m = season.value?.mundial;
  if (!m) return;

  // Semi 1
  if (m.semi1.placar1 > m.semi1.placar2) {
    m.final.time1 = m.semi1.time1;
    m.terceiro.time1 = m.semi1.time2;
  } else if (m.semi1.placar2 > m.semi1.placar1) {
    m.final.time1 = m.semi1.time2;
    m.terceiro.time1 = m.semi1.time1;
  } else if (m.semi1.pen1 || m.semi1.pen2) {
    if (m.semi1.pen1 > m.semi1.pen2) {
      m.final.time1 = m.semi1.time1;
      m.terceiro.time1 = m.semi1.time2;
    } else {
      m.final.time1 = m.semi1.time2;
      m.terceiro.time1 = m.semi1.time1;
    }
  }

  // Semi 2
  if (m.semi2.placar1 > m.semi2.placar2) {
    m.final.time2 = m.semi2.time1;
    m.terceiro.time2 = m.semi2.time2;
  } else if (m.semi2.placar2 > m.semi2.placar1) {
    m.final.time2 = m.semi2.time2;
    m.terceiro.time2 = m.semi2.time1;
  } else if (m.semi2.pen1 || m.semi2.pen2) {
    if (m.semi2.pen1 > m.semi2.pen2) {
      m.final.time2 = m.semi2.time1;
      m.terceiro.time2 = m.semi2.time2;
    } else {
      m.final.time2 = m.semi2.time2;
      m.terceiro.time2 = m.semi2.time1;
    }
  }

  // Final
  if (m.final.placar1 > m.final.placar2) {
    season.value.campeao = m.final.time1;
    season.value.vice = m.final.time2;
  } else if (m.final.placar2 > m.final.placar1) {
    season.value.campeao = m.final.time2;
    season.value.vice = m.final.time1;
  } else if (m.final.pen1 || m.final.pen2) {
    if (m.final.pen1 > m.final.pen2) {
      season.value.campeao = m.final.time1;
      season.value.vice = m.final.time2;
    } else {
      season.value.campeao = m.final.time2;
      season.value.vice = m.final.time1;
    }
  }
}

const saveMundialBracket = async () => {
  try {
    // Recalcular Campeão e Vice antes de salvar
    const m = season.value.mundial
    let novoCampeao = season.value.campeao
    let novoVice = season.value.vice

    if (m.final.time1 && m.final.time2 && (m.final.placar1 !== '' || m.final.placar2 !== '')) {
        const p1 = parseInt(m.final.placar1) || 0
        const p2 = parseInt(m.final.placar2) || 0
        const pn1 = parseInt(m.final.pen1) || 0
        const pn2 = parseInt(m.final.pen2) || 0

        if (p1 > p2 || (p1 === p2 && pn1 > pn2)) {
            novoCampeao = m.final.time1
            novoVice = m.final.time2
        } else if (p2 > p1 || (p2 === p1 && pn2 > pn1)) {
            novoCampeao = m.final.time2
            novoVice = m.final.time1
        }
    }

    await seasonService.update(season.value.id, { 
        mundial: season.value.mundial,
        campeao: novoCampeao,
        vice: novoVice
    })
    
    season.value.campeao = novoCampeao
    season.value.vice = novoVice
    
    showMundialModal.value = false
    alert('Chaveamento do Mundial salvo com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar mundial:', error)
    alert('Erro ao salvar: ' + error.message)
  }
}

// Mapeamento especial para Grupos de Outros Clubes (ÍCONES REDONDOS)
const getFlagUrl = (countryName) => {
  if (!countryName) return null

  if (countryName === 'Outros Américas') return 'logos/competitions/banner-americas-redondo.png'
  if (countryName === 'Outros Europa') return 'logos/competitions/banner-europa-redondo.png'
  if (countryName === 'Outros África') return 'logos/competitions/banner-africa-redondo.png'

  const data = dataSearchService.findNationalTeam(countryName) || dataSearchService.findClub(countryName)
  return data?.bandeira_url || null
}

// Mapeamento especial para BANNERS DE FUNDO (RETANGULARES)
const getSlantFlagUrl = (countryName) => {
  if (!countryName) return null

  if (countryName === 'Outros Américas') return 'logos/competitions/banner-americas.png'
  if (countryName === 'Outros Europa') return 'logos/competitions/banner-europa.png'
  if (countryName === 'Outros África') return 'logos/competitions/banner-africa.png'

  return getFlagUrl(countryName)
}

const isNationalCompetition = computed(() => {
  return competitionInfo.value?.id >= 1000 || 
         NATIONAL_COMPETITIONS_STRUCTURE.some(continent => 
           continent?.competicoes?.some(c => c.nome === season.value?.competitionName)
         )
})

const isInternational = computed(() => {
  return competitionInfo.value?.tipo === 'internacional' || 
         INTERNATIONAL_DATA.some(c => c.nome === season.value?.competitionName);
})

const competitionInfo = computed(() => {
  if (!season.value?.competitionName) return null
  return dataSearchService.findCompetition(season.value.competitionName)
})

const competitionStats = computed(() => {
  const comp = competitionInfo.value
  
  return {
    promoted: comp?.promovidos || 0,
    relegated: getRelegationCount(comp),
    qualified: comp?.qualificados || 0
  }
})

const getRelegationCount = (comp) => {
  if (!comp) return 0
  const name = comp.nome;
  if (name === 'Liga Profissional' || name === 'Primera División' || name === 'Liga Argentina') return 4 // Regra Argentina A
  return comp.rebaixados || 0
}


const getFederation = (continentName) => {
  if (!continentName) return { nome: 'Federação', logo: '' };
  const normalize = (s) => s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const normalizedKey = normalize(continentName);
  const key = Object.keys(FEDERATIONS_DATA).find(k => normalize(k) === normalizedKey);
  return FEDERATIONS_DATA[key] || { nome: 'Federação', logo: '' };
}

const getClubInfo = (clubName) => {
  if (!clubName) return null;
  // Usar clubStore para busca robusta (inclui customizados e normalização)
  const club = clubStore.getClub(clubName);
  if (!club) return null;
  
  const cont = (club.continente || '').toUpperCase();
  let displayCountry = club.pais;
  
  // Mapeamento automático para grupos de "Outros" se o clube estiver categorizado assim
  if (cont.includes('OUTROS AMÉRICAS')) displayCountry = 'Outros Américas';
  else if (cont.includes('OUTROS EUROPA')) displayCountry = 'Outros Europa';
  else if (cont.includes('OUTROS ÁFRICA')) displayCountry = 'Outros África';
  
  const fed = getFederation(club.continente);
  
  return {
    pais: displayCountry,
    bandeira: club.bandeira_url,
    federacao: fed.nome,
    federacaoLogo: fed.logo
  };
}

const hasScorers = computed(() => {
  return season.value && (
    (season.value.topScorers && season.value.topScorers.length > 0) || 
    (season.value.artilheiro && season.value.artilheiro.nome)
  );
})

const allScorers = computed(() => {
  if (!season.value) return [];
  if (season.value.topScorers) return season.value.topScorers;
  if (season.value.artilheiro && season.value.artilheiro.nome) return [season.value.artilheiro];
  return [];
})

const seasonCountTitles = computed(() => {
  if (!season.value) return 0
  const teamName = season.value.campeao
  if (!teamName) return 0
  const compName = season.value.competitionName
  const currentYear = getSeasonFinalYear(season.value.ano)
  
  const matches = seasonStore.list.filter(s => {
    return s.competitionName === compName &&
           s.campeao && s.campeao.toLowerCase().trim() === teamName.toLowerCase().trim() &&
           getSeasonFinalYear(s.ano) <= currentYear
  })
  
  // Contar apenas anos únicos para evitar duplicidade de registros
  return new Set(matches.map(s => getSeasonFinalYear(s.ano))).size
})

const seasonCountVices = computed(() => {
  if (!season.value) return 0
  const teamName = season.value.vice
  if (!teamName) return 0
  const compName = season.value.competitionName
  const currentYear = getSeasonFinalYear(season.value.ano)
  
  const matches = seasonStore.list.filter(s => {
    return s.competitionName === compName &&
           s.vice && s.vice.toLowerCase().trim() === teamName.toLowerCase().trim() &&
           getSeasonFinalYear(s.ano) <= currentYear
  })

  // Contar apenas anos únicos para evitar duplicidade de registros
  return new Set(matches.map(s => getSeasonFinalYear(s.ano))).size
})

const headerBgStyle = computed(() => {
  return {};
})

const parsedTable = computed(() => {
  if (!season.value?.tabela) return []
  const lines = season.value.tabela.split('\n').filter(l => l?.trim())
  return lines.map(line => {
    let cells = line.split('\t')
    if (cells.length === 1) cells = line.split(/\s{2,}/)
    if (cells.length === 1) {
      const match = line.match(/^([^\d]+)(.*)$/)
      if (match) {
        const teamName = match[1].trim()
        const stats = match[2].trim().split(/\s+/)
        cells = [teamName, ...stats]
      }
    }
    return cells.map(c => c.toString().trim()).filter(c => c !== '')
  })
})

const loadSeasonData = async () => {
  const id = String(route.params.id);
  let found = seasonStore.list.find(s => String(s.id) === id);
  if (!found) {
    const allSeasons = await seasonService.getAll();
    found = allSeasons.find(s => String(s.id) === id);
  }
  if (found) {
    season.value = found;
    loadLibertadoresTeams();
    if (!season.value.participantes) season.value.participantes = [];
    if (!season.value.mundial && season.value.competitionName === 'Mundial de Clubes') {
      season.value.mundial = {
        semi1: { time1: '', time2: '', placar1: 0, placar2: 0 },
        semi2: { time1: '', time2: '', placar1: 0, placar2: 0 },
        final: { time1: '', time2: '', placar1: 0, placar2: 0 },
        terceiro: { time1: '', time2: '', placar1: 0, placar2: 0 }
      }
    }
    
    if (season.value.participantes) {
      season.value.participantes.forEach(p => {
        // Fallback: Se o país for '-' ou vazio, tenta recuperar via getClubInfo
        if (!p.pais || p.pais === '-' || !p.federacao) {
          const info = getClubInfo(p.nome);
          if (info) {
            if (!p.pais || p.pais === '-') p.pais = info.pais;
            if (!p.federacao) p.federacao = info.federacao;
          }
        }
      });
    }
    
    if (hasScorers.value) {
      for (const sc of allScorers.value) {
        if (sc.fotoUrl && !sc.fotoUrl.startsWith('http') && !sc.fotoUrl.startsWith('data:')) {
          const b64 = await imageCacheService.getLogo(sc.fotoUrl)
          if (b64) cachedLogos.value[sc.fotoUrl] = b64
        }
      }
    }
  }
}



const getFedColorClass = (fedName) => {
  if (!fedName) return '';
  const n = fedName.toUpperCase();
  if (n.includes('CONMEBOL')) return 'fed-conmebol';
  if (n.includes('UEFA')) return 'fed-uefa';
  if (n.includes('CONCACAF')) return 'fed-concacaf';
  if (n.includes('FIFA')) return 'fed-fifa';
  if (n.includes('AFC') || n.includes('ASIA') || n.includes('ÁSIA')) return 'fed-afc';
  if (n.includes('CAF') || n.includes('AFRICA') || n.includes('ÁFRICA')) return 'fed-caf';
  return '';
}

onMounted(async () => {
  await seasonStore.loadAll()
  await careerStore.loadAll()
  loadSeasonData()
  
  // Força re-render dos selects após carregamento para aplicar CSS corretamente
  setTimeout(() => {
    if (season.value?.participantes) {
      season.value.participantes = [...season.value.participantes]
    }
  }, 100)
})

// Watcher para forçar re-aplicação de classes CSS quando dados mudam
watch(() => season.value?.participantes, (newVal) => {
  if (newVal && newVal.length > 0) {
    // Força re-render para aplicar classes CSS corretamente
    setTimeout(() => {
      const selects = document.querySelectorAll('.cup-input-select')
      selects.forEach(select => {
        // Força o navegador a re-renderizar o select
        select.style.display = 'none'
        select.offsetHeight // trigger reflow
        select.style.display = ''
      })
    }, 50)
  }
}, { deep: true, immediate: true })

watch(() => route.params.id, () => {
  loadSeasonData();
})

// Sincronização automática de Campeão e Vice a partir da lista de participantes
watch(() => season.value?.participantes, (newPart) => {
  if (!newPart || !season.value) return
  
  const champ = newPart.find(p => p.colocacao === 'CAMPEÃO')
  const vice = newPart.find(p => p.colocacao === 'VICE')
  
  if (champ && season.value.campeao !== champ.nome) {
    season.value.campeao = champ.nome
  }
  if (vice && season.value.vice !== vice.nome) {
    season.value.vice = vice.nome
  }
}, { deep: true })

// Sincronização automática para o modo Mundial
watch(() => season.value?.mundial, (newMundial) => {
  if (!newMundial || !season.value) return
  computeMundialResults()
}, { deep: true })

// FIX: Reagir a atualizações no Store (ex: após edição do artilheiro)
watch(() => seasonStore.list, () => {
  const id = String(route.params.id);
  const found = seasonStore.list.find(s => String(s.id) === id);
  if (found) {
     loadSeasonData();
  }
}, { deep: true })

const saveClassification = async () => {
  if (!season.value) return;

  // Atualizar automaticamente Campeão e Vice se houver na classificação
  const champ = season.value.participantes.find(p => p.colocacao === 'CAMPEÃO');
  const vice = season.value.participantes.find(p => p.colocacao === 'VICE');
  
  if (champ) season.value.campeao = champ.nome;
  if (vice) season.value.vice = vice.nome;

  try {
    // IMPORTANTE: Ordenar os participantes por colocação ANTES de salvar a tabela string
    // Isso garante que o Raio-X leia na ordem certa (Campeão no topo)
    const sortedToSave = [...season.value.participantes].sort((a, b) => getPhaseRank(a.colocacao) - getPhaseRank(b.colocacao));

    // Gerar string da tabela para compatibilidade com históricos
    let tableStr = '';
    sortedToSave.forEach((p, index) => {
       tableStr += `${index + 1}\t${p.nome}\t${p.colocacao || '-'}\n`;
    });

    await seasonStore.updateSeason(season.value.id, { 
      participantes: JSON.parse(JSON.stringify(season.value.participantes)),
      tabela: tableStr, // Salva a versão string para o parser do histórico
      campeao: season.value.campeao,
      vice: season.value.vice
    });
    alert('Classificação salva com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar classificação:', error);
    alert('Erro ao salvar classificação.');
  }
}

</script>

<style scoped>
.season-detail-header-compact {
  min-height: 50px;
  background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.6) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.trophy-badge-mini {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #000;
  color: #ffc107;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  border: 1px solid #ffc107;
  box-shadow: 0 0 10px rgba(255,193,7,0.4);
}

.bloco-campeao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: default;
  transition: all 0.25s;
}

.bloco-campeao img {
  flex-shrink: 0;
}

.trofeu-campeao {
  height: 100px;
  width: auto;
  transition: 0.25s;
}

.escudo-campeao {
  height: 100px;
  width: auto;
}

.bloco-campeao:hover .trofeu-campeao {
  transform: scale(1.08);
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
}

/* EFEITO CONFETE NO HOVER */
.confetti-p {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffc107;
  border-radius: 50%;
  top: -10px;
  opacity: 0;
  pointer-events: none;
}

.bloco-campeao:hover .confetti-p {
  animation: confetti-fall 0.8s ease-out forwards;
}

@keyframes confetti-fall {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(40px) scale(0); opacity: 0; }
}

.confetti-p:nth-child(1) { left: 20%; animation-delay: 0.0s; }
.confetti-p:nth-child(2) { left: 40%; animation-delay: 0.1s; }
.confetti-p:nth-child(3) { left: 60%; animation-delay: 0.05s; }
.confetti-p:nth-child(4) { left: 80%; animation-delay: 0.15s; }
.confetti-p:nth-child(5) { left: 30%; animation-delay: 0.2s; }
.confetti-p:nth-child(6) { left: 50%; animation-delay: 0.1s; }
.confetti-p:nth-child(7) { left: 70%; animation-delay: 0.25s; }
.confetti-p:nth-child(8) { left: 25%; animation-delay: 0.0s; }
.confetti-p:nth-child(9) { left: 55%; animation-delay: 0.3s; }
.confetti-p:nth-child(10) { left: 75%; animation-delay: 0.12s; }

/* NOVO LAYOUT ARTILHARIA HORIZONTAL PREMIUM */
.scorers-horizontal-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
}

.premium-scorer-card-h {
  height: 120px;
  background: rgba(10, 15, 25, 0.95);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.scorer-h-glow {
  position: absolute;
  top: 0; left: 0; bottom: 0; width: 300px;
  background: radial-gradient(circle at 0% 50%, rgba(255, 193, 7, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.scorer-trophy-box-h {
  width: 110px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.08);
}

.scorer-trophy-box-h img {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255,193,7,0.6));
}

.scorer-photo-h {
  width: 140px;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  flex-shrink: 0;
}

.player-img {
  height: 100%;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(0,0,0,0.8));
}

.sc-placeholder-h {
  font-size: 4rem;
  opacity: 0.1;
  margin-bottom: 10px;
}

.scorer-info-h {
  padding: 0 25px;
  flex-grow: 1;
}

.scorer-name-h {
  font-weight: 900;
  font-size: 1.8rem;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: -0.5px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.scorer-pos-h {
  font-weight: 900;
  font-size: 0.8rem;
  color: #58ccff;
  letter-spacing: 2px;
  text-transform: uppercase;
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
  font-size: 1rem;
  text-transform: uppercase;
}

.club-shield-h-wrap {
  background: rgba(255,255,255,0.03);
  padding: 5px;
  border-radius: 10px;
}

.scorer-goals-h {
  padding-right: 20px;
}

.goals-box-h {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #000;
  padding: 10px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 25px rgba(255, 152, 0, 0.4);
  transform: scale(1.1);
}

.goals-box-h .val {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
}

.goals-box-h .lbl {
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 1px;
}

/* UTILS */
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.7rem; }
.fw-black { font-weight: 900; }

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.premium-scorer-card-h {
  animation: slideInRight 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.hvr-underline-gold {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.hvr-underline-gold::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #ffc107;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.5);
}

.cursor-pointer {
  cursor: pointer;
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

.hvr-underline-gold:hover {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

.hvr-underline-gold:hover::after {
  width: 100%;
}
/* Cup Table V2 - Modern Style */
.cup-table-v2 {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.cup-header-v2 {
  display: flex;
  align-items: flex-end;
  margin-bottom: 4px;
}

.h-main {
  display: flex;
  width: 280px; /* Reduzido de 310px */
  font-weight: 900;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}

.cup-header-v2.is-sul-americana .h-main {
  width: 360px; /* Reduzido de 410px */
}

.h-pos { width: 40px; text-align: center; }
.h-team { padding-left: 10px; display: flex; align-items: center; justify-content: flex-start; }

.h-stats {
  display: flex;
  gap: 2px;
  flex-grow: 1;
}

.h-slant {
  background: rgba(255, 255, 255, 0.05);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.5);
  height: 16px;
  padding: 0 10px;
}

.h-slant.country { width: 220px; } /* Ajustado para 220px */
.h-slant.pos { width: 170px; }
.h-slant.fed { width: 80px; }

.cup-row-v2 {
  display: flex;
  align-items: stretch;
  background: rgba(15, 25, 40, 0.85);
  height: 32px;
  position: relative;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cup-row-v2:hover {
  transform: scale(1.015);
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* HOVER NEON DINÂMICO POR POSIÇÃO */
.cup-row-v2.pos-gold:hover {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.25), rgba(255, 215, 0, 0.1)) !important;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.2);
  border-left: 4px solid #ffd700;
}

.cup-row-v2.pos-silver:hover {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.25), rgba(192, 192, 192, 0.1)) !important;
  box-shadow: 0 0 20px rgba(192, 192, 192, 0.6), inset 0 0 15px rgba(192, 192, 192, 0.2);
  border-left: 4px solid #c0c0c0;
}

.cup-row-v2.pos-bronze:hover {
  background: linear-gradient(90deg, rgba(255, 140, 0, 0.25), rgba(255, 140, 0, 0.1)) !important;
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.6), inset 0 0 15px rgba(255, 140, 0, 0.2);
  border-left: 4px solid #ff8c00;
}

.cup-row-v2.pos-green:hover {
  background: linear-gradient(90deg, rgba(46, 204, 113, 0.25), rgba(46, 204, 113, 0.1)) !important;
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.6), inset 0 0 15px rgba(46, 204, 113, 0.2);
  border-left: 4px solid #2ecc71;
}

.cup-row-v2.pos-cyan:hover {
  background: linear-gradient(90deg, rgba(0, 242, 255, 0.25), rgba(0, 242, 255, 0.1)) !important;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.6), inset 0 0 15px rgba(0, 242, 255, 0.2);
  border-left: 4px solid #00f2ff;
}

.cup-row-v2.pos-blue-dark:hover {
  background: linear-gradient(90deg, rgba(0, 86, 179, 0.25), rgba(0, 86, 179, 0.1)) !important;
  box-shadow: 0 0 20px rgba(0, 86, 179, 0.6), inset 0 0 15px rgba(0, 86, 179, 0.2);
  border-left: 4px solid #0056b3;
}

.cup-row-v2.pos-red:hover {
  background: linear-gradient(90deg, rgba(231, 76, 60, 0.25), rgba(231, 76, 60, 0.1)) !important;
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.6), inset 0 0 15px rgba(231, 76, 60, 0.2);
  border-left: 4px solid #e74c3c;
}

.row-alt { background: rgba(10, 18, 30, 0.5); }


.team-info-cup {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding-left: 8px;
  padding-right: 10px;
  width: 280px; /* Reduzido de 310px */
  z-index: 5;
  background: rgba(30, 40, 55, 0.98); 
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.3s ease;
}

/* LAYOUT ESPECIAL APENAS PARA SUL-AMERICANA */
.cup-row-v2.is-sul-americana .team-info-cup {
  width: 360px; /* Reduzido de 410px */
  gap: 12px;
}

/* CONTAINERS DE ALINHAMENTO FIXO */
.trophy-icon-container {
  width: 24px; /* Fixado para todas as linhas */
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lib-indicator-container {
  width: 0; /* Oculto por padrão (Libertadores, etc) */
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s ease;
}

.cup-row-v2.is-sul-americana .lib-indicator-container {
  width: 28px;
}

.shield-container {
  width: 32px; /* Fixado para todas as linhas */
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trophy-icon {
  font-size: 18px;
  animation: trophy-pulse 2s ease-in-out infinite;
}

.trophy-icon.gold {
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
}

.trophy-icon.silver {
  filter: drop-shadow(0 0 4px rgba(192, 192, 192, 0.8));
}

@keyframes trophy-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.team-name {
  font-weight: 800;
  font-size: 0.70rem;
  text-transform: uppercase;
  color: #fff !important;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-group-cup {
  display: flex;
  gap: 2px;
  width: fit-content; /* Remove excesso lateral */
}

.stat-slant-cup {
  background: rgba(0, 0, 0, 0.2);
  transform: skewX(-20deg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.stat-slant-cup .slant-content {
  transform: skewX(20deg);
  display: flex;
  align-items: center;
  justify-content: flex-start; 
  padding-left: 15px; /* Reduzido de 20px */
  width: 100%;
  font-weight: 800;
  font-size: 0.65rem;
  z-index: 2;
  position: relative;
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
}

.stat-slant-cup.select-col .slant-content {
  font-size: 0.58rem; /* Fonte ainda menor para garantir que caiba */
  justify-content: center;
  padding: 0 10px; /* Margem interna de segurança */
}

.country-bg-glass {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.4;
  background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
}

.stat-slant-cup.country { 
  width: 220px; /* Aumentado para não cortar "OUTROS AMÉRICAS" */
  border-left: 2px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden; /* Garante que o blur não vaze */
}

.country-slant-bg-flag {
  position: absolute;
  top: 0;
  left: -20%; /* Posição ajustada para amplitude */
  transform: skewX(20deg) scale(2.2); 
  width: 100%; 
  height: 100%;
  object-fit: cover;
  opacity: 0.4; /* Mais translúcido para não ofuscar a bandeira redonda */
  filter: brightness(0.85); 
  mask-image: linear-gradient(to right, black 65%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 75%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.stat-slant-cup.fed { width: 80px; background: rgba(0, 0, 0, 0.3); }

/* FEDERATION COLORS WITH GRADIENTS */
.fed-conmebol { 
  border-left-color: #2ecc40 !important; 
  background: linear-gradient(90deg, rgba(46, 204, 64, 0.2), transparent) !important;
}
.fed-uefa { 
  border-left-color: #0074d9 !important; 
  background: linear-gradient(90deg, rgba(0, 116, 217, 0.2), transparent) !important;
}
.fed-concacaf { 
  border-left-color: #ff6400 !important; 
  background: linear-gradient(90deg, rgba(255, 100, 0, 0.2), transparent) !important;
}
.fed-fifa { 
  border-left-color: #ffdc00 !important; 
  background: linear-gradient(90deg, rgba(255, 220, 0, 0.2), transparent) !important;
}
.fed-afc { 
  border-left-color: #ff00ff !important; 
  background: linear-gradient(90deg, rgba(255, 0, 255, 0.15), transparent) !important;
}
.fed-caf { 
  border-left-color: #00ffff !important; 
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.15), transparent) !important;
}

.stat-slant-cup.select-col { width: 170px; background: rgba(0, 0, 0, 0.4); }

/* SPECIAL ROW ACCENTS */
.linha-campeao {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent) !important;
  border-left: 3px solid #ffc107;
}
.bg-champion-cup {
  background: linear-gradient(135deg, #ffc107 0%, #b8860b 100%) !important;
  color: #000 !important;
}

.linha-vice {
  background: linear-gradient(90deg, rgba(200, 200, 200, 0.1), transparent) !important;
  border-left: 3px solid #6c757d;
}
.bg-vice-cup {
  background: linear-gradient(135deg, #a0a0a0 0%, #444 100%) !important;
  color: #fff !important;
}

/* CUSTOM SELECT INSIDE SLANT */
.cup-input-select {
  background: transparent !important;
  border: none !important;
  color: #000 !important;
  font-size: 0.65rem;
  padding: 0 4px !important; /* Padding reduzido para ganhar espaço lateral */
  height: 28px;
  width: 100% !important; /* Mudei para 100% para parar de cortar por largura fixa */
  cursor: pointer;
  appearance: none;
  text-align: center;
  font-weight: 900 !important;
}

/* Overlay de texto sobre o select */
.select-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 950;
  pointer-events: none;
  z-index: 1;
  text-transform: uppercase;
}

.select-text-overlay.pos-gold {
  color: #000 !important;
}

.select-text-overlay.pos-silver {
  color: #000 !important;
}

.cup-input-select:focus {
  outline: none;
  box-shadow: none;
}

.cup-input-select option {
  background: #111;
  color: white;
  font-weight: bold;
}

/* GARANTIR COR DO TEXTO EM TODAS AS SITUAÇÕES */
select.cup-input-select.pos-gold,
select.cup-input-select.pos-gold option:checked {
  color: #000 !important;
}

select.cup-input-select.pos-silver,
select.cup-input-select.pos-silver option:checked {
  color: #000 !important;
}

/* Mundial Bracket Styles */
.mundial-match-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  position: relative;
}

.highlight-gold {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
}

.game-score-input {
  width: 40px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffc107;
  font-weight: 900;
  padding: 4px;
}

.game-score-input-lg {
  width: 60px;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #ffc107;
  font-weight: 900;
  font-size: 1.25rem;
  padding: 8px;
}

.game-input-sm {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 4px 8px;
}

.final-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%);
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
/* FUNDOS E BORDAS POR POSIÇÃO */
.team-info-cup { border-left: 4px solid transparent; } /* Base para indicador de posição */
.team-info-cup.pos-gold { border-left-color: #ffd700 !important; }
.team-info-cup.pos-silver { border-left-color: #ffffff !important; }
.team-info-cup.pos-bronze { border-left-color: #cd7f32 !important; }
.team-info-cup.pos-green { border-left-color: #2ecc71 !important; }
.team-info-cup.pos-blue-lib { border-left-color: #00f2ff !important; }
.team-info-cup.pos-blue-sula { border-left-color: #0096ff !important; }
.team-info-cup.pos-red-group { border-left-color: #ff4444 !important; }
.team-info-cup.pos-red-pre { border-left-color: #ff7777 !important; }

.cup-row-v2 .select-col.pos-gold { background: rgba(255, 237, 75, 0.5) !important; border-left: 2px solid #ffd700; }
.cup-row-v2 .select-col.pos-silver { background: rgba(224, 224, 224, 0.4) !important; border-left: 2px solid #ffffff; }
.cup-row-v2 .select-col.pos-bronze { background: rgba(205, 127, 50, 0.4) !important; border-left: 2px solid #cd7f32; }
.cup-row-v2 .select-col.pos-green { background: rgba(40, 167, 69, 0.4) !important; border-left: 2px solid #2ecc71; }
.cup-row-v2 .select-col.pos-blue-lib { background: rgba(0, 123, 255, 0.4) !important; border-left: 2px solid #00f2ff; }
.cup-row-v2 .select-col.pos-blue-sula { background: rgba(0, 85, 255, 0.4) !important; border-left: 2px solid #0096ff; }
.cup-row-v2 .select-col.pos-red-group { background: rgba(220, 53, 69, 0.4) !important; border-left: 2px solid #ff4444; }
.cup-row-v2 .select-col.pos-red-pre { background: rgba(255, 77, 77, 0.4) !important; border-left: 2px solid #ff7777; }

/* RE-MAPEAMENTO DAS CLASSES ANTIGAS PARA COMPATIBILIDADE NO DETALHE */
.cup-row-v2.pos-cyan { background: rgba(0, 123, 255, 0.15) !important; }
.cup-row-v2.pos-blue-dark { background: rgba(0, 85, 255, 0.15) !important; }
.cup-row-v2.pos-red { background: rgba(220, 53, 69, 0.15) !important; }

/* BADGES DAS POSIÇÕES (VIBRANTES/SÓLIDAS) - HERDANDO DO PLACEMENTS.CSS */
select.form-select.cup-input-select.pos-gold { 
  background-color: var(--pos-gold) !important; 
  color: var(--pos-gold-text) !important; 
}
select.form-select.cup-input-select.pos-silver { 
  background-color: var(--pos-silver) !important; 
  color: var(--pos-silver-text) !important; 
}
select.form-select.cup-input-select.pos-bronze { 
  background-color: var(--pos-bronze) !important; 
  color: var(--pos-bronze-text) !important; 
}
select.form-select.cup-input-select.pos-green { 
  background-color: var(--pos-green) !important; 
  color: var(--pos-green-text) !important; 
}
select.form-select.cup-input-select.pos-blue-lib { 
  background-color: var(--pos-blue-lib) !important; 
  color: var(--pos-blue-lib-text) !important; 
}
select.form-select.cup-input-select.pos-blue-sula { 
  background-color: var(--pos-blue-sula) !important; 
  color: var(--pos-blue-sula-text) !important; 
}
select.form-select.cup-input-select.pos-red-group { 
  background-color: var(--pos-red-group) !important; 
  color: var(--pos-red-group-text) !important; 
}
select.form-select.cup-input-select.pos-red-pre { 
  background-color: var(--pos-red-pre) !important; 
  color: var(--pos-red-pre-text) !important; 
}


.lib-indicator-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  filter: drop-shadow(0 0 10px rgba(57, 255, 20, 0.8));
  transition: all 0.3s ease;
  cursor: help;
}

.lib-indicator-medium {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  filter: drop-shadow(0 0 8px rgba(57, 255, 20, 0.8));
  transition: all 0.3s ease;
  cursor: help;
}

.lib-indicator-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  filter: drop-shadow(0 0 5px rgba(57, 255, 20, 0.8));
  transition: all 0.3s ease;
  cursor: help;
}

.lib-indicator-large:hover, .lib-indicator-medium:hover, .lib-indicator-small:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 0 15px rgba(57, 255, 20, 1));
}

/* Modal Full Screen (Copiado de UniversoView) */
.form-full-screen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(25px);
  z-index: 5000;
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
  padding-right: 1rem;
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

/* PRINTS GALLERY DETAIL */
.prints-gallery-container {
  display: grid;
  gap: 15px;
  width: 100%;
}

.prints-count-1 { grid-template-columns: 1fr; }
.prints-count-2 { grid-template-columns: 1fr 1fr; }
.prints-count-3 { grid-template-columns: 1fr 1fr 1fr; }
.prints-count-4 { grid-template-columns: repeat(2, 1fr); }
.prints-count-5 { grid-template-columns: repeat(3, 1fr); }

.print-item-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  background: rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  aspect-ratio: 16/9;
}

.prints-count-1 .print-item-wrapper {
  aspect-ratio: 21/9;
  max-height: 400px;
}

.print-item-wrapper:hover {
  border-color: var(--game-info);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.print-img-detail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.print-zoom-hint {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.print-item-wrapper:hover .print-zoom-hint {
  opacity: 1;
}

.print-zoom-hint i {
  font-size: 2rem;
  color: white;
  text-shadow: 0 0 10px rgba(0,0,0,0.5);
}

@media (max-width: 992px) {
  .prints-count-3 { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .prints-count-2, .prints-count-3 { grid-template-columns: 1fr; }
}
.expert-sort-select {
  background-color: rgba(25, 135, 84, 0.2);
  border: 1px solid rgba(25, 135, 84, 0.4);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  width: auto;
  min-width: 130px;
  border-radius: 6px;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.expert-sort-select:focus {
  background-color: rgba(25, 135, 84, 0.4);
  border-color: #198754;
  box-shadow: 0 0 10px rgba(25, 135, 84, 0.3);
  color: #fff;
}

.expert-sort-select option {
  background-color: #1a1a1a;
  color: #fff;
  font-weight: 700;
}
.copa-phases-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.copa-phase-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px 8px;
  border-radius: 8px;
  border-left: 3px solid rgba(255, 255, 255, 0.1);
}

.copa-phase-badge {
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  min-width: 80px;
  text-align: center;
}

.copa-team-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 24px;
}

.copa-team-chip .x-small {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.pos-gold { background: linear-gradient(to right, #ffc107, #ff9800); color: #000; border-left-color: #ffc107; }
.pos-silver { background: linear-gradient(to right, #e0e0e0, #bdbdbd); color: #000; border-left-color: #e0e0e0; }
.pos-bronze { background: linear-gradient(to right, #cd7f32, #a0522d); color: #fff; border-left-color: #cd7f32; }

@media (max-width: 768px) {
  .prints-count-2, .prints-count-3 { grid-template-columns: 1fr; }
  .copa-phase-row { flex-direction: column; align-items: flex-start; }
}
</style>
