import * as admin from 'firebase-admin';
import { DocumentData, UpdateData } from '@google-cloud/firestore';
import { LegalDocument, AnalysisResult, DocumentStatus, QAPair, ComparisonResult } from '../../../shared/types';
import { Logger } from '../utils/logging';

export class FirestoreService {
  private static get collection() {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK is not initialized. Check credentials.');
    }
    return admin.firestore().collection('documents');
  }

  static async createDocument(doc: LegalDocument): Promise<void> {
    try {
      await this.collection.doc(doc.id).set(doc as DocumentData);
    } catch (error) {
      Logger.error(`Failed to create Firestore document record`, { documentId: doc.id, error: (error as Error).message });
      throw new Error('Database service failure during document creation');
    }
  }

  static async updateDocument(id: string, updates: Partial<LegalDocument>): Promise<void> {
    try {
      await this.collection.doc(id).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      } as UpdateData<DocumentData>);
    } catch (error) {
      Logger.error(`Failed to update Firestore document record`, { documentId: id, error: (error as Error).message });
      throw new Error('Database service failure during document update');
    }
  }

  static async getUserDocuments(userId: string): Promise<LegalDocument[]> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('uploadedAt', 'desc')
        .get();
      return snapshot.docs.map(doc => doc.data() as unknown as LegalDocument);
    } catch (error) {
      Logger.error(`Failed to fetch user documents`, { userId, error: (error as Error).message });
      throw new Error('Database service failure while fetching documents');
    }
  }

  static async getDocumentById(userId: string, docId: string): Promise<LegalDocument | null> {
    try {
      const docSnapshot = await this.collection.doc(docId).get();
      if (!docSnapshot.exists) return null;

      const data = docSnapshot.data() as unknown as LegalDocument;

      if (data.userId !== userId) {
        Logger.warn(`Unauthorized document access attempt`, { userId, documentId: docId });
        return null;
      }

      return data;
    } catch (error) {
      Logger.error(`Failed to fetch document by ID`, { documentId: docId, error: (error as Error).message });
      throw new Error('Database service failure while fetching document');
    }
  }

  static async updateDocumentStatus(docId: string, status: DocumentStatus): Promise<void> {
    try {
      await this.collection.doc(docId).update({
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      Logger.error(`Failed to update document status`, { documentId: docId, error: (error as Error).message });
      throw new Error('Database service failure during status update');
    }
  }

  static async saveAnalysisResult(docId: string, result: AnalysisResult): Promise<void> {
    try {
      await this.collection.doc(docId).collection('analysis').doc('latest').set(result as DocumentData);
    } catch (error) {
      Logger.error(`Failed to save analysis result`, { documentId: docId, error: (error as Error).message });
      throw new Error('Database service failure during analysis save');
    }
  }

  static async getAnalysisResult(docId: string): Promise<AnalysisResult | null> {
    try {
      const docSnapshot = await this.collection.doc(docId).collection('analysis').doc('latest').get();
      if (!docSnapshot.exists) return null;
      return docSnapshot.data() as unknown as AnalysisResult;
    } catch (error) {
      Logger.error(`Failed to fetch analysis result`, { documentId: docId, error: (error as Error).message });
      throw new Error('Database service failure while fetching analysis result');
    }
  }

  static async saveQAPair(docId: string, qaPair: QAPair): Promise<void> {
    try {
      await this.collection.doc(docId).collection('qa').doc(qaPair.id).set(qaPair as DocumentData);
    } catch (error) {
      Logger.error('Failed to save QA pair', { documentId: docId, error: (error as Error).message });
      throw new Error('Database service failure during QA save');
    }
  }

  static async getQAPairs(docId: string): Promise<QAPair[]> {
    try {
      const snapshot = await this.collection.doc(docId).collection('qa').orderBy('askedAt', 'asc').get();
      return snapshot.docs.map(doc => doc.data() as unknown as QAPair);
    } catch (error) {
      Logger.error('Failed to fetch QA pairs', { documentId: docId, error: (error as Error).message });
      throw new Error('Database service failure while fetching QA pairs');
    }
  }

  static get comparisonsCollection() {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK is not initialized.');
    }
    return admin.firestore().collection('comparisons');
  }

  static async saveComparisonResult(result: ComparisonResult): Promise<void> {
    try {
      await this.comparisonsCollection.doc(result.id).set(result as DocumentData);
    } catch (error) {
      Logger.error('Failed to save comparison result', { error: (error as Error).message });
      throw new Error('Database service failure during comparison save');
    }
  }

  static async getComparisonResult(id: string, userId: string): Promise<ComparisonResult | null> {
    try {
      const docSnapshot = await this.comparisonsCollection.doc(id).get();
      if (!docSnapshot.exists) return null;

      const data = docSnapshot.data() as unknown as ComparisonResult;
      if (data.userId !== userId) {
        Logger.warn('Unauthorized comparison access attempt', { userId, extra: { comparisonId: id } });
        return null;
      }
      return data;
    } catch (error) {
      Logger.error('Failed to fetch comparison result', { error: (error as Error).message });
      throw new Error('Database service failure while fetching comparison result');
    }
  }
}
