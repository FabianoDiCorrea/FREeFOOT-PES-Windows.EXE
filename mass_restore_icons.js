import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

const files = [
    'src/views/UniversoView.vue',
    'src/views/SeasonDetailView.vue',
    'src/views/CountrySeasonMatrixView.vue',
    'src/views/CarreiraView.vue'
];

const emojiMap = [
    { from: /\?\? HISTÓRICO/g, to: '🏆 HISTÓRICO' },
    { from: /\? {{ getGroupedStars/g, to: '⭐ {{ getGroupedStars' },
    { from: /\?\? {{ getGroupedVices/g, to: '🥈 {{ getGroupedVices' },
    { from: /'??'.repeat/g, to: "'🥈'.repeat" },
    { from: /'\?'.repeat/g, to: "'⭐'.repeat" },
    { from: /title="Tem Artilheiro">\?/g, to: 'title="Tem Artilheiro">⚽' },
    { from: /title="Tem Tabela">\?\?/g, to: 'title="Tem Tabela">📋' },
    { from: />\?\?<\/span>/g, to: '>📋</span>' },
    { from: />\?<\/span>/g, to: '>⚽</span>' },
    { from: /\?\? 1º/g, to: '🏆 1º' },
    { from: /\?\? 2º/g, to: '🥈 2º' },
    { from: /identificação de Pas/g, to: 'identificação de País' },
    { from: /Pgina Individual/g, to: 'Página Individual' },
    { pattern: /Am\?rica/g, to: 'América' }
];

try {
    files.forEach(file => {
        if (!fs.existsSync(file)) return;

        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        emojiMap.forEach(rep => {
            const pattern = rep.from || rep.pattern;
            if (content.match(pattern)) {
                console.log(`Fixing ${file}: ${pattern} -> ${rep.to}`);
                content = content.replace(pattern, rep.to);
                changed = true;
            }
        });

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Saved: ${file}`);
        }
    });
    console.log("Mass restore complete.");
} catch (e) {
    console.error(e);
}
