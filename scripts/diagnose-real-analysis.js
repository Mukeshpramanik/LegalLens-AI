const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

require('../backend/dist/backend/src/middleware/auth');
const { FirestoreService } = require('../backend/dist/backend/src/services/firestoreService');
const { StorageService } = require('../backend/dist/backend/src/services/storageService');
const { GeminiService } = require('../backend/dist/backend/src/services/geminiService');
const { Logger } = require('../backend/dist/backend/src/utils/logging');
const fs = require('fs');

Logger.error = (msg, meta) => console.error('[LOGGER ERROR]', msg, JSON.stringify(meta, null, 2));
Logger.info = (msg, meta) => console.log('[LOGGER INFO]', msg);

// Override StorageRoot to match backend running dir
const originalStorageRoot = path.resolve(__dirname, '../backend/uploads');
StorageService.storageRoot = originalStorageRoot;

async function run() {
  console.log('--- Starting REAL Document Diagnosis ---');
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    const snapshot = await db.collection('documents').get();

    let validDoc = null;
    let documentText = null;

    for (const doc of snapshot.docs) {
      const docData = doc.data();
      const documentId = doc.id;
      const userId = docData.userId;
      try {
        const textPath = path.resolve(originalStorageRoot, `users/${userId}/documents/${documentId}/extracted.txt`);
        if (fs.existsSync(textPath)) {
          documentText = fs.readFileSync(textPath, 'utf8');
          validDoc = { id: documentId, userId };
          break; // Use the first one we find
        }
      } catch (e) {}
    }

    if (!validDoc) {
      console.log('No documents found with extracted text on disk!');
      process.exit(0);
    }

    const { id: documentId, userId } = validDoc;

    console.log(`[Status] Found document: ${documentId} (User: ${userId})`);
    console.log(`[Status] Text retrieved. Length: ${documentText.length} characters.`);

    // We bypass the StorageService call since we already loaded it, or we can mock it
    StorageService.getExtractedText = async () => documentText;

    console.log(`[Status] Executing Gemini analysis...`);
    try {
      const result = await GeminiService.analyzeDocument(documentId, userId, documentText);
      console.log('[Status] Analysis Succeeded!');

      console.log(`[Status] Validating against FirestoreService...`);
      await FirestoreService.saveAnalysisResult(documentId, result);
      console.log('[Status] Firestore Save Succeeded!');

    } catch (geminiError) {
      console.error('\n--- GEMINI SERVICE EXCEPTION ---');
      console.error(geminiError.message);
      console.error(geminiError.stack);
    }

  } catch (error) {
    console.error('\n--- FATAL EXCEPTION ---');
    console.error(error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

run();
