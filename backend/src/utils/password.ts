/**
 * Password Utility - PBKDF2 Hashing
 * Uses Node.js Standard Library 'node:crypto'
 */
import crypto from 'node:crypto';

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash: derivedKey, salt: generatedSalt };
}

/**
 * Verify a password against stored hash
 */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derivedKey, 'hex'), Buffer.from(storedHash, 'hex'));
}
