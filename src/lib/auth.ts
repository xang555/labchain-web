import db from './db';
import type { User, Session } from './db';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// Hash password using SHA-256 with salt
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

// Verify password
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  const inputHash = createHash('sha256').update(password + salt).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(inputHash));
  } catch {
    return false;
  }
}

// Check if any user exists (for first-time setup)
export function isFirstTimeSetup(): boolean {
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  return result.count === 0;
}

// Create user
export function createUser(username: string, password: string): User | null {
  const passwordHash = hashPassword(password);

  try {
    const stmt = db.prepare(`
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
    `);
    const result = stmt.run(username, passwordHash);

    return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Get user by username
export function getUserByUsername(username: string): User | null {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | null;
}

// Authenticate user
export function authenticateUser(username: string, password: string): User | null {
  const user = getUserByUsername(username);

  if (!user) {
    return null;
  }

  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }

  return user;
}

// Generate session ID
function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

// Create session
export function createSession(userId: number): string {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(sessionId, userId, expiresAt.toISOString());

  // Clean up expired sessions
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();

  return sessionId;
}

// Get session
export function getSession(sessionId: string): Session | null {
  const session = db.prepare(`
    SELECT * FROM sessions
    WHERE id = ? AND expires_at > datetime('now')
  `).get(sessionId) as Session | null;

  return session;
}

// Get user from session
export function getUserFromSession(sessionId: string): User | null {
  const session = getSession(sessionId);

  if (!session) {
    return null;
  }

  return db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as User | null;
}

// Delete session (logout)
export function deleteSession(sessionId: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

// Validate session from cookie
export function validateSessionCookie(cookie: string | undefined): User | null {
  if (!cookie) {
    return null;
  }

  // Parse cookies
  const cookies = Object.fromEntries(
    cookie.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );

  const sessionId = cookies['session'];

  if (!sessionId) {
    return null;
  }

  return getUserFromSession(sessionId);
}

// Update username
export function updateUsername(userId: number, newUsername: string): { success: boolean; error?: string } {
  // Check if username already exists
  const existing = getUserByUsername(newUsername);
  if (existing && existing.id !== userId) {
    return { success: false, error: 'Username already exists' };
  }

  try {
    db.prepare(`
      UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(newUsername, userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Update password
export function updatePassword(userId: number, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | null;

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Verify current password
  if (!verifyPassword(currentPassword, user.password_hash)) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Hash new password and update
  const newPasswordHash = hashPassword(newPassword);

  try {
    db.prepare(`
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(newPasswordHash, userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
