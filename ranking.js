function sortRanking() {
    return loadPlayers().sort((a, b) => b.score - a.score);
}

function createRowRanking(player, position) {
    return `<tr class="ranking-row">
        <td class="col-rank"><span class="rank-badge">${position}</span></td>
        <td class="col-player">${player.name}</td>
        <td class="col-score">${player.score}</td>
        <td class="col-wins">${player.wins}</td>
        <td class="col-losses">${player.losses}</td>
        <td class="col-matches">${player.matches}</td>
    </tr>`;
}

function renderizarRanking() {
    const players = sortRanking();
    const list = document.getElementById("ranking-list");
    const empty = document.getElementById("ranking-empty");

    if (players.length === 0) {
        list.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");
    list.innerHTML = players.map((p, i) => createRowRanking(p, i + 1)).join("");
}

function updateLeaderboard() {
    const top3 = sortRanking().slice(0, 3);
    const list = document.getElementById("ranking-list");
    const empty = document.getElementById("ranking-empty");

    if (top3.length === 0) {
        list.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");
    list.innerHTML = top3.map((p, i) => createRowRanking(p, i + 1)).join("");
}
