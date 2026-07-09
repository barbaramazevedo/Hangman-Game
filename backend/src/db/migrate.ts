import db from "./database";

function migrate() {
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

    CREATE TABLE IF NOT EXISTS categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS words (
      word_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      text        TEXT    NOT NULL UNIQUE,
      category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
      difficulty  TEXT,
      language    TEXT    NOT NULL DEFAULT 'en',
      created_by  INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

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

    CREATE TABLE IF NOT EXISTS game_players (
      game_id   INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
      user_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      score     INTEGER NOT NULL DEFAULT 0,
      is_winner INTEGER NOT NULL DEFAULT 0,
      joined_at TEXT    NOT NULL DEFAULT (datetime('now')),
      left_at   TEXT,
      PRIMARY KEY (game_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS guess_attempts (
      attempt_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id      INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
      user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      letter       TEXT    NOT NULL,
      is_correct   INTEGER NOT NULL DEFAULT 0,
      attempted_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log("Migration ran successfully — tables: users, categories, words, games, game_players, guess_attempts");
}

migrate();
