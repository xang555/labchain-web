import type { Database } from 'better-sqlite3';
import type { Migration } from '../migrations';

export const migration: Migration = {
  version: 3,
  name: 'token_requests',

  up: (db: Database) => {
    // Token requests table for LAB token faucet requests
    db.exec(`
      CREATE TABLE token_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        wallet_address TEXT NOT NULL,
        requested_amount TEXT NOT NULL,
        reason TEXT NOT NULL,
        contact_info TEXT,
        status TEXT DEFAULT 'pending',
        transferred_amount TEXT,
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },

  down: (db: Database) => {
    db.exec(`DROP TABLE IF EXISTS token_requests`);
  },
};
