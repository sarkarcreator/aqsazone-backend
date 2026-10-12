import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getPool } from '@/src/db';
import type { RowDataPacket } from 'mysql2';

const scrypt = promisify(scryptCallback);
const SESSION_SECONDS = 60 * 60 * 12;
let adminTableReady: Promise<void> | null = null;

type AdminSession = { email: string; name: string; exp: number };

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be set to at least 32 characters.');
  return secret;
}

export async function ensureAdminTable() {
  if (!adminTableReady) {
    adminTableReady = getPool().execute(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        name VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).then(() => undefined).catch((error) => {
      adminTableReady = null;
      throw error;
    });
  }
  return adminTableReady ?? Promise.resolve();
}

export async function adminSetupNeeded() {
  await ensureAdminTable();
  const [rows] = await getPool().query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM admin_accounts');
  return Number(rows[0]?.total || 0) === 0;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split(':');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createAdminSession(email: string, name: string) {
  const payload: AdminSession = { email, name, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(encoded).digest('base64url');
  return { token: `${encoded}.${signature}`, maxAge: SESSION_SECONDS };
}

export function readAdminSession(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  try {
    const [encoded, suppliedSignature] = token.split('.');
    if (!encoded || !suppliedSignature) return null;
    const expectedSignature = createHmac('sha256', sessionSecret()).update(encoded).digest();
    const supplied = Buffer.from(suppliedSignature, 'base64url');
    if (supplied.length !== expectedSignature.length || !timingSafeEqual(supplied, expectedSignature)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as AdminSession;
    if (!payload.email || !payload.name || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminFromSession(token: string | undefined | null) {
  const session = readAdminSession(token);
  if (!session) return null;
  await ensureAdminTable();
  const [rows] = await getPool().execute<(RowDataPacket & { email: string; name: string })[]>(
    'SELECT email, name FROM admin_accounts WHERE email = ? LIMIT 1', [session.email]
  );
  const admin = rows[0];
  return admin ? { email: admin.email, name: admin.name } : null;
}

export const ADMIN_COOKIE = 'az_admin_session';
export const ADMIN_SESSION_SECONDS = SESSION_SECONDS;
