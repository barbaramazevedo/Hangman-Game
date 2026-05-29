let currentWord = "";
let guessedLetters = [];
let wrongLetters = [];
let attemptsLeft = 6;
let gameActive = false;
let currentPlayer = null;
let currentDefinition = "";
let hintsUsed = 0;

const MAX_ATTEMPTS = 6;

const HANGMAN_PARTS = [
    "hangman-head",
    "hangman-body",
    "hangman-left-arm",
    "hangman-right-arm",
    "hangman-left-leg",
    "hangman-right-leg"
];


function fetchWord() {
    return getRandomWord();
}

async function startRound(playerName) {
    currentPlayer = playerName;
    guessedLetters = [];
    wrongLetters = [];
    attemptsLeft = MAX_ATTEMPTS;
    gameActive = false;

    hintsUsed = 0;

    resetHangman();
    resetKeyboard();
    clearWrongLetters();
    clearWordDisplay();
    updateAttemptsDisplay();

    const wordData = fetchWord();

    currentWord = wordData.word;
    currentDefinition = wordData.definition;
    document.getElementById("word-category").textContent = wordData.category;

    gameActive = true;

    hideAllStatuses();
    document.getElementById("hint-text").classList.add("hidden");
    document.getElementById("hint-btn").disabled = false;
    document.getElementById("hint-btn").textContent = "💡 Hint (−1 attempt) [2 left]";
    renderWordDisplay();
}

function checkLetter(letter) {
    if (!gameActive) return;
    if (guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);

    const keyBtn = document.querySelector(`.key-btn[data-letter="${letter}"]`);
    if (keyBtn) keyBtn.disabled = true;

    if (currentWord.includes(letter)) {
        if (keyBtn) keyBtn.classList.add("key-correct");
        renderWordDisplay();

        if (checkVictory()) {
            gameActive = false;
            addMatchToHistory(currentPlayer, currentWord, true);
            updateScore(currentPlayer, true);
            refreshPlayerUI(currentPlayer);
            showStatus("win");
            disableKeyboard();
        }
    } else {
        if (keyBtn) keyBtn.classList.add("key-wrong");
        wrongLetters.push(letter);
        attemptsLeft--;

        updateAttemptsDisplay();
        addWrongLetterChip(letter);
        revealHangmanPart();

        if (attemptsLeft === 0) {
            gameActive = false;
            addMatchToHistory(currentPlayer, currentWord, false);
            updateScore(currentPlayer, false);
            refreshPlayerUI(currentPlayer);
            document.getElementById("revealed-word").textContent = currentWord;
            showStatus("lose");
            disableKeyboard();
        }
    }
}

function checkVictory() {
    return currentWord.split("").every(letter => guessedLetters.includes(letter));
}

function renderWordDisplay() {
    const container = document.getElementById("word-display");
    container.innerHTML = "";

    currentWord.split("").forEach(function(letter, index) {
        const slot = document.createElement("span");
        slot.classList.add("letter-slot");
        slot.dataset.index = index;

        if (guessedLetters.includes(letter)) {
            slot.classList.add("revealed");
            slot.textContent = letter;
        }

        container.appendChild(slot);
    });
}

function clearWordDisplay() {
    document.getElementById("word-display").innerHTML = "";
}

function revealHangmanPart() {
    const partIndex = MAX_ATTEMPTS - attemptsLeft - 1;
    const partId = HANGMAN_PARTS[partIndex];
    if (partId) {
        document.getElementById(partId).classList.add("visible");
    }
}

function resetHangman() {
    HANGMAN_PARTS.forEach(function(id) {
        document.getElementById(id).classList.remove("visible");
    });
}

function updateAttemptsDisplay() {
    document.getElementById("attempts-remaining").textContent = attemptsLeft;

    document.querySelectorAll(".attempt-dot").forEach(function(dot) {
        const dotNum = parseInt(dot.dataset.dot);
        if (dotNum > attemptsLeft) {
            dot.classList.add("used");
        } else {
            dot.classList.remove("used");
        }
    });
}

function addWrongLetterChip(letter) {
    const container = document.getElementById("wrong-letters-container");
    const chip = document.createElement("span");
    chip.classList.add("wrong-letter-chip");
    chip.textContent = letter;
    container.appendChild(chip);
}

function clearWrongLetters() {
    document.getElementById("wrong-letters-container").innerHTML = "";
}

function resetKeyboard() {
    document.querySelectorAll(".key-btn").forEach(function(btn) {
        btn.disabled = false;
        btn.classList.remove("key-correct", "key-wrong");
    });
}

function disableKeyboard() {
    document.querySelectorAll(".key-btn").forEach(function(btn) {
        btn.disabled = true;
    });
}

function showStatus(type) {
    hideAllStatuses();
    const el = document.getElementById("status-" + type);
    if (el) el.classList.remove("hidden");
}

function hideAllStatuses() {
    ["loading", "win", "lose", "error"].forEach(function(type) {
        const el = document.getElementById("status-" + type);
        if (el) el.classList.add("hidden");
    });
}

function useHint() {
    if (!gameActive) return;
    if (hintsUsed >= 2) return;
    if (attemptsLeft <= 1) {
        alert("Not enough attempts to use a hint!");
        return;
    }

    hintsUsed++;
    attemptsLeft--;
    updateAttemptsDisplay();
    revealHangmanPart();

    const btn = document.getElementById("hint-btn");

    if (hintsUsed === 1) {
        const hintText = document.getElementById("hint-text");
        hintText.textContent = currentDefinition;
        hintText.classList.remove("hidden");
        btn.textContent = "💡 Hint (−1 attempt) [1 left]";
    } else {
        const hidden = currentWord.split("").filter(l => !guessedLetters.includes(l));
        if (hidden.length > 0) {
            const letter = hidden[Math.floor(Math.random() * hidden.length)];
            checkLetter(letter);
        }
        btn.disabled = true;
        btn.textContent = "💡 Hint (no uses left)";
    }
}

function refreshPlayerUI(name) {
    const player = searchPlayer(name);
    if (!player) return;

    document.getElementById("player-score").textContent   = player.score;
    document.getElementById("player-wins").textContent    = player.wins;
    document.getElementById("player-losses").textContent  = player.losses;
    document.getElementById("player-matches").textContent = player.matches;

    renderizarRanking();
}
