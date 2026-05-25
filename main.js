function registerEvents() {
    const playerNameInput = document.getElementById("player-name-input");
    const btnConfirm = document.getElementById("confirm-player-btn");
    const btnStartGame = document.getElementById("start-game-btn");
    const playerInputSection = document.getElementById("player-input-section");
    const playerConfirmedSection = document.getElementById("player-confirmed-section");
    const confirmedPlayerName = document.getElementById("confirmed-player-name");

    function onConfirmPlayer() {
        const name = capitalizeText(playerNameInput.value.trim());

        if (!name) {
            alert("Please enter a name.");
            return;
        }

        const success = registerPlayer(name);

        if (success) {
            playerInputSection.classList.add("hidden");
            confirmedPlayerName.textContent = name;
            playerConfirmedSection.classList.remove("hidden");
        }
    }

    function onStartGame() {
        // iniciar jogo
    }

    btnConfirm.addEventListener("click", onConfirmPlayer);
    playerNameInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            onConfirmPlayer();
        }
    });
    btnStartGame.addEventListener("click", onStartGame);
}

registerEvents();