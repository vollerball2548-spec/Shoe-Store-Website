import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

let AUTH_SECRET = process.env.AUTH_SECRET || '';
const TOKEN_TTL_SECONDS = 60 * 60 * 4;

export interface TokenPayload {
  sub: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
  email: string;
  exp: number;
}

export function assertAuthConfig(production: boolean) {
  if (!AUTH_SECRET && !production) AUTH_SECRET = crypto.randomBytes(32).toString('hex');
  if (Buffer.byteLength(AUTH_SECRET, 'utf8') < 32 || /change-this|example|dev-secret/i.test(AUTH_SECRET)) {
    throw new Error('Set AUTH_SECRET to a random secret of at least 32 characters in the service environment.');
  }
}

const base64url = (input: string | Buffer) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const fromBase64url = (input: string) =>
  Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('hex');
  return `scrypt$32768$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algorithm, cost, salt, encodedHash] = stored.startsWith('scrypt$')
    ? stored.split('$')
    : ['legacy', '16384', ...stored.split(':')];
  const hash = encodedHash;
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64, {
    N: Number(algorithm === 'legacy' ? 16384 : cost),
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

export function signToken(data: Omit<TokenPayload, 'exp'>): string {
  if (!AUTH_SECRET) throw new Error('AUTH_SECRET is required before issuing login sessions.');
  const payload: TokenPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };
  const body = base64url(JSON.stringify(payload));
  const signature = base64url(
    crypto.createHmac('sha256', AUTH_SECRET).update(body).digest()
  );
  return `${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!AUTH_SECRET) return null;
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;
    const expected = base64url(
      crypto.createHmac('sha256', AUTH_SECRET).update(body).digest()
    );
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(fromBase64url(body)) as TokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function readToken(req: Request): string | null {
  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith('auth_session='));
  if (!cookie) return null;
  try {
    return decodeURIComponent(cookie.slice('auth_session='.length));
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string, secure: boolean) {
  res.setHeader('Set-Cookie', `auth_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TOKEN_TTL_SECONDS}${secure ? '; Secure' : ''}`);
}

export function clearAuthCookie(res: Response, secure: boolean) {
  res.setHeader('Set-Cookie', `auth_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`);
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      (req as any).auth = payload;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  }
  (req as any).auth = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบผู้ดูแลร้าน' });
  }
  if (payload.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงหลังบ้าน' });
  }
  (req as any).auth = payload;
  next();
}

export function getAuth(req: Request): TokenPayload | null {
  return (req as any).auth || null;
}
