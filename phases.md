# LegalEase-AI — Development Phases

> **Hackathon:** PromptWars Virtual — "AI for Legal Assistance & Access"
> **Project:** LegalEase-AI — GenAI-powered legal document understanding tool
> **Source of truth:** PRD.md, architecture.md, rules.md, design.md
> **Status:** Implementation plan

---

## Execution Overview

LegalEase-AI is built in **6 sequential phases** with overlapping testing and security work throughout. Each phase delivers a verifiable increment. The final phase produces a hackathon-ready deployment with demo script.

The MVP protection rule applies at every phase: if time runs short, the project must still ship working Authentication → Upload → Processing → Gemini Analysis → Summary → Clause/Risk Detection → Q&A → Comparison → Next Steps → Security → Disclaimer → Deployment.

Optional items never block the MVP.

---

## Phase Dependency Diagram

```
Phase 1: Foundation & Security Baseline
   ↓ (security baseline gates all later phases)
Phase 2: Auth, Upload & Document Processing
   ↓ (auth + document pipeline gates AI)
Phase 3: GenAI Legal Analysis & Document Understanding
   ↓ (analysis must be stable before interactive features)
Phase 4: Document Q&A, Comparison & Advanced Assistance
   ↓ (interactive features complete the core feature set)
Phase 5: Polish, Security Hardening & Comprehensive Testing
   ↓ (hardening gates production)
Phase 6: Deployment, Observability & Demo Readiness
```

Work that happens **in parallel** with phases:

- Unit testing — starts Phase 2, continues through Phase 5
- UI polish — incremental, starts Phase 1, continues through Phase 5
- Security reviews — continuous, formal gates at Phase 1, Phase 5
- Documentation — continuous, finalize in Phase 6

---

## Phase 1 — Foundation, Project Setup & Security Baseline

### Phase Objective

Establish the secure technical foundation: project structure, Firebase/Google Cloud configuration, environment/secrets strategy, authentication architecture, frontend/backend boundaries, and security baselines that all later phases depend on.

### Why This Phase Exists

No AI, no upload, no document processing can be built safely without:

- A clean project structure that enforces frontend/backend separation
- Environment variable and secret management that prevents leaked credentials
- Firebase + Google Cloud projects configured with security rules
- Auth architecture prepared so Phase 2 can build on it immediately
- .gitignore and CI basics that prevent accidental secret commits

### Goals

- Next.js/React/TypeScript project initialized with strict mode
- Frontend/backend folder boundaries enforced
- Firebase project created and configured
- Google Cloud project created with required services enabled
- Environment variable strategy defined and `.env.example` created
- Secret management plan in place (Secret Manager for production)
- Firestore, Cloud Storage, Cloud Run configured at project level
- Git + GitHub setup with proper .gitignore
- Security baseline documented

### Detailed Tasks

#### Project Setup (MUST HAVE)

- [ ] Initialize Next.js application with TypeScript strict mode
- [ ] Create folder structure per architecture.md §12
- [ ] Configure `tsconfig.json` with strict mode
- [ ] Set up frontend/backend separation (`frontend/`, `backend/`, `shared/`)
- [ ] Create `shared/types/` for common TypeScript interfaces
- [ ] Add ESLint + Prettier with consistent rules
- [ ] Create `.gitignore` including `.env`, `node_modules`, build artifacts
- [ ] Create `.env.example` with variable names only (no values)

#### Google Cloud / Firebase Foundation (MUST HAVE)

- [ ] Create Firebase project, enable Authentication (Google OAuth)
- [ ] Create Google Cloud project, enable: Cloud Run, Cloud Storage, Firestore, Vertex AI, Cloud Logging, Secret Manager
- [ ] Configure Firestore database (production rules placeholder)
- [ ] Configure Cloud Storage bucket with user-scoped path structure
- [ ] Create Cloud Run service skeleton (health endpoint)
- [ ] Enable Cloud Logging and Cloud Monitoring
- [ ] Configure IAM: least-privilege service accounts
- [ ] Record project IDs in `.env.example` (names only, no real values)

#### Security Baseline (MUST HAVE)

- [ ] Define environment variable strategy: `.env` for dev, Secret Manager for production
- [ ] Create `backend/src/config/env.ts` with validation (Zod or equivalent)
- [ ] Document secret exposure rules per rules.md §7
- [ ] Add secret-scan script to package.json (`npm audit`, grep for API keys)
- [ ] Create CORS configuration (frontend origin only)
- [ ] Create rate-limiting middleware skeleton
- [ ] Document auth architecture (Firebase ID token → backend verification)
- [ ] Prepare authorization model (user ownership, document-scoped access)
- [ ] Prepare user/document ownership model (Firestore schema draft)

#### UI Foundation (SHOULD HAVE)

- [ ] Create basic page routing (Landing, Dashboard, Upload placeholders)
- [ ] Set up design token system (colors, spacing, typography per design.md §4–§5)
- [ ] Create basic accessible layout shell (semantic HTML, skip-nav link)
- [ ] Add focus state styles (2px `--color-focus` outline, 2px offset)

#### CI/CD Foundation (NICE TO HAVE)

- [ ] Create basic GitHub Actions workflow for lint/typecheck
- [ ] Add build verification step

### Features/Components Built

- Project skeleton (frontend/backend/shared)
- Environment configuration with validation
- Firebase project configured
- Google Cloud project configured (Cloud Run, Storage, Firestore, Vertex AI, Logging, Secret Manager)
- Security baseline documented
- Basic routing shell

### AI/GenAI Work

None in this phase. No Gemini integration yet.

### Security Requirements

- `.env` in `.gitignore` (verified)
- `.env.example` has variable names only
- No API keys in source code
- CORS restricted to frontend origin
- Rate-limiting middleware skeleton
- Secret exposure scan script
- IAM least-privilege draft

### Testing Requirements

- [ ] Project builds without errors
- [ ] TypeScript strict mode passes
- [ ] Lint passes
- [ ] Folder structure matches architecture.md §12
- [ ] `.env` not committed (verified by grep)

### Google Cloud / Firebase Work

- Firebase project created, Google OAuth enabled
- Google Cloud project created
- Cloud Storage bucket created (user-scoped path structure defined)
- Firestore database created (placeholder rules)
- Cloud Run service skeleton deployed (health endpoint)
- Vertex AI / Gemini API enabled (but not integrated yet)
- Cloud Logging + Monitoring enabled
- Secret Manager access configured

### Deliverables

- Initialized repo with folder structure
- `.env.example` with all required variable names
- Firebase + Google Cloud project IDs documented
- Security baseline document
- Health endpoint responding on Cloud Run

### Definition of Done

- [ ] `npm run build` succeeds
- [ ] TypeScript strict mode passes
- [ ] Firebase project exists and Google OAuth is configured
- [ ] Google Cloud project has Cloud Run, Storage, Firestore, Vertex AI, Logging enabled
- [ ] `.env.example` contains all required variable names, no real secrets
- [ ] `.gitignore` excludes `.env`, `node_modules`, build artifacts
- [ ] Health endpoint returns 200 on Cloud Run
- [ ] CORS configuration exists (frontend origin only)
- [ ] Secret scan script runs and reports clean
- [ ] Folder structure matches architecture.md §12

