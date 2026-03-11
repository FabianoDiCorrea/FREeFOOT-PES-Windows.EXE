
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GamePanel from '../components/GamePanel.vue'
import GameButton from '../components/GameButton.vue'
import LogoFREeFOOT from '../components/LogoFREeFOOT.vue'
import TeamShield from '../components/TeamShield.vue'
import NationalFlag from '../components/NationalFlag.vue'
import { ALL_COMPETITIONS_DATA } from '../services/competitions.data'
import { INTERNATIONAL_DATA } from '../data/internationalCompetitions'
import { FEDERATIONS_DATA } from '../services/federations.data'
import { seasonStore } from '../services/season.store'
import { getSeasonFinalYear } from '../services/utils'
import { CLUBS_DATA } from '../data/clubs.data'
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data'
import { db } from '../services/db'
import { imageCacheService } from '../services/imageCache.service'
import { careerStore } from '../services/career.store'

const selectedContinent = ref(null)
const selectedCountry = ref(null)
const selectedCompetition = ref(null)
const showNewSeasonForm = ref(false)

const route = useRoute()
const router = useRouter()

// Watch para reset de navega??o via Menu
watch(() => route.query.reset, (newVal) => {
  if (newVal === 'true') {
    resetNavigation()
    router.replace({ query: {} })
  } 
})

const isEditing = ref(false)
const currentEditId = ref(null)

const viewMode = ref('list') // 'list' ou 'form'
const teamSearchQuery = ref({ campeao: '', vice: '', clubeArtilheiro: '', participantes: '', participantesTexto: '' })
const showTeamResults = ref({ campeao: false, vice: false, clubeArtilheiro: false, participantes: false })

const newSeason = ref({
  id: null,
  ano: '',
  campeao: '',
  vice: '',
  competitionName: '',
  topScorers: [],
  participantes: [],
  tabela: '',
  promovidosPlayoff: []
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
  return CLUBS_DATA.filter(c => c.nome.toLowerCase().includes(q)).slice(0, 10);
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
  }
}

