import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
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
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
  } else if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      errorCode = 'FILE_TOO_LARGE';
      message = 'File size exceeds maximum allowed limit (10MB).';
    } else {
      statusCode = 400;
      errorCode = err.code || 'UPLOAD_ERROR';
    }
  } else if (message.includes('not allowed by CORS')) {
    statusCode = 403;
    errorCode = 'CORS_FORBIDDEN';
  }

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
