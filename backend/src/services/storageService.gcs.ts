import { Storage } from '@google-cloud/storage';
import { env } from '../config/env';
import { Logger } from '../utils/logging';

// The Storage client will automatically use Application Default Credentials
// or the environment variables provided (like FIREBASE_CLIENT_EMAIL / PRIVATE_KEY
// if we instantiate it with credentials, but standard GCP uses ADC).
const storage = new Storage({
  projectId: env.GCP_PROJECT_ID,
  ...(env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
    ? {
        credentials: {
          client_email: env.FIREBASE_CLIENT_EMAIL,
          private_key: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      }
    : {}),
});

const bucket = storage.bucket(env.GCS_BUCKET_NAME);

export class StorageService {
  /**
   * Uploads the original document to Google Cloud Storage.
   * Path: users/{userId}/documents/{docId}/original_{filename}
   */
  static async uploadDocument(
    userId: string,
    docId: string,
    buffer: Buffer,
    mimeType: string,
    filename: string
  ): Promise<string> {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `users/${userId}/documents/${docId}/original_${sanitizedFilename}`;
    const file = bucket.file(path);

    try {
      await file.save(buffer, {
        contentType: mimeType,
        resumable: false,
      });
      Logger.info(`Successfully uploaded document to GCS`, { userId, documentId: docId });
      return path;
    } catch (error) {
      Logger.error(`Failed to upload document to GCS`, { userId, documentId: docId, error: (error as Error).message });
      throw new Error('Storage service failure during upload');
    }
  }

  /**
   * Saves the extracted text to GCS to avoid Firestore 1MB limits.
   * Path: users/{userId}/documents/{docId}/extracted.txt
   */
  static async saveExtractedText(userId: string, docId: string, text: string): Promise<string> {
    const path = `users/${userId}/documents/${docId}/extracted.txt`;
    const file = bucket.file(path);

    try {
      await file.save(text, {
        contentType: 'text/plain',
        resumable: false,
      });
      return path;
    } catch (error) {
      Logger.error(`Failed to save extracted text to GCS`, { userId, documentId: docId, error: (error as Error).message });
      throw new Error('Storage service failure during text persistence');
    }
  }
}
