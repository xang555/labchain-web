import type { Database } from 'better-sqlite3';
import type { Migration } from '../migrations';

export const migration: Migration = {
  version: 2,
  name: 'beacon_enr_p2p_nullable_endpoint',

  up: (db: Database) => {
    // First, add enr and p2p columns if they don't exist
    try {
      db.exec(`ALTER TABLE beacon_nodes ADD COLUMN enr TEXT`);
    } catch (e) {
      // Column already exists
    }
    try {
      db.exec(`ALTER TABLE beacon_nodes ADD COLUMN p2p TEXT`);
    } catch (e) {
      // Column already exists
    }

    // Check if endpoint is NOT NULL and migrate if needed
    const tableInfo = db.prepare("PRAGMA table_info(beacon_nodes)").all() as {
      name: string;
      notnull: number;
    }[];
    const endpointCol = tableInfo.find(col => col.name === 'endpoint');

    if (endpointCol && endpointCol.notnull === 1) {
      // Recreate table with nullable endpoint
      db.exec(`
        CREATE TABLE beacon_nodes_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          endpoint TEXT,
          enr TEXT,
          p2p TEXT,
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
      db.exec(`INSERT INTO beacon_nodes_new SELECT * FROM beacon_nodes`);
      db.exec(`DROP TABLE beacon_nodes`);
      db.exec(`ALTER TABLE beacon_nodes_new RENAME TO beacon_nodes`);
    }
  },

  down: (db: Database) => {
    // Rollback: recreate table with endpoint NOT NULL and without enr/p2p
    const tableInfo = db.prepare("PRAGMA table_info(beacon_nodes)").all() as {
      name: string;
    }[];
    const hasEnr = tableInfo.some(col => col.name === 'enr');
    const hasP2p = tableInfo.some(col => col.name === 'p2p');

    if (!hasEnr && !hasP2p) {
      // Already at old schema
      return;
    }

    // Get current column info to check if endpoint is nullable
    const fullTableInfo = db.prepare("PRAGMA table_info(beacon_nodes)").all() as {
      name: string;
      notnull: number;
    }[];
    const endpointCol = fullTableInfo.find(col => col.name === 'endpoint');

    // Only rollback if we're currently at the nullable endpoint schema
    if (endpointCol && endpointCol.notnull === 0) {
      db.exec(`
        CREATE TABLE beacon_nodes_old (
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

      // Migrate data back - only include rows with endpoint
      db.exec(`
        INSERT INTO beacon_nodes_old (id, name, endpoint, location, status, version, sync_status, slots, epoch, last_update, created_at, updated_at)
        SELECT id, name, endpoint, location, status, version, sync_status, slots, epoch, last_update, created_at, updated_at
        FROM beacon_nodes
        WHERE endpoint IS NOT NULL
      `);

      db.exec(`DROP TABLE beacon_nodes`);
      db.exec(`ALTER TABLE beacon_nodes_old RENAME TO beacon_nodes`);
    }
  },
};
