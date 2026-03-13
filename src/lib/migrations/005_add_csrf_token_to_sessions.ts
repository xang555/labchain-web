import type { Database } from 'better-sqlite3';
import type { Migration } from '../migrations';

export const migration: Migration = {
  version: 5,
  name: 'add_csrf_token_to_sessions',

  up: (db: Database) => {
    // Add csrf_token column to sessions table
    db.exec(`
      ALTER TABLE sessions ADD COLUMN csrf_token TEXT
    `);
  },

  down: (db: Database) => {
    // SQLite doesn't support ALTER TABLE DROP COLUMN
    // Need to recreate table without csrf_token
    db.exec(`
      CREATE TABLE sessions_new (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.exec(`
      INSERT INTO sessions_new (id, user_id, expires_at, created_at)
      SELECT id, user_id, expires_at, created_at FROM sessions
    `);

    db.exec(`DROP TABLE sessions`);
    db.exec(`ALTER TABLE sessions_new RENAME TO sessions`);
  },
};
