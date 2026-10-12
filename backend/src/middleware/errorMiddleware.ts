/**
 * Error Middleware
 * Global error handler for Express
 */
import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err);
  
  if (err.name === 'MulterError') {
    const errorMsg = err.code === 'LIMIT_FILE_SIZE' 
      ? 'File size exceeds maximum limit of 5MB.' 
      : err.message || 'File upload validation failed.';
    return res.status(400).json({
      success: false,
      message: errorMsg,
      error: errorMsg
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 400 ? 'Bad request or invalid JSON payload.' : (err.message || 'Internal server error.');
  res.status(status).json({
    success: false,
    message,
    error: message
  });
}
