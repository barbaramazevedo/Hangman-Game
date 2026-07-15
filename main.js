/* =========================================================
   GLOBAL STATE
   ========================================================= */
let currentPlayerGlobal = null;

function resetPlayerForm() {
    const playerNameInput     = document.getElementById("player-name-input");
    const playerInputSection  = document.getElementById("player-input-section");
    const playerConfirmedSection = document.getElementById("player-confirmed-section");
    const cardTitle           = document.querySelector("#player-form-card .card-title");

    playerNameInput.value = "";
    playerConfirmedSection.classList.add("hidden");
    playerInputSection.classList.remove("hidden");
    cardTitle.classList.remove("hidden");
}

/* =========================================================
   PLAYER FORM (EXISTENTE + AJUSTADO)
   ========================================================= */
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

        document.getElementById("stat-wins").textContent =
            player ? player.wins : 0;
        document.getElementById("stat-losses").textContent =
            player ? player.losses : 0;
        document.getElementById("stat-matches").textContent =
            player ? player.matches : 0;
        document.getElementById("stat-score").textContent =
            player ? player.score : 0;

        cardTitle.classList.add("hidden");
        playerInputSection.classList.add("hidden");
        confirmedPlayerName.textContent = name;
        playerConfirmedSection.classList.remove("hidden");
    }

    function onStartGame() {
        registerPlayer(confirmedName);
        currentPlayerGlobal = confirmedName;

        showScreen("game-screen");
        startRound(confirmedName);
    }

    function onChangeName() {
        resetPlayerForm();
    }

    btnConfirm.addEventListener("click", onConfirmPlayer);
    playerNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") onConfirmPlayer();
    });

    btnStartGame.addEventListener("click", onStartGame);
    btnChangeName.addEventListener("click", onChangeName);
    document.querySelectorAll(".key-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            checkLetter(btn.dataset.letter);
        });
    });
    document.getElementById("hint-btn").addEventListener("click", useHint);
}

/* ==================================================