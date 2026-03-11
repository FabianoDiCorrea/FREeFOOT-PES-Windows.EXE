<template>
  <div class="gauge-wrapper" :class="{ 'is-excellent': value >= 90 }">
    <div class="gauge-container">
      <div class="gauge-body">
        <!-- Scale Background (Fixed 5 Colors) -->
        <div class="gauge-scale-background"></div>
        
        <!-- Mask to create arc -->
        <div class="gauge-mask"></div>

        <!-- Value Display -->
        <div class="gauge-cover">
          <div class="gauge-value" :style="{ color: valueColor }">{{ value }}%</div>
          <div class="gauge-label text-uppercase">{{ label }}</div>
        </div>

        <!-- Needle -->
        <div class="gauge-needle" :style="needleStyles"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: 'Performance'
  }
})

// Cores 5 níveis (Novo Esquema Elite Blue)
const colors = {
    ruim: '#dc3545',      // Vermelho (0-30%)
    regular: '#fd7e14',   // Laranja (30-55%)
    bom: '#ffc107',       // Amarelo (55-75%)
    otimo: '#28a745',     // Verde (75-90%)
    excelente: '#00bfff'  // Azul Elite (90-100%)
}

const valueColor = computed(() => {
    if (props.value >= 90) return colors.excelente
    if (props.value >= 75) return colors.otimo
    if (props.value >= 55) return colors.bom
    if (props.value >= 30) return colors.regular
    return colors.ruim
})

const needleStyles = computed(() => {
  // 0% = -90deg, 100% = 90deg
  const rotation = -90 + (Math.min(props.value, 100) / 100) * 180
  return {
    '--target-rotation': `${rotation}deg`,
    transform: `rotate(${rotation}deg)`
  }
})
</script>

<style scoped>
.gauge-wrapper {
  position: relative;
  width: 200px;
  height: 110px;
  margin: 0 auto;
  cursor: pointer;
}

.gauge-wrapper:hover .gauge-needle {
    animation: needle-sweep 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.gauge-wrapper:hover .gauge-value {
    animation: value-pulse 0.5s ease;
}

@keyframes needle-sweep {
    0% { transform: rotate(-90deg); }
    70% { transform: rotate(calc(var(--target-rotation) + 10deg)); }
    100% { transform: rotate(var(--target-rotation)); }
}

@keyframes value-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.gauge-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gauge-body {
  position: relative;
  width: 200px;
  height: 100px;
  border-radius: 100px 100px 0 0;
  overflow: hidden;
}

/* 
  Conic Gradient Elite Blue System:
  Vermelho (0-30%): 54deg
  Laranja (30-55%): +45deg = 99deg
  Amarelo (55-75%): +36deg = 135deg
  Verde (75-90%): +27deg = 162deg
  Azul (90-100%): +18deg = 180deg
*/
.gauge-scale-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200%;
    border-radius: 50%;
    background: conic-gradient(
        from 270deg,
        #dc3545 0deg,
        #dc3545 54deg,    /* 30% */
        #fd7e14 54deg,
        #fd7e14 99deg,    /* 55% */
        #ffc107 99deg,
        #ffc107 135deg,   /* 75% */
        #28a745 135deg,
        #28a745 162deg,   /* 90% */
        #00bfff 162deg,
        #00bfff 180deg    /* 100% */
    );
}

.gauge-mask {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 160px;
    height: 160px; /* Mascarar o centro */
    background: #181818; /* Cor do fundo do card */
    border-radius: 50%;
    z-index: 1;
}

.gauge-cover {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 5px;
}

.gauge-value {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 2rem;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.gauge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  margin-top: 5px;
}

.gauge-needle {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 4px;
  height: 95px; /* Quase o topo */
  background: #fff;
  transform-origin: bottom center;
  transition: transform 1.0s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 5;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

.gauge-needle::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: -6px;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

/* Efeito Neon Azul Elite para Excelente */
.is-excellent .gauge-body {
    box-shadow: inset 0 0 20px rgba(0, 191, 255, 0.3);
    border-top: 2px solid rgba(0, 191, 255, 0.8);
}

.is-excellent .gauge-value {
    text-shadow: 0 0 15px rgba(0, 191, 255, 0.6);
    color: #00bfff !important; /* Azul Elite */
}

.is-excellent .gauge-needle {
    background: #00bfff;
    box-shadow: 0 0 10px rgba(0, 191, 255, 0.8);
}

.is-excellent .gauge-needle::after {
    background: #00bfff;
}
</style>
