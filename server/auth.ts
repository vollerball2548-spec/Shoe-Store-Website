import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

const AUTH_SECRET = process.env.AUTH_SECRET || 'patsakorn-mix-shop-dev-secret-change-me';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface TokenPayload {
  sub: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
  email: string;
  exp: number;
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
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

export function signToken(data: Omit<TokenPayload, 'exp'>): string {
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
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
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
