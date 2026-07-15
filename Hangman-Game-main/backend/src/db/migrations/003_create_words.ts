import db from "../database";

export default function migrate_003() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      word_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      text        TEXT    NOT NULL UNIQUE,
      category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
      difficulty  TEXT,
      language    TEXT    NOT NULL DEFAULT 'en',
      created_by  INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
