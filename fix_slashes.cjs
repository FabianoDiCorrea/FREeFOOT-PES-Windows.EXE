const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/data/competitions.data.js',
    'src/services/federations.data.js',
    'src/data/internationalCompetitions.js',
    'src/services/national.data.js',
    'src/data/clubs.data.js',
    'src/services/utils.js',
    'src/views/TrophyRoomView.vue',
    'src/views/UniversoView.vue',
    'src/views/SeasonDetailView.vue',
    'src/views/CarreiraView.vue'
];

filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;

        // JS references to relative with ./
        content = content.replace(/logo:\s*['"]\/?(logos\/[^'"]+)['"]/g, "logo: './$1'");
        content = content.replace(/bandeira:\s*['"]\/?(logos\/[^'"]+)['"]/g, "bandeira: './$1'");
        content = content.replace(/bandeira_url:\s*['"]\/?(logos\/[^'"]+)['"]/g, "bandeira_url: './$1'");
        content = content.replace(/ escudo:\s*['"]\/?(logos\/[^'"]+)['"]/g, " escudo: './$1'");

        content = content.replace(/return\s*['"]\/?(logos\/[^'"]+)['"]/g, "return './$1'");
        content = content.replace(/return\s*['"]\/?(assets\/trofeus\/[^'"]+)['"]/g, "return './$1'");
        content = content.replace(/return\s*['"]\/?(trofeus\/[^'"]+)['"]/g, "return './$1'");

        // Vue References in template need / resolving to public dir by Vite
        content = content.replace(/src=["']\/?(logos\/[A-Za-z0-9_\-./]+)["']/g, 'src="/$1"');

        if (original !== content) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Fixed paths in ' + file);
        }
    }
});
