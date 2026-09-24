import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { AppError } from '../utils/errorHandler';
import { Logger } from '../utils/logging';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
}

// Initialize Firebase Admin if credentials available
let firebaseAppInitialized = false;

function initFirebase() {
  if (firebaseAppInitialized) return;
  try {
    if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      firebaseAppInitialized = true;
      Logger.info('Firebase Admin SDK initialized successfully');
    } else {
      Logger.warn('Firebase Admin credentials not fully configured in env; running in mock/dev auth mode');
    }
  } catch (err) {
    Logger.error('Failed to initialize Firebase Admin SDK', { error: (err as Error).message });
  }
}

initFirebase();

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const authReq = req as AuthenticatedRequest;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Missing or invalid Authorization header', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return next(new AppError('Unauthorized: Empty access token', 401, 'UNAUTHORIZED'));
  }

  // Development bypass / fallback mode if Firebase Admin is not initialized
  if (env.NODE_ENV === 'development') {
    if (token === 'dev-token' || token.startsWith('mock-token-')) {
      authReq.user = {
        uid: token.replace('mock-token-', '') || 'dev-user-123',
        email: 'dev@legalease.ai',
        name: 'Dev User',
      };
      return next();
    }
  }

  try {
    if (!firebaseAppInitialized) {
      return next(new AppError('Authentication service unavailable', 503, 'SERVICE_UNAVAILABLE'));
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    authReq.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
    return next();
  } catch (err) {
    Logger.warn('Failed Firebase ID token verification', { error: (err as Error).message });
    return next(new AppError('Unauthorized: Invalid or expired authentication token', 401, 'INVALID_TOKEN'));
  }
}
