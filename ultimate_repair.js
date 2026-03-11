import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

const files = [
    'src/views/UniversoView.vue',
    'src/views/SeasonDetailView.vue',
    'src/views/CountrySeasonMatrixView.vue',
    'src/views/CarreiraView.vue'
];

try {
    files.forEach(file => {
        if (!fs.existsSync(file)) return;

        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        // Substituir U+FFFD (Replacement Character)
        if (content.includes('\uFFFD')) {
            console.log(`Fixing U+FFFD in ${file}`);
            // Casos específicos conhecidos
            content = content.replace(/P\uFFFDgina/g, 'Página');
            content = content.replace(/Pa\uFFFDs/g, 'País');
            content = content.replace(/edera\uFFFD\uFFFD0/g, 'ederação'); // De federação
            content = content.replace(/federa\uFFFD\uFFFDo/g, 'federação');
            content = content.replace(/federa\uFFFD\?o/g, 'federação');
            content = content.replace(/federa\?\?o/g, 'federação');
            content = content.replace(/Am\uFFFDrica/g, 'América');
            content = content.replace(/identifica\uFFFD\uFFFDo/g, 'identificação');

            // Remover qualquer U+FFFD genérico que sobrou
            content = content.replace(/\uFFFD/g, '');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Final fix saved: ${file}`);
        }
    });
    console.log("Ultimate repair complete.");
} catch (e) {
    console.error(e);
}
