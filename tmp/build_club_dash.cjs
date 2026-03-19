const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('c:/Users/fabia/OneDrive/Documents/FREeFOOT-PES-Windows.EXE/src/views/ClubDashboardView.vue');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Template: Header changes
code = code.replace(
  `<h2 class="m-0 text-info"><i class="bi bi-bar-chart-fill me-2"></i>MINHAS ESTATÍSTICAS</h2>`,
  `<h2 class="m-0 text-info"><i class="bi bi-bar-chart-fill me-2"></i>ESTATÍSTICAS: {{ clubName }}</h2>`
);

// 2. Remove context tabs template completely
const tabStart = code.indexOf(`<!-- Abas de Filtro de Contexto (Global) -->`);
if (tabStart !== -1) {
    const tabEnd = code.indexOf(`</div>`, tabStart);
    if (tabEnd !== -1) {
       // get out one more div because it's wrapped in `bg-dark rounded ...`
       const actualEnd = code.indexOf(`</div>`, tabEnd + 6);
       code = code.slice(0, tabStart) + code.slice(actualEnd + 6);
    }
}

// 3. Remove go back push route to fixed /carreira, use history back
code = code.replace(`@click="$router.push('/carreira')"`, `@click="$router.back()"`);

// 4. Update Header empty message
code = code.replace(`<h4>Nenhum dado encontrado para {{ contextType === 'clube' ? 'Clubes' : 'Seleções' }}</h4>`, `<h4>Nenhum dado encontrado para {{ clubName }}</h4>`);

// --- Script Setup Replacements ---

// 5. Router imports
code = code.replace(
  `import { useCareerStore } from '@/services/career.store';`,
  `import { useRoute } from 'vue-router';`
);

code = code.replace(
  `const careerStore = useCareerStore();`,
  `const route = useRoute();\nconst clubName = ref(decodeURIComponent(route.params.id || ''));\nconst contextType = ref('clube');`
);

// 6. Delete `onMounted` careerStore.loadAll
code = code.replace(`await careerStore.loadAll();`, ``);

// 7. Remove `const history = computed(() => careerStore.career?.history);`
code = code.replace(`const history = computed(() => careerStore.career?.history);`, ``);

// 8. Find `filteredHistory` block down through `myAwardedPlayers` block and replace it!
const processedStart = code.indexOf(`// Retorna apenas a história do tipo ativo`);
const processedEnd = code.indexOf(`onMounted(async () => {`);

