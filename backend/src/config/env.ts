import dotenv from 'dotenv';
import fs from "fs";

import path from 'path';
import { z } from 'zod';

let envPath = path.resolve(__dirname, '../../../.env'); // ts-node (src/config)
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(__dirname, '../../../../../.env'); // node (dist/backend/src/config)
}
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(process.cwd(), '.env'); // fallback
}
dotenv.config({ path: envPath });

const envSchema = z.object({
  PORT: z.string().default('8080').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  GCP_PROJECT_ID: z.string().default('demo-gcp-project'),
  GCP_REGION: z.string().default('us-central1'),
  GCS_BUCKET_NAME: z.string().default('legalease-documents'),

  AI_PROVIDER: z.enum(['google-gemini-api', 'vertex-ai']).default('google-gemini-api'),
  GEMINI_API_KEY: z.string().optional(),
  VERTEX_AI_LOCATION: z.string().default('us-central1'),
  GEMINI_MODEL: z.string().default('gemini-3.6-flash'),

  FIREBASE_PROJECT_ID: z.string().default('demo-firebase-project'),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:', result.error.format());
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In dev mode, fallback to default values
    return envSchema.parse({});
  }
  return result.data;
}

export const env = parseEnv();
