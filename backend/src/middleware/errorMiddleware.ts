/**
 * Error Middleware
 * Global error handler for Express
 */
import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 400 ? 'Bad request or invalid JSON payload.' : (err.message || 'Internal server error.'),
  });
}
