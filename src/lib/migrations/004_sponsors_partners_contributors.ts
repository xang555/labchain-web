import type { Database } from 'better-sqlite3';
import type { Migration } from '../migrations';

export const migration: Migration = {
  version: 4,
  name: 'sponsors_partners_contributors',

  up: (db: Database) => {
    // Sponsors table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_url TEXT NOT NULL,
        website_url TEXT,
        display_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Partners table
    db.exec(`
      CREATE TABLE IF NOT EXISTS partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_url TEXT NOT NULL,
        website_url TEXT,
        display_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Node contributors table
    db.exec(`
      CREATE TABLE IF NOT EXISTS node_contributors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_url TEXT NOT NULL,
        website_url TEXT,
        display_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },

  down: (db: Database) => {
    db.exec(`DROP TABLE IF EXISTS node_contributors`);
    db.exec(`DROP TABLE IF EXISTS partners`);
    db.exec(`DROP TABLE IF EXISTS sponsors`);
  },
};
