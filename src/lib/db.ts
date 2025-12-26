import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path - store in project root/data folder
const dataDir = join(__dirname, '../../data');
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
  endpoint: string;
  location: string;
  status: 'active' | 'syncing' | 'inactive';
  version: string;
  sync_status: string;
  slots: string;
  epoch: string;
  last_update: string;
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
