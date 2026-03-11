<template>
  <div class="game-panel" :class="customClass">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  customClass: String
})
</script>

<style scoped>
.game-panel {
  background: rgba(0, 31, 63, 0.7);
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  color: white;
}
</style>
