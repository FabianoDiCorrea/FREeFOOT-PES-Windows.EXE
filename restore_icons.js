import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

const filePath = 'src/views/UniversoView.vue';

try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log("Iniciando Restauração de Ícones e Emojis...");

    const replacements = [
        // Template - Botões e Badges
        { pattern: /\?\? HISTÓRICO/g, to: '🏆 HISTÓRICO' },
        { pattern: /\?\? {{ getGroupedVices/g, to: '🥈 {{ getGroupedVices' },
        { pattern: /\? {{ getGroupedStars/g, to: '⭐ {{ getGroupedStars' },
        { pattern: /title="Tem Artilheiro">\?/g, to: 'title="Tem Artilheiro">⚽' },
        { pattern: /title="Tem Tabela">\?\?/g, to: 'title="Tem Tabela">📋' },
        { pattern: /title="Ver Pgina Individual"/g, to: 'title="Ver Página Individual"' },

        // Script - Funções de retorno de ícones
        { pattern: /return '\?'.repeat\(remaining\)/g, to: "return '⭐'.repeat(remaining)" },
        { pattern: /return '\?\?'.repeat\(remaining\)/g, to: "return '🥈'.repeat(remaining)" },

        // Outros termos de interface
        { pattern: /'Amrica do Sul'/g, to: "'América do Sul'" },
        { pattern: /identificação de Pas/g, to: 'identificação de País' },
    ];

    let count = 0;
    replacements.forEach(rep => {
        const matches = content.match(rep.pattern);
        if (matches) {
            console.log(`Restaurando ${matches.length} ocorrencias de ${rep.pattern} -> ${rep.to}`);
            content = content.replace(rep.pattern, rep.to);
            count += matches.length;
        }
    });

    if (count > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Ícones restaurados: ${count} alterações feitas.`);
    } else {
        console.log("Nenhum ícone corrompido detectado.");
    }

} catch (err) {
    console.error("Erro no script de restauração de ícones:", err);
}
