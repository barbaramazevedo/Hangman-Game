import db from "../database";

export default function migrate_005() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_players (
      game_id   INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
      user_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      score     INTEGER NOT NULL DEFAULT 0,
      is_winner INTEGER NOT NULL DEFAULT 0,
      joined_at TEXT    NOT NULL DEFAULT (datetime('now')),
      left_at   TEXT,
      PRIMARY KEY (game_id, user_id)
    );
  `);
}
