import { Router, Response } from "express";
import db from "../db/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getRoom } from "../game/gameManager";
import { Game, GamePlayer } from "../models";

const router = Router();

// GET /games/:roomCode — current state of a room
router.get("/:roomCode", authMiddleware, (req: AuthRequest, res: Response): void => {
  const roomCode = req.params.roomCode as string;

  // Check in-memory first (live game)
  const live = getRoom(roomCode.toUpperCase());
  if (live) {
    res.json({
      gameId: live.gameId,
      roomCode: live.roomCode,
      status: live.status,
      hostUserId: live.hostUserId,
      maxPlayers: live.maxPlayers,
      players: live.players.map((p) => ({
        userId: p.userId,
        username: p.username,
        livesLeft: p.livesLeft,
        isAlive: p.isAlive,
      })),
      turnUserId: live.players[live.turnIndex]?.userId ?? null,
      guessedLetters: live.guessedLetters,
    });
    return;
  }

  // Fallback to DB (finished/historical games)
  const game = db
    .prepare("SELECT * FROM games WHERE room_code = ?")
    .get(roomCode.toUpperCase()) as Game | undefined;

  if (!game) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const players = db
    .prepare("SELECT * FROM game_players WHERE game_id = ?")
    .all(game.game_id) as GamePlayer[];

  res.json({ game, players });
});

// GET /games — list rooms with status 'waiting' (lobby discovery)
router.get("/", authMiddleware, (_req: AuthRequest, res: Response): void => {
  const games = db
    .prepare(
      `SELECT g.game_id, g.room_code, g.status, g.max_players, g.host_user_id, g.created_at,
              COUNT(gp.user_id) AS player_count
       FROM games g
       LEFT JOIN game_players gp ON g.game_id = gp.game_id AND gp.left_at IS NULL
       WHERE g.status = 'waiting'
       GROUP BY g.game_id
       ORDER BY g.created_at DESC
       LIMIT 20`
    )
    .all();

  res.json({ games });
});

export default router;
