import type { Database } from 'better-sqlite3';
import type { Migration } from '../migrations';

export const migration: Migration = {
  version: 1,
  name: 'initial_schema',

  up: (db: Database) => {
    // Users table for admin authentication
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // RPC endpoints table
    db.exec(`
      CREATE TABLE rpc_endpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'community',
        location TEXT,
        status TEXT DEFAULT 'active',
        latency TEXT,
        requests TEXT,
        rate_limit TEXT,
        features TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Boot nodes table
    db.exec(`
      CREATE TABLE boot_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        enode TEXT NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'active',
        uptime TEXT,
        peers INTEGER DEFAULT 0,
        last_seen TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Beacon nodes table (initial version with endpoint NOT NULL and no enr/p2p columns)
    db.exec(`
      CREATE TABLE beacon_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'active',
        version TEXT,
        sync_status TEXT,
        slots TEXT,
        epoch TEXT,
        last_update TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table for authentication
    db.exec(`
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Node requests table for user submissions
    db.exec(`
      CREATE TABLE node_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_id TEXT UNIQUE NOT NULL,
        node_type TEXT NOT NULL,
        name TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        location TEXT,
        contact_email TEXT NOT NULL,
        contact_name TEXT,
        description TEXT,
        status TEXT DEFAULT 'pending',
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table for application configuration
    db.exec(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },

  down: (db: Database) => {
    db.exec(`DROP TABLE IF EXISTS settings`);
    db.exec(`DROP TABLE IF EXISTS node_requests`);
    db.exec(`DROP TABLE IF EXISTS sessions`);
    db.exec(`DROP TABLE IF EXISTS beacon_nodes`);
    db.exec(`DROP TABLE IF EXISTS boot_nodes`);
    db.exec(`DROP TABLE IF EXISTS rpc_endpoints`);
    db.exec(`DROP TABLE IF EXISTS users`);
  },
};
