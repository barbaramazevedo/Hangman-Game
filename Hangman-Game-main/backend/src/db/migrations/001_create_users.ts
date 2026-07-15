import db from "../database";

export default function migrate_001() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      avatar_url    TEXT,
      total_wins    INTEGER NOT NULL DEFAULT 0,
      total_losses  INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
