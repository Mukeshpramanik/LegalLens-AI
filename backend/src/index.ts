import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { Logger } from './utils/logging';
import { globalErrorHandler } from './utils/errorHandler';
import {
  apiLimiter,
  uploadLimiter,
  analysisLimiter,
  qaLimiter,
  compareLimiter,
} from './middleware/rateLimit';
import { requireAuth } from './middleware/auth';
import { getHealthStatus } from './handlers/health';
import {
  uploadMiddleware,
  handleUpload,
  handleGetDocuments,
  handleGetDocumentById,
  handleDeleteDocument,
} from './handlers/documents';
import {
  handleAnalyzeDocument,
  handleGetAnalysis,
  handleAskQuestion,
  handleGetQAPairs,
  handleCompareDocuments,
} from './handlers/analysis';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (supports comma-separated origins, wildcard, and development)
const rawFrontendUrls = env.FRONTEND_URL || '*';
const allowedOrigins = rawFrontendUrls
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, uptime monitors, health checks)
      if (!requestOrigin) {
        return callback(null, true);
      }

      if (
        env.NODE_ENV !== 'production' ||
        rawFrontendUrls === '*' ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }

      const normalizedRequestOrigin = requestOrigin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedRequestOrigin)) {
        return callback(null, true);
      }

      Logger.warn(`Blocked by CORS: origin "${requestOrigin}" not in allowed list [${allowedOrigins.join(', ')}]`);
      return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// JSON body parser (limit to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (registered before routes to log all incoming requests)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    Logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      durationMs,
      requestId: req.headers['x-request-id'] as string,
      extra: { statusCode: res.statusCode, ip: req.ip },
    });
  });
  next();
});

// Health check endpoints (accessible without rate limiting or authentication)
app.get('/health', getHealthStatus);
app.get('/api/health', getHealthStatus);

// Apply API rate limiting to all /api/ routes
app.use('/api/', apiLimiter);

// Specific document routes (registered before parameterized :id routes)
app.post('/api/documents/upload', requireAuth, uploadLimiter, uploadMiddleware.single('file'), handleUpload);
app.post('/api/documents/compare', requireAuth, compareLimiter, handleCompareDocuments);
app.get('/api/documents', requireAuth, handleGetDocuments);

// Parameterized document routes
app.get('/api/documents/:id', requireAuth, handleGetDocumentById);
app.delete('/api/documents/:id', requireAuth, handleDeleteDocument);
app.post('/api/documents/:id/analyze', requireAuth, analysisLimiter, handleAnalyzeDocument);
app.get('/api/documents/:id/analyze', requireAuth, handleGetAnalysis);
app.post('/api/documents/:id/ask', requireAuth, qaLimiter, handleAskQuestion);
app.get('/api/documents/:id/ask', requireAuth, handleGetQAPairs);

// Catch-all route for unhandled endpoints
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.originalUrl} not found`,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = env.PORT || 8080;
const HOST = '0.0.0.0';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    Logger.info(`🚀 LegalLens AI Backend listening on ${HOST}:${PORT} [${env.NODE_ENV}]`);
  });
}

export default app;
