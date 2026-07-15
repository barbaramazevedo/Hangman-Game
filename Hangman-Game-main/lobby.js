/* =========================================================
   LOBBY — Multiplayer logic via Socket.IO
   ========================================================= */

const BACKEND_URL = "http://localhost:3000";

const MP_HANGMAN_PARTS = [
    "mp-hangman-head",
    "mp-hangman-body",
    "mp-hangman-left-arm",
    "mp-hangman-right-arm",
    "mp-hangman-left-leg",
    "mp-hangman-right-leg"
];

let mpSocket = null;
let mpToken  = null;
let mpUserId = null;
let mpUsername = null;
let mpRoomCode = null;
let mpIsHost   = false;
let mpWrongCount = 0;

/* ─── AUTH ─────────────────────────────────────────────────── */

async function mpRegister() {
    const username = document.getElementById("mp-username-input").value.trim();
    const email    = document.getElementById("mp-email-input").value.trim();
    const password = document.getElementById("mp-password-input").value;

    console.log("Register attempt:", { username, email, password: password ? "***" : "(empty)" });

    if (!username || !email || !password) return mpAuthError("Fill in all fields: username, email and password.");
    if (username.length < 3) return mpAuthError("Username must be at least 3 characters.");
    if (password.length < 6) return mpAuthError("Password must be at least 6 characters.");

    try {
        const res = await fetch(`${BACKEND_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            const msg = typeof data.error === "string"
                ? data.error
                : Object.values(data.error).flat().join(" ");
            return mpAuthError(msg);
        }
        mpAuthSuccess("Account created! You can now login.");
    } catch {
        mpAuthError("Cannot reach the server.");
    }
}

async function mpLogin() {
    const email    = document.getElementById("mp-email-input").value.trim();
    const password = document.getElementById("mp-password-input").value;

    if (!email || !password) return mpAuthError("Enter email and password.");

    try {
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            const msg = typeof data.error === "string"
                ? data.error
                : Object.values(data.error).flat().join(" ");
            return mpAuthError(msg);
        }
        mpToken    = data.token;
        mpUserId   = data.user.user_id;
        mpUsername = data.user.username;

        mpConnectSocket();
        showScreen("multiplayer-lobby-screen");
        document.getElementById("lobby-username-badge").textContent = mpUsername;
    } catch {
        mpAuthError("Cannot reach the server.");
    }
}

function mpAuthError(msg) {
    const el = document.getElementById("mp-auth-error");
    el.textContent = msg;
    el.classList.remove("hidden");
    document.getElementById("mp-auth-success").classList.add("hidden");
}

function mpAuthSuccess(msg) {
    const el = document.getElementById("mp-auth-success");
    el.textContent = msg;
    el.classList.remove("hidden");
    document.getElementById("mp-auth-error").classList.add("hidden");
}

/* ─── SOCKET CONNECTION ─────────────────────────────────────── */

function mpConnectSocket() {
    if (mpSocket) mpSocket.disconnect();

    mpSocket = io(BACKEND_URL, { auth: { token: mpToken } });

    mpSocket.on("connect", () => console.log("Socket connected:", mpSocket.id));
    mpSocket.on("error",   (e) => mpShowLobbyError(e.message));

    mpSocket.on("room_created",  onRoomCreated);
    mpSocket.on("room_joined",   onRoomJoined);
    mpSocket.on("player_joined", onPlayerJoined);
    mpSocket.on("player_left",   onPlayerLeft);
    mpSocket.on("game_started",  onGameStarted);
    mpSocket.on("letter_guessed", onLetterGuessed);
    mpSocket.on("turn_changed",  onTurnChanged);
    mpSocket.on("game_over",     onGameOver);
}

/* ─── ROOM ACTIONS ──────────────────────────────────────────── */

function mpCreateRoom() {
    if (!mpSocket) return;
    const maxPlayers = parseInt(document.getElementById("lobby-max-players").value);
    mpSocket.emit("create_room", { maxPlayers });
}

function mpJoinRoom() {
    if (!mpSocket) return;
    const code = document.getElementById("lobby-room-code-input").value.trim().toUpperCase();
    if (!code) return mpShowLobbyError("Enter a room code.");
    mpSocket.emit("join_room", { roomCode: code });
}

function mpLeaveRoom() {
    if (mpSocket && mpRoomCode) {
        mpSocket.emit("leave_room", { roomCode: mpRoomCode });
    }
    mpRoomCode = null;
    mpIsHost   = false;
    document.getElementById("lobby-room-panel").classList.add("hidden");
    document.getElementById("lobby-start-btn").classList.add("hidden");
}

function mpStartGame() {
    if (mpSocket && mpRoomCode) {
        mpSocket.emit("start_game", { roomCode: mpRoomCode });
    }
}

/* ─── SOCKET EVENT HANDLERS ─────────────────────────────────── */

function onRoomCreated(room) {
    mpRoomCode = room.roomCode;
    mpIsHost   = true;
    renderLobbyRoom(room);
    document.getElementById("lobby-start-btn").classList.remove("hidden");
}

function onRoomJoined(room) {
    mpRoomCode = room.roomCode;
    mpIsHost   = (room.hostUserId === mpUserId);
    renderLobbyRoom(room);
    if (mpIsHost) document.getElementById("lobby-start-btn").classList.remove("hidden");
}

function onPlayerJoined(data) {
    renderLobbyRoom(data.room);
}

function onPlayerLeft(data) {
    renderLobbyRoom(data.room);
}

function onGameStarted(data) {
    const room = data.room;
    mpWrongCount = 0;

    showScreen("multiplayer-game-screen");
    document.getElementById("mp-room-code-topbar").textContent = room.roomCode;
    document.getElementById("mp-word-category").textContent = "---";

    mpResetHangman();
    mpRenderWordDisplay(room.maskedWord);
    mpRenderPlayersStatus(room.players);
    mpUpdateTurnBadge(data.turnUserId, room.players);
    mpEnableKeyboard(data.turnUserId === mpUserId);

    document.getElementById("mp-status-waiting").classList.add("hidden");
    document.getElementById("mp-status-win").classList.add("hidden");
    document.getElementById("mp-status-lose").classList.add("hidden");
}

function onLetterGuessed(data) {
    mpRenderWordDisplay(data.maskedWord);

    if (!data.isCorrect) {
        mpWrongCount++;
        mpRevealHangmanPart(mpWrongCount);
    }

    if (data.playerEliminated) {
        const el = document.querySelector(`[data-mp-user="${data.userId}"] .mp-player-lives`);
        if (el) el.textContent = "💀 Eliminated";
    }
}

function onTurnChanged(data) {
    const myTurn = data.nextTurnUserId === mpUserId;
    mpEnableKeyboard(myTurn);

    const badge = document.getElementById("mp-turn-badge");
    if (myTurn) {
        badge.textContent = "Your turn!";
        badge.classList.add("mp-turn-mine");
    } else {
        badge.textContent = "Opponent's turn";
        badge.classList.remove("mp-turn-mine");
    }
}

function onGameOver(data) {
    mpEnableKeyboard(false);

    const isWinner = data.winners.some(w => w.userId === mpUserId);
    document.getElementById("mp-revealed-word").textContent = data.word;

    if (isWinner) {
        const names = data.winners.map(w => w.username).join(", ");
        document.getElementById("mp-win-text").textContent = `🎉 ${names} won!`;
        document.getElementById("mp-status-win").classList.remove("hidden");
    } else {
        document.getElementById("mp-lose-text").textContent = "Game over! Nobody got it.";
        document.getElementById("mp-status-lose").classList.remove("hidden");
    }

    document.getElementById("mp-turn-badge").textContent = "Game over";
    document.getElementById("mp-turn-badge").classList.remove("mp-turn-mine");
}

/* ─── RENDER HELPERS ────────────────────────────────────────── */

function renderLobbyRoom(room) {
    const panel = document.getElementById("lobby-room-panel");
    panel.classList.remove("hidden");

    document.getElementById("lobby-room-code-display").textContent = room.roomCode;
    document.getElementById("lobby-room-status-badge").textContent =
        room.status === "waiting" ? "Waiting" : room.status === "in_progress" ? "In Progress" : "Finished";

    const list = document.getElementById("lobby-players-list");
    list.innerHTML = room.players.map(p => `
        <div class="lobby-player-row">
            <span class="lobby-player-name">${p.username}</span>
            ${p.userId === room.hostUserId ? '<span class="lobby-host-badge">HOST</span>' : ""}
        </div>
    `).join("");

    mpShowLobbyError("");
}

function mpRenderPlayersStatus(players) {
    const container = document.getElementById("mp-players-status");
    container.innerHTML = players.map(p => `
        <div class="mp-player-card" data-mp-user="${p.userId}">
            <span class="mp-player-name">${p.username}</span>
            <span class="mp-player-lives">${"❤️".repeat(p.livesLeft)}</span>
        </div>
    `).join("");
}

function mpUpdateTurnBadge(turnUserId, players) {
    const badge = document.getElementById("mp-turn-badge");
    const myTurn = turnUserId === mpUserId;
    if (myTurn) {
        badge.textContent = "Your turn!";
        badge.classList.add("mp-turn-mine");
    } else {
        const player = players.find(p => p.userId === turnUserId);
        badge.textContent = player ? `${player.username}'s turn` : "Opponent's turn";
        badge.classList.remove("mp-turn-mine");
    }
}

function mpRenderWordDisplay(masked) {
    const container = document.getElementById("mp-word-display");
    container.innerHTML = "";
    if (!masked) return;
    masked.split("").forEach(ch => {
        const slot = document.createElement("span");
        slot.classList.add("letter-slot");
        if (ch !== "_") {
            slot.classList.add("revealed");
            slot.textContent = ch;
        }
        container.appendChild(slot);
    });
}

function mpEnableKeyboard(enabled) {
    document.querySelectorAll("#mp-virtual-keyboard .key-btn").forEach(btn => {
        btn.disabled = !enabled;
    });
}

function mpRevealHangmanPart(wrongCount) {
    const partId = MP_HANGMAN_PARTS[wrongCount - 1];
    if (partId) document.getElementById(partId)?.classList.add("visible");
}

function mpResetHangman() {
    MP_HANGMAN_PARTS.forEach(id => document.getElementById(id)?.classList.remove("visible"));
}

function mpShowLobbyError(msg) {
    const el = document.getElementById("lobby-error");
    if (msg) {
        el.textContent = msg;
        el.classList.remove("hidden");
    } else {
        el.classList.add("hidden");
    }
}

/* ─── GUESS FROM MP KEYBOARD ────────────────────────────────── */

function mpGuessLetter(letter) {
    if (mpSocket && mpRoomCode) {
        mpSocket.emit("guess_letter", { roomCode: mpRoomCode, letter });
        const btn = document.querySelector(`#mp-virtual-keyboard .key-btn[data-letter="${letter}"]`);
        if (btn) btn.disabled = true;
    }
}

/* ─── REGISTER LOBBY EVENTS ─────────────────────────────────── */

function registerLobbyEvents() {
    document.getElementById("view-multiplayer-btn").addEventListener("click", () => {
        showScreen("multiplayer-login-screen");
    });

    document.getElementById("back-from-multiplayer-btn").addEventListener("click", () => {
        showScreen("welcome-screen");
    });

    document.getElementById("mp-login-btn").addEventListener("click", mpLogin);
    document.getElementById("mp-register-btn").addEventListener("click", mpRegister);

    document.getElementById("mp-username-input").addEventListener("keydown", e => {
        if (e.key === "Enter") mpLogin();
    });
    document.getElementById("mp-password-input").addEventListener("keydown", e => {
        if (e.key === "Enter") mpLogin();
    });

    document.getElementById("lobby-create-btn").addEventListener("click", mpCreateRoom);
    document.getElementById("lobby-join-btn").addEventListener("click", mpJoinRoom);
    document.getElementById("lobby-room-code-input").addEventListener("keydown", e => {
        if (e.key === "Enter") mpJoinRoom();
    });
    document.getElementById("lobby-start-btn").addEventListener("click", mpStartGame);
    document.getElementById("lobby-leave-btn").addEventListener("click", () => {
        mpLeaveRoom();
    });
    document.getElementById("lobby-back-btn").addEventListener("click", () => {
        mpLeaveRoom();
        if (mpSocket) mpSocket.disconnect();
        showScreen("welcome-screen");
    });

    document.getElementById("mp-game-leave-btn").addEventListener("click", () => {
        mpLeaveRoom();
        if (mpSocket) mpSocket.disconnect();
        showScreen("welcome-screen");
    });

    document.getElementById("mp-play-again-btn").addEventListener("click", () => {
        showScreen("multiplayer-lobby-screen");
    });
    document.getElementById("mp-play-again-btn2").addEventListener("click", () => {
        showScreen("multiplayer-lobby-screen");
    });

    document.getElementById("mp-virtual-keyboard").addEventListener("click", e => {
        const btn = e.target.closest(".key-btn");
        if (!btn || btn.disabled) return;
        btn.classList.add("key-wrong");
        mpGuessLetter(btn.dataset.letter);
    });
}
