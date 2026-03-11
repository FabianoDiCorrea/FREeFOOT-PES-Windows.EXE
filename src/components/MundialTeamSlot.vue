<template>
  <div class="team-slot" :class="{ 'is-large': large, 'is-compact': compact, 'active-pos': position }">
    <!-- ESCUDO -->
    <div class="shield-container">
      <TeamShield :teamName="team" :size="large ? 42 : (compact ? 24 : 32)" />
    </div>

    <!-- INFO TIME -->
    <div class="team-info flex-grow-1">
      <div v-if="isEditable" class="edit-mode">
        <input type="text" :value="team" @input="handleTeamInput" @focus="showResults = true" class="form-control team-input" placeholder="Buscar time...">
        
        <!-- Sugestões -->
        <div v-if="showResults && filteredTeams.length > 0" class="suggestions-box shadow-lg">
          <div v-for="t in filteredTeams" :key="t.nome" @click="selectTeam(t.nome)" class="suggestion-item">
            <TeamShield :teamName="t.nome" :size="20" />
            <span class="x-small fw-bold">{{ t.nome }}</span>
          </div>
        </div>
      </div>
      <div v-else class="view-mode">
        <div class="team-name" :class="{ 'large-text': large }">{{ team || '---' }}</div>
        <div v-if="clubInfo" class="club-meta">
           <div class="meta-item">
             <i class="bi bi-geo-alt-fill mini-icon"></i>
             <NationalFlag :countryName="clubInfo.pais" :size="12" />
             <span>{{ clubInfo.pais }}</span>
           </div>
           <div class="meta-item" v-if="clubInfo.federacao">
             <i class="bi bi-globe mini-icon"></i>
             <span class="fed-tag">{{ clubInfo.federacao }}</span>
           </div>
        </div>
      </div>
    </div>

    <!-- PLACAR -->
    <div class="score-container" :class="{ 'is-editable': isEditable }">
      <template v-if="isEditable">
         <input type="number" :value="placar" @input="$emit('update:placar', parseInt($event.target.value))" class="score-input">
         <div v-if="penRequired" class="pen-input-group mt-1">
            <span class="x-mini">P</span>
            <input type="number" :value="pen" @input="$emit('update:pen', parseInt($event.target.value))" class="pen-input">
         </div>
      </template>
      <template v-else>
         <div class="score-val" :class="{ 'large-score': large }">{{ placar ?? '-' }}</div>
         <div v-if="pen > 0 || (placar === otherScore && placar !== null && pen !== undefined)" class="pen-val">
            <span class="pen-label">P</span> {{ pen }}
         </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TeamShield from './TeamShield.vue'
import NationalFlag from './NationalFlag.vue'
import { CLUBS_DATA } from '../data/clubs.data'
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data'

const props = defineProps({
  team: String,
  placar: [Number, String],
  pen: [Number, String],
  otherScore: [Number, String], // Para saber se precisa de pênaltis
  isEditable: Boolean,
  large: Boolean,
  compact: Boolean,
  position: String
})

const emit = defineEmits(['update:team', 'update:placar', 'update:pen'])

const showResults = ref(false)
const searchQuery = ref('')

const clubInfo = computed(() => {
  if (!props.team) return null;
  const n = normalize(props.team);
  return CLUBS_DATA.find(c => normalize(c.nome) === n) || 
         NATIONAL_TEAMS_DATA.find(nt => normalize(nt.nome) === n);
})

const filteredTeams = computed(() => {
  const q = normalize(searchQuery.value);
  if (!q) return [];
  return [...CLUBS_DATA, ...NATIONAL_TEAMS_DATA]
    .filter(t => normalize(t.nome).includes(q))
    .slice(0, 5);
})

const penRequired = computed(() => {
    return props.placar !== null && props.placar !== '' && props.placar === props.otherScore;
})

function normalize(s) {
  if (!s) return '';
  return s.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function handleTeamInput(e) {
    searchQuery.value = e.target.value;
    emit('update:team', e.target.value);
}

function selectTeam(name) {
    emit('update:team', name);
    showResults.value = false;
    searchQuery.value = '';
}
</script>

<style scoped>
.team-slot {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 12px;
  min-height: 60px;
  transition: background 0.2s;
}

.team-slot.is-large {
    padding: 15px 20px;
    background: rgba(255, 255, 255, 0.02);
}

.team-slot.is-compact {
    padding: 4px 8px;
    gap: 8px;
    min-height: 36px;
}

.shield-container {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.team-info {
  min-width: 0;
  position: relative;
}

.team-name {
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #eee;
}

.team-name.large-text {
    font-size: 1rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: 1px;
}

.club-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
  opacity: 0.5;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
}

.mini-icon {
    font-size: 0.5rem;
    opacity: 0.5;
}

.fed-tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 0 4px;
    border-radius: 2px;
}

/* PLACAR */
.score-container {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.score-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 1.1rem;
  color: var(--bs-warning);
}

.score-val.large-score {
    font-size: 1.8rem;
    text-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
}

.pen-val {
  font-size: 0.65rem;
  font-weight: 900;
  background: var(--bs-warning);
  color: #000;
  padding: 0 6px;
  border-radius: 10px;
  line-height: 1.2;
}

.pen-label {
    font-size: 0.5rem;
    opacity: 0.7;
}

/* EDIT MODE */
.team-input {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    font-size: 0.7rem;
    padding: 4px 8px;
    height: 28px;
}

.score-input {
    width: 40px;
    height: 32px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: var(--bs-warning);
    text-align: center;
    font-weight: 900;
    border-radius: 6px;
}

.pen-input-group {
    display: flex;
    align-items: center;
    gap: 2px;
}

.pen-input {
    width: 30px;
    height: 20px;
    background: var(--bs-warning);
    color: #000;
    border: none;
    text-align: center;
    font-weight: 900;
    font-size: 0.7rem;
    border-radius: 4px;
}

.x-mini { font-size: 0.5rem; font-weight: 900; }

.suggestions-box {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #1a2a3a;
    border: 1px solid rgba(255,255,255,0.1);
    z-index: 100;
    border-radius: 4px;
    max-height: 150px;
    overflow-y: auto;
}

.suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    cursor: pointer;
    transition: background 0.2s;
}

.suggestion-item:hover {
    background: rgba(255,255,255,0.05);
}

.suggestion-item .x-small { font-size: 0.7rem; }
</style>
