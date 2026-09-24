import { Request, Response, NextFunction } from 'express';
import { Logger } from './logging';
import { env } from '../config/env';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  Logger.error(`API Error: ${message}`, {
    requestId: req.headers['x-request-id'] as string,
    error: err.stack || err.message,
    extra: {
      path: req.path,
      method: req.method,
      statusCode,
      errorCode,
    },
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(env.NODE_ENV === 'development' && err instanceof AppError ? { details: err.details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
