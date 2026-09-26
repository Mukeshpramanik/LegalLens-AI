import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { DocumentService } from '../services/documentService';
import { FirestoreService } from '../services/firestoreService';
import { StorageService } from '../services/storageService';
import { AppError } from '../utils/errorHandler';
import { SUPPORTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../../shared/constants';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

// Configure Multer for memory storage (file is kept in memory to be sent to GCS)

const uuidSchema = z.string().uuid('Invalid Document ID format');

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 10 MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if ((SUPPORTED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported file format. Please upload PDF, DOCX, or TXT.', 400, 'INVALID_FILE_TYPE'));
    }
  },
});

export async function handleUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.uid) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    if (!req.file) {
      throw new AppError('No file provided. Ensure the field name is "file".', 400, 'NO_FILE');
    }

    if (req.file.size === 0) {
      throw new AppError('File is empty.', 400, 'EMPTY_FILE');
    }

    const document = await DocumentService.processUpload(authReq.user.uid, req.file);

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.uid) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const docs = await FirestoreService.getUserDocuments(authReq.user.uid);

    res.json({
      success: true,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.uid) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) {
      throw new AppError(parsedId.error.errors[0].message, 400, 'INVALID_PARAM');
    }

    const doc = await FirestoreService.getDocumentById(authReq.user.uid, id);
    if (!doc) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.uid) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) {
      throw new AppError(parsedId.error.errors[0].message, 400, 'INVALID_PARAM');
    }

    const userId = authReq.user.uid;

    // 1. Verify existence and ownership
    const doc = await FirestoreService.getDocumentById(userId, id);
    if (!doc) {
      // getDocumentById internally ensures it only returns the doc if it belongs to userId.
      // If the doc doesn't exist OR belongs to someone else, it returns null.
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    // 2. Delete from Storage
    await StorageService.deleteDocumentFiles(userId, id);

    // 3. Delete from Firestore (metadata, analysis, QA, comparisons)
    await FirestoreService.deleteDocument(id, userId);

    res.json({
      success: true,
      data: { message: 'Document deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
}