if (processedStart !== -1 && processedEnd !== -1) {
    const newEngine = `
// Calcula e processa todos os dados das temporadas específicos para este Clube
const processedSeasons = computed(() => {
    const searchName = normalizeString(clubName.value);
    const byYear = {};
    
    seasonStore.list.forEach(s => {
        const year = s.ano;
        const normalizedYear = normalizeYearStrict(year);
        if (!byYear[normalizedYear]) {
            byYear[normalizedYear] = { 
                anoCortado: normalizedYear, 
                temporada: year, 
                timeNome: clubName.value, 
                pais: '', 
                posicoesLiga: [],
                hasAnyData: false,
                jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0
            };
        }
        
        // Match club in this competition
        let playedHere = false;
        let pos = null;
        let j=0, v=0, e=0, d=0, gp=0, gc=0;
        
        if (s.campeao && normalizeString(s.campeao) === searchName) {
            pos = 1; playedHere = true;
        } else if (s.tabela && normalizeString(s.tabela).includes(searchName)) {
            playedHere = true;
            const lines = s.tabela.split('\\n');
            const tLine = lines.find(l => normalizeString(l).includes(searchName));
            if (tLine) {
                const parts = tLine.replace(/[^\\w\\s\\d]/g, ' ').trim().split(/\\s+/);
                const numbers = parts.filter(p => !isNaN(parseInt(p)) && p !== '').map(p => parseInt(p));
                pos = lines.indexOf(tLine) + 1;
                if (numbers.length >= 8) {
                    for (let i = 1; i < numbers.length - 2; i++) {
                         if (numbers[i-1] === numbers[i] + numbers[i+1] + (numbers[i+2] || 0)) {
                             j = numbers[i-1]; v = numbers[i]; e = numbers[i+1]; d = numbers[i+2] || 0;
                             if (numbers[i+3] !== undefined) gp = numbers[i+3];
                             if (numbers[i+4] !== undefined) gc = numbers[i+4];
                             break;
                         }
                    }
                }
            }
        }
        
        if (playedHere) {
             byYear[normalizedYear].hasAnyData = true;
             
             const cNameLower = (s.competitionName || '').toLowerCase();
             const isInter = cNameLower.includes('libertadores') || cNameLower.includes('sul-americana') || cNameLower.includes('champions') || cNameLower.includes('europa') || cNameLower.includes('concacaf') || cNameLower.includes('mundial') || cNameLower.includes('recopa') || cNameLower.includes('supercopa da uefa');
             
             if (!s.isCup && !isInter) {
                 byYear[normalizedYear].posicoesLiga.push({ pos, ligaNome: s.competitionName || 'Liga' });
                 if(!byYear[normalizedYear].pais && s.pais) byYear[normalizedYear].pais = s.pais;
                 
                 byYear[normalizedYear].jogos += j;
                 byYear[normalizedYear].vitorias += v;
                 byYear[normalizedYear].empates += e;
                 byYear[normalizedYear].derrotas += d;
                 byYear[normalizedYear].golsPro += gp;
                 byYear[normalizedYear].golsContra += gc;
             }
        }
    });

    const result = [];
    for (const key of Object.keys(byYear).sort((a,b) => parseInt(a) - parseInt(b))) {
        const yData = byYear[key];
        if (yData.hasAnyData) {
            let finalPos = null;
            let finalLiga = 'Sem Liga';
            if (yData.posicoesLiga.length > 0) {
                 finalPos = yData.posicoesLiga[0].pos;
                 finalLiga = yData.posicoesLiga[0].ligaNome;
            }
            
            let finalPais = yData.pais;
            if (!finalPais) {
                 const clubMatch = clubStore.list.find(c => c.nome.toLowerCase() === clubName.value.toLowerCase());
                 if (clubMatch) finalPais = clubMatch.pais;
            }
            
            const winRate = yData.jogos > 0 ? (((yData.vitorias + yData.empates) / yData.jogos) * 100).toFixed(1) : 0;
            
            result.push({
                id: 'club_' + key,
                anoCortado: yData.anoCortado,
                temporada: yData.temporada,
                timeNome: yData.timeNome,
                pais: finalPais || 'Desconhecido',
                posicaoTimeline: finalPos,
                ligaNome: finalLiga,
                rate: parseFloat(winRate),
                jogos: yData.jogos,
                derrotas: yData.derrotas,
                golsPro: yData.golsPro,
                golsContra: yData.golsContra
            });
        }
    }
    return result;
});

// Top 3 Calculators
const top3WinRates = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => b.rate - a.rate).slice(0,3);
});

const bottom3WinRates = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => a.rate - b.rate).slice(0,3);
});

const top3Ataques = computed(() => {
    return [...processedSeasons.value].filter(s => s.golsPro > 0).sort((a,b) => b.golsPro - a.golsPro).slice(0,3);
});

const top3Defesas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos > 0).sort((a,b) => a.golsContra - b.golsContra).slice(0,3);
});

const worst3Defesas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos > 0).sort((a,b) => b.golsContra - a.golsContra).slice(0,3);
});

const top3MenosDerrotas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => a.derrotas - b.derrotas).slice(0,3);
});

const top3MaisDerrotas = computed(() => {
    return [...processedSeasons.value].filter(s => s.jogos >= 1).sort((a,b) => b.derrotas - a.derrotas).slice(0,3);
});

const myTopScorers = computed(() => {
    let results = [];
    const searchName = clubName.value.toLowerCase().trim();
    
    seasonStore.list.forEach(season => {
        const scorers = season.topScorers || (season.artilheiro && season.artilheiro.nome ? [season.artilheiro] : []);
        scorers.forEach(scorer => {
            const scorerTeam = (scorer.clube || scorer.clubeArtilheiro || '').toLowerCase().trim();
            if (scorerTeam === searchName) {
                results.push({
                    nome: scorer.nome,
                    gols: scorer.gols || '?',
                    clube: scorer.clube || scorer.clubeArtilheiro,
                    pais: clubStore.list.find(c => c.nome.toLowerCase() === searchName)?.pais || '',
                    temporada: season.ano,
                    campeonato: season.nome || season.competitionName
                });
            }
        });
    });
    
    return results.sort((a,b) => (parseInt(b.gols) || 0) - (parseInt(a.gols) || 0)).slice(0, 5);
});

const myAwardedPlayers = computed(() => {
    const searchName = clubName.value.toLowerCase().trim();
    return awardsStore.list.filter(award => {
        return (award.clube || award.nacionalidade || '').toLowerCase().trim() === searchName;
    }).sort((a, b) => b.season.localeCompare(a.season));
});

`;
    code = code.slice(0, processedStart) + newEngine + code.slice(processedEnd);
    fs.writeFileSync(targetPath, code, 'utf8');
    console.log("REWRITE SUCCESS");
} else {
    console.log("BLOCK NOT FOUND");
}
