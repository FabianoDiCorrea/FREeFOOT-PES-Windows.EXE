<template>
  <span class="logo-container" :style="{ fontSize: size }">
    <span class="fre">FRE</span>
    <div class="e-circle">
      <span class="e-letter">e</span>
    </div>
    <span class="foot">FOOT</span>
  </span>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'inherit'
  }
})
</script>

<style scoped>
.logo-container {
  display: inline-flex;
  align-items: baseline;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-weight: 900;
  user-select: none;
  line-height: 1;
  vertical-align: baseline;
}

.fre {
  color: #0074d9;
}

.foot {
  color: #ff851b;
}

.e-circle {
  border: 2.5px solid #0074d9;
  background-color: transparent;
  width: 0.72em; 
  height: 0.72em;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 1px;
  position: relative;
  /* Mantendo o ajuste fino feito pelo usuário */
  top: -0.09em; 
}

.e-letter {
  color: #ff851b;
  font-size: 0.68em; /* Mantendo a proporção definida pelo usuário */
  font-weight: 900;
  line-height: 1;
  display: inline-block;
  transform: translateY(-9%);
}
</style>
