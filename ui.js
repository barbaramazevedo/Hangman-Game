// ===============================
// UI CONTROLLER (Pessoa 2)
// ===============================

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function updateWordDisplay(word, guessedLetters = []) {
    const container = document.getElementById("word-display");
    container.innerHTML = "";

    word.split("").forEach((letter, index) => {
        const span = document.createElement("span");
        span.classList.add("letter-slot");

        if (letter === " ") {
            span.classList.add("space");
        } else if (guessedLetters.includes(letter.toLowerCase())) {
            span.classList.add("revealed");
            span.textContent = letter.toUpperCase();
        } else {
            span.textContent = "";
        }

        container.appendChild(span);
    });
}

function updateKeyboard(letter, status) {
    const btn = document.querySelector(`[data-letter="${letter.toUpperCase()}"]`);
    if (!btn) return;

    btn.disabled = true;

    if (status === "correct") btn.classList.add("key-correct");
    if (status === "wrong") btn.classList.add("key-wrong");
}

function resetKeyboard() {
    document.querySelectorAll(".key-btn").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("key-correct", "key-wrong");
    });
}

function updateWrongLetters(letters) {
    const container = document.getElementById("wrong-letters-container");
    container.innerHTML = "";

    letters.forEach(l => {
        const span = document.createElement("span");
        span.classList.add("wrong-letter-chip");
        span.textContent = l.toUpperCase();
        container.appendChild(span);
    });
}

function updateAttempts(remaining) {
    document.getElementById("attempts-remaining").textContent = remaining;

    const dots = document.querySelectorAll(".attempt-dot");
    dots.forEach((dot, index) => {
        dot.classList.toggle("used", index >= remaining);
    });
}

function updateHangman(errors) {
    const parts = [
        "hangman-head",
        "hangman-body",
        "hangman-left-arm",
        "hangman-right-arm",
        "hangman-left-leg",
        "hangman-right-leg"
    ];

    parts.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        if (index < errors) {
            el.classList.add("visible");
        } else {
            el.classList.remove("visible");
        }
    });
}

function showStatus(type, word = "") {
    document.querySelectorAll(".status-message").forEach(el => el.classList.add("hidden"));

    const map = {
        loading: "status-loading",
        win: "status-win",
        lose: "status-lose",
        error: "status-error"
    };

    const el = document.getElementById(map[type]);
    if (el) el.classList.remove("hidden");

    if (type === "lose" && word) {
        document.getElementById("revealed-word").textContent = word.toUpperCase();
    }
}

function resetUI() {
    resetKeyboard();
    updateWrongLetters([]);
    updateAttempts(6);
    updateHangman(0);
    document.getElementById("word-display").innerHTML = "";
    document.querySelectorAll(".status-message").forEach(el => el.classList.add("hidden"));
}