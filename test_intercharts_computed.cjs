const { defineComponent, ref, computed } = require('vue');

// Simple mockup of the data
const processedSeasons = { value: [
  { anoCortado: '2025', temporada: '2025', timeNome: 'Flamengo', pais: 'Brasil' }
] };

const seasonStore = { list: [] };
const labels = { value: ['2025'] };

const normalizeYearStrict = (str) => str;
const normalizeString = (str) => str.toLowerCase();
const getCupRank = (fase) => 1;
const customTooltipExternal = () => {};

const baseInterOptions = {
    scales: {
        y: { ticks: {} },
        x: { grid: {} }
    },
    plugins: { tooltip: {} }
};

const interCharts = computed(() => {
    // 1. Sort processed seasons to match other charts
    const sorted = [...(processedSeasons.value || [])].sort((a,b) => {
        return parseInt(a.anoCortado) - parseInt(b.anoCortado);
    });
    const normalizedLabels = sorted.map(s => normalizeYearStrict(s.temporada));

    // Collect all inter competitions found
    const compsFound = {};

    sorted.forEach((s, idx) => {
        const normYear = normalizedLabels[idx];
        const hYearNorm = normalizeYearStrict(s.temporada);
        const hTimeNorm = normalizeString(s.timeNome);

        const interDaTemporada = seasonStore.list.filter(season => {
            const sYearNorm = normalizeYearStrict(season.ano);
            if (sYearNorm !== hYearNorm) return false;
            const cName = (season.competitionName || '').toLowerCase();
            return cName.includes('libertadores') || cName.includes('sul-americana') || cName.includes('champions') || cName.includes('europa') || cName.includes('concacaf') || cName.includes('mundial') || cName.includes('recopa') || cName.includes('supercopa da uefa');
        });

        for (const inter of interDaTemporada) {
            let extra = '';
            let intFaseStr = '';
            let intPos = null;
            let played = false;

            if (inter.campeao && normalizeString(inter.campeao) === hTimeNorm) {
                intFaseStr = 'Campeão';
                intPos = 1;
                played = true;
            } else if (inter.tabela && normalizeString(inter.tabela).includes(hTimeNorm)) {
                const lines = inter.tabela.split('\n');
                const teamLineRaw = lines.find(l => normalizeString(l).includes(hTimeNorm));
                if (teamLineRaw) {
                    let cells = teamLineRaw.split('\t');
                    if (cells.length === 1) cells = teamLineRaw.split(/\s{2,}/);
                    
                    if (/^\d+$/.test(cells[0]?.trim()) || /^\d+\.?$/.test(cells[0]?.trim())) {
                        if (cells[2]) extra = cells[2].trim();
                    } else if (cells[1]) {
                        extra = cells[1].trim();
                    }

                    if (extra) {
                        const rank = getCupRank(extra);
                        if (rank) {
                            intFaseStr = extra;
                            intPos = rank;
                            played = true;
                        }
                    }
                }
            }

            if (played) {
                const compName = inter.competitionName || 'Internacional';
                if (!compsFound[compName]) compsFound[compName] = [];
                compsFound[compName].push({
                    idx: idx,
                    x: normYear,
                    y: intPos,
                    time: s.timeNome,
                    compName: compName,
                    pais: s.pais,
                    faseLabel: intFaseStr,
                    temporadaLonga: s.temporada
                });
            }
        }
    });

    const charts = [];
    const colors = ['#0d6efd', '#d63384', '#198754', '#ffc107', '#0dcaf0', '#fd7e14'];
    let colorIndex = 0;

    for (const [compName, dataPoints] of Object.entries(compsFound)) {
        const fullDataArray = Array(sorted.length).fill(null);
        dataPoints.forEach(dp => fullDataArray[dp.idx] = dp);
        
        const color = colors[colorIndex % colors.length];
        colorIndex++;

        // clone base options to set dynamic y-axis color
        const options = JSON.parse(JSON.stringify(baseInterOptions));
        options.scales.y.ticks.color = color;
        // Need to re-attach external tooltip because JSON stringify removes functions
        options.plugins.tooltip.external = customTooltipExternal;
        options.scales.y.ticks.callback = function(value) {
          const map = { 1: '🏆 CAMPEÃO', 2: '🥈 VICE', 3: 'SEMI', 4: 'QUARTAS', 5: 'OITAVAS', 6: '16 AVOS', 7: 'GRUPOS', 8: 'PRÉ-COPA' };
          return map[value] || '';
        };
        options.scales.x.grid.color = (context) => {
            if (context.tick && typeof context.tick.label === 'string' && context.tick.label.trim() === '') return 'transparent';
            return 'rgba(255, 255, 255, 0.1)';
        };

        charts.push({
            title: compName,
            color: color,
            data: {
                labels: labels.value,
                datasets: [{
                    label: compName,
                    data: fullDataArray,
                    borderColor: color,
                    backgroundColor: color + '22', // transparent version
                    borderWidth: 5,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: color,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    pointHoverBackgroundColor: color,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 4,
                    fill: true,
                    tension: 0.3,
                    spanGaps: true
                }]
            },
            options: options
        });
    }

    // Sort charts (e.g. Libertadores first, then Sul-Americana, then Mundial)
    return charts.sort((a, b) => a.title.localeCompare(b.title));
});

try {
  const result = interCharts.value;
  console.log("SUCCESS:", result.length);
} catch (e) {
  console.log("ERROR:", e);
}
