/**
 * Authentication Middleware
 * Handles cookie-based and Bearer token authentication
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string = ''): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(pair => {
    const parts = pair.trim().split('=');
    if (parts[0]) {
      cookies[parts[0]] = decodeURIComponent(parts.slice(1).join('='));
    }
  });
  return cookies;
}

/**
 * Extract token from cookie or Authorization header
 */
function extractToken(req: Request): string | null {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.token) {
    return cookies.token;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.slice(7).trim();
  }
  return null;
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(res: Response, token: string) {
  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`
  );
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(res: Response) {
  res.setHeader(
    'Set-Cookie',
    `token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
}

/**
 * Strict authentication middleware for protected routes
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }

  req.user = { id: decoded.id, email: decoded.email };
  next();
}

/**
 * Optional authentication middleware for public views with personalized enrichment (e.g. Dashboard)
 */
export function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    req.user = undefined;
    return next();
  }

  const decoded = verifyToken(token);
  if (decoded) {
    req.user = { id: decoded.id, email: decoded.email };
  } else {
    req.user = undefined;
  }
  next();
}
