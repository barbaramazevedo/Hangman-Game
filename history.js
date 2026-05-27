function addMatchToHistory(playerName, word, won) {
    const history = loadHistory();
    history.push({
        player: playerName,
        word: word,
        won: won,
        score: won ? 10 : -5,
        date: new Date().toISOString()
    });
    saveHistory(history);
}

function createHistoryCard(match) {
    const resultClass = match.won ? "result-win" : "result-lose";
    const badgeClass  = match.won ? "win" : "lose";
    const badgeText   = match.won ? "WIN" : "LOSE";
    const scoreText   = match.won ? `+${match.score} pts` : `${match.score} pts`;

    return `<article class="history-card ${resultClass}">
        <div class="history-card-header">
            <span class="history-player-name">${match.player}</span>
            <span class="history-result-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="history-card-body">
            <span class="history-word-label">Word:</span>
            <span class="history-word-value">${match.word}</span>
        </div>
        <div class="history-card-footer">
            <span class="history-score">${scoreText}</span>
            <span class="history-date">${formatDate(new Date(match.date))}</span>
        </div>
    </article>`;
}

function renderHistory() {
    const filterText   = document.getElementById("history-filter-input").value.toLowerCase();
    const filterResult = document.getElementById("history-filter-result").value;

    let matches = loadHistory();

    if (filterText) {
        matches = matches.filter(m =>
            m.player.toLowerCase().includes(filterText) ||
            m.word.toLowerCase().includes(filterText)
        );
    }

    if (filterResult !== "all") {
        matches = matches.filter(m => filterResult === "win" ? m.won : !m.won);
    }

    const list  = document.getElementById("history-list");
    const empty = document.getElementById("history-empty");

    if (matches.length === 0) {
        list.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");
    list.innerHTML = matches.map(createHistoryCard).join("");
}
