function registerPlayer(name) {
    if (!name) return false;

    const alreadyExists = searchPlayer(name);
    if (alreadyExists) return true;

    const players = loadPlayers();
    players.push({ name, wins: 0, losses: 0, matches: 0, score: 0 });
    savePlayers(players);
    return true;
}

function searchPlayer(name) {
    const players = loadPlayers();
    return players.find(j => j.name === name);
}

function atualizarPontuacao(nome, venceu) {
    
}


function obterJogadores() {
}