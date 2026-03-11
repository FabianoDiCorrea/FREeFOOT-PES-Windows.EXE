<template>
  <div class="mundial-bracket-container" :class="{ 'is-editable': isEditable }">
    <div class="bracket-wrapper">
      <!-- SEMIFINAIS -->
      <div class="bracket-column">
        <div class="bracket-node">
          <div class="node-header">SEMIFINAL 1</div>
          <div class="node-match" :class="{ 'editable-match': isEditable }">
            <TeamSlot :team="mundial.semi1.time1" :placar="mundial.semi1.placar1" :pen="mundial.semi1.pen1" :is-editable="isEditable" @update:team="val => $emit('updateMatch', 'semi1', 'time1', val)" @update:placar="val => $emit('updateMatch', 'semi1', 'placar1', val)" @update:pen="val => $emit('updateMatch', 'semi1', 'pen1', val)" position="top" />
            <div class="match-divider">X</div>
            <TeamSlot :team="mundial.semi1.time2" :placar="mundial.semi1.placar2" :pen="mundial.semi1.pen2" :is-editable="isEditable" @update:team="val => $emit('updateMatch', 'semi1', 'time2', val)" @update:placar="val => $emit('updateMatch', 'semi1', 'placar2', val)" @update:pen="val => $emit('updateMatch', 'semi1', 'pen2', val)" position="bottom" />
          </div>
        </div>

        <div class="bracket-node">
          <div class="node-header">SEMIFINAL 2</div>
          <div class="node-match" :class="{ 'editable-match': isEditable }">
            <TeamSlot :team="mundial.semi2.time1" :placar="mundial.semi2.placar1" :pen="mundial.semi2.pen1" :is-editable="isEditable" @update:team="val => $emit('updateMatch', 'semi2', 'time1', val)" @update:placar="val => $emit('updateMatch', 'semi2', 'placar1', val)" @update:pen="val => $emit('updateMatch', 'semi2', 'pen1', val)" position="top" />
            <div class="match-divider">X</div>
            <TeamSlot :team="mundial.semi2.time2" :placar="mundial.semi2.placar2" :pen="mundial.semi2.pen2" :is-editable="isEditable" @update:team="val => $emit('updateMatch', 'semi2', 'time2', val)" @update:placar="val => $emit('updateMatch', 'semi2', 'placar2', val)" @update:pen="val => $emit('updateMatch', 'semi2', 'pen2', val)" position="bottom" />
          </div>
        </div>
      </div>

      <!-- CONECTORES (LINHAS) -->
      <div class="bracket-connectors">
        <div class="connector-group">
            <div class="line-horizontal"></div>
            <div class="line-vertical"></div>
        </div>
        <div class="connector-group">
            <div class="line-horizontal"></div>
            <div class="line-vertical"></div>
        </div>
        <div class="line-final-horizontal"></div>
      </div>

      <!-- FINAL -->
      <div class="bracket-column centered">
        <div class="bracket-node final-node">
          <div class="node-header final"><i class="bi bi-trophy-fill me-2"></i>GRANDE FINAL</div>
          <div class="node-match large" :class="{ 'editable-match': isEditable }">
             <TeamSlot :team="mundial.final.time1" :placar="mundial.final.placar1" :pen="mundial.final.pen1" :is-editable="isEditable" :large="true" @update:team="val => $emit('updateMatch', 'final', 'time1', val)" @update:placar="val => $emit('updateMatch', 'final', 'placar1', val)" @update:pen="val => $emit('updateMatch', 'final', 'pen1', val)" position="top" />
             <div class="match-divider-large">VS</div>
             <TeamSlot :team="mundial.final.time2" :placar="mundial.final.placar2" :pen="mundial.final.pen2" :is-editable="isEditable" :large="true" @update:team="val => $emit('updateMatch', 'final', 'time2', val)" @update:placar="val => $emit('updateMatch', 'final', 'placar2', val)" @update:pen="val => $emit('updateMatch', 'final', 'pen2', val)" position="bottom" />
          </div>
        </div>

        <!-- 3º LUGAR -->
        <div class="bracket-node third-node mt-4">
          <div class="node-header small">DISPUTA 3º LUGAR</div>
          <div class="node-match small-match" :class="{ 'editable-match': isEditable }">
             <TeamSlot :team="mundial.terceiro.time1" :placar="mundial.terceiro.placar1" :pen="mundial.terceiro.pen1" :is-editable="isEditable" :compact="true" @update:team="val => $emit('updateMatch', 'terceiro', 'time1', val)" @update:placar="val => $emit('updateMatch', 'terceiro', 'placar1', val)" @update:pen="val => $emit('updateMatch', 'terceiro', 'pen1', val)" position="left" />
             <div class="match-divider-small">-</div>
             <TeamSlot :team="mundial.terceiro.time2" :placar="mundial.terceiro.placar2" :pen="mundial.terceiro.pen2" :is-editable="isEditable" :compact="true" @update:team="val => $emit('updateMatch', 'terceiro', 'time2', val)" @update:placar="val => $emit('updateMatch', 'terceiro', 'placar2', val)" @update:pen="val => $emit('updateMatch', 'terceiro', 'pen2', val)" position="right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TeamSlot from './MundialTeamSlot.vue'

const props = defineProps({
  mundial: {
    type: Object,
    required: true
  },
  isEditable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['updateMatch'])
</script>

<style scoped>
.mundial-bracket-container {
  width: 100%;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
  min-height: 400px;
}

.bracket-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  position: relative;
}

.bracket-column {
  display: flex;
  flex-direction: column;
  height: 450px;
  width: 320px;
  z-index: 2;
}

.bracket-column.centered {
    justify-content: center;
    width: 400px;
}

.bracket-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
}

.node-header {
  font-size: 0.65rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding-left: 10px;
}

.node-header.final {
    color: var(--bs-warning);
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 15px;
    text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
}

.node-header.small {
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
}

.node-match {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-height: 121px; /* 2x60 + 1 */
}

.node-match.large {
    background: linear-gradient(145deg, rgba(255, 193, 7, 0.05) 0%, rgba(0,0,0,0.2) 100%);
    border-color: rgba(255, 193, 7, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 193, 7, 0.1);
}

.node-match.small-match {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    padding: 5px;
}

.match-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.1);
  position: relative;
}

.match-divider-large {
    text-align: center;
    font-weight: 900;
    color: rgba(255, 193, 7, 0.2);
    font-size: 0.8rem;
    padding: 5px 0;
    background: rgba(0,0,0,0.1);
}

.match-divider-small {
    padding: 0 10px;
    opacity: 0.2;
}

/* CONNECTORS */
.bracket-connectors {
    width: 60px;
    height: 450px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.connector-group {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.line-horizontal {
    width: 30px;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
}

.line-vertical {
    width: 2px;
    height: 225px; /* Distância entre os centros (450/2) */
    background: rgba(255, 255, 255, 0.1);
    position: absolute;
    left: 30px;
}

.connector-group:first-child .line-vertical {
    top: 50%;
    border-radius: 2px 2px 0 0;
}

.connector-group:last-child .line-vertical {
    bottom: 50%;
    border-radius: 0 0 2px 2px;
}

.line-final-horizontal {
    position: absolute;
    right: 0;
    top: 50%;
    width: 30px;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-50%);
}

@media (max-width: 992px) {
    .bracket-wrapper {
        flex-direction: column;
        gap: 30px;
    }
    .bracket-connectors {
        display: none;
    }
    .bracket-column {
        width: 100%;
        min-height: auto;
    }
}
</style>
