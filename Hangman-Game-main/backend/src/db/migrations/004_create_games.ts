import db from "../database";

export default function migrate_004() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      game_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code    TEXT    NOT NULL UNIQUE,
      status       TEXT    NOT NULL DEFAULT 'waiting',
      max_players  INTEGER NOT NULL DEFAULT 4,
      word_id      INTEGER REFERENCES words(word_id) ON DELETE SET NULL,
      host_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      started_at   TEXT,
      finished_at  TEXT
    );
  `);
}
