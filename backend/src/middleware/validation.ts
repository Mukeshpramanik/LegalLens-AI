import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errorHandler';

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError('Invalid request payload', 400, 'VALIDATION_ERROR', err.errors));
      }
      next(err);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as unknown as Request['query'];
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError('Invalid query parameters', 400, 'VALIDATION_ERROR', err.errors));
      }
      next(err);
    }
  };
}