### Dependencies

None — this phase has no upstream dependencies.

### Exit Criteria

- Project builds clean
- Google Cloud + Firebase projects exist and are configured
- Security baseline documented
- Auth architecture prepared for Phase 2

---

## Phase 2 — Authentication, Document Upload & Document Processing

### Phase Objective

Build the complete document ingestion pipeline: authenticated users can upload valid PDFs/DOCX/TXT files, files are validated securely, text is extracted, metadata is stored in Firestore, and processing states are tracked end-to-end.

### Why This Phase Exists

The document pipeline is the prerequisite for all AI features. Without reliable upload, validation, extraction, and metadata tracking, Phase 3 (Gemini analysis) has nothing to analyze. This phase also establishes the auth boundary that protects every later phase.

### Goals

- Users sign in via Google OAuth (Firebase)
- Backend verifies Firebase ID tokens on every request
- Protected routes enforce authentication
- Document upload accepts PDF/DOCX/TXT ≤ 10 MB
- Multi-layer validation: client extension, MIME type, server content inspection
- Secure upload via signed Cloud Storage URLs
- User-scoped storage paths: `users/{userId}/documents/{docId}/original`
- Text extraction (pdf-parse, mammoth, TXT reader)
- Document normalization + metadata extraction
- Chunking for large documents (≤ 3,000 words/chunk)
- Firestore metadata stored (filename, upload date, processing status)
- Processing states tracked (uploading → validating → extracting → ready/failed)
- Unauthorized document access prevented

### Detailed Tasks

#### Authentication (MUST HAVE)

- [ ] Implement Firebase Auth SDK in frontend (Google OAuth button)
- [ ] Implement backend token verification middleware (verify Firebase ID token on every request)
- [ ] Implement protected route middleware (redirect unauthenticated users to login)
- [ ] Implement session management (httpOnly cookies or secure token storage)
- [ ] Implement logout (clear client + server session)
- [ ] Implement session expiry handling (redirect to login with message)

#### Document Upload (MUST HAVE)

- [ ] Create upload UI component (drag-drop + file picker)
- [ ] Client-side validation: file type (PDF/DOCX/TXT), size ≤ 10 MB
- [ ] Backend validation: MIME type, file signature/content inspection, size re-check
- [ ] Generate signed upload URLs from backend (Cloud Storage, user-scoped path)
- [ ] Frontend uploads directly to Cloud Storage via signed URL
- [ ] Filename sanitization (strip path traversal, generate unique storage names)
- [ ] Empty/corrupt file handling (reject with clear error message)
- [ ] Upload progress display to user

#### Document Processing (MUST HAVE)

- [ ] Text extraction: PDF (pdf-parse), DOCX (mammoth), TXT (direct read)
- [ ] Empty document detection (0 bytes or no extractable text → reject)
- [ ] Document normalization (standardize whitespace, encoding)
- [ ] Metadata extraction (page count, filename, upload date, file size)
- [ ] Chunking for large documents (≤ 3,000 words per chunk, per architecture.md §16.1)
- [ ] Store document metadata in Firestore (userId, filename, uploadDate, processingStatus, analysisIds[])
- [ ] Processing status tracking (uploading → validating → extracting → analyzing → complete/failed)
- [ ] Document history foundation (list documents per user, scoped to userId)

#### Security (MUST HAVE)

- [ ] User ownership check on every document access
- [ ] Unauthorized document access prevented (cross-user access test)
- [ ] Malicious/invalid upload handling (HTML/JS disguised as PDF rejected server-side)
- [ ] Input sanitization on all user-provided text
- [ ] File content not executed or rendered directly

#### UI States (SHOULD HAVE)

- [ ] Upload progress indicator
- [ ] Processing status display
- [ ] Success/error states with retry
- [ ] Empty state (no documents yet)

### Features/Components Built

- Google OAuth sign-in/sign-out
- Backend token verification middleware
- Protected route enforcement
- Upload UI (drag-drop + picker)
- Multi-layer file validation (client + server)
- Signed URL upload to Cloud Storage
- Text extraction pipeline (PDF/DOCX/TXT)
- Document normalization + chunking
- Firestore metadata CRUD
- Processing status tracking
- Document history list (user-scoped)

### AI/GenAI Work

None in this phase. Text extraction only — no Gemini calls yet.

### Security Requirements

- Firebase ID token verified on every API request
- User ownership verified server-side on every document access
- Signed URLs for Cloud Storage (user-scoped, time-limited)
- MIME type + file signature validation server-side
- Filename sanitization
- No execution of uploaded files
- HTML/JS stripped from user inputs
- CORS restricted to frontend origin

### Testing Requirements

- [ ] Valid PDF upload → accepted, metadata stored
- [ ] Valid DOCX upload → accepted
- [ ] Valid TXT upload → accepted
- [ ] Invalid file type (JPG, EXE, HTML) → rejected with specific error
- [ ] File > 10 MB → rejected with specific error
- [ ] Empty file → rejected
- [ ] Corrupted PDF → rejected with clear error
- [ ] Unauthenticated upload → redirected to login
- [ ] Cross-user document access → denied (403)
- [ ] Prompt injection in filename → sanitized, rejected if malicious

### Google Cloud / Firebase Work

- Firebase Authentication fully integrated (Google OAuth, session management)
- Cloud Storage bucket with user-scoped paths operational
- Firestore collections: `users`, `documents` operational
- Signed URL generation from backend working

### Deliverables

- Working sign-in/sign-out flow
- Upload UI with validation
- Document processing pipeline (extract → normalize → chunk → store metadata)
- Firestore metadata for uploaded documents
- Processing status visible to user

### Definition of Done

- [ ] Authenticated user can upload a valid PDF/DOCX/TXT ≤ 10 MB
- [ ] Unauthenticated user cannot upload (redirected to login)
- [ ] Invalid file type rejected with specific error message
- [ ] File > 10 MB rejected with specific error message
- [ ] Corrupted/empty file rejected with specific error message
- [ ] Unauthorized user cannot access another user's document (403 verified)
- [ ] Document text extracted successfully from PDF/DOCX/TXT
- [ ] Firestore metadata stored: userId, filename, uploadDate, processingStatus
- [ ] Cloud Storage path follows `users/{userId}/documents/{docId}/original`
- [ ] Processing status transitions visible to user (uploading → validating → extracting → ready/failed)
- [ ] Upload progress shown to user
- [ ] All security rules from rules.md §8–§9 satisfied

### Dependencies

- Phase 1 complete (project scaffold, Firebase/Google Cloud projects configured, env/secrets strategy defined)

### Exit Criteria

- Authenticated upload pipeline works end-to-end
- Document text extraction reliable for PDF/DOCX/TXT
- Firestore metadata stored correctly
- Security boundaries verified (auth + ownership)

---

## Phase 3 — GenAI Legal Analysis & Document Understanding

### Phase Objective

Implement real Gemini/Vertex AI integration: document analysis produces structured JSON output including summary, key clauses, obligations, important dates, risk/attention areas, and actionable next steps — all dynamically generated per document, grounded in the uploaded text, with source attribution and AI disclaimers.

### Why This Phase Exists

