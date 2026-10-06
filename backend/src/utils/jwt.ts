/**
 * JWT Utility - HMAC-SHA256 Token Sign & Verify
 * Uses Node.js Standard Library 'node:crypto'
 */
import crypto from 'node:crypto';
import { config } from '../config/env.ts';

export interface TokenPayload {
  id: string;
  email: string;
  exp: number;
}

/**
 * Sign a JWT token using HMAC-SHA256
 */
export function signToken(data: { id: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      id: data.id,
      email: data.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', config.jwtSecret).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const data: TokenPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
