function registerPlayerFormEvents() {
    const playerNameInput = document.getElementById("player-name-input");
    const btnConfirm = document.getElementById("confirm-player-btn");
    const btnStartGame = document.getElementById("start-game-btn");
    const btnChangeName = document.getElementById("change-player-btn");
    const playerInputSection = document.getElementById("player-input-section");
    const playerConfirmedSection = document.getElementById("player-confirmed-section");
    const confirmedPlayerName = document.getElementById("confirmed-player-name");
    const cardTitle = document.querySelector("#player-form-card .card-title");

    let confirmedName = null;

    function onConfirmPlayer() {
        const name = capitalizeText(playerNameInput.value.trim());

        if (!name) {
            alert("Please enter a name.");
            return;
        }

        confirmedName = name;

        const player = searchPlayer(name);
        document.getElementById("stat-wins").textContent    = player ? player.wins    : 0;
        document.getElementById("stat-losses").textContent  = player ? player.losses  : 0;
        document.getElementById("stat-matches").textContent = player ? player.matches : 0;
        document.getElementById("stat-score").textContent   = player ? player.score   : 0;

        cardTitle.classList.add("hidden");
        playerInputSection.classList.add("hidden");
        confirmedPlayerName.textContent = name;
        playerConfirmedSection.classList.remove("hidden");
    }

    function onStartGame() {
        registerPlayer(confirmedName);
        // iniciar jogo
    }

    function onChangeName() {
        playerNameInput.value = "";
        playerConfirmedSection.classList.add("hidden");
        playerInputSection.classList.remove("hidden");
        cardTitle.classList.remove("hidden");
    }

    btnConfirm.addEventListener("click", onConfirmPlayer);
    playerNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") onConfirmPlayer();
    });
    btnStartGame.addEventListener("click", onStartGame);
    btnChangeName.addEventListener("click", onChangeName);
}

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
        s.classList.add("hidden");
    });
    const target = document.getElementById(screenId);
    target.classList.remove("hidden");
    target.classList.add("active");
}

function registerRankingEvents() {
    document.getElementById("view-ranking-btn").addEventListener("click", () => {
        renderizarRanking();
        showScreen("ranking-screen");
    });

    document.getElementById("back-from-ranking-btn").addEventListener("click", () => {
        showScreen("welcome-screen");
    });

    document.getElementById("clear-ranking-btn").addEventListener("click", () => {
        if (!confirm("Clear all ranking data? This cannot be undone.")) return;
        clearRanking();
        renderizarRanking();
    });
}

function registerMatchHistory() {
    document.getElementById("view-history-btn").addEventListener("click", () => {
        renderHistory();
        showScreen("history-screen");
    });

    document.getElementById("back-from-history-btn").addEventListener("click", () => {
        showScreen("welcome-screen");
    });

    document.getElementById("clear-history-btn").addEventListener("click", () => {
        if (!confirm("Clear all match history? This cannot be undone.")) return;
        clearHistory();
        renderHistory();
    });

    document.getElementById("history-filter-input").addEventListener("input", renderHistory);
    document.getElementById("history-filter-result").addEventListener("change", renderHistory);
}

function registerEvents() {
    registerPlayerFormEvents();
    registerRankingEvents();
    registerMatchHistory();
}

registerEvents();