This is the core AI phase that delivers the product's primary value. The document pipeline from Phase 2 provides clean, validated text. Now Gemini must analyze that text and produce structured, safe, grounded output. AI safety rules (no invented clauses, no legal advice, educational language only) are enforced here.

### Goals

- Gemini/Vertex AI backend integration working
- AI orchestration layer in backend (not frontend)
- Document analysis prompt producing structured JSON
- System prompt defines AI role (educational only, not a lawyer)
- Grounding: AI answers only from provided document text
- Source/page/section attribution on all findings
- JSON schema validation on AI responses
- Malformed AI response handling with graceful fallback
- Risk detection with educational language ("may deserve attention")
- AI disclaimer on every analysis output
- Uncertainty handling ("I'm not confident...")
- "Information not present in document" behavior
- Prompt injection defense (document treated as untrusted data)

### Detailed Tasks

#### Gemini Integration (MUST HAVE)

- [ ] Create `aiService.ts` in backend: Gemini API calls via Vertex AI
- [ ] System prompt: educational purpose only, not a lawyer, refuse definitive legal advice
- [ ] Document analysis prompt: summary, key clauses, obligations, dates, risks, next steps
- [ ] Structured JSON output prompt with schema (per architecture.md §6.2, §7.1)
- [ ] Backend-only AI calls (API keys never exposed to frontend)

#### Document Analysis (MUST HAVE)

- [ ] Full document text sent as context to Gemini (or relevant chunks for large docs)
- [ ] AI generates: executive summary, key clauses with descriptions, obligations per party, important dates, risk flags with explanations
- [ ] Risk categories: liability, termination, indemnity, auto-renewal, limitation of liability, confidentiality, IP assignment, jurisdiction, payment obligations, penalties
- [ ] Each risk includes: clause description, why it may deserve attention, suggested clarification question
- [ ] Educational language only: "may deserve attention", "consider reviewing", "consider asking a qualified legal professional"
- [ ] Never label clauses "illegal", "invalid", "guaranteed risk"

#### Output Validation (MUST HAVE)

- [ ] JSON schema validation on AI response (required fields, types)
- [ ] Malformed JSON handling: log error, return user-friendly message, allow retry
- [ ] Missing fields filled with defaults, not crashed
- [ ] AI response validation BEFORE storing to Firestore and BEFORE sending to frontend

#### AI Safety (MUST HAVE)

- [ ] Hallucination mitigation: system prompt instructs "do not invent information"
- [ ] Uncertainty handling: AI states "I'm not confident about this detail" when uncertain
- [ ] "Information not present" behavior: explicit statement, not fabricated answer
- [ ] Prompt injection defense: uploaded document treated as untrusted data; system instructions have higher priority
- [ ] User question treated as untrusted input; sanitized before sending to Gemini
- [ ] AI disclaimer visible on every analysis output

#### Source Attribution (MUST HAVE)

- [ ] Every AI claim that references document content shows source (section/page)
- [ ] Source format: `Section X.X · Page Y`
- [ ] If source unavailable: omit citation, never fabricate

#### Processing Flow (SHOULD HAVE)

- [ ] AI analysis runs asynchronously (not blocking upload)
- [ ] Processing status updated: analyzing → complete/failed
- [ ] AI latency logged for observability
- [ ] Retry logic for transient AI failures (max 2 retries, exponential backoff)

### Features/Components Built

- `aiService.ts` — Gemini/Vertex AI backend integration
- System prompt + document analysis prompt
- Structured JSON output schema
- JSON schema validation layer
- Risk detection with educational language
- AI disclaimer component
- Source attribution component
- Prompt injection defense layer
- AI response validation before storage/rendering

### AI/GenAI Work

- Gemini API integration (backend only)
- System prompt (role + safety boundaries)
- Document analysis prompt (structured JSON)
- Risk detection prompt
- Simplification prompt (grade-10 reading level, preserve meaning)
- Q&A prompt (grounded, source-citing, "not found" handling)
- Comparison prompt (added/removed/modified clauses)
- Structured JSON output schema validation

### Security Requirements

- AI API keys stored in environment variables/Secret Manager (never frontend)
- Backend-only AI calls
- Document text treated as untrusted (prompt injection defense)
- User questions sanitized before AI call
- System instructions have higher priority than document content
- AI outputs validated before rendering (XSS prevention)
- No full document content in logs

### Testing Requirements

- [ ] AI analysis returns valid structured JSON
- [ ] Summary generated for standard contract
- [ ] At least 3 key clauses identified
- [ ] Obligations list contains ≥ 2 items per party
- [ ] Risk flags include explanation for each clause
- [ ] AI output is dynamic (different documents → different outputs)
- [ ] Missing information explicitly stated ("not present in document")
- [ ] Uncertainty expressed textually ("moderately confident")
- [ ] Prompt injection ignored (system returns grounded answer, not injected content)
- [ ] Malformed AI output handled gracefully (user-friendly error, retry)
- [ ] AI API failure produces graceful fallback message
- [ ] AI disclaimer visible on all outputs
- [ ] Source citations present for AI claims

### Google Cloud / Firebase Work

- Vertex AI / Gemini API configured and integrated
- Cloud Logging captures AI latency and errors
- Firestore stores analysis results (analysis collection)

### Deliverables

- Working Gemini integration producing structured analysis
- AI safety rules enforced (system prompt + validation)
- Source attribution on all AI findings
- Risk detection with educational language
- AI disclaimer on every analysis output

### Definition of Done

- [ ] Upload triggers AI analysis automatically
- [ ] AI returns structured JSON: summary, clauses[], obligations[], important_dates[], risks[], guidance{}
- [ ] Summary generated within 30 seconds for documents ≤ 50 pages
- [ ] At least 3 key clauses identified for standard contracts
- [ ] Risk flags include explanation for each flagged clause
- [ ] AI response is dynamic — different documents produce different outputs
- [ ] All AI outputs include disclaimer: "educational information, not legal advice"
- [ ] Source citations present for AI claims (Section X.X · Page Y)
- [ ] JSON schema validation passes on all AI responses
- [ ] Malformed AI output handled gracefully (error message + retry)
- [ ] Prompt injection attempts neutralized (system ignores injection, returns grounded answer)
- [ ] "Information not present" behavior works for out-of-scope questions
- [ ] Uncertainty expressed textually, never as numerical percentage
- [ ] No AI API keys exposed in frontend or browser DevTools
- [ ] No full document content in application logs
- [ ] All legal safety rules from rules.md §11, §14, §26 satisfied

### Dependencies

- Phase 2 complete (document pipeline stable: upload → extract → chunk → store metadata)

### Exit Criteria

- Gemini analysis produces valid structured JSON for uploaded documents
- AI safety rules enforced (no invented clauses, no legal advice, educational language)
- Source attribution present on all findings
- Malformed AI output handled gracefully

---

## Phase 4 — Document Q&A, Comparison & Advanced Legal Assistance

### Phase Objective

Build interactive AI capabilities on top of the stable document pipeline: users can ask questions about uploaded documents and receive grounded, source-attributed answers; upload/select two documents for comparison; receive actionable next-step guidance; and access "Explain This Clause" as an optional high-value feature.

### Why This Phase Exists

Phase 3 delivers one-way analysis (document → AI → results). Phase 4 makes the system interactive: users ask questions, compare documents, and get actionable guidance. These features complete the core MVP feature set defined in PRD.md §5.1.

