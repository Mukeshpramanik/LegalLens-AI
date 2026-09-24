# LegalLens AI

Grounded GenAI Legal Assistance for understanding, simplifying, comparing, and navigating legal documents.

## Problem Statement
Legal documents are often dense, convoluted, and difficult for non-lawyers to understand. Individuals and small businesses frequently struggle to parse lengthy contracts, identify critical obligations, detect hidden risks, and compare multiple versions of agreements. Traditional legal consultation is expensive and time-consuming.

## Solution
LegalLens AI is a secure, intelligent platform that empowers users to analyze legal documents instantly. By leveraging advanced generative AI (Google Gemini) and a robust document processing pipeline, LegalLens AI automatically extracts key clauses, maps obligations and rights, surfaces risks, provides a grounded Q&A interface for specific inquiries, and compares document versions side-by-side.

## Key Features
- **AI document analysis**: Automatic extraction of key clauses, obligations, and parties.
- **Legal document Q&A**: Ask specific questions and receive grounded answers sourced directly from your uploaded document.
- **Document comparison**: Select two contracts to analyze side-by-side for additions, removals, modifications, and introduced risks.
- **Risk identification**: Automatic surfacing of potentially dangerous clauses (e.g., liability, termination penalties).
- **Grounded responses**: The AI is strictly prompted to only use information present in the document.
- **Secure authentication**: Firebase-backed user authentication ensures data privacy.
- **Document ownership protection**: Strict Firestore rules and backend validations prevent unauthorized access to other users' documents.

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Zod (Validation), express-rate-limit
- **Database / Auth**: Firebase Admin SDK, Firestore, Firebase Auth
- **AI**: Google Gemini API (\`@google/genai\`)

## Architecture

\`\`\`mermaid
flowchart TD
    Client[Next.js Frontend] -->|Auth Token| API[Express Backend]
    API -->|Validates Token| Auth[Firebase Auth]
    API -->|Reads/Writes| DB[(Firestore)]
    API -->|Sends text for analysis| Gemini[Google Gemini API]

    subgraph Backend Pipeline
        API --> Upload(Document Upload & Extraction)
        Upload --> Storage[Local/Cloud Storage]
        API --> Analyze(AI Analysis Route)
        API --> QA(Q&A Route)
        API --> Compare(Compare Route)
    end
\`\`\`

## AI Workflow
1. **Extraction**: Uploaded documents (PDF, DOCX, TXT) are securely parsed to extract raw text.
2. **Structuring**: The text is sent to the Gemini API with strict JSON schema requirements to enforce structured outputs.
3. **Grounding**: Gemini is prompted to strictly cite the source text and avoid inventing facts.
4. **Retry Engine**: Transient API failures (e.g., 503 High Demand) are handled by a custom exponential backoff engine to ensure reliable processing.
5. **Validation**: The backend safely parses the AI response and validates it before persisting to Firestore.

## Security
- **Strict Validations**: Zod schemas on all API endpoints reject malformed requests.
- **Rate Limiting**: Targeted limits on expensive AI endpoints prevent abuse.
- **Ownership Verification**: All routes rigorously verify that the authenticated user owns the requested documents.
- **Secrets Management**: No API keys or sensitive data are exposed to the client or tracked in version control.

## Installation

1. Clone the repository.
2. Install dependencies for the root, frontend, and backend:
   \`\`\`bash
   npm install
   npm run build
   \`\`\`

## Environment Variables
Copy the provided example file and fill in your credentials:
\`\`\`bash
cp .env.example .env
\`\`\`
*(See \`.env.example\` for required variables including \`GEMINI_API_KEY\` and Firebase Admin credentials).*

## Running Locally

To start both the frontend and backend concurrently:
\`\`\`bash
npm run dev:backend
# In a separate terminal:
npm run dev:frontend
\`\`\`

## API Overview
- \`POST /api/documents/upload\`: Securely upload and extract text.
- \`GET /api/documents\`: List authenticated user's documents.
- \`POST /api/documents/:id/analyze\`: Trigger full Gemini document analysis.
- \`POST /api/documents/:id/ask\`: Submit a question against a document.
- \`POST /api/documents/compare\`: Compare two documents.

## Project Structure
- \`/frontend\`: Next.js React application.
- \`/backend\`: Express TypeScript API.
- \`/shared\`: Shared TypeScript types and constants.
- \`/scripts\`: Utility and integration test scripts.

## Limitations
- Large legal documents may exceed the context window of standard LLM tiers.
- File parsing is currently optimized for standard text layouts; heavily formatted PDFs may degrade extraction quality.
- Rate limits are in-memory (per Node process) and should be moved to Redis for multi-instance scaling.

## Future Scope
- Implementation of a vector database for semantic search across massive document repositories.
- Collaborative document review (multi-user sharing).
- Export analysis results to PDF/DOCX.

## Disclaimer
LegalLens AI provides informational document analysis and is not a substitute for advice from a qualified legal professional.
