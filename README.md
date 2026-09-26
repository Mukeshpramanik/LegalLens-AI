# LegalLens AI (LegalEase-AI)

Grounded GenAI Legal Assistance for understanding, simplifying, comparing, and navigating legal documents.

---

## Repository & Deployment Context

- **Active GitHub Repository**: [https://github.com/Mukeshpramanik/LegalLens-AI](https://github.com/Mukeshpramanik/LegalLens-AI)
- **Upstream / Original Project**: [https://github.com/babluprajapatii/LegalEase-AI](https://github.com/babluprajapatii/LegalEase-AI)
- **Backend Production Host**: Render ([render.yaml](render.yaml) blueprint included)
- **Frontend Production Host**: Cloudflare Workers / Pages via OpenNext

> [!NOTE]
> If deploying via Render, verify which repository is linked to your Render Web Service. Render is currently connected to `Mukeshpramanik/LegalLens-AI` on branch `main`.

---

## Tech Stack & Architecture

- **Frontend**: Next.js 14.2.11 (React 18), Tailwind CSS, Lucide Icons, OpenNext for Cloudflare Workers
- **Backend**: Node.js 24, Express.js, TypeScript 5.6.2, Zod, express-rate-limit, Multer
- **Database & Auth**: Firebase Admin SDK (ID token verification), Cloud Firestore
- **AI Engine**: Google Gemini API (`@google/genai` 1.52.0)

```mermaid
flowchart TD
    Client[Next.js Frontend on Cloudflare] -->|Bearer ID Token| API[Express Backend on Render]
    API -->|Verifies Token| Auth[Firebase Auth]
    API -->|Reads/Writes Metadata & Analysis| DB[(Firestore)]
    API -->|Sends text for structured analysis| Gemini[Google Gemini API]

    subgraph Backend Pipeline
        API --> Upload(Document Upload & Text Extraction)
        Upload --> Storage[Local / Cloud Storage]
        API --> Analyze(AI Analysis Route)
        API --> QA(Grounded Q&A Route)
        API --> Compare(Document Comparison Route)
    end
```

---

## API Overview & Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `GET` | `/health` | No | Server health check and uptime (Render health probe) |
| `GET` | `/api/health` | No | API health check endpoint |
| `POST` | `/api/documents/upload` | Yes | Upload PDF, DOCX, or TXT (Max 10MB) |
| `GET` | `/api/documents` | Yes | List authenticated user's uploaded documents |
| `GET` | `/api/documents/:id` | Yes | Retrieve metadata for a single document |
| `DELETE`| `/api/documents/:id` | Yes | Delete a document and its stored analysis |
| `POST` | `/api/documents/:id/analyze` | Yes | Trigger full Gemini legal analysis & risk extraction |
| `GET` | `/api/documents/:id/analyze` | Yes | Retrieve cached analysis for a document |
| `POST` | `/api/documents/:id/ask` | Yes | Ask grounded question about a specific document |
| `GET` | `/api/documents/:id/ask` | Yes | Retrieve question-answer history for a document |
| `POST` | `/api/documents/compare` | Yes | Compare two documents side-by-side |

---

## Render Deployment Configuration

When deploying the backend on **Render**, configure the following settings in your Web Service:

| Setting | Value |
|---|---|
| **Environment** | Node |
| **Branch** | `main` |
| **Root Directory** | `.` *(leave blank or set to repository root)* |
| **Build Command** | `npm install --include=dev && npm run build:backend` |
| **Start Command** | `npm run start:backend` |
| **Health Check Path**| `/health` *(or `/api/health`)* |

### Required Environment Variables on Render

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Port to bind to | `8080` *(injected automatically by Render)* |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated) | `https://legallens-ai.<subdomain>.workers.dev` |
| `AI_PROVIDER` | AI provider type | `google-gemini-api` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini Model | `gemini-3.6-flash` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `your-firebase-project` |
| `FIREBASE_CLIENT_EMAIL`| Service account email | `firebase-adminsdk-xxx@...iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service account private key | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

---

## Common Deployment Pitfalls & Resolutions

1. **Missing Declarations (`TS7016: Could not find declaration file for 'express'`)**:
   - *Cause*: In npm workspaces with `NODE_ENV=production`, `npm install` skips `devDependencies`.
   - *Fix*: `typescript` and `@types/*` are placed in `backend/package.json` `dependencies` and the build command uses `npm install --include=dev`.
2. **Network Binding (`0.0.0.0`)**:
   - *Cause*: Express listening on `localhost` or default IPv6 can fail Render port detection.
   - *Fix*: Express explicitly binds to `0.0.0.0:${PORT}`.
3. **ESM / CommonJS Dynamic Import (`TS1479`)**:
   - *Cause*: `@google/genai` is an ESM-only package imported dynamically in a CommonJS project.
   - *Fix*: Structural TypeScript typing (`GenAIClient`) avoids static type imports that trigger TS1479.
4. **CORS Rejection**:
   - *Cause*: Trailing slashes or multi-origin deployments.
   - *Fix*: Dynamic origin matcher strips trailing slashes and handles comma-separated domains.

---

## Local Development & Testing

### Installation
```bash
npm install
```

### Typechecking
```bash
npm run typecheck
```

### Building
```bash
# Build backend only
npm run build:backend

# Build complete monorepo (backend + frontend)
npm run build
```

### Running Tests
```bash
# Run production integration and smoke tests
npm test

# Run tests targeting backend workspace
npm test --workspace=backend

# Run secret baseline scan
npm run secret-scan
```

### Local Development Servers
```bash
# Start backend (auto-reload on port 8080)
npm run dev:backend

# Start frontend (Next.js on port 3000)
npm run dev:frontend
```

---

## Disclaimer

LegalLens AI provides informational document analysis and is not a substitute for advice from a qualified legal professional.