### Goals

- Document-grounded Q&A with source citations
- Explicit "not found" handling for out-of-scope questions
- Document comparison (added/removed/modified clauses, changed obligations/dates/amounts)
- Actionable next-step guidance (checklist, lawyer questions, documents needed)
- "Explain This Clause" optional feature (if timeline permits, must not destabilize core MVP)
- Document history, search, analysis history, comparison history
- Dashboard integration with all features
- Loading states, empty states, error states on every interactive feature

### Detailed Tasks

#### Document Q&A (MUST HAVE)

- [ ] Q&A input component on analysis page
- [ ] Retrieve relevant document context (keyword matching + proximity, top 3-5 chunks)
- [ ] Send question + relevant chunks to Gemini with grounding instructions
- [ ] Display answer with source references (clickable, opens document at section/page)
- [ ] Confidence indicator: textual only ("highly confident", "moderately confident", "limited information")
- [ ] "Not found" response when information absent from document
- [ ] Prompt injection resistance (user question sanitized, system instructions enforced)
- [ ] Multiple questions supported within a session (conversation context where appropriate)
- [ ] Q&A history stored in Firestore (qa_sessions collection)

#### Document Comparison (MUST HAVE)

- [ ] Comparison selector UI (choose 2 documents from user's history)
- [ ] Verify both documents belong to user and are analyzed
- [ ] Send both documents to Gemini for comparison
- [ ] Identify: added clauses, removed clauses, modified clauses, changed obligations/dates/amounts/conditions
- [ ] Incompatible document type warning (lease vs. privacy policy)
- [ ] Structured comparison display with change types (+, –, ▼)
- [ ] Source references for each difference where available
- [ ] Comparison results stored in Firestore (comparisons collection)
- [ ] Recommended next steps based on comparison results

#### Actionable Guidance (MUST HAVE)

- [ ] Next Steps section on analysis page
- [ ] Checklist of action items (concrete, document-specific)
- [ ] Questions to ask a lawyer (open-ended, ≥ 2 per document)
- [ ] Documents/information user may need
- [ ] Things to clarify with the other party
- [ ] "Consider professional legal help" section for high-risk situations

#### Optional Feature: Explain This Clause (SHOULD HAVE — NICE TO HAVE if timeline tight)

- [ ] User selects a clause in analysis results
- [ ] "Explain This Clause" button triggers Gemini explanation
- [ ] Display: what clause says, plain-language explanation, why it may matter, what to clarify, source reference
- [ ] Marked as AI-generated with disclaimer
- [ ] Must not destabilize core MVP if implemented

#### History & Search (SHOULD HAVE)

- [ ] Document history list (filename, upload date, status)
- [ ] Search history by filename keyword
- [ ] Analysis history re-access (re-run analysis on old documents)
- [ ] Comparison history where appropriate
- [ ] Delete document with confirmation dialog (permanent deletion, no undo)

#### Dashboard Integration (SHOULD HAVE)

- [ ] Dashboard shows recent documents with status badges
- [ ] Quick actions: Upload, Compare
- [ ] Recent activity feed
- [ ] Empty states for all lists
- [ ] Loading/skeleton states on all async operations

### Features/Components Built

- Q&A interface with grounded answers
- Source citation component (clickable, opens document viewer)
- Document comparison UI (side-by-side, added/removed/modified)
- Next Steps checklist component
- "Explain This Clause" optional feature
- Document history with search
- Comparison history
- Dashboard with document list + quick actions
- Empty/loading/error states for all interactive features

### AI/GenAI Work

- Q&A prompt (grounded, source-citing, "not found" handling)
- Comparison prompt (added/removed/modified clauses, changed obligations/dates/amounts)
- Next steps generation prompt (checklist, lawyer questions, documents needed)
- "Explain This Clause" prompt (plain-language explanation, why it matters)
- Context retrieval for Q&A (keyword matching, top 3-5 chunks)

### Security Requirements

- Q&A questions sanitized (prompt injection defense)
- User owns both documents before comparison allowed
- Document content not logged in Q&A or comparison logs
- AI outputs validated before rendering (XSS prevention)
- Delete confirmation dialog (permanent action, no undo)
- Authorization on every document access (cross-user prevention)

### Testing Requirements

- [ ] Q&A returns grounded answer with source citation for in-scope question
- [ ] Q&A returns "This information is not present in the uploaded document" for out-of-scope question
- [ ] Q&A handles prompt injection gracefully (ignores injection, returns grounded answer)
- [ ] Comparison identifies added/removed/modified clauses for two different documents
- [ ] Incompatible document types trigger warning
- [ ] Next steps checklist contains ≥ 3 actionable items
- [ ] Lawyer questions section contains ≥ 2 questions
- [ ] "Explain This Clause" shows plain-language explanation with source reference
- [ ] Document history loads within 2 seconds
- [ ] Search filters history by filename keyword
- [ ] Delete requires confirmation, permanently removes document + analysis + Q&A history
- [ ] Unauthorized document access denied (403)
- [ ] All UI states present: loading, empty, error, success for Q&A, comparison, history

### Google Cloud / Firebase Work

- Firestore collections: `qa_sessions`, `comparisons` operational
- Cloud Logging captures Q&A and comparison latency/errors
- Cloud Storage retrieves documents for Q&A context and comparison

### Deliverables

- Working Q&A interface with grounded answers + source citations
- Document comparison with added/removed/modified clauses
- Next Steps checklist with lawyer questions
- Document history with search and delete
- Dashboard with quick actions and recent documents
- Optional "Explain This Clause" if timeline permits

### Definition of Done

- [ ] User can ask a question about an uploaded document and receive a grounded answer with source citation
- [ ] Out-of-scope question returns explicit "not found in document" response (not hallucinated answer)
- [ ] Prompt injection in Q&A is neutralized (system ignores injection, returns grounded answer)
- [ ] User can select two documents and receive structured comparison (added/removed/modified clauses)
- [ ] Incompatible document types trigger warning
- [ ] Next Steps checklist contains ≥ 3 actionable items + ≥ 2 lawyer questions
- [ ] Document history is searchable and user-scoped
- [ ] Delete requires confirmation and permanently removes data
- [ ] Dashboard shows recent documents with status badges and quick actions
- [ ] All interactive features have loading/empty/error/success states
- [ ] All Q&A answers include AI disclaimer
- [ ] All comparison results include AI badge + disclaimer
- [ ] "Explain This Clause" (if implemented) does not destabilize core MVP
- [ ] MVP core feature list satisfied: Authentication → Upload → Processing → Analysis → Summary → Clauses → Risks → Q&A → Comparison → Next Steps → Security → Disclaimer

### Dependencies

- Phase 3 complete (Gemini analysis stable, structured JSON output validated)

### Exit Criteria

- Q&A returns grounded answers with source citations
- Comparison identifies meaningful differences between documents
- Next Steps checklist generated per document
- All core MVP features working end-to-end

---

## Phase 5 — Product Polish, Security Hardening & Comprehensive Testing

### Phase Objective

Make the system reliable, safe, accessible, and hackathon-ready. This phase performs COMPLETE final validation: security hardening across all layers, AI safety testing, functional testing of all flows, edge-case testing, accessibility validation, and performance benchmarking.

### Why This Phase Exists

Earlier phases build features. Phase 5 validates everything together under real conditions. Security is not "tested only here" — it was considered throughout, but Phase 5 is where formal hardening and comprehensive testing happen. Testing started in earlier phases (unit/integration per phase); Phase 5 completes the full suite.

### Goals

- Security hardening: auth review, authorization review, cross-user access testing, Firebase rules, input/output validation, XSS, prompt injection, rate limiting, abuse protection
- AI safety testing: hallucination resistance, grounding, missing information, misleading questions, malformed output
- Functional testing: login, logout, upload, processing, analysis, simplification, Q&A, comparison, history, delete, errors, retry flows
- Edge-case testing: empty/corrupt/huge documents, unsupported files, AI timeout, storage failure, network failure
- Accessibility validation: WCAG 2.1 AA, keyboard navigation, focus states, semantic HTML, screen reader compatibility
- Performance validation: upload, processing, AI latency, Firestore reads/writes, frontend performance
- UX polish: loading states, skeletons, empty states, error messages, retry buttons, progress indicators, responsive layout, mobile usability

### Detailed Tasks

#### Security Hardening (MUST HAVE)

- [ ] Authentication review: verify Firebase ID token validation on every endpoint
- [ ] Authorization review: verify user ownership on every document access
- [ ] Cross-user access testing: attempt to access another user's document → verify denied
- [ ] Firebase security rules: finalize and test (request.auth.uid == userId)
- [ ] Firestore security rules: finalize and test
- [ ] Cloud Storage access controls: signed URLs, user-scoped, IAM policies
- [ ] API authorization: every endpoint requires auth + ownership check
- [ ] Input validation: file type, size, content checks at client + server
- [ ] Output validation: sanitize AI outputs before rendering (XSS prevention)
- [ ] XSS protection: HTML tags stripped from user inputs, JS events neutralized
- [ ] Prompt injection testing: submit injection prompts → verify neutralized
- [ ] Malicious document testing: HTML/JS disguised as PDF → rejected server-side
- [ ] Secret exposure check: grep for API keys, tokens, passwords in source
- [ ] Environment variable review: no secrets in frontend, .env in .gitignore
- [ ] Dependency security audit: `npm audit`, fix vulnerabilities
- [ ] Rate limiting: per-user-per-hour limits on AI endpoints, upload endpoints
- [ ] Abuse protection: exponential backoff for exceeded limits
- [ ] Sensitive logging review: verify no document content, tokens, API keys in logs

#### AI Safety Testing (MUST HAVE)

- [ ] Hallucination resistance: verify AI does not invent clauses/dates/obligations
- [ ] Grounding verification: answers cite document sections (not hallucinated)
- [ ] Missing information: "not found" response for out-of-scope questions
- [ ] Conflicting information: AI handles contradictory document content gracefully
- [ ] Misleading questions: AI ignores manipulation attempts, returns grounded answer
- [ ] Prompt injection: system ignores injection, returns document-grounded answer
- [ ] Malicious document instructions: uploaded document cannot override system behavior
- [ ] Malformed model output: JSON validation catches invalid responses, graceful fallback
- [ ] Uncertain answers: AI expresses uncertainty textually, not numerically
- [ ] Unsupported legal claims: AI never claims clause is illegal/invalid without authoritative basis
- [ ] Disclaimer presence: every AI output includes disclaimer

#### Functional Testing (MUST HAVE)

- [ ] Login success (Google OAuth)
- [ ] Login failure (invalid credentials → error message)
- [ ] Logout (session cleared, redirected to login)
- [ ] Upload valid PDF/DOCX/TXT
- [ ] Upload invalid file type → rejected
- [ ] Upload oversized file → rejected
- [ ] Upload corrupt file → rejected
- [ ] Upload empty document → rejected
- [ ] Processing completes → analysis displayed
- [ ] Analysis: summary, clauses, obligations, dates, risks displayed
- [ ] Simplification: plain-language version with original side-by-side
- [ ] Q&A: in-scope question → grounded answer with source
- [ ] Q&A: out-of-scope question → "not found" response
- [ ] Q&A: prompt injection → neutralized
- [ ] Comparison: two documents → added/removed/modified clauses
- [ ] History: document list loads, search filters, click re-opens analysis
- [ ] Delete: confirmation dialog, permanent removal
- [ ] Retry flows: upload retry, analysis retry, Q&A retry

#### Edge-Case Testing (MUST HAVE)

- [ ] Empty document → error message
- [ ] Corrupted document → error message
- [ ] Huge document (> 50 pages) → warning or chunked processing
- [ ] Unsupported file (.jpg, .exe) → rejected with specific error
- [ ] Duplicate document → handled (allow or warn)
- [ ] Very long question → truncated with warning
- [ ] Irrelevant question → "not found" response
- [ ] Question outside document → "not found" response
- [ ] Two incompatible documents → warning before comparison
- [ ] AI timeout → graceful error message + retry
- [ ] AI unavailable → fallback message + retry
- [ ] Storage failure → retry with exponential backoff
- [ ] Database failure → queue for retry + user notification
- [ ] Authentication failure → redirect to login
- [ ] Network failure → offline detection + retry option

#### Accessibility Validation (MUST HAVE)

- [ ] WCAG 2.1 AA principles: color contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- [ ] Keyboard navigation: all interactive elements reachable via Tab
- [ ] Focus states: 2px `--color-focus` outline on all interactive elements
- [ ] Semantic HTML: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`
- [ ] Labels: all inputs have associated `<label>` elements
- [ ] Screen reader compatibility: ARIA labels, live regions for dynamic content
- [ ] Readable text: body ≥ 16px, line height ≥ 1.5
- [ ] Sufficient contrast: verified with contrast checker
- [ ] Responsive design: mobile (≤ 768px), tablet (769–1024px), desktop (≥ 1025px)

#### Performance Validation (SHOULD HAVE)

- [ ] Dashboard loads ≤ 2 seconds
- [ ] Document analysis completes ≤ 30 seconds (≤ 50 pages)
- [ ] Q&A answers ≤ 10 seconds
- [ ] Comparison ≤ 45 seconds
- [ ] Upload ≤ 15 seconds (≤ 5 MB)
- [ ] 95th percentile API response time < 5 seconds
- [ ] Unnecessary AI calls eliminated (cache valid analysis)
- [ ] Firestore reads/writes optimized (indexed queries, pagination)
- [ ] Large document handling: chunking working, no timeout

#### UX Polish (SHOULD HAVE)

- [ ] Loading states: spinner/skeleton on every async operation
- [ ] Skeleton screens for dashboard, document list, analysis results
- [ ] Empty states: illustrated, with CTA, for all empty lists
- [ ] Error messages: human-readable, actionable, non-technical
- [ ] Retry buttons on all error states
- [ ] Progress indicators on upload and processing
- [ ] Responsive layout: mobile-first, stacks on small screens
- [ ] Mobile usability: touch targets ≥ 48px, readable text without zoom
- [ ] Consistent components: buttons, inputs, cards, badges per design.md
- [ ] Clear AI disclaimer visible on all AI outputs

### Features/Components Built

No new features — this phase validates and hardens all existing features.

### AI/GenAI Work

- AI safety testing (hallucination, grounding, uncertainty, injection)
- Malformed output handling verification
- Disclaimer presence verification on all AI outputs

### Security Requirements

- All security hardening tasks from MUST HAVE list
- Secret exposure scan clean
- Dependency audit clean
- Authorization verified on all endpoints
- Input/output validation verified
- Rate limiting active on expensive endpoints

### Testing Requirements

- All functional, edge-case, security, AI safety, accessibility, performance tests from lists above
- Test pass rate ≥ 80% (per PRD.md §19.4)
- Manual test pass for all primary flows

### Google Cloud / Firebase Work

- Cloud Logging verified capturing structured logs
- Cloud Monitoring verified capturing metrics
- Firestore security rules finalized and tested
- Cloud Storage IAM policies verified
- Secret Manager production secrets configured

### Deliverables

- Fully tested, hardened application
- Security audit report
- Accessibility audit report
- Performance benchmark report
- Test suite passing ≥ 80%
- Updated documentation

### Definition of Done

- [ ] Security hardening complete: auth review, authorization review, cross-user access test passed, Firebase/Storage rules finalized, input/output validation verified, XSS/prompt injection tested, rate limiting active, secrets scan clean
- [ ] AI safety testing complete: hallucination resistance verified, grounding verified, missing-information behavior verified, prompt injection neutralized, disclaimer present on all outputs
- [ ] Functional testing complete: login/logout/upload/analysis/simplification/Q&A/comparison/history/delete/retry all pass
- [ ] Edge-case testing complete: all 15 edge cases from rules.md §14 handled gracefully
- [ ] Accessibility validation complete: WCAG 2.1 AA, keyboard nav, focus states, semantic HTML, screen reader, contrast ≥ 4.5:1, responsive
- [ ] Performance validation complete: dashboard ≤ 2s, analysis ≤ 30s, Q&A ≤ 10s, comparison ≤ 45s, upload ≤ 15s
- [ ] UX polish complete: loading/empty/error/success states on all features, mobile usable, AI disclaimer visible
- [ ] Test pass rate ≥ 80%
- [ ] No API keys exposed in frontend or browser DevTools
- [ ] No secrets in Git history
- [ ] All rules from rules.md satisfied

### Dependencies

- Phase 4 complete (all core features implemented)

### Exit Criteria

- Security hardening verified
- All tests passing ≥ 80%
- Accessibility WCAG 2.1 AA verified
- Performance targets met
- MVP core feature list fully functional

---

## Phase 6 — Deployment, Observability & Hackathon Demo Readiness

### Phase Objective

Deploy to production: frontend hosted, Cloud Run backend deployed, Firebase/Firestore/Storage configured for production, observability enabled, hackathon demo prepared with live demo script, backup plan, and evaluation criteria verification.

### Why This Phase Exists

A working local application is not a hackathon submission. Phase 6 produces a production-deployed, observable, demo-ready system that judges can access and evaluate against all criteria.

### Goals

- Production build and deployment (frontend + Cloud Run backend)
- Firebase production configuration (auth, Firestore rules, Storage rules)
- Gemini/Vertex AI production configuration
- Environment variables and Secret Manager configured
- Observability: Cloud Logging, Cloud Monitoring, health endpoint, structured logs
- Reliability: retries, graceful AI failure, storage failure handling, user-friendly fallback
- Hackathon demo: 4-minute live demo flow with script, backup plan, demo documents
- Evaluation criteria verification: code quality, security, efficiency, testing, accessibility, problem statement alignment, Google Services usage, GenAI usage, real dynamic AI behavior

### Detailed Tasks

#### Deployment (MUST HAVE)

- [ ] Production build: `npm run build` succeeds, no warnings
- [ ] Frontend deployment: Next.js static export or managed hosting (Vercel/Cloud Run)
- [ ] Cloud Run deployment: backend container built, deployed, traffic routing
- [ ] Firebase production configuration: auth enabled, Firestore production rules active, Storage production rules active
- [ ] Firestore production rules: `request.auth.uid == userId` enforced
- [ ] Cloud Storage production configuration: user-scoped access, signed URLs, IAM policies
- [ ] Gemini/Vertex AI production configuration: API key from Secret Manager, backend calls only
- [ ] Environment variables configured in Cloud Run: GEMINI_API_KEY, FIREBASE_CONFIG, etc.
- [ ] Secret Manager: production API keys stored, backend fetches automatically
- [ ] Production authentication configuration: Google OAuth verified, token expiry handled
- [ ] CORS: frontend origin only, no wildcard
- [ ] API configuration: rate limits, timeouts, retries configured

#### Observability (MUST HAVE)

- [ ] Cloud Logging: structured JSON logs for all backend operations
- [ ] Cloud Monitoring: custom metrics for AI processing time, error rates
- [ ] Health endpoint: `/api/health` returns service status
- [ ] Structured logs include: timestamp, userId, action, duration, response code
- [ ] Error tracking: categorized errors logged with context (no sensitive data)
- [ ] AI failure monitoring: Gemini API failures logged and alerted
- [ ] Request monitoring: API response times, throughput
- [ ] Basic performance metrics: document processing time, Q&A latency

#### Reliability (MUST HAVE)

- [ ] Retries where appropriate: AI API (max 2, exponential backoff), storage (exponential backoff)
- [ ] Graceful AI failure: user-friendly fallback message, retry option
- [ ] Storage failure handling: retry + user notification
- [ ] Database failure handling: queue for retry + user notification
- [ ] User-friendly fallback states: all error paths have clear message + action
- [ ] Never log: auth tokens, API keys, passwords, full legal documents, unnecessary sensitive content, secrets

#### Hackathon Demo (MUST HAVE)

- [ ] Demo flow prepared (under 4 minutes):
  - [ ] 0:00–0:30 Landing page (value prop, sign-in button)
  - [ ] 0:30–1:00 Live Google login
  - [ ] 1:00–1:45 Live document upload + processing + AI analysis (summary, clauses, risks)
  - [ ] 1:45–2:15 Live Q&A (2 questions with grounded answers + source citations)
  - [ ] 2:15–2:45 Document comparison (2 documents, added/removed/modified clauses)
  - [ ] 2:45–3:15 Risk detection + Next Steps checklist
  - [ ] 3:15–3:40 Edge case demo (out-of-scope question → "not found" response)
  - [ ] 3:40–4:00 Wrap-up (AI disclaimer, Google Services summary, value prop)
- [ ] Demo documents prepared and tested (sample lease + sample contract)
- [ ] Demo user/account created with clean database state
- [ ] Stable production URL verified accessible
- [ ] Public/unlisted demo video access prepared
- [ ] UI readable from judge's seat (font sizes, contrast)
- [ ] Cursor visible and deliberate during demo
- [ ] Clear user flow narrated during demo
- [ ] Final demo script written
- [ ] Backup demo plan prepared (pre-analyzed results if upload fails, screenshots if AI fails, local copies if network fails)

#### Evaluation Criteria Verification (MUST HAVE)

- [ ] Code Quality: modular, clean, documented
- [ ] Security: no exposed secrets, strong authorization, secure document handling
- [ ] Efficiency: controlled AI calls, optimized processing, sensible resource usage
- [ ] Testing: automated + manual validation, ≥ 80% pass rate
- [ ] Accessibility: WCAG 2.1 AA, keyboard nav, screen reader, contrast
- [ ] Problem Statement Alignment: "AI for Legal Assistance & Access" addressed
- [ ] Google Services Usage: all 6 services genuinely integrated (Gemini, Firebase Auth, Cloud Storage, Firestore, Cloud Run, Cloud Logging)
- [ ] GenAI usage: real dynamic AI behavior (not hardcoded)
- [ ] Real dynamic AI output verified on demo documents

#### Production Hardening (SHOULD HAVE)

- [ ] HTTPS enforced (auto via Cloud Run/Firebase)
- [ ] HSTS headers configured
- [ ] Service accounts with least privilege
- [ ] VPC peering for internal communication (if applicable)
- [ ] Alerting for high error rates, performance degradation
- [ ] Backup demo documents tested on demo machine
- [ ] Stable internet connection verified for demo day

### Features/Components Built

No new features — this phase deploys and validates what exists.

### AI/GenAI Work

- Verify AI output is dynamic on demo documents (different inputs → different outputs)
- Verify grounding on demo Q&A
- Verify risk detection on demo documents
- Verify comparison on demo document pair

### Security Requirements

- Production secrets in Secret Manager (not .env)
- No hardcoded credentials in code
- Firebase production rules enforced
- Cloud Storage production IAM verified
- HTTPS enforced
- CORS restricted to frontend origin
- No secrets in Git history or browser DevTools

### Testing Requirements

- Production smoke tests: login, upload, analysis, Q&A, comparison, delete
- Demo dry-run: full 4-minute demo flow timed and verified
- Backup plan tested: upload failure → pre-analyzed results; AI failure → screenshots; network failure → local copies
- Edge case verified on production: out-of-scope Q&A → "not found"
- Google Services verified in production: all 6 services genuinely operational

### Google Cloud / Firebase Work

- Cloud Run production deployment with environment variables + Secret Manager
- Firebase production configuration (auth, Firestore rules, Storage rules)
- Vertex AI production API key from Secret Manager
- Cloud Logging + Monitoring production configuration
- Health endpoint operational
- Structured logging enabled

### Deliverables

- Production URL (stable, accessible)
- Deployed frontend + backend
- Firestore + Cloud Storage production configured
- Secret Manager production secrets configured
- Observability dashboard (logs + metrics)
- Demo script + backup plan
- Demo documents tested
- Evaluation criteria checklist completed

### Definition of Done

- [ ] Production build succeeds, frontend deployed, Cloud Run backend deployed
- [ ] Firebase production configuration active (auth, Firestore rules, Storage rules)
- [ ] Secret Manager configured with production API keys
- [ ] Health endpoint returns 200
- [ ] Cloud Logging capturing structured logs (no sensitive data)
- [ ] Cloud Monitoring capturing metrics (AI latency, error rates)
- [ ] Demo flow fits within 4 minutes (timed dry-run verified)
- [ ] Demo uses live input and dynamic AI output (not hardcoded)
- [ ] All 16 demo steps demonstrated successfully (landing → login → dashboard → upload → processing → analysis → summary → clauses → risks → Q&A → comparison → next steps → edge case → disclaimer)
- [ ] Backup demo plan tested and ready
- [ ] All 9 hackathon evaluation criteria verified and passing
- [ ] All 6 Google Services genuinely integrated and operational in production
- [ ] AI disclaimer visible on all AI outputs in production
- [ ] No API keys, tokens, secrets exposed in frontend or browser DevTools
- [ ] Documentation synchronized (README, API docs, deployment steps)

### Dependencies

- Phase 5 complete (all features implemented, tested, hardened)

### Exit Criteria

- Production deployment successful and accessible
- Demo flow completed within 4 minutes on production URL
- All evaluation criteria verified passing
- Backup plan tested and ready

---

## Cross-Phase Engineering Rules

These rules apply to ALL phases, not just one:

### Security (applies to every phase)

- API keys never in frontend code — backend only
- Firebase ID tokens verified on every API request
- User ownership verified server-side on every document access
- Input validated at every layer (client + server)
- Output sanitized before rendering (XSS prevention)
- Secrets in `.env` (dev) or Secret Manager (prod), never in Git
- CORS restricted to frontend origin
- Rate limiting on expensive endpoints

### AI Safety (applies to every phase with AI)

- System prompt has highest priority (prompt injection defense)
- AI never invents clauses, dates, obligations, or facts
- AI never provides definitive legal advice
- Educational language only ("may deserve attention", "consider reviewing")
- Disclaimer on every AI output
- Uncertainty expressed textually, never numerically
- "Not found" response for missing information

### Legal Safety (applies to every phase)

- Never label clauses "illegal" or "invalid" without authoritative basis
- Never claim AI output is verified, accurate, or authoritative
- Always recommend consulting a qualified legal professional for high-risk matters
- High-risk document types trigger enhanced disclaimer

### Testing (starts Phase 2, continues through Phase 5)

- Unit tests for auth, upload validation, AI response parsing
- Integration tests for upload → extraction → analysis flow
- AI workflow tests for grounding, dynamic output, risk detection
- Security tests for API key exposure, prompt injection, authorization
- Edge-case tests for all error scenarios
- Accessibility tests for keyboard nav, screen reader, contrast
- Performance tests for dashboard load, analysis time, Q&A time

### Accessibility (applies to every phase with UI)

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`)
- Keyboard navigation (all interactive elements reachable via Tab)
- Focus states visible (2px `--color-focus` outline)
- Labels on all inputs
- ARIA labels on dynamic content regions
- Color not used alone (icon + text + color)
- Screen reader support (ARIA, live regions)
- Contrast ≥ 4.5:1 normal, ≥ 3:1 large

