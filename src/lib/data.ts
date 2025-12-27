import db from './db';
import type { RpcEndpoint, BootNode, BeaconNode, NodeRequest } from './db';
import { randomBytes } from 'crypto';

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

export function createRpcEndpoint(data: { name: string; endpoint: string; type: 'official' | 'community' }): RpcEndpoint {
  const stmt = db.prepare(`
    INSERT INTO rpc_endpoints (name, endpoint, type)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.endpoint,
    data.type
  );
  return db.prepare('SELECT * FROM rpc_endpoints WHERE id = ?').get(result.lastInsertRowid) as RpcEndpoint;
}

export function updateRpcEndpoint(id: number, data: { name?: string; endpoint?: string; type?: 'official' | 'community' }): RpcEndpoint | null {
  const existing = getRpcEndpointById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE rpc_endpoints
    SET name = ?, endpoint = ?, type = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? existing.name,
    data.endpoint ?? existing.endpoint,
    data.type ?? existing.type,
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

export function createBootNode(data: { name: string; enode: string }): BootNode {
  const stmt = db.prepare(`
    INSERT INTO boot_nodes (name, enode)
    VALUES (?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.enode
  );
  return db.prepare('SELECT * FROM boot_nodes WHERE id = ?').get(result.lastInsertRowid) as BootNode;
}

export function updateBootNode(id: number, data: { name?: string; enode?: string }): BootNode | null {
  const existing = getBootNodeById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE boot_nodes
    SET name = ?, enode = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? existing.name,
    data.enode ?? existing.enode,
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

export function createBeaconNode(data: { name: string; enr?: string; p2p?: string }): BeaconNode {
  const stmt = db.prepare(`
    INSERT INTO beacon_nodes (name, enr, p2p)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.enr || '',
    data.p2p || ''
  );
  return db.prepare('SELECT * FROM beacon_nodes WHERE id = ?').get(result.lastInsertRowid) as BeaconNode;
}

export function updateBeaconNode(id: number, data: { name?: string; enr?: string; p2p?: string }): BeaconNode | null {
  const existing = getBeaconNodeById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE beacon_nodes
    SET name = ?, enr = ?, p2p = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? existing.name,
    data.enr ?? existing.enr ?? '',
    data.p2p ?? existing.p2p ?? '',
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
  const pendingRequests = (db.prepare("SELECT COUNT(*) as count FROM node_requests WHERE status = 'pending'").get() as { count: number }).count;

  return {
    rpcEndpoints: { total: rpcCount, active: activeRpc },
    bootNodes: { total: bootNodeCount, active: activeBootNodes },
    beaconNodes: { total: beaconNodeCount, active: activeBeaconNodes },
    requests: { pending: pendingRequests },
  };
}

// Node Requests
function generateTrackingId(): string {
  return 'REQ-' + randomBytes(4).toString('hex').toUpperCase();
}

export function getAllNodeRequests(): NodeRequest[] {
  return db.prepare('SELECT * FROM node_requests ORDER BY created_at DESC').all() as NodeRequest[];
}

export function getNodeRequestsByStatus(status: string): NodeRequest[] {
  return db.prepare("SELECT * FROM node_requests WHERE status = ? ORDER BY created_at DESC").all(status) as NodeRequest[];
}

export function getNodeRequestById(id: number): NodeRequest | null {
  return db.prepare('SELECT * FROM node_requests WHERE id = ?').get(id) as NodeRequest | null;
}

export function getNodeRequestByTrackingId(trackingId: string): NodeRequest | null {
  return db.prepare('SELECT * FROM node_requests WHERE tracking_id = ?').get(trackingId) as NodeRequest | null;
}

// Check if endpoint already exists in requests or approved nodes
export function isEndpointDuplicate(endpoint: string, nodeType: string): { exists: boolean; location: string } {
  // Check in pending/approved requests
  const requestExists = db.prepare(
    "SELECT * FROM node_requests WHERE endpoint = ? AND status != 'rejected'"
  ).get(endpoint) as NodeRequest | null;

  if (requestExists) {
    return { exists: true, location: 'pending request' };
  }

  // Check in existing nodes based on type
  if (nodeType === 'rpc') {
    const rpcExists = db.prepare('SELECT * FROM rpc_endpoints WHERE endpoint = ?').get(endpoint);
    if (rpcExists) return { exists: true, location: 'RPC endpoints' };
  } else if (nodeType === 'bootnode') {
    const bootExists = db.prepare('SELECT * FROM boot_nodes WHERE enode = ?').get(endpoint);
    if (bootExists) return { exists: true, location: 'Boot nodes' };
  } else if (nodeType === 'beacon') {
    const beaconExists = db.prepare('SELECT * FROM beacon_nodes WHERE endpoint = ?').get(endpoint);
    if (beaconExists) return { exists: true, location: 'Beacon nodes' };
  }

  return { exists: false, location: '' };
}

export function createNodeRequest(data: {
  node_type: string;
  name: string;
  endpoint: string;
  description?: string;
}): NodeRequest {
  const trackingId = generateTrackingId();

  const stmt = db.prepare(`
    INSERT INTO node_requests (tracking_id, node_type, name, endpoint, location, contact_email, contact_name, description, status)
    VALUES (?, ?, ?, ?, '', '', '', ?, 'pending')
  `);

  const result = stmt.run(
    trackingId,
    data.node_type,
    data.name,
    data.endpoint,
    data.description || ''
  );

  return db.prepare('SELECT * FROM node_requests WHERE id = ?').get(result.lastInsertRowid) as NodeRequest;
}

export function updateNodeRequestStatus(id: number, status: string, adminNotes?: string): NodeRequest | null {
  const existing = getNodeRequestById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE node_requests
    SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, adminNotes || existing.admin_notes || '', id);
  return getNodeRequestById(id);
}

export function deleteNodeRequest(id: number): boolean {
  const result = db.prepare('DELETE FROM node_requests WHERE id = ?').run(id);
  return result.changes > 0;
}

// Approve request and create the node
export function approveAndCreateNode(requestId: number): { success: boolean; error?: string } {
  const request = getNodeRequestById(requestId);
  if (!request) return { success: false, error: 'Request not found' };

  try {
    if (request.node_type === 'rpc') {
      createRpcEndpoint({
        name: request.name,
        endpoint: request.endpoint,
        type: 'community'
      });
    } else if (request.node_type === 'bootnode') {
      createBootNode({
        name: request.name,
        enode: request.endpoint
      });
    } else if (request.node_type === 'beacon') {
      createBeaconNode({
        name: request.name,
        enr: request.endpoint,  // User submits ENR in the endpoint field
        p2p: ''
      });
    }

    updateNodeRequestStatus(requestId, 'approved');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
