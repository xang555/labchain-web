import db from './db';
import type { RpcEndpoint, BootNode, BeaconNode } from './db';

// RPC Endpoints
export function getAllRpcEndpoints(): RpcEndpoint[] {
  return db.prepare('SELECT * FROM rpc_endpoints ORDER BY type DESC, name ASC').all() as RpcEndpoint[];
}

export function searchRpcEndpoints(query: string): RpcEndpoint[] {
  const searchQuery = `%${query}%`;
  return db.prepare(`
    SELECT * FROM rpc_endpoints
    WHERE name LIKE ? OR endpoint LIKE ? OR location LIKE ? OR type LIKE ?
    ORDER BY type DESC, name ASC
  `).all(searchQuery, searchQuery, searchQuery, searchQuery) as RpcEndpoint[];
}

export function getRpcEndpointById(id: number): RpcEndpoint | null {
  return db.prepare('SELECT * FROM rpc_endpoints WHERE id = ?').get(id) as RpcEndpoint | null;
}

export function createRpcEndpoint(data: Omit<RpcEndpoint, 'id' | 'created_at' | 'updated_at'>): RpcEndpoint {
  const stmt = db.prepare(`
    INSERT INTO rpc_endpoints (name, endpoint, type, location, status, latency, requests, rate_limit, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.endpoint,
    data.type,
    data.location,
    data.status,
    data.latency,
    data.requests,
    data.rate_limit,
    data.features
  );
  return db.prepare('SELECT * FROM rpc_endpoints WHERE id = ?').get(result.lastInsertRowid) as RpcEndpoint;
}

export function updateRpcEndpoint(id: number, data: Partial<RpcEndpoint>): RpcEndpoint | null {
  const existing = getRpcEndpointById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE rpc_endpoints
    SET name = ?, endpoint = ?, type = ?, location = ?, status = ?,
        latency = ?, requests = ?, rate_limit = ?, features = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? existing.name,
    data.endpoint ?? existing.endpoint,
    data.type ?? existing.type,
    data.location ?? existing.location,
    data.status ?? existing.status,
    data.latency ?? existing.latency,
    data.requests ?? existing.requests,
    data.rate_limit ?? existing.rate_limit,
    data.features ?? existing.features,
    id
  );
  return getRpcEndpointById(id);
}

export function deleteRpcEndpoint(id: number): boolean {
  const result = db.prepare('DELETE FROM rpc_endpoints WHERE id = ?').run(id);
  return result.changes > 0;
}

// Boot Nodes
export function getAllBootNodes(): BootNode[] {
  return db.prepare('SELECT * FROM boot_nodes ORDER BY status ASC, name ASC').all() as BootNode[];
}

export function searchBootNodes(query: string): BootNode[] {
  const searchQuery = `%${query}%`;
  return db.prepare(`
    SELECT * FROM boot_nodes
    WHERE name LIKE ? OR enode LIKE ? OR location LIKE ? OR status LIKE ?
    ORDER BY status ASC, name ASC
  `).all(searchQuery, searchQuery, searchQuery, searchQuery) as BootNode[];
}

export function getBootNodeById(id: number): BootNode | null {
  return db.prepare('SELECT * FROM boot_nodes WHERE id = ?').get(id) as BootNode | null;
}

export function createBootNode(data: Omit<BootNode, 'id' | 'created_at' | 'updated_at'>): BootNode {
  const stmt = db.prepare(`
    INSERT INTO boot_nodes (name, enode, location, status, uptime, peers, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.enode,
    data.location,
    data.status,
    data.uptime,
    data.peers,
    data.last_seen
  );
  return db.prepare('SELECT * FROM boot_nodes WHERE id = ?').get(result.lastInsertRowid) as BootNode;
}

export function updateBootNode(id: number, data: Partial<BootNode>): BootNode | null {
  const existing = getBootNodeById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE boot_nodes
    SET name = ?, enode = ?, location = ?, status = ?,
        uptime = ?, peers = ?, last_seen = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? existing.name,
    data.enode ?? existing.enode,
    data.location ?? existing.location,
    data.status ?? existing.status,
    data.uptime ?? existing.uptime,
    data.peers ?? existing.peers,
    data.last_seen ?? existing.last_seen,
    id
  );
  return getBootNodeById(id);
}