### Performance (applies to every phase)

- No unnecessary AI calls (cache valid analysis)
- Document size ≤ 10 MB, ≤ 50 pages
- Chunk large documents (≤ 3,000 words/chunk)
- Only relevant context sent to AI (not entire document for Q&A)
- Firestore queries indexed and paginated
- Frontend rendering optimized (no unnecessary re-renders)

### Google Services (every service has real technical responsibility)

- Gemini = the brain (GenAI)
- Firebase Auth = the gatekeeper (security)
- Cloud Storage = the vault (file persistence)
- Firestore = the memory (structured data)
- Cloud Run = the engine (processing orchestration)
- Cloud Logging = the nervous system (observability)

### Logging Rules (apply to every phase)

- Log: request ID, timestamp, endpoint, processing status, response time, error category, service failure, AI latency, file processing status, userId (audit trail)
- Never log: full legal documents, full extracted text, auth tokens, API keys, passwords, sensitive user data, full prompts containing private documents, full AI responses containing private documents

---

## MVP Priority Matrix

If time is limited, ship this minimum viable product in order:

| Priority     | Feature                                                       | Phase          | MVP Protection                          |
| ------------ | ------------------------------------------------------------- | -------------- | --------------------------------------- |
| MUST         | Authentication (Google OAuth)                                 | 2              | Core — no upload or AI without auth     |
| MUST         | Document Upload (PDF/DOCX/TXT ≤ 10 MB)                        | 2              | Core — input pipeline                   |
| MUST         | Document Processing (text extraction, chunking)               | 2              | Core — prepares text for AI             |
| MUST         | Gemini Analysis (summary, clauses, obligations, dates, risks) | 3              | Core — primary value                    |
| MUST         | Risk Detection with educational language                      | 3              | Core — differentiates from generic AI   |
| MUST         | Document Q&A (grounded, source-cited)                         | 4              | Core — interactive feature              |
| MUST         | Document Comparison (added/removed/modified)                  | 4              | Core — two-document feature             |
| MUST         | Next Steps (checklist, lawyer questions)                      | 4              | Core — actionable output                |
| MUST         | AI Disclaimer on all outputs                                  | 3              | Core — legal safety                     |
| MUST         | Security (auth, authorization, input validation)              | 1–5            | Core — no demo without it               |
| MUST         | Deployment (Cloud Run + frontend)                             | 6              | Core — judges must access it            |
| SHOULD       | Simplification (plain-language version)                       | 3              | Important but not MVP-blocking          |
| SHOULD       | Document history + search                                     | 4              | Useful but not MVP-blocking             |
| SHOULD       | "Explain This Clause"                                         | 4              | Nice-to-have optional                   |
| SHOULD       | Accessibility polish                                          | 5              | Important for scoring, not MVP-blocking |
| SHOULD       | Performance optimization                                      | 5              | Important for scoring, not MVP-blocking |
| NICE TO HAVE | Vector search (Vertex AI Vector Search)                       | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Multilingual support                                          | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Lawyer matching/scheduling                                    | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Advanced analytics                                            | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Collaboration features                                        | Post-hackathon | Future enhancement                      |
| NICE TO HAVE | Microservices architecture                                    | Post-hackathon | Over-engineering for MVP                |

