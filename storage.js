function savePlayers(players) {
    localStorage.setItem("players", JSON.stringify(players));
}

function loadPlayers() {
    const data = localStorage.getItem("players");
    return data ? JSON.parse(data) : [];
}

function saveHistory() {

}

function loadHistory() {

}

function clearHistory() {

}

function clearRanking() {
    
}