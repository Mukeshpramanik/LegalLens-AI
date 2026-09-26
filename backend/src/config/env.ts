import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Resolve .env from multiple potential working/transpiled directories
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../../.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const p of possibleEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

const envSchema = z.object({
  PORT: z
    .union([z.string(), z.number()])
    .default('8080')
    .transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))),
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

  const parsed = result.data;

  // Production configuration warnings (clear, actionable, no secrets leaked)
  if (parsed.NODE_ENV === 'production') {
    if (parsed.AI_PROVIDER === 'google-gemini-api' && (!parsed.GEMINI_API_KEY || !parsed.GEMINI_API_KEY.trim())) {
      console.warn('⚠️  [CONFIG WARNING] GEMINI_API_KEY is not configured in production. AI analysis and Q&A endpoints will fail.');
    }
    if (!parsed.FIREBASE_CLIENT_EMAIL || !parsed.FIREBASE_PRIVATE_KEY) {
      console.warn('⚠️  [CONFIG WARNING] Firebase Admin credentials (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) are missing. Authenticated endpoints will return 503.');
    }
    if (parsed.FRONTEND_URL === 'http://localhost:3000') {
      console.warn('⚠️  [CONFIG WARNING] FRONTEND_URL is set to localhost in production. Set FRONTEND_URL to your deployed Cloudflare frontend domain.');
    }
  }

  return parsed;
}

export const env = parseEnv();