---

## Final Definition of Done

The project is hackathon-ready when ALL of the following are met:

### Code Quality

- [ ] Clean, modular code (frontend/backend/AI separated)
- [ ] Consistent naming conventions
- [ ] No hardcoded AI responses — all AI output dynamically generated
- [ ] Code documented with comments for complex logic
- [ ] Error handling for all known edge cases

### Security

- [ ] No API keys exposed in frontend or browser DevTools
- [ ] All secrets in `.env` (dev) or Secret Manager (prod), excluded by `.gitignore`
- [ ] Firebase ID tokens validated on every API request
- [ ] File uploads validated on client + server
- [ ] Input sanitization on all user-provided text
- [ ] Prompt injection handled gracefully
- [ ] HTTPS enforced, CORS configured

### Efficiency

- [ ] Dashboard loads ≤ 2 seconds
- [ ] Document analysis ≤ 30 seconds (≤ 50 pages)
- [ ] Q&A ≤ 10 seconds
- [ ] Comparison ≤ 45 seconds
- [ ] Resource usage optimized (no unnecessary API calls)

### Testing

- [ ] Unit tests for auth, upload validation, AI response parsing
- [ ] Integration tests for full document processing flow
- [ ] AI workflow tests verifying dynamic output and grounding
- [ ] Security tests (API key exposure, prompt injection, authorization)
- [ ] Edge-case tests for all error scenarios
- [ ] Accessibility tests (keyboard, screen-reader, contrast)
- [ ] Test pass rate ≥ 80%

### Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen-reader compatible
- [ ] Sufficient color contrast
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Clear, descriptive error messages

### Problem Statement Alignment

- [ ] Product addresses "AI for Legal Assistance & Access"
- [ ] AI provides information and assistance, NOT replacement for legal advice
- [ ] All AI outputs grounded in uploaded documents
- [ ] System does not invent facts or clauses
- [ ] System encourages professional legal consultation for high-risk matters
- [ ] Disclaimer clearly visible on all AI outputs

### Google Services Usage

- [ ] Gemini / Vertex AI used for GenAI features
- [ ] Firebase Auth used for authentication
- [ ] Cloud Storage used for document storage
- [ ] Firestore used for metadata/history
- [ ] Cloud Run used for backend API
- [ ] Cloud Logging used for observability
- [ ] Each service serves clear, necessary function (not decorative)

### Demo Readiness

- [ ] Full demo flow fits within 4 minutes
- [ ] Live user input/data demonstrated
- [ ] Real working functionality shown (not mockups)
- [ ] Clear GenAI integration visible
- [ ] Dynamic AI responses (not hardcoded)
- [ ] At least one success case demonstrated
- [ ] At least one error/edge case demonstrated

---

## Release Readiness Checklist

Before submitting to hackathon, verify:

### Pre-Submission

