import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import db from "../db/database";
import { User } from "../models";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  startGame,
  guessLetter,
  getRoom,
  getRoomBySocketId,
  getPlayerBySocketId,
  RoomState,
} from "./gameManager";

interface AuthPayload {
  userId: number;
  username: string;
}

function buildRoomPayload(room: RoomState) {
  return {
    roomCode: room.roomCode,
    status: room.status,
    hostUserId: room.hostUserId,
    maxPlayers: room.maxPlayers,
    players: room.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      livesLeft: p.livesLeft,
      isAlive: p.isAlive,
    })),
    turnUserId: room.players[room.turnIndex]?.userId ?? null,
    guessedLetters: room.guessedLetters,
    // Word is only revealed after game ends; during play send masked version
    maskedWord:
      room.status === "in_progress" || room.status === "finished"
        ? room.word
            .split("")
            .map((c) => (room.guessedLetters.includes(c) ? c : "_"))
            .join("")
        : null,
    word: room.status === "finished" ? room.word : null,
  };
}

function resolveAuth(socket: Socket, secret: string): AuthPayload | null {
  try {
    const token =
      (socket.handshake.auth as Record<string, string>).token ||
      (socket.handshake.headers.authorization || "").replace("Bearer ", "");

    if (!token) return null;
    const payload = jwt.verify(token, secret) as { userId: number };

    const user = db.prepare("SELECT username FROM users WHERE user_id = ?").get(payload.userId) as Pick<User, "username"> | undefined;
    if (!user) return null;

    return { userId: payload.userId, username: user.username };
  } catch {
    return null;
  }
}

export function registerSocketHandlers(io: Server): void {
  const secret = process.env.JWT_SECRET as string;

  io.on("connection", (socket: Socket) => {
    const auth = resolveAuth(socket, secret);

    if (!auth) {
      socket.emit("error", { message: "Authentication required" });
      socket.disconnect(true);
      return;
    }

    const { userId, username } = auth;

    // ─── CREATE ROOM ───────────────────────────────────────────────────────────
    socket.on("create_room", ({ maxPlayers }: { maxPlayers?: number }) => {
      const room = createRoom(userId, username, socket.id, maxPlayers ?? 4);
      socket.join(room.roomCode);

      socket.emit("room_created", buildRoomPayload(room));
    });

    // ─── JOIN ROOM ─────────────────────────────────────────────────────────────
    socket.on("join_room", ({ roomCode }: { roomCode: string }) => {
      const result = joinRoom(roomCode, userId, username, socket.id);

      if ("error" in result) {
        socket.emit("error", { message: result.error });
        return;
      }

      socket.join(roomCode);

      // Confirm to joining player
      socket.emit("room_joined", buildRoomPayload(result.room));

      // Notify everyone else in the room
      socket.to(roomCode).emit("player_joined", {
        userId,
        username,
        room: buildRoomPayload(result.room),
      });
    });

    // ─── LEAVE ROOM ────────────────────────────────────────────────────────────
    socket.on("leave_room", ({ roomCode }: { roomCode: string }) => {
      handleLeave(socket, io, roomCode);
    });

    // ─── START GAME ────────────────────────────────────────────────────────────
    socket.on("start_game", ({ roomCode }: { roomCode: string }) => {
      const result = startGame(roomCode, userId);

      if ("error" in result) {
        socket.emit("error", { message: result.error });
        return;
      }

      const room = result.room;

      io.to(roomCode).emit("game_started", {
        room: buildRoomPayload(room),
        turnUserId: room.players[room.turnIndex]?.userId ?? null,
      });
    });

    // ─── GUESS LETTER ──────────────────────────────────────────────────────────
    socket.on("guess_letter", ({ roomCode, letter }: { roomCode: string; letter: string }) => {
      const result = guessLetter(roomCode, userId, letter);

      if ("error" in result) {
        socket.emit("error", { message: result.error });
        return;
      }

      const payload = {
        userId,
        username,
        letter: result.letter,
        isCorrect: result.isCorrect,
        guessedLetters: result.guessedLetters,
        maskedWord: result.room.word
          .split("")
          .map((c) => (result.guessedLetters.includes(c) ? c : "_"))
          .join(""),
        playerLivesLeft: result.playerLivesLeft,
        playerEliminated: result.playerEliminated,
      };

      io.to(roomCode).emit("letter_guessed", payload);

      if (result.gameOver) {
        io.to(roomCode).emit("game_over", {
          word: result.room.word,
          winners: result.winners.map((w) => ({ userId: w.userId, username: w.username })),
          players: result.room.players.map((p) => ({
            userId: p.userId,
            username: p.username,
            livesLeft: p.livesLeft,
            isAlive: p.isAlive,
          })),
        });
      } else if (!result.wordRevealed) {
        io.to(roomCode).emit("turn_changed", {
          nextTurnUserId: result.nextTurnUserId,
        });
      }
    });

    // ─── GET ROOM STATE ────────────────────────────────────────────────────────
    socket.on("get_room", ({ roomCode }: { roomCode: string }) => {
      const room = getRoom(roomCode);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      socket.emit("room_state", buildRoomPayload(room));
    });

    // ─── DISCONNECT ────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const room = getRoomBySocketId(socket.id);
      if (!room) return;
      handleLeave(socket, io, room.roomCode);
    });
  });
}

function handleLeave(socket: Socket, io: Server, roomCode: string): void {
  const room = leaveRoom(roomCode, socket.id);
  socket.leave(roomCode);

  if (!room) {
    // Room was destroyed (last player left)
    return;
  }

  const leavingPlayer = { socketId: socket.id };

  socket.to(roomCode).emit("player_left", {
    socketId: leavingPlayer.socketId,
    room: {
      roomCode: room.roomCode,
      status: room.status,
      hostUserId: room.hostUserId,
      players: room.players.map((p) => ({
        userId: p.userId,
        username: p.username,
        livesLeft: p.livesLeft,
        isAlive: p.isAlive,
      })),
    },
  });
}
