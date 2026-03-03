/**
 * Remove acentos e converte para minúsculas para buscas mais precisas.
 */
export const normalizeString = (str) => {
    if (!str) return '';
    return str
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

/**
 * Extrai o ano final de uma string de temporada.
 * Padrão atual: "2024 / 2025 = 2025" -> 2025
 */
export const getSeasonFinalYear = (seasonStr) => {
    if (!seasonStr) return 0;

    // Se tiver o sinal de igual (novo padrão unificado), o ano final é o que vem depois
    if (seasonStr.includes(' = ')) {
        const parts = seasonStr.split(' = ');
        return parseInt(parts[parts.length - 1].trim()) || 0;
    }

    // Suporte para o padrão anterior com traço
    if (seasonStr.includes(' - ')) {
        const parts = seasonStr.split(' - ');
        return parseInt(parts[parts.length - 1].trim()) || 0;
    }

    // Fallback para padrão antigo XXXX / XXXX
    const parts = seasonStr.split('/');
    const year = parts.length > 1 ? parts[1] : parts[0];
    return parseInt(year) || 0;
};

/**
 * Retorna o caminho da imagem do troféu baseado no slug.
 */
export const getTrofeuPath = (slug) => {
    if (!slug) return '';
    return `assets/trofeus/${slug}.png`;
};

/**
 * Normalização estrita para garantir o formato "XXXX / XXXX = XXXX".
 * Remove parênteses, espaços extras e trata formatos legados.
 */
export const normalizeYearStrict = (y) => {
    if (!y) return '';
    let val = y.toString().trim()
        .replace(/[()]/g, '') // Remove parênteses
        .replace(/\s+/g, ' '); // Normaliza espaços múltiplos

    // Caso de erro comum: "2024/20252025" -> Extrair apenas os primeiros 9 caracteres (XXXX/XXXX)
    if (val.match(/^\d{4}\/\d{8}$/)) {
        val = val.substring(0, 9);
    }

    // Trata barra sem espaços para padronizar
    if (val.includes('/') && !val.includes(' / ')) {
        val = val.replace('/', ' / ');
    }

    // Se já estiver no padrão correto XXXX / XXXX = XXXX, retorna limpo
    if (val.includes(' = ')) {
        const parts = val.split(' = ').map(p => p.trim());
        if (parts.length === 2 && parts[0].includes(' / ')) {
            return `${parts[0]} = ${parts[1]}`;
        }
    }

    // Tratamento de migração "-" para "="
    if (val.includes(' - ')) {
        val = val.replace(' - ', ' = ');
    }

    // Se for formato XXXX / XXXX, converte para XXXX / XXXX = XXXX
    if (val.includes(' / ')) {
        const parts = val.split(' / ').map(p => p.trim());
        if (parts.length === 2) {
            // Se a segunda parte tiver mais de 4 dígitos (erro de concatenação), limpa
            let finalYear = parts[1];
            if (finalYear.length > 4) finalYear = finalYear.substring(0, 4);
            return `${parts[0]} / ${finalYear} = ${finalYear}`;
        }
    }

    // Se for apenas um ano simples XXXX, converte para XXXX / XXXX = XXXX
    const yearMatch = val.match(/\d{4}/);
    if (yearMatch && val.length >= 4) {
        const year = yearMatch[0];
        return `${year} / ${year} = ${year}`;
    }

    return val;
};

/**
 * Retorna o próximo ano no padrão unificado.
 */
export const getNextSeasonYear = (currentYear) => {
    if (!currentYear) return '';

    // Primeiro normaliza para garantir o padrão
    const normalized = normalizeYearStrict(currentYear);

    if (normalized.includes(' = ')) {
        const parts = normalized.split(' = ').map(s => s.trim());
        if (parts.length === 2) {
            const range = parts[0];
            const final = parseInt(parts[1]);

            let nextRange = '';
            if (range.includes(' / ')) {
                const rParts = range.split(' / ').map(p => p.trim());
                if (rParts.length === 2) {
                    nextRange = `${parseInt(rParts[0]) + 1} / ${parseInt(rParts[1]) + 1}`;
                }
            } else {
                nextRange = (parseInt(range) + 1).toString();
            }

            return `${nextRange} = ${final + 1}`;
        }
    }

    return '';
};
