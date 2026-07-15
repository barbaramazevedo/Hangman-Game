import db from "../database";

export default function migrate_006() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guess_attempts (
      attempt_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id      INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
      user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      letter       TEXT    NOT NULL,
      is_correct   INTEGER NOT NULL DEFAULT 0,
      attempted_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
