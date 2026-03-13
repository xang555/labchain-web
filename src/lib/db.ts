import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { runMigrations } from './migrations';
import { migrations } from './migrations/index';

// Database path - use DATA_DIR env var or default to ./data
const dataDir = process.env.DATA_DIR || join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'labchain.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

/**
 * Initialize database schema using the migration system.
 * This will create the schema_migrations tracking table if it doesn't exist,
 * then run any pending migrations in order.
 */
export function initDatabase() {
  runMigrations(db, migrations);
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
  csrf_token?: string | null;
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

export interface Sponsor {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface NodeContributor {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