const addParticipant = (teamName) => {
  if (!teamName) return;
  const q = teamName.toLowerCase().trim();
  const alreadyAdded = newSeason.value.participantes.some(p => p.nome.toLowerCase().trim() === q);
  if (alreadyAdded) return;

  const club = CLUBS_DATA.find(c => c.nome.toLowerCase().trim() === q);
  
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

const isArgentinaB = computed(() => {
  const name = selectedCompetition.value?.nome;
  return (name === 'Primera Nacional' || name === 'Liga Argentina S?rie B'); 
})

const playoffCandidates = computed(() => {
  if (!newSeason.value.tabela) return []
  const lines = newSeason.value.tabela.split('\n').filter(l => l.trim())
  const teams = []
  
  lines.forEach((line, idx) => {
    // Pegar do 3? ao 6? (idx 2 a 5)
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

  // 1. Identificar Competi??o
  const allComps = [
    ...ALL_COMPETITIONS_DATA.flatMap(continent => [
      ...continent.paises.flatMap(p => p.competicoes),
      ...continent.continentais
    ]),
    ...INTERNATIONAL_DATA
  ]
  
  let comp = allComps.find(c => c.nome.toLowerCase().trim() === season.competitionName.toLowerCase().trim())

  // Fallback para nomes antigos/alternativos
  if (!comp) {
    if (season.competitionName === 'Liga Argentina S?rie B') {
       comp = allComps.find(c => c.nome === 'Primera Nacional') || { nome: 'Primera Nacional', rebaixados: 0 }
    } else if (season.competitionName === 'Liga Argentina') {
       comp = allComps.find(c => c.nome === 'Liga Profissional') || { nome: 'Liga Profissional', rebaixados: 4 } // Fallback direto para 4
    }
  }

  // 2. Definir Quantidade de Rebaixados
  let count = comp?.rebaixados || 0
  const name = comp ? comp.nome : season.competitionName
  if (name === 'Liga Profissional' || name === 'Primera Divisi?n' || name === 'Liga Argentina') count = 4

  if (count === 0) return []

  // 3. Parsear Tabela e Pegar os ?ltimos
  const lines = season.tabela.split('\n').filter(l => l.trim())
  const teams = []
  
  // Extrair nomes dos times
  lines.forEach(line => {
      let cells = line.split('\t')
      if (cells.length === 1) cells = line.split(/\s{2,}/)
      if (cells.length === 1) {
         const match = line.match(/^([^\d]+)(.*)$/)
         if (match) cells = [match[1].trim()]
      }
      if (cells[0]) teams.push(cells[0].trim())
  })

  // Retornar os ?ltimos 'count'
  if (teams.length >= count) {
    return teams.slice(-count)
  }
  return []
}

const getFederation = (continentName) => {
  if (!continentName) return { nome: 'Federa??o', logo: '' };
  
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const normalizedKey = normalize(continentName);
  
  // Buscar a chave que mais se aproxima
  const key = Object.keys(FEDERATIONS_DATA).find(k => normalize(k) === normalizedKey);
  
  return FEDERATIONS_DATA[key] || { nome: 'Federa??o', logo: '' };
}

const getFederationLogo = (continente) => {
  if (!continente) return '';
  const fedMap = {
    'CONMEBOL': 'Am?rica do Sul',
    'UEFA': 'Europa',
    'CONCACAF': 'Am?rica do Norte',
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
  const club = CLUBS_DATA.find(c => c.nome.toLowerCase().trim() === clubName.toLowerCase().trim());
  if (!club) return null;
  
  // Mapear continente para federa??o
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
        // Atualizar refs globais usadas pelo form
        playerPhotoPreview.value = base64;
        scorerForm.value.fotoUrl = base64;
        
        // Garantir sincronia se o objeto legado artilheiro ainda existir na nova temporada
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
      // Atualizar refs globais usadas pelo form
      playerPhotoPreview.value = base64;
      scorerForm.value.fotoUrl = base64;
      
      // Garantir sincronia se o objeto legado artilheiro ainda existir
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
  
  // Caso 1: Editando no Modal de Artilheiros
  if (isEditingScorer.value && selectedSeasonForScorer.value && currentScorerIndex.value !== null) {
      if (selectedSeasonForScorer.value.topScorers[currentScorerIndex.value]) {
          selectedSeasonForScorer.value.topScorers[currentScorerIndex.value].fotoUrl = '';
      }
  }

  // Caso 2: Criando/Editando Temporada no Form Completo
  if (newSeason.value.artilheiro) {
     newSeason.value.artilheiro.fotoUrl = '';
  }
  // FIX: Tamb?m limpar do array topScorers se estiver populado (que ? o padr?o novo)
  if (newSeason.value.topScorers && newSeason.value.topScorers.length > 0) {
     // Assume que o primeiro ? o artilheiro sendo editado no form principal
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
      'CONMEBOL': 'Am?rica do Sul',
      'UEFA': 'Europa',
      'CONCACAF': 'Am?rica do Norte',
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
  
  // Cachear fotos dos artilheiros desta competi??o
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

const resetNavigation = () => {
  selectedContinent.value = null
  selectedCountry.value = null
  selectedCompetition.value = null
  showNewSeasonForm.value = false
  isEditing.value = false
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

const countTitles = (teamName, seasonStr) => {
  if (!teamName || !selectedCompetition.value || !seasonStr) return 0
  const currentYear = getSeasonFinalYear(seasonStr)
  
  return seasonStore.list.filter(s => {
    const isSameTeam = s.campeao.toLowerCase().trim() === teamName.toLowerCase().trim()
    const isPastOrPresent = getSeasonFinalYear(s.ano) <= currentYear
    return isSameTeam && isPastOrPresent
  }).length
}

const getIndividualStars = (titles) => {
  const remaining = titles % 5
  return '?'.repeat(remaining)
}

const getGroupedStars = (titles) => {
  const groups = Math.floor(titles / 5)
  return groups > 0 ? `x${groups * 5}` : ''
}

const countVices = (teamName, seasonStr) => {
  if (!teamName || !selectedCompetition.value || !seasonStr) return 0
  const currentYear = getSeasonFinalYear(seasonStr)
  
  return seasonStore.list.filter(s => {
    const hasVice = s.vice && s.vice.toLowerCase().trim() === teamName.toLowerCase().trim()
    const isPastOrPresent = getSeasonFinalYear(s.ano) <= currentYear
    return hasVice && isPastOrPresent
  }).length
}

const getIndividualVices = (vices) => {
  const remaining = vices % 5
  return '??'.repeat(remaining)
}

const getGroupedVices = (vices) => {
  const groups = Math.floor(vices / 5)
  return groups > 0 ? `x${groups * 5}` : ''
}

const prepareEdit = async (season) => {
  newSeason.value = JSON.parse(JSON.stringify({ 
    ...season,
    topScorers: season.topScorers || (season.artilheiro && season.artilheiro.nome ? [season.artilheiro] : []),
    participantes: season.participantes || [],
    promovidosPlayoff: season.promovidosPlayoff || []
  }))
  
  // Carregar o primeiro artilheiro no formul?rio unificado (opcional no form)
  if (newSeason.value.topScorers && newSeason.value.topScorers.length > 0) {
    scorerForm.value = JSON.parse(JSON.stringify(newSeason.value.topScorers[0]))
    
    // Carregar foto do cache/banco para pr?-visualiza??o
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

  isEditing.value = true
  currentEditId.value = season.id
  viewMode.value = 'form'
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
  newSeason.value = {
    id: null,
    ano: '',
    campeao: '',
    vice: '',
    competitionName: selectedCompetition.value.nome,
    topScorers: [],
    participantes: [],
    tabela: '',
    promovidosPlayoff: []
  }
  resetScorerForm()
  viewMode.value = 'form'
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

  // Criar uma c?pia para evitar problemas de refer?ncia
  const scorerToSave = { ...scorerForm.value }

  // Persistir foto se for base64
  if (scorerToSave.fotoUrl && scorerToSave.fotoUrl.startsWith('data:')) {
    const imageId = `artilheiro_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await db.saveImage(imageId, scorerToSave.fotoUrl);
    // Alimentar cache para exibi??o imediata
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
    alert('Erro: ID da temporada n?o encontrado. Tente reabrir o modal de artilheiros.');
    return;
  }

  console.log('Persisting scorers for season ID:', selectedSeasonForScorer.value.id);
  
  try {
    // Limpeza profunda para garantir que nada estranho v? para o storage
    const topScorersClean = JSON.parse(JSON.stringify(selectedSeasonForScorer.value.topScorers));
    
    await seasonStore.updateSeason(selectedSeasonForScorer.value.id, { 
      topScorers: topScorersClean 
    });
    
    console.log('Artilheiros salvos com sucesso!');
    showScorerModal.value = false;
  } catch (error) {
    console.error('Erro ao salvar artilheiros:', error);
    alert('N?o foi poss?vel salvar os artilheiros.\nMotivo: ' + (error.message || 'Erro de persist?ncia no banco de dados.'));
  }
}

const confirmDelete = (season) => {
  if (confirm(`Excluir permanentemente o registro de ${season.ano}?`)) {
    seasonStore.removeSeason(season.id)
  }
}



const saveNewSeason = async (shouldClose = true) => {
  if (!selectedCompetition.value) return
  
  // Garantir que os artilheiros sejam processados se preenchidos no form ?nico
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

    // Se j? existia esse artilheiro (edi??o), poder?amos ter l?gica aqui, 
    // mas o requisito diz "adicionar uma temporada completa em UMA ?nica tela".
    // Ent?o assumimos que se o form est? preenchido, ele ? o artilheiro principal.
    newSeason.value.topScorers = [scorerToSave];
  } else {
    // Se o nome estiver vazio no form, entendemos que o usu?rio quer remover o artilheiro
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
  // Cachear competi??es internacionais
  for (const comp of INTERNATIONAL_DATA) {
    if (comp.logo) {
      const b64 = await imageCacheService.getOrCache(comp.logo)
      if (b64) cachedLogos.value[comp.logo] = b64
    }
  }

  // Cachear logos de federa??es
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

// Persist?ncia de Navega??o
watch([selectedContinent, selectedCountry, selectedCompetition], () => {
  const state = {
    continent: selectedContinent.value,
    country: selectedCountry.value,
    competition: selectedCompetition.value ? { nome: selectedCompetition.value.nome } : null
  }
  localStorage.setItem('freefoot_universo_nav', JSON.stringify(state))
}, { deep: true })

const restoreNavigation = () => {
  // 1. Deep Link via Query Param (Checklist Access)
  if (route.query.compId) {
      const compId = parseInt(route.query.compId)
      const targetCountry = route.query.country
      
      console.log('Deep Link:', compId, targetCountry)

      let foundComp = null
      let foundCountry = null
      let foundContinent = null

      // Busca em competi??es continentais/nacionais
      for (const region of ALL_COMPETITIONS_DATA) {
          if (region.paises) {
    const compId = parseInt(route.query.compId)
    let foundComp = null
    let foundCountry = null
    let foundContinent = null

    // Busca exaustiva
    ALL_COMPETITIONS_DATA.forEach(cont => {
      cont.paises.forEach(p => {
        const c = p.competicoes.find(item => item.id === compId)
        if (c) { 
          foundComp = c
          foundCountry = p
          foundContinent = cont
        }
      })
      if (!foundComp && cont.continentais) {
         const c = cont.continentais.find(item => item.id === compId)
         if (c) {
           foundComp = c
           foundContinent = cont
         }
      }
    })

    if (!foundComp) {
      foundComp = INTERNATIONAL_DATA.find(c => c.id === compId)
    }

    if (foundComp) {
      selectedContinent.value = foundContinent
      selectedCountry.value = foundCountry
      selectedCompetition.value = foundComp
      
      // FIX: Garantir carregamento de temporadas no Deep Link
      const targetCountry = foundComp.pais || foundCountry?.nome || foundContinent?.continente
      seasonStore.loadSeasons(foundComp.nome, targetCountry)

      // Limpa a query para n?o ficar ?preso? na URL
      router.replace({ query: {} })
      return
    }
  }

  if (route.query.reset === 'true') {
    resetNavigation()
    router.replace({ query: {} })
    return
  }
  
  // 2. LocalStorage Restore (Original Logic)
  const savedNav = localStorage.getItem('freefoot_universo_nav')
  if (savedNav) {
    try {
      const state = JSON.parse(savedNav)
      if (!state || typeof state !== 'object') {
          localStorage.removeItem('freefoot_universo_nav')
          return
      }

      if (state.continent) selectedContinent.value = state.continent
      if (state.country) selectedCountry.value = state.country
      
      if (state.competition && state.competition.nome) {
        // Tenta re-encontrar a competi??o nos dados frescos (ID ou Nome)
        let foundComp = null
        const allComps = [
          ...ALL_COMPETITIONS_DATA.flatMap(c => c.paises.flatMap(p => p.competicoes)),
          ...ALL_COMPETITIONS_DATA.flatMap(c => c.continentais || []),
          ...INTERNATIONAL_DATA
        ]
        
        foundComp = allComps.find(c => c.id === state.competition.id) || 
                    allComps.find(c => c.nome === state.competition.nome)

        if (foundComp) {
          selectedCompetition.value = foundComp
          // FIX: Garantir carregamento de temporadas na restaura??o
          const targetCountry = foundComp.pais || selectedCountry.value?.nome || selectedContinent.value?.continente
          seasonStore.loadSeasons(foundComp.nome, targetCountry)
          
          if (foundComp.tipo === 'internacional') { // Restaurar l?gica de visual internacional
             const fedMap = {
                'CONMEBOL': 'Am?rica do Sul',
                'UEFA': 'Europa',
                'CONCACAF': 'Am?rica do Norte',
                'FIFA': 'FIFA'
             }
             const fedKey = fedMap[foundComp.continente]
             if (fedKey && !selectedCountry.value) {
                 selectedCountry.value = {
                    nome: foundComp.continente,
                    bandeira: FEDERATIONS_DATA[fedKey]?.logo || ''
                 }
             }
          }
        }
      }
    } catch (e) {
      console.error("Erro ao restaurar navega??o:", e)
    }
  }
}


onMounted(async () => {
  try {
    // Restaurar estado de navega??o com seguran?a
    restoreNavigation()
  } catch (e) {
    console.error("Critical error in restoreNavigation:", e)
    resetNavigation()
  }

  try {
    // Carregar Cache de Imagens Geral em background
    await cacheImages(ALL_COMPETITIONS_DATA)
    
    // Carregar fotos artilheiros se j? tiver competi??o selecionada
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
    console.error("Error in onMounted UniversoView:", e)
  }
})

