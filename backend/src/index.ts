import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { Logger } from './utils/logging';
import { globalErrorHandler } from './utils/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { getHealthStatus } from './handlers/health';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (restricted to frontend origin in production)
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// JSON body parser (limit to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Document Routes
import { uploadLimiter, analysisLimiter, qaLimiter, compareLimiter } from './middleware/rateLimit';
import { requireAuth } from './middleware/auth';
import { uploadMiddleware, handleUpload, handleGetDocuments, handleGetDocumentById, handleDeleteDocument } from './handlers/documents';
import { handleAnalyzeDocument, handleGetAnalysis, handleAskQuestion, handleGetQAPairs, handleCompareDocuments } from './handlers/analysis';

app.post('/api/documents/upload', requireAuth, uploadLimiter, uploadMiddleware.single('file'), handleUpload);
app.get('/api/documents', requireAuth, handleGetDocuments);
app.get('/api/documents/:id', requireAuth, handleGetDocumentById);
app.delete('/api/documents/:id', requireAuth, handleDeleteDocument);
app.post('/api/documents/:id/analyze', requireAuth, analysisLimiter, handleAnalyzeDocument);
app.get('/api/documents/:id/analyze', requireAuth, handleGetAnalysis);
app.post('/api/documents/compare', requireAuth, compareLimiter, handleCompareDocuments);
app.post('/api/documents/:id/ask', requireAuth, qaLimiter, handleAskQuestion);
app.get('/api/documents/:id/ask', requireAuth, handleGetQAPairs);

// Request logging middleware
app.use((req, res, next) => {
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

// Health check endpoints
app.get('/health', getHealthStatus);
app.get('/api/health', getHealthStatus);

// Catch-all route for unhandled endpoints
app.use('*', (req, res) => {
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
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    Logger.info(`🚀 LegalLens AI Backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

export default app;
