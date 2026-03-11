export const MOCK_DATA = {
    continentes: ["América do Sul", "Europa", "América do Norte/Central", "África", "Ásia", "Oceania", "Internacional"],

    paises: [
        { nome: "Brasil", bandeira: "https://flagcdn.com/w80/br.png", continente: "América do Sul" },
        { nome: "Argentina", bandeira: "https://flagcdn.com/w80/ar.png", continente: "América do Sul" },
        { nome: "Venezuela", bandeira: "https://flagcdn.com/w80/ve.png", continente: "América do Sul" },
        { nome: "Inglaterra", bandeira: "https://flagcdn.com/w80/gb-eng.png", continente: "Europa" },
        { nome: "Espanha", bandeira: "https://flagcdn.com/w80/es.png", continente: "Europa" },
        { nome: "Itália", bandeira: "https://flagcdn.com/w80/it.png", continente: "Europa" },
        { nome: "Alemanha", bandeira: "https://flagcdn.com/w80/de.png", continente: "Europa" },
        { nome: "França", bandeira: "https://flagcdn.com/w80/fr.png", continente: "Europa" },
        { nome: "Portugal", bandeira: "https://flagcdn.com/w80/pt.png", continente: "Europa" }
    ],

    competicoesBase: [
        {
            nome: "Brasileirão Série A",
            logo: "https://logodownload.org/wp-content/uploads/2017/05/brasileirao-logo-0.png",
            trofeu: "https://upload.wikimedia.org/wikipedia/pt/2/2b/Trofeu_Brasileirao.png",
            tipo: "Liga"
        },
        {
            nome: "UEFA Champions League",
            logo: "https://upload.wikimedia.org/wikipedia/pt/f/f3/Logo_UEFA_Champions_League.png",
            trofeu: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/UEFA_Champions_League_trophy.png/150px-UEFA_Champions_League_trophy.png",
            tipo: "Competição continental"
        },
        {
            nome: "Copa do Mundo",
            logo: "https://upload.wikimedia.org/wikipedia/pt/d/d3/FIFA_World_Cup_logo.png",
            trofeu: "https://upload.wikimedia.org/wikipedia/pt/d/d3/FIFA_World_Cup_trophy.png",
            tipo: "Seleções"
        }
    ],

    tiposCompeticao: [
        "Liga", "Copa", "Supercopa", "Competição continental", "Seleções"
    ]
};