- [ ] Production URL accessible and stable
- [ ] Demo dry-run completed (timed, fits 4 minutes)
- [ ] Demo documents prepared and tested
- [ ] Demo user account created with clean database state
- [ ] Backup demo plan tested (upload failure → pre-analyzed results; AI failure → screenshots; network failure → local copies)
- [ ] No API keys in frontend code or browser DevTools
- [ ] No secrets in Git history (rotate if leaked)
- [ ] `.env` in `.gitignore`, `.env.example` has variable names only
- [ ] Firebase Auth Google OAuth working in production
- [ ] Firestore production rules enforced (`request.auth.uid == userId`)
- [ ] Cloud Storage production IAM verified (user-scoped access)
- [ ] Cloud Run backend deployed with Secret Manager secrets
- [ ] Vertex AI API key from Secret Manager, backend calls only
- [ ] Cloud Logging capturing structured logs (no sensitive data)
- [ ] Health endpoint `/api/health` returning 200
- [ ] All 6 Google Services genuinely operational in production
- [ ] AI disclaimer visible on all AI outputs
- [ ] Source attribution present on all AI-cited content
- [ ] Dynamic AI output verified (different documents → different results)
- [ ] Prompt injection neutralized (tested and verified)
- [ ] "Not found" behavior works for out-of-scope questions
- [ ] Accessibility: keyboard nav, screen reader, contrast, responsive verified
- [ ] All edge cases handled gracefully (empty doc, corrupt doc, AI timeout, network failure, unauthorized access)
- [ ] README synchronized with architecture
- [ ] Demo script written and rehearsed
- [ ] Judges can access production URL without authentication issues
- [ ] Demo video recorded (if required) or backup plan ready

### Hackathon Evaluation Criteria

- [ ] Code Quality: clean, modular, maintainable
- [ ] Security: no leaked secrets, strong authorization, secure document handling
- [ ] Efficiency: controlled AI calls, optimized processing, sensible resource usage
- [ ] Testing: automated + manual validation, ≥ 80% pass rate
- [ ] Accessibility: WCAG-aware UI and accessible AI results
- [ ] Problem Statement Alignment: "AI for Legal Assistance & Access" addressed
- [ ] Google Services Usage: all 6 services genuinely integrated and working
- [ ] GenAI usage: real dynamic AI behavior, not hardcoded
- [ ] Real dynamic AI output verified on demo documents

---

_LegalEase-AI development phases — PromptWars Virtual hackathon._

_Phases based on PRD.md, architecture.md, rules.md, and design.md._

_Every phase protects the MVP. No optional feature blocks the core product._

_LegalEase-AI does not provide legal advice. These phases are an engineering plan, not legal advice._
