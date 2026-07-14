import db from "../db/database";
import { Game, GamePlayer, GuessAttempt } from "../models";

const MAX_WRONG = 6;

export interface RoomPlayer {
  userId: number;
  username: string;
  socketId: string;
  livesLeft: number;
  isAlive: boolean;
}

export interface RoomState {
  gameId: number;
  roomCode: string;
  status: "waiting" | "in_progress" | "finished";
  hostUserId: number;
  word: string;
  guessedLetters: string[];
  players: RoomPlayer[];
  turnIndex: number;
  maxPlayers: number;
}

// In-memory room store — persisted to DB on key state changes
const rooms = new Map<string, RoomState>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function pickWord(): { wordId: number; text: string } {
  const row = db
    .prepare("SELECT word_id, text FROM words ORDER BY RANDOM() LIMIT 1")
    .get() as { word_id: number; text: string } | undefined;

  if (!row) {
    // Fallback if words table is empty
    return { wordId: 0, text: "HANGMAN" };
  }
  return { wordId: row.word_id, text: row.text };
}

export function createRoom(hostUserId: number, username: string, socketId: string, maxPlayers = 4): RoomState {
  let roomCode = generateRoomCode();
  while (rooms.has(roomCode)) {
    roomCode = generateRoomCode();
  }

  const stmt = db.prepare(`
    INSERT INTO games (room_code, status, max_players, host_user_id)
    VALUES (?, 'waiting', ?, ?)
  `);
  const info = stmt.run(roomCode, maxPlayers, hostUserId);
  const gameId = info.lastInsertRowid as number;

  db.prepare(`
    INSERT INTO game_players (game_id, user_id) VALUES (?, ?)
  `).run(gameId, hostUserId);

  const room: RoomState = {
    gameId,
    roomCode,
    status: "waiting",
    hostUserId,
    word: "",
    guessedLetters: [],
    players: [
      {
        userId: hostUserId,
        username,
        socketId,
        livesLeft: MAX_WRONG,
        isAlive: true,
      },
    ],
    turnIndex: 0,
    maxPlayers,
  };

  rooms.set(roomCode, room);
  return room;
}

export function joinRoom(
  roomCode: string,
  userId: number,
  username: string,
  socketId: string
): { room: RoomState; error?: never } | { error: string; room?: never } {
  const room = rooms.get(roomCode);

  if (!room) return { error: "Room not found" };
  if (room.status !== "waiting") return { error: "Game already started" };
  if (room.players.length >= room.maxPlayers) return { error: "Room is full" };
  if (room.players.some((p) => p.userId === userId)) return { error: "Already in room" };

  db.prepare(`
    INSERT OR IGNORE INTO game_players (game_id, user_id) VALUES (?, ?)
  `).run(room.gameId, userId);

  room.players.push({
    userId,
    username,
    socketId,
    livesLeft: MAX_WRONG,
    isAlive: true,
  });

  return { room };
}

export function leaveRoom(roomCode: string, socketId: string): RoomState | null {
  const room = rooms.get(roomCode);
  if (!room) return null;

  const idx = room.players.findIndex((p) => p.socketId === socketId);
  if (idx === -1) return room;

  const [leaving] = room.players.splice(idx, 1);

  db.prepare(`
    UPDATE game_players SET left_at = datetime('now')
    WHERE game_id = ? AND user_id = ?
  `).run(room.gameId, leaving.userId);

  if (room.players.length === 0) {
    rooms.delete(roomCode);
    db.prepare("UPDATE games SET status = 'finished', finished_at = datetime('now') WHERE game_id = ?").run(room.gameId);
    return null;
  }

  // If host left, promote next player
  if (leaving.userId === room.hostUserId) {
    room.hostUserId = room.players[0].userId;
  }

  // Adjust turn index to avoid out-of-bounds
  if (room.turnIndex >= room.players.length) {
    room.turnIndex = 0;
  }

  return room;
}

export function startGame(roomCode: string, requesterId: number): { room: RoomState; error?: never } | { error: string; room?: never } {
  const room = rooms.get(roomCode);

  if (!room) return { error: "Room not found" };
  if (room.hostUserId !== requesterId) return { error: "Only the host can start the game" };
  if (room.status !== "waiting") return { error: "Game already started" };
  if (room.players.length < 2) return { error: "Need at least 2 players to start" };

  const { wordId, text } = pickWord();

  room.word = text.toUpperCase();
  room.guessedLetters = [];
  room.status = "in_progress";
  room.turnIndex = 0;
  room.players.forEach((p) => {
    p.livesLeft = MAX_WRONG;
    p.isAlive = true;
  });

  db.prepare(`
    UPDATE games
    SET status = 'playing', word_id = ?, started_at = datetime('now')
    WHERE game_id = ?
  `).run(wordId || null, room.gameId);

  return { room };
}

