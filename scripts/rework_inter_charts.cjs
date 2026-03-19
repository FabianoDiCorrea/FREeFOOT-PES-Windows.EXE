const fs = require('fs');
const path = 'c:/Users/fabia/OneDrive/Documents/FREeFOOT-PES-Windows.EXE/src/views/CareerDashboardView.vue';
let content = fs.readFileSync(path, 'utf8');

// 1. Rewrite Template
const templateStart = content.indexOf(`<!-- ABA: TIMELINE INTERNACIONAIS -->`);
const templateEnd = content.indexOf(`<!-- ABA: RECORDES (TOP 3) -->`);
if (templateStart !== -1 && templateEnd !== -1) {
    const newTemplate = `<!-- ABA: TIMELINE INTERNACIONAIS -->
      <div v-if="activeTab === 'timeline-inter'" class="row g-4 px-2 animate-slide-up">
        <div v-if="interCharts.length === 0" class="col-12 text-center p-5 opacity-50">
          <GamePanel>
            Sem participações em torneios internacionais nesta carreira.
          </GamePanel>
        </div>
        <div v-for="(chart, idx) in interCharts" :key="idx" class="col-12">
          <GamePanel>
            <h4 class="text-white text-uppercase fw-bold mb-4">
              <i class="bi bi-globe-americas" :style="{ color: chart.color }"></i> {{ chart.title }}
            </h4>
            
            <div class="chart-scroll-wrapper custom-scrollbar" style="overflow-x: auto; width: 100%; height: 450px; position: relative;">
              <div class="mx-auto" style="min-width: 100%; height: 100%;">
                <Line :data="chart.data" :options="chart.options" />
              </div>
            </div>
          </GamePanel>
        </div>
      </div>\n\n      `;
    content = content.slice(0, templateStart) + newTemplate + content.slice(templateEnd);
}

// 2. Remove old chartDataInter, chartOptionsInter, chartDataPointsContinental, chartDataPointsMundial
// Find where chartOptionsInter starts
const oldOptionsStart = content.indexOf('const chartOptionsInter = {');
const endOfChartDataInter = content.indexOf('const chartDataCopas = computed(() => ({');

if (oldOptionsStart !== -1 && endOfChartDataInter !== -1) {
    // Generate new interCharts computed
    const newInterLogic = `
const baseInterOptions = {
  responsive: true,
  maintainAspectRatio: false,
  clip: false,
  layout: { padding: { top: 30, bottom: 30, left: 10, right: 10 } },
  scales: {
    y: {
      reverse: true, min: 1, suggestedMax: 8,
      ticks: {
        color: '#ffffff', stepSize: 1, autoSkip: false, font: { size: 10, weight: 'bold' },
        callback: function(value) {
          const map = { 1: '🏆 CAMPEÃO', 2: '🥈 VICE', 3: 'SEMI', 4: 'QUARTAS', 5: 'OITAVAS', 6: '16 AVOS', 7: 'GRUPOS', 8: 'PRÉ-COPA' };
          return map[value] || '';
        }
      },
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
    },
    x: {
      offset: true,
      ticks: { color: '#eeeeee', font: { size: 10, weight: 'bold' }, maxRotation: 45, minRotation: 45 },
      grid: { 
         display: true,
         color: (context) => {
            if (context.tick && typeof context.tick.label === 'string' && context.tick.label.trim() === '') return 'transparent';
            return 'rgba(255, 255, 255, 0.1)';
         }
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false, external: customTooltipExternal }
  },
  interaction: { mode: 'nearest', intersect: false, axis: 'x' }
};

const interCharts = computed(() => {
    // Collect all inter competitions found
    const compsFound = {};

    sorted.value.forEach((s, idx) => {
        const normYear = normalizedLabels.value[idx];
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
                const lines = inter.tabela.split('\\n');
                const teamLineRaw = lines.find(l => normalizeString(l).includes(hTimeNorm));
                if (teamLineRaw) {
                    let cells = teamLineRaw.split('\\t');
                    if (cells.length === 1) cells = teamLineRaw.split(/\\s{2,}/);
                    
                    if (/^\\d+$/.test(cells[0]?.trim()) || /^\\d+\\.?$/.test(cells[0]?.trim())) {
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

    for (const [compName, dataPoints]] of Object.entries(compsFound)) {
        const fullDataArray = Array(sorted.value.length).fill(null);
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

`;
    content = content.slice(0, oldOptionsStart) + newInterLogic + content.slice(endOfChartDataInter);
}

// 3. Remove the previous watch loop items for Continental / Mundial
const regexWatchObj = /chartDataPointsContinental\.value = \s*sorted\.map[^;]+;\s*chartDataPointsMundial\.value = \s*sorted\.map[^;]+;/g;
content = content.replace(regexWatchObj, '');

const regexRefCont = /const chartDataPointsContinental = ref\(\[\]\);\nconst chartDataPointsMundial = ref\(\[\]\);\n/;
content = content.replace(regexRefCont, '');


fs.writeFileSync(path, content, 'utf8');
console.log('Update Complete.');
