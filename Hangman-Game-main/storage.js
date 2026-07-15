function savePlayers(players) {
    localStorage.setItem("players", JSON.stringify(players));
}

function loadPlayers() {
    const data = localStorage.getItem("players");
    return data ? JSON.parse(data) : [];
}

function saveHistory(history) {
    localStorage.setItem("history", JSON.stringify(history));
}

function loadHistory() {
    const data = localStorage.getItem("history");
    return data ? JSON.parse(data) : [];
}

function clearHistory() {
    localStorage.removeItem("history");
}

function clearRanking() {
    localStorage.removeItem("players");
}
