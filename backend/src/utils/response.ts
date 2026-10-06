/**
 * Response Utility
 * Standardized API response helpers
 */
import { Response } from 'express';

export function sendSuccess(res: Response, data: any, message?: string, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message: message || 'Success',
    ...data,
  });
}

export function sendError(res: Response, message: string, statusCode: number = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}
