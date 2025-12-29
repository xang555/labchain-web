import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Database path - use DATA_DIR env var or default to ./data
const dataDir = process.env.DATA_DIR || join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'labchain.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  // Users table for admin authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // RPC endpoints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rpc_endpoints (
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
    CREATE TABLE IF NOT EXISTS boot_nodes (
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

  // Beacon nodes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS beacon_nodes (
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

  // Add enr and p2p columns if they don't exist (migration for existing databases)
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

  // Migration: Recreate beacon_nodes table to make endpoint nullable
  // Check if endpoint is NOT NULL and migrate if needed
  try {
    const tableInfo = db.prepare("PRAGMA table_info(beacon_nodes)").all() as { name: string; notnull: number }[];
    const endpointCol = tableInfo.find(col => col.name === 'endpoint');
    if (endpointCol && endpointCol.notnull === 1) {
      // Need to recreate table with nullable endpoint
      db.exec(`
        CREATE TABLE IF NOT EXISTS beacon_nodes_new (
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
  } catch (e) {
    // Migration already done or table doesn't exist yet
  }

  // Sessions table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Node requests table for user submissions
  db.exec(`
    CREATE TABLE IF NOT EXISTS node_requests (
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
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Token requests table for LAB token faucet requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS token_requests (
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
}

// Initialize database on import
initDatabase();

export default db;

// Type definitions
export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface RpcEndpoint {
  id: number;
  name: string;
  endpoint: string;
  type: 'official' | 'community';
  location: string;
  status: 'active' | 'inactive';
  latency: string;
  requests: string;
  rate_limit: string;
  features: string;
  created_at: string;
  updated_at: string;
}

export interface BootNode {
  id: number;
  name: string;
  enode: string;
  location: string;
  status: 'active' | 'syncing' | 'inactive';
  uptime: string;
  peers: number;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface BeaconNode {
  id: number;
  name: string;
  endpoint?: string;
  enr?: string;
  p2p?: string;
  location?: string;
  status?: 'active' | 'syncing' | 'inactive';
  version?: string;
  sync_status?: string;
  slots?: string;
  epoch?: string;
  last_update?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface NodeRequest {
  id: number;
  tracking_id: string;
  node_type: 'rpc' | 'bootnode' | 'beacon';
  name: string;
  endpoint: string;
  location: string;
  contact_email: string;
  contact_name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export interface TokenRequest {
  id: number;
  tracking_id: string;
  first_name: string;
  last_name: string;
  email: string;
  wallet_address: string;
  requested_amount: string;
  reason: string;
  contact_info: string;
  status: 'pending' | 'approved' | 'rejected' | 'transferred';
  transferred_amount: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}
