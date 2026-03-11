import { SOUTH_AMERICA_COMPETITIONS, UEFA_COMPETITIONS, INTERNATIONAL_COMPETITIONS, CONCACAF_COMPETITIONS } from '../data/competitions.data';

export const SOUTH_AMERICA_DATA = {
    // ...
    continente: "América do Sul",
    logo_continente: "https://a.imagem.app/B76ggb.png",
    paises: [
        // ... (paises existentes mantidos)
        {
            nome: "Brasil",
            bandeira: "https://flagcdn.com/w80/br.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Brasil")
        },
        {
            nome: "Argentina",
            bandeira: "https://flagcdn.com/w80/ar.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Argentina")
        },
        {
            nome: "Uruguai",
            bandeira: "https://flagcdn.com/w80/uy.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Uruguai")
        },
        {
            nome: "Colômbia",
            bandeira: "https://flagcdn.com/w80/co.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Colômbia")
        },
        {
            nome: "Chile",
            bandeira: "https://flagcdn.com/w80/cl.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Chile")
        },
        {
            nome: "Paraguai",
            bandeira: "https://flagcdn.com/w80/py.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Paraguai")
        },
        {
            nome: "Equador",
            bandeira: "https://flagcdn.com/w80/ec.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Equador")
        },
        {
            nome: "Peru",
            bandeira: "https://flagcdn.com/w80/pe.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Peru")
        },
        {
            nome: "Bolívia",
            bandeira: "https://flagcdn.com/w80/bo.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Bolívia")
        },
        {
            nome: "Venezuela",
            bandeira: "https://flagcdn.com/w80/ve.png",
            competicoes: SOUTH_AMERICA_COMPETITIONS.filter(c => c.pais === "Venezuela")
        }
    ],
    continentais: INTERNATIONAL_COMPETITIONS.filter(c => c.pais === "América do Sul")
};


export const EUROPE_DATA = {
    continente: "Europa",
    logo_continente: "https://a.imagem.app/B76yUr.png",
    paises: [
        {
            nome: "Inglaterra",
            bandeira: "https://flagcdn.com/w80/gb-eng.png",
            competicoes: UEFA_COMPETITIONS.filter(c => c.pais === "Inglaterra")
        },
        {
            nome: "Itália",
            bandeira: "https://flagcdn.com/w80/it.png",
            competicoes: UEFA_COMPETITIONS.filter(c => c.pais === "Itália")
        },
        {
            nome: "Espanha",
            bandeira: "https://flagcdn.com/w80/es.png",
            competicoes: UEFA_COMPETITIONS.filter(c => c.pais === "Espanha")
        },
        {
            nome: "França",
            bandeira: "https://flagcdn.com/w80/fr.png",
            competicoes: UEFA_COMPETITIONS.filter(c => c.pais === "França")
        },
        {
            nome: "Alemanha",
            bandeira: "https://flagcdn.com/w80/de.png",
            competicoes: UEFA_COMPETITIONS.filter(c => c.pais === "Alemanha")
        }
    ],
    continentais: INTERNATIONAL_COMPETITIONS.filter(c => c.pais === "Europa")
};

export const CONCACAF_DATA = {
    continente: "América do Norte",
    logo_continente: "https://1000marcas.net/wp-content/uploads/2020/03/Logo-Concacaf.png",
    paises: [
        {
            nome: "Estados Unidos",
            bandeira: "https://flagcdn.com/w80/us.png",
            competicoes: CONCACAF_COMPETITIONS.filter(c => c.pais === "Estados Unidos")
        },
        {
            nome: "México",
            bandeira: "https://flagcdn.com/w80/mx.png",
            competicoes: CONCACAF_COMPETITIONS.filter(c => c.pais === "México")
        },
        {
            nome: "Costa Rica",
            bandeira: "https://flagcdn.com/w80/cr.png",
            competicoes: CONCACAF_COMPETITIONS.filter(c => c.pais === "Costa Rica")
        }
    ],
    continentais: []
};

export const ALL_COMPETITIONS_DATA = [SOUTH_AMERICA_DATA, EUROPE_DATA, CONCACAF_DATA];
