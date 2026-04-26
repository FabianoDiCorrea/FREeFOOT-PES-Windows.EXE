<template>
  <div class="season-count-icon" :title="count + ' Temporada(s)'">
    <i class="bi bi-calendar4-week fw-bold cal-icon"></i>
    <div class="shield-badge">
      <i class="bi bi-shield-fill shield-i"></i>
      <span class="shield-number" :class="{ 'small-text': count > 9 }">{{ count > 99 ? '99+' : count }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true,
    default: 0
  }
})
</script>

<style scoped>
.season-count-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: #1a1a24;
  border-radius: 50%;
  border: 1px solid rgba(0, 229, 255, 0.5);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.season-count-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3);
}

.cal-icon {
  font-size: 1.5rem;
  color: #00E5FF;
  margin-top: -4px;
  margin-left: -4px;
}

.shield-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shield-i {
  font-size: 1.6rem;
  color: #00E5FF;
  line-height: 1;
  text-shadow: -2px -2px 0 #1a1a24, 2px -2px 0 #1a1a24, -2px 2px 0 #1a1a24, 2px 2px 0 #1a1a24;
}

.shield-number {
  position: absolute;
  color: #1a1a24;
  font-weight: 900;
  font-family: 'Arial Black', sans-serif;
  font-size: 0.75rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: -1px;
}

.shield-number.small-text {
  font-size: 0.65rem;
  letter-spacing: -0.5px;
}
</style>
