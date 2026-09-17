import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getDb, User } from './db';

const SESSION_COOKIE_NAME = 'nova_session';
const SESSION_DURATION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return resolve(false);
    const [salt, key] = parts;
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const storedKeyBuffer = Buffer.from(key, 'hex');
        resolve(crypto.timingSafeEqual(storedKeyBuffer, derivedKey));
      } catch {
        resolve(false);
      }
    });
  });
}

export function getUserCreditBalance(userId: string): number {
  const db = getDb();
  const row = db.prepare('SELECT COALESCE(SUM(delta), 0) as balance FROM credit_ledger WHERE user_id = ?').get(userId) as { balance?: number } | undefined;
  return row?.balance ?? 0;
}

export function createSession(userId: string): { sessionId: string; expiresAt: Date } {
  const db = getDb();
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
  const expiresAtIso = expiresAt.toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    userId,
    expiresAtIso
  );

  return { sessionId, expiresAt };
}

export function deleteSession(sessionId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  createdAt: string;
  balance: number;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }

    const sessionId = sessionCookie.value;
    const db = getDb();

    // Clean expired sessions
    const nowIso = new Date().toISOString();
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(nowIso);

    interface SessionJoinRow {
      user_id: string;
      email: string;
      created_at: string;
      expires_at: string;
    }

    const row = db.prepare(`
      SELECT s.user_id, u.email, u.created_at, s.expires_at
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at >= ?
    `).get(sessionId, nowIso) as SessionJoinRow | undefined;

    if (!row) {
      return null;
    }

    const balance = getUserCreditBalance(row.user_id);

    return {
      id: row.user_id,
      email: row.email,
      createdAt: row.created_at,
      balance,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export { SESSION_COOKIE_NAME };