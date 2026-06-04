<template>
  <div class="calendario-container p-4 min-vh-100 bg-dark text-white">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
       <div class="d-flex align-items-center gap-3">
           <button @click="goBack" class="btn btn-outline-light btn-sm">
              <i class="bi bi-arrow-left"></i> VOLTAR
           </button>
          <h2 class="m-0 fw-black text-uppercase ls-1">CALENDÁRIO DA TEMPORADA</h2>
       </div>
    </div>

    <!-- INFORMAÇÕES DE LIGAS E TEMPORADAS -->
    <div class="row g-4 mb-5">
      <div class="col-md-6">
        <div class="card bg-dark border border-secondary border-opacity-25 h-100 season-card">
          <div class="card-body">
            <h5 class="card-title text-warning fw-bold text-uppercase mb-3"><i class="bi bi-globe-americas me-2"></i>América do Sul (e França)</h5>
            <p class="text-light opacity-75 mb-1"><i class="bi bi-calendar-event me-2"></i><strong>Formato:</strong> Julho a Junho do ano seguinte</p>
            <p class="text-light opacity-75 mb-1"><i class="bi bi-info-circle me-2"></i><strong>Exemplo:</strong> Inicia em Julho/2026, termina em Junho/2027 (Temporada 2026/2027 = 2027)</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card bg-dark border border-secondary border-opacity-25 h-100 season-card">
          <div class="card-body">
            <h5 class="card-title text-info fw-bold text-uppercase mb-3"><i class="bi bi-globe-europe-africa me-2"></i>Europa e América do Norte</h5>
            <p class="text-light opacity-75 mb-1"><i class="bi bi-calendar-event me-2"></i><strong>Formato:</strong> Janeiro a Dezembro</p>
            <p class="text-light opacity-75 mb-1"><i class="bi bi-info-circle me-2"></i><strong>Exemplo:</strong> Inicia em Jan/2027, termina em Dez/2027. (Metade da temporada Sul-Americana)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TIMELINE DOS MESES -->
    <div class="timeline-container">
      
      <!-- JANEIRO -->
      <div class="timeline-item">
        <div class="timeline-month bg-primary">JAN</div>
        <div class="timeline-content card bg-dark border border-primary border-opacity-25">
          <div class="card-body py-3">
            <ul class="list-unstyled m-0 text-light opacity-75">
              <li class="mb-1"><i class="bi bi-play-circle text-success me-2"></i> Início da Temporada: Ligas da Europa e América do Norte (Exceto França)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- JUNHO -->
      <div class="timeline-item">
        <div class="timeline-month bg-secondary">JUN</div>
        <div class="timeline-content card bg-dark border border-secondary border-opacity-25">
          <div class="card-body py-3">
            <ul class="list-unstyled m-0 text-light opacity-75">
              <li class="mb-1"><i class="bi bi-stop-circle text-danger me-2"></i> Fim da Temporada: Ligas da América do Sul e França</li>
              <li class="mb-1"><i class="bi bi-list-ol text-warning me-2"></i> Atualização do Rank de Clubes</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- JULHO -->
      <div class="timeline-item">
        <div class="timeline-month bg-warning text-dark">JUL</div>
        <div class="timeline-content card bg-dark border border-warning border-opacity-25">
          <div class="card-body py-3">
            <ul class="list-unstyled m-0 text-light opacity-75">
              <li class="mb-2"><i class="bi bi-play-circle text-success me-2"></i> Início da Temporada: Ligas da América do Sul e França</li>
              <li class="mb-2"><i class="bi bi-calendar-check text-warning me-2"></i> <strong>26 de Julho:</strong> Atualização do Rank de Seleções</li>
              <li class="mb-2 border-top border-secondary border-opacity-25 pt-2">
                <i class="bi bi-trophy text-info me-2"></i> <strong>Copas Continentais de Seleções</strong> (A cada 2 anos, ex: Julho de 2028)
              </li>
              <li class="mb-2"><i class="bi bi-globe me-2 text-primary"></i> <strong>Copa do Mundo</strong> (A cada 4 anos, ex: Julho de 2030)</li>
              <li class="mb-0"><i class="bi bi-flag text-danger me-2"></i> <strong>23 de Julho:</strong> Fim das Eliminatórias (Ex: 2029)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- AGOSTO -->
      <div class="timeline-item">
        <div class="timeline-month bg-success">AGO</div>
        <div class="timeline-content card bg-dark border border-success border-opacity-25">
          <div class="card-body py-3">
            <ul class="list-unstyled m-0 text-light opacity-75">
              <li class="mb-1"><i class="bi bi-award text-warning me-2"></i> <strong>27 de Agosto:</strong> Prêmio de Melhor da Conmebol</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- DEZEMBRO -->
      <div class="timeline-item">
        <div class="timeline-month bg-danger">DEZ</div>
        <div class="timeline-content card bg-dark border border-danger border-opacity-25">
          <div class="card-body py-3">
            <ul class="list-unstyled m-0 text-light opacity-75">
              <li class="mb-2"><i class="bi bi-stop-circle text-danger me-2"></i> Fim da Temporada: Ligas da Europa e América do Norte (Exceto França)</li>
              <li class="mb-2"><i class="bi bi-award text-warning me-2"></i> <strong>02 de Dezembro:</strong> Prêmio de Melhor do Mundo & Melhor Técnico do Mundo</li>
              <li class="mb-2"><i class="bi bi-award text-info me-2"></i> <strong>29 de Dezembro:</strong> Prêmio de Melhor da Concacaf</li>
              <li class="mb-0"><i class="bi bi-award text-primary me-2"></i> <strong>30 de Dezembro:</strong> Prêmio de Melhor da Europa</li>
            </ul>
          </div>
        </div>
      </div>

    </div>

    <!-- COMPETIÇÕES PENDENTES -->
    <div class="card bg-dark border border-secondary border-opacity-50 mt-5 pending-card">
      <div class="card-header bg-black bg-opacity-25 border-bottom border-secondary border-opacity-25">
        <h5 class="mb-0 text-muted fw-bold"><i class="bi bi-hourglass-split me-2"></i>Competições a Definir (Para Anotar Depois)</h5>
      </div>
      <div class="card-body">
        <div class="d-flex flex-wrap gap-2">
          <span class="badge bg-secondary border border-light border-opacity-25 p-2">Libertadores</span>
          <span class="badge bg-secondary border border-light border-opacity-25 p-2">Sul-Americana</span>
          <span class="badge bg-secondary border border-light border-opacity-25 p-2">Champions League</span>
          <span class="badge bg-secondary border border-light border-opacity-25 p-2">Concacaf Champions</span>
          <span class="badge bg-secondary border border-light border-opacity-25 p-2">Mundial de Clubes</span>
          <span class="badge bg-secondary border border-light border-opacity-25 p-2">Recopa Sul-Americana</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    router.back()
}
</script>

<style scoped>
.calendario-container {
    background: #000;
}

.season-card {
  transition: transform 0.3s ease;
}
.season-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
}

.timeline-container {
  position: relative;
  padding-left: 50px;
  margin-top: 2rem;
}
.timeline-container::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-month {
  position: absolute;
  left: -50px;
  top: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.8rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.8);
  border: 2px solid #1a1a1a;
  z-index: 2;
}

.timeline-content {
  margin-left: 20px;
  transition: all 0.3s ease;
}

.timeline-item:hover .timeline-content {
  transform: translateX(10px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  background: rgba(255,255,255,0.05) !important;
}

.timeline-content li {
  font-size: 0.95rem;
}

.pending-card {
  border-style: dashed !important;
}
</style>
