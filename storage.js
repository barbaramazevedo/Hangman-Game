function savePlayers(players) {
    localStorage.setItem("players", JSON.stringify(players));
}

function loadPlayers() {
    const data = localStorage.getItem("players");
    return data ? JSON.parse(data) : [];
}

function salvarHistorico() {

}

function carregarHistorico() {

}

function limparHistorico() {

}

function limparRanking() {
    
}