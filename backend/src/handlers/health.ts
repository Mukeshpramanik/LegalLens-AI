import { Request, Response } from 'express';
import { env } from '../config/env';

export function getHealthStatus(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'healthy',
    service: 'legalease-ai-backend',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
}
