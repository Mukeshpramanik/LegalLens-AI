import { promises as fs } from 'fs';
import path from 'path';

import { Logger } from '../utils/logging';

const storageRoot = path.resolve(process.cwd(), 'uploads');

export class StorageService {
  /**
   * Saves the original document to local filesystem storage.
   * Path: uploads/users/{userId}/documents/{docId}/original_{filename}
   */
  static async uploadDocument(
    userId: string,
    docId: string,
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const relativePath = path.join(
      'users',
      userId,
      'documents',
      docId,
      `original_${sanitizedFilename}`
    );
    const absolutePath = path.join(storageRoot, relativePath);

    try {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, buffer);

      Logger.info(`Successfully saved document locally`, {
        userId,
        documentId: docId,
      });

      return relativePath;
    } catch (error) {
      Logger.error(`Failed to save document locally`, {
        userId,
        documentId: docId,
        error: (error as Error).message,
      });

      throw new Error('Storage service failure during upload');
    }
  }

  /**
   * Saves extracted text to local filesystem storage.
   * Path: uploads/users/{userId}/documents/{docId}/extracted.txt
   */
  static async saveExtractedText(
    userId: string,
    docId: string,
    text: string
  ): Promise<string> {
    const relativePath = path.join(
      'users',
      userId,
      'documents',
      docId,
      'extracted.txt'
    );
    const absolutePath = path.join(storageRoot, relativePath);

    try {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, text, 'utf8');

      return relativePath;
    } catch (error) {
      Logger.error(`Failed to save extracted text locally`, {
        userId,
        documentId: docId,
        error: (error as Error).message,
      });

      throw new Error('Storage service failure during text persistence');
    }
  }

  /**
   * Retrieves extracted text from local filesystem storage.
   * Expected path: users/{userId}/documents/{docId}/extracted.txt
   */
  static async getExtractedText(userId: string, docId: string): Promise<string> {
    const relativePath = path.join('users', userId, 'documents', docId, 'extracted.txt');
    const absolutePath = path.join(storageRoot, relativePath);

    try {
      const data = await fs.readFile(absolutePath, 'utf8');
      return data;
    } catch (error) {
      Logger.error(`Failed to read extracted text locally`, {
        userId,
        documentId: docId,
        error: (error as Error).message,
      });
      throw new Error('Storage service failure during text retrieval');
    }
  }

  /**
   * Deletes a document directory and all its contents.
   */
  static async deleteDocumentFiles(userId: string, docId: string): Promise<void> {
    const relativePath = path.join('users', userId, 'documents', docId);
    const absolutePath = path.join(storageRoot, relativePath);

    try {
      await fs.rm(absolutePath, { recursive: true, force: true });
      Logger.info('Successfully deleted document files locally', { userId, documentId: docId });
    } catch (error) {
      Logger.error('Failed to delete document files locally', {
        userId,
        documentId: docId,
        error: (error as Error).message,
      });
      // We don't throw an error here to prevent a failed storage cleanup from blocking Firestore cleanup
      // if the folder is already missing or locked.
    }
  }
}
