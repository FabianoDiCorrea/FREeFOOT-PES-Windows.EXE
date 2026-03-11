
// Estrutura de Competições de Seleções
// Hierarquia: Continente -> Competição

export const NATIONAL_COMPETITIONS_STRUCTURE = [
    {
        id: 'nc_america_sul',
        continente: "América do Sul",
        logo_continente: "",
        competicoes: [
            { id: 1001, nome: "Copa América", pais: "América", tipo: "Copa", modoRegistro: "participantes", logo: 'logos/competitions/copa_america.png', trofeu: 'trofeu-copaamerica' },
            { id: 1002, nome: "Eliminatórias (Am. do Sul)", pais: "América do Sul", tipo: "Liga", modoRegistro: "liga", logo: "", trofeu: '' }
        ]
    },
    {
        id: 'nc_america_norte',
        continente: "América do Norte",
        logo_continente: "",
        competicoes: [
            { id: 1001, nome: "Copa América", pais: "América", tipo: "Copa", modoRegistro: "participantes", logo: 'logos/competitions/copa_america.png', trofeu: 'trofeu-copaamerica' },
            { id: 1010, nome: "Eliminatórias (Concacaf)", pais: "América do Norte", tipo: "Liga", modoRegistro: "liga", logo: "", trofeu: '' }
        ]
    },
    {
        id: 'nc_europa',
        continente: "Europa",
        logo_continente: "",
        competicoes: [
            { id: 1003, nome: "Euro Copa", pais: "Europa", tipo: "Copa", modoRegistro: "participantes", logo: 'logos/competitions/uefa_euro.png', trofeu: 'trofeu-euro-copa' },
            { id: 1004, nome: "Eliminatórias (Europa)", pais: "Europa", tipo: "Liga", modoRegistro: "liga", logo: "", trofeu: '' }
        ]
    },
    {
        id: 'nc_africa',
        continente: "África",
        logo_continente: "",
        competicoes: [
            { id: 1005, nome: "Copa da África", pais: "África", tipo: "Copa", modoRegistro: "participantes", logo: 'logos/competitions/copa_africa.png', trofeu: 'trofeu-copaafrica' },
            { id: 1006, nome: "Eliminatórias (África)", pais: "África", tipo: "Liga", modoRegistro: "liga", logo: "", trofeu: '' }
        ]
    },
    {
        id: 'nc_asia',
        continente: "Ásia - Oceania",
        logo_continente: "",
        competicoes: [
            { id: 1007, nome: "Copa da Ásia", pais: "Ásia", tipo: "Copa", modoRegistro: "participantes", logo: 'logos/competitions/copa_asia_oceania.png', trofeu: 'trofeu-copaasiaoceania' },
            { id: 1008, nome: "Eliminatórias (Ásia)", pais: "Ásia", tipo: "Liga", modoRegistro: "liga", logo: "", trofeu: '' }
        ]
    },
    {
        id: 'nc_mundo',
        continente: "Mundial",
        logo_continente: "",
        competicoes: [
            { id: 1009, nome: "COPA DO MUNDO", pais: "Mundo", tipo: "Copa", modoRegistro: "mundial", logo: 'logos/competitions/copa_mundo.png', trofeu: 'trofeu-copadomundo' }
        ]
    }
];