export interface GuessResult {
  letter: string;
  isCorrect: boolean;
  guessedLetters: string[];
  wordRevealed: boolean;
  playerLivesLeft: number;
  playerEliminated: boolean;
  gameOver: boolean;
  winners: RoomPlayer[];
  nextTurnUserId: number | null;
  room: RoomState;
}

export function guessLetter(
  roomCode: string,
  userId: number,
  letter: string
): GuessResult | { error: string } {
  const room = rooms.get(roomCode);

  if (!room) return { error: "Room not found" };
  if (room.status !== "in_progress") return { error: "Game is not in progress" };

  const currentPlayer = room.players[room.turnIndex];
  if (!currentPlayer || currentPlayer.userId !== userId) return { error: "Not your turn" };
  if (!currentPlayer.isAlive) return { error: "You are eliminated" };

  const upperLetter = letter.toUpperCase();

  if (room.guessedLetters.includes(upperLetter)) return { error: "Letter already guessed" };
  if (!/^[A-Z]$/.test(upperLetter)) return { error: "Invalid letter" };

  const isCorrect = room.word.includes(upperLetter);
  room.guessedLetters.push(upperLetter);

  db.prepare(`
    INSERT INTO guess_attempts (game_id, user_id, letter, is_correct)
    VALUES (?, ?, ?, ?)
  `).run(room.gameId, userId, upperLetter, isCorrect ? 1 : 0);

  let playerEliminated = false;

  if (!isCorrect) {
    currentPlayer.livesLeft--;
    if (currentPlayer.livesLeft <= 0) {
      currentPlayer.isAlive = false;
      playerEliminated = true;
    }
  }

  // Check if word is fully revealed
  const wordRevealed = room.word.split("").every((c) => room.guessedLetters.includes(c));

  let gameOver = false;
  let winners: RoomPlayer[] = [];

  if (wordRevealed) {
    gameOver = true;
    winners = room.players.filter((p) => p.isAlive);
    finishGame(room, winners);
  } else {
    const alivePlayers = room.players.filter((p) => p.isAlive);
    if (alivePlayers.length === 0) {
      // Everyone eliminated — no winners
      gameOver = true;
      finishGame(room, []);
    } else {
      // Advance turn to next alive player
      advanceTurn(room);
    }
  }

  const nextTurnUserId =
    !gameOver && room.players[room.turnIndex]
      ? room.players[room.turnIndex].userId
      : null;

  return {
    letter: upperLetter,
    isCorrect,
    guessedLetters: room.guessedLetters,
    wordRevealed,
    playerLivesLeft: currentPlayer.livesLeft,
    playerEliminated,
    gameOver,
    winners,
    nextTurnUserId,
    room,
  };
}

function advanceTurn(room: RoomState): void {
  let next = (room.turnIndex + 1) % room.players.length;
  let tries = 0;
  while (!room.players[next].isAlive && tries < room.players.length) {
    next = (next + 1) % room.players.length;
    tries++;
  }
  room.turnIndex = next;
}

function finishGame(room: RoomState, winners: RoomPlayer[]): void {
  room.status = "finished";

  db.prepare(`
    UPDATE games SET status = 'finished', finished_at = datetime('now') WHERE game_id = ?
  `).run(room.gameId);

  for (const player of room.players) {
    const isWinner = winners.some((w) => w.userId === player.userId);
    const score = isWinner ? 10 : 0;

    db.prepare(`
      UPDATE game_players SET score = ?, is_winner = ? WHERE game_id = ? AND user_id = ?
    `).run(score, isWinner ? 1 : 0, room.gameId, player.userId);

    if (isWinner) {
      db.prepare("UPDATE users SET total_wins = total_wins + 1 WHERE user_id = ?").run(player.userId);
    } else {
      db.prepare("UPDATE users SET total_losses = total_losses + 1 WHERE user_id = ?").run(player.userId);
    }
  }
}

export function getRoom(roomCode: string): RoomState | undefined {
  return rooms.get(roomCode);
}

export function getRoomBySocketId(socketId: string): RoomState | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) {
      return room;
    }
  }
  return undefined;
}

export function getPlayerBySocketId(room: RoomState, socketId: string): RoomPlayer | undefined {
  return room.players.find((p) => p.socketId === socketId);
}
