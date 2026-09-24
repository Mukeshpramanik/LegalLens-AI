import { v4 as uuidv4 } from 'uuid';
import * as mammoth from 'mammoth';
import 'multer'; // Import for Express.Multer.File types
import { StorageService } from './storageService';
import { FirestoreService } from './firestoreService';
import { LegalDocument } from '../../../shared/types';
import { Logger } from '../utils/logging';

// Use require for pdf-parse to avoid TS default export and types issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

export class DocumentService {
  /**
   * Processes the uploaded file: extracts text, validates content, uploads to GCS, and saves metadata.
   */
  static async processUpload(
    userId: string,
    file: Express.Multer.File
  ): Promise<LegalDocument> {
    const docId = uuidv4();
    const now = new Date().toISOString();

    Logger.info(`Starting document processing`, { userId, documentId: docId });

    // 1. Extract text to validate file is not corrupt/empty
    let extractedText = '';
    try {
      if (file.mimetype === 'application/pdf') {
        // Deep copy the buffer because pdf.js might read the underlying ArrayBuffer pool which contains garbage
        const safeBuffer = Buffer.from(new Uint8Array(file.buffer));
        const pdfData = await pdfParse(safeBuffer);
        extractedText = pdfData.text || '';
      } else if (file.mimetype.includes('wordprocessingml')) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } else if (file.mimetype === 'text/plain') {
        extractedText = file.buffer.toString('utf-8');
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (err) {
      Logger.error(`Document text extraction failed`, { documentId: docId, error: (err as Error).message });
      throw new Error('Failed to extract text from document. File may be corrupt or encrypted.');
    }

    if (!extractedText || !extractedText.trim()) {
      throw new Error('Document contains no extractable text. Scanned images without OCR are not supported.');
    }

    // Normalize text basic
    extractedText = extractedText.replace(/\\u0000/g, '').trim();

    // 2. Upload to Google Cloud Storage
    const storagePath = await StorageService.uploadDocument(
      userId,
      docId,
      file.buffer,
      file.originalname
    );

    await StorageService.saveExtractedText(userId, docId, extractedText);

    // 3. Create Firestore metadata record
    const document: LegalDocument = {
      id: docId,
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storagePath,
      status: 'complete', // For MVP Phase 2, this is complete. Will be updated in Phase 3.
      uploadedAt: now,
      updatedAt: now,
      charCount: extractedText.length,
    };

    await FirestoreService.createDocument(document);

    Logger.info(`Document processed successfully`, { userId, documentId: docId });
    return document;
  }
}
