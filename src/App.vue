<template>
  <div class="app-layout">
    <!-- Topo Fixo -->
    <header class="top-bar ps-2 pe-4">
      <div class="d-flex align-items-center gap-4 flex-grow-1">
        <LogoFREeFOOT size="1.8rem" />
        
        <nav class="top-nav d-flex align-items-center h-100">
          <router-link to="/" class="nav-item" active-class="active">HOME</router-link>
          <router-link to="/universo?reset=true" class="nav-item" active-class="active">UNIVERSO DO FUTEBOL</router-link>
          <router-link to="/carreira" class="nav-item" active-class="active">MINHA CARREIRA</router-link>
          <router-link to="/premio-individual" class="nav-item" active-class="active">PRÊMIO INDIVIDUAL</router-link>
          <router-link to="/rankings" class="nav-item" active-class="active">RANKINGS</router-link>
          <router-link to="/backup" class="nav-item" active-class="active">BACKUP</router-link>
        </nav>
      </div>

      <div class="system-status d-flex align-items-center">
        <span class="badge bg-secondary opacity-55 x-small">V.0.0.5</span>
        <span class="ms-3 pt-time fw-bold text-secondary">{{ currentTime }}</span>
      </div>
    </header>

    <main class="main-content">
      <!-- keep-alive preserva o UniversoView em memória para evitar remontagem e piscada ao voltar -->
      <router-view v-slot="{ Component }">
        <keep-alive include="UniversoView">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LogoFREeFOOT from './components/LogoFREeFOOT.vue'
import { clubStore } from './services/club.store'

const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-BR')
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 1000)
  
  // Inicializa o store de clubes (carrega customizações locais)
  await clubStore.init()
})
</script>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';
@import './assets/game-theme.css';

:root {
  --top-bar-height: 70px;
  --side-menu-width: 280px;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg);
  color: white;
  overflow: hidden;
}

header.top-bar {
  height: var(--top-bar-height);
  background: linear-gradient(180deg, #001f3f 0%, #000c18 100%);
  border-bottom: 2px solid var(--color-secondary);
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

.top-nav {
  margin-left: 20px;
}

.nav-item {
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  color: #a0aec0;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  text-transform: uppercase;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  color: var(--color-secondary);
  border-bottom-color: var(--color-secondary);
  background: linear-gradient(0deg, rgba(255, 133, 27, 0.1) 0%, transparent 100%);
}

.main-content {
  margin-top: var(--top-bar-height);
  height: calc(100vh - var(--top-bar-height));
  width: 100%;
  padding: 20px;
  overflow-y: auto;
  background: radial-gradient(circle at center, #001a33 0%, #000c18 100%);
  display: flex;
  flex-direction: column;
}

.x-small { font-size: 0.6rem; }

/* Transições */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Scrollbar Style */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #000c18;
}
::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}
</style>