export function deleteBootNode(id: number): boolean {
  const result = db.prepare('DELETE FROM boot_nodes WHERE id = ?').run(id);
  return result.changes > 0;
}

// Beacon Nodes
export function getAllBeaconNodes(): BeaconNode[] {
  return db.prepare('SELECT * FROM beacon_nodes ORDER BY status ASC, name ASC').all() as BeaconNode[];
}

export function searchBeaconNodes(query: string): BeaconNode[] {
  const searchQuery = `%${query}%`;
  return db.prepare(`
    SELECT * FROM beacon_nodes
    WHERE name LIKE ? OR endpoint LIKE ? OR location LIKE ? OR status LIKE ?
    ORDER BY status ASC, name ASC
  `).all(searchQuery, searchQuery, searchQuery, searchQuery) as BeaconNode[];
}

export function getBeaconNodeById(id: number): BeaconNode | null {
  return db.prepare('SELECT * FROM beacon_nodes WHERE id = ?').get(id) as BeaconNode | null;
}

export function createBeaconNode(data: Omit<BeaconNode, 'id' | 'created_at' | 'updated_at'>): BeaconNode {
  const stmt = db.prepare(`
    INSERT INTO beacon_nodes (name, endpoint, location, status, version, sync_status, slots, epoch, last_update)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.endpoint,
    data.location,
    data.status,
    data.version,
    data.sync_status,
    data.slots,
    data.epoch,
    data.last_update
  );
  return db.prepare('SELECT * FROM beacon_nodes WHERE id = ?').get(result.lastInsertRowid) as BeaconNode;
}

export function updateBeaconNode(id: number, data: Partial<BeaconNode>): BeaconNode | null {
  const existing = getBeaconNodeById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE beacon_nodes
    SET name = ?, endpoint = ?, location = ?, status = ?,
        version = ?, sync_status = ?, slots = ?, epoch = ?, last_update = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? existing.name,
    data.endpoint ?? existing.endpoint,
    data.location ?? existing.location,
    data.status ?? existing.status,
    data.version ?? existing.version,
    data.sync_status ?? existing.sync_status,
    data.slots ?? existing.slots,
    data.epoch ?? existing.epoch,
    data.last_update ?? existing.last_update,
    id
  );
  return getBeaconNodeById(id);
}

export function deleteBeaconNode(id: number): boolean {
  const result = db.prepare('DELETE FROM beacon_nodes WHERE id = ?').run(id);
  return result.changes > 0;
}

// Stats
export function getStats() {
  const rpcCount = (db.prepare('SELECT COUNT(*) as count FROM rpc_endpoints').get() as { count: number }).count;
  const bootNodeCount = (db.prepare('SELECT COUNT(*) as count FROM boot_nodes').get() as { count: number }).count;
  const beaconNodeCount = (db.prepare('SELECT COUNT(*) as count FROM beacon_nodes').get() as { count: number }).count;
  const activeRpc = (db.prepare("SELECT COUNT(*) as count FROM rpc_endpoints WHERE status = 'active'").get() as { count: number }).count;
  const activeBootNodes = (db.prepare("SELECT COUNT(*) as count FROM boot_nodes WHERE status = 'active'").get() as { count: number }).count;
  const activeBeaconNodes = (db.prepare("SELECT COUNT(*) as count FROM beacon_nodes WHERE status = 'active'").get() as { count: number }).count;

  return {
    rpcEndpoints: { total: rpcCount, active: activeRpc },
    bootNodes: { total: bootNodeCount, active: activeBootNodes },
    beaconNodes: { total: beaconNodeCount, active: activeBeaconNodes },
  };
}
