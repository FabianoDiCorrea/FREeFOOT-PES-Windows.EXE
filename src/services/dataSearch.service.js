import { clubStore } from './club.store';
import { NATIONAL_TEAMS_DATA } from '../data/nationalTeams.data';
import {
    SOUTH_AMERICA_COMPETITIONS,
    UEFA_COMPETITIONS,
    INTERNATIONAL_COMPETITIONS,
    CONCACAF_COMPETITIONS
} from '../data/competitions.data';
import { NATIONAL_COMPETITIONS_STRUCTURE } from './national.data';
import { normalizeString, normalizeCountry } from './utils';
import { db } from './db';

let cachedCustomNationalities = [];

export const refreshCustomNationalities = async () => {
    try {
        const list = await db.getAll('player_nationalities') || [];
        cachedCustomNationalities = list;
    } catch (e) {
        cachedCustomNationalities = [];
    }
};

// Carrega imediatamente ao iniciar o arquivo
refreshCustomNationalities();

export const dataSearchService = {
    /**
     * Busca um clube pelo nome.
     */
    findClub(name, exactOnly = false) {
        if (!name) return null;
        const search = normalizeString(name);
        const list = clubStore.list.length > 0 ? clubStore.list : [];

        const exactMatch = list.find(c => normalizeString(c.nome) === search);
        if (exactMatch || exactOnly) return exactMatch;

        return list.find(c => normalizeString(c.nome).includes(search));
    },

    /**
     * Busca um clube pelo nome com prioridade pelo país exato (evita confundir Barcelona SC Equador com Barcelona Espanha).
     */
    findClubByCountry(name, country) {
        if (!name || !country) return null;
        const search = normalizeString(name);
        const searchCountry = normalizeCountry(country);
        const list = clubStore.list.length > 0 ? clubStore.list : [];

        // 1. Busca exata no país correto
        const exactInCountry = list.find(c => normalizeString(c.nome) === search && normalizeCountry(c.pais) === searchCountry);
        if (exactInCountry) return exactInCountry;

        // 2. Busca parcial no país correto (Ex: "Barcelona" -> "Barcelona SC" se estiver no Equador)
        const partialInCountry = list.find(c =>
            normalizeCountry(c.pais) === searchCountry &&
            (normalizeString(c.nome).startsWith(search) || search.startsWith(normalizeString(c.nome)))
        );
        if (partialInCountry) return partialInCountry;

        // 3. Fallback: Match exato em qualquer país (Último recurso)
        return list.find(c => normalizeString(c.nome) === search);
    },

    /**
     * Busca uma seleção pelo nome.
     */
    findNationalTeam(name, exactOnly = false) {
        if (!name) return null;
        const search = normalizeString(name);

        const exactMatch = cachedCustomNationalities.find(n => normalizeString(n.nome) === search) ||
            NATIONAL_TEAMS_DATA.find(n => normalizeString(n.nome) === search) ||
            NATIONAL_TEAMS_DATA.find(n => normalizeCountry(n.pais) === normalizeCountry(search));

        if (exactMatch) return exactMatch;

        if (exactOnly) return null;

        return cachedCustomNationalities.find(n => normalizeString(n.nome).includes(search)) ||
            NATIONAL_TEAMS_DATA.find(n => normalizeString(n.nome).includes(search));
    },

    /**
     * Busca uma competição pelo nome.
     */
    findCompetition(name) {
        if (!name) return null;
        const search = normalizeString(name);
        const allComps = [
            ...SOUTH_AMERICA_COMPETITIONS,
            ...UEFA_COMPETITIONS,
            ...INTERNATIONAL_COMPETITIONS,
            ...CONCACAF_COMPETITIONS,
            ...NATIONAL_COMPETITIONS_STRUCTURE.flatMap(continent => continent.competicoes)
        ];
        return allComps.find(c => normalizeString(c.nome) === search) ||
            allComps.find(c => normalizeString(c.nome).includes(search));
    },

    /**
     * Retorna todos os clubes de um país.
     */
    getClubsByCountry(countryName) {
        if (!countryName) return [];
        const search = normalizeCountry(countryName);
        const list = clubStore.list.length > 0 ? clubStore.list : [];
        return list.filter(c => normalizeCountry(c.pais) === search);
    },

    /**
     * Retorna todas as seleções de um continente.
     */
    getNationalsByContinent(continentName) {
        if (!continentName) return [];
        const search = normalizeString(continentName);
        return NATIONAL_TEAMS_DATA.filter(n => normalizeString(n.continente) === search);
    },

    /**
     * Busca automática (Clube ou Seleção).
     */
    search(name, type = null) {
        if (type === 'selecao') return this.findNationalTeam(name);
        if (type === 'clube') return this.findClub(name);

        // Prioridade 1: Match exato em clubes
        const exactClub = this.findClub(name, true);
        if (exactClub) return exactClub;

        // Prioridade 2: Match exato em seleções
        const exactNational = this.findNationalTeam(name, true);
        if (exactNational) return exactNational;

        // Prioridade 3: Match parcial
        return this.findClub(name) || this.findNationalTeam(name);
    }
};
