let currentWord = "";
let guessedLetters = [];
let wrongLetters = [];
let attempts = 6;
let currentPlayerName = null;

/* =========================
   PLAYER
   ========================= */
function setCurrentPlayer(name) {
    currentPlayerName = name;
}

/* =========================
   START ROUND
   ========================= */
async function startRound() {
    showStatus("loading");

    currentWord = await fetchWord();

    if (!currentWord) {
        showStatus("error");
        return;
    }

    guessedLetters = [];
    wrongLetters = [];
    attempts = 6;

    resetUI();
    updateWordDisplay(currentWord, guessedLetters);
    updateAttempts(attempts);
    updateHangman(0);
    updateWrongLetters([]);
    resetKeyboard();

    showStatus("loading");
}

/* =========================
   GUESS LETTER (CORE)
   ========================= */
function guessLetter(letter, button = null) {
    if (!currentWord) return;

    letter = letter.toLowerCase();

    if (
        guessedLetters.includes(letter) ||
        wrongLetters.includes(letter)
    ) return;

    let isCorrect = false;

    if (currentWord.includes(letter)) {
        guessedLetters.push(letter);
        isCorrect = true;
    } else {
        wrongLetters.push(letter);
        attempts--;
    }

    // UI updates (Pessoa 2)
    updateWordDisplay(currentWord, guessedLetters);
    updateWrongLetters(wrongLetters);
    updateAttempts(attempts);
    updateHangman(6 - attempts);

    if (button) {
        updateKeyboard(letter, isCorrect ? "correct" : "wrong");
    }

    checkGameEnd();
}

/* =========================
   WRAPPER (MAIN.JS CALLS THIS)
   ========================= */
function handleGuess(letter, button) {
    guessLetter(letter, button);
}

/* =========================
   GAME END
   ========================= */
function checkGameEnd() {
    const won = currentWord
        .split("")
        .every(l => guessedLetters.includes(l));

    if (won) {
        finishRound(true);
        return;
    }

    if (attempts <= 0) {
        finishRound(false);
        return;
    }
}

/* =========================
   FINISH ROUND
   ========================= */
function finishRound(won) {
    updateScore(currentPlayerName, won);

    const history = loadHistory();

    history.push({
        player: currentPlayerName,
        word: currentWord,
        result: won ? "Victory" : "Defeat",
        date: formatDate()
    });

    saveHistory(history);

    renderizarRanking();
    renderHistory();

    showStatus(won ? "win" : "lose", currentWord);

    setTimeout(() => {
        alert(won ? "You won!" : "You lost!");
    }, 300);
}

/* =========================
   RESET GAME
   ========================= */
function resetGame() {
    currentWord = "";
    guessedLetters = [];
    wrongLetters = [];
    attempts = 6;

    resetUI();
}