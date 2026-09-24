# LegalEase-AI — Design System & UX Specification

> **Version:** 1.0
> **Hackathon:** PromptWars Virtual — "AI for Legal Assistance & Access"
> **Sources:** PRD.md, architecture.md, rules.md, phases.md
> **Status:** Final

---

## 1. Design Vision

LegalEase-AI helps people understand legal documents without being legal experts. The interface must make complex legal information feel clear, trustworthy, and manageable.

Design is not decoration. Design serves understanding. Every visual choice must help the user comprehend their document faster and with more confidence.

The product should look like a polished, modern SaaS tool — professional, calm, focused. Not a generic AI wrapper. Not a legal-tech novelty. A serious document understanding tool for real people.

**Visual identity:**

> Modern legal clarity powered by responsible AI.

---

## 2. Design Principles

| Principle           | Meaning                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Clarity First**   | Reduce cognitive load. Short sections, clear headings, cards, progressive disclosure. Never overwhelm.                           |
| **Trust**           | Feel reliable, secure, professional, calm. No gimmicks. No gaming aesthetics. No aggressive corporate styling.                   |
| **AI Transparency** | Users must always know when AI is involved. AI output is visually distinct, labeled, and accompanied by disclaimers and sources. |
| **Document-First**  | The uploaded document is the primary source of truth. Every feature points back to it.                                           |
| **Accessibility**   | WCAG 2.1 AA. Keyboard navigation, screen-reader support, readable typography, sufficient contrast, mobile-friendly.              |
| **Plain Language**  | Labels, buttons, messages, and explanations written for non-lawyers. No jargon without explanation.                              |

---

## 3. Brand & Visual Identity

### Brand Personality

| Trait        | Expression                                                       |
| ------------ | ---------------------------------------------------------------- |
| Trustworthy  | Clean layouts, professional typography, no flashy effects        |
| Intelligent  | Structured information, clear hierarchy, organized data          |
| Approachable | Plain language, warm-but-professional tone, gentle color palette |
| Professional | Restrained design, consistent spacing, no decorative excess      |
| Transparent  | AI labels, source citations, disclaimers always visible          |
| Helpful      | Actionable guidance, clear next steps, helpful empty states      |
| Modern       | Contemporary sans-serif typography, subtle depth, clean icons    |

### Avoid

- Stereotypical courtroom imagery (gavels, scales of justice)
- Excessive legal-iconography
- Aggressive corporate styling (dark "enterprise" themes)
- Overly robotic AI branding (circuit patterns, robot mascots)
- Gaming-like animations or gamification
- Generic AI-chatbot aesthetics (gradient bubbles, glowing borders)

---

## 4. Color System

Colors communicate meaning. Never rely on color alone — pair every semantic color with an icon and text label.

### Token Table

| Token                      | Value     | Usage                                                     |
| -------------------------- | --------- | --------------------------------------------------------- |
| `--color-primary`          | `#1E3A5F` | Primary actions, links, headers, active states            |
| `--color-primary-hover`    | `#152D4A` | Hover for primary elements                                |
| `--color-primary-light`    | `#E8EDF3` | Primary backgrounds, selected states                      |
| `--color-secondary`        | `#5B7D99` | Secondary actions, supporting elements                    |
| `--color-secondary-hover`  | `#4A6A82` | Hover for secondary elements                              |
| `--color-background`       | `#F7F8FA` | Page background                                           |
| `--color-surface`          | `#FFFFFF` | Card backgrounds, input backgrounds                       |
| `--color-surface-elevated` | `#FFFFFF` | Modals, popovers, dropdowns (same as surface with shadow) |
| `--color-text-primary`     | `#1A1A2E` | Body text, headings, primary content                      |
| `--color-text-secondary`   | `#5E6B7A` | Captions, labels, supporting text                         |
| `--color-text-muted`       | `#8A95A3` | Placeholder text, disabled labels                         |
| `--color-border`           | `#DDE1E7` | Dividers, card borders, input borders                     |
| `--color-border-strong`    | `#B8C0C9` | Focus borders, important separators                       |
| `--color-success`          | `#2E7D4A` | Success states, confirmed actions                         |
| `--color-success-bg`       | `#E8F5E9` | Success background                                        |
| `--color-warning`          | `#B7791F` | Warnings, attention needed                                |
| `--color-warning-bg`       | `#FEF5E7` | Warning background                                        |
| `--color-error`            | `#C0392B` | Errors, destructive actions, invalid input                |
| `--color-error-bg`         | `#FDEDEC` | Error background                                          |
| `--color-info`             | `#3B7CB5` | Informational messages, links                             |
| `--color-info-bg`          | `#EBF3FB` | Info background                                           |
| `--color-ai`               | `#6C5CE7` | AI-generated content indicator                            |
| `--color-ai-bg`            | `#F3F1FF` | AI content background                                     |
| `--color-focus`            | `#3B7CB5` | Focus indicators (2px outline)                            |
| `--color-disabled`         | `#B0B7C0` | Disabled elements                                         |
| `--color-risk-low`         | `#2E7D4A` | Low attention indicators                                  |
| `--color-risk-medium`      | `#B7791F` | Review attention indicators                               |
| `--color-risk-high`        | `#C0392B` | High attention indicators                                 |

### Risk Level Visual Encoding

Each risk level uses **color + icon + text**:

| Level          | Color | Icon | Label            |
| -------------- | ----- | ---- | ---------------- |
| Low Attention  | Green | `○`  | "Low attention"  |
| Review         | Amber | `△`  | "Review"         |
| High Attention | Red   | `▲`  | "High attention" |

No clause is labeled "illegal," "invalid," or "guaranteed risk."

### Focus State

All interactive elements: 2px solid `#3B7CB5` outline, 2px offset. Visible at all zoom levels.

### Disabled State

Opacity 0.5, cursor not-allowed, no hover effects, text color `--color-disabled`.

---

## 5. Typography

### Font Family

| Element         | Font                                     | Fallback                                                             |
| --------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| Headings & Body | Inter                                    | system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif |
| Code/Technical  | JetBrains Mono                           | "SF Mono", "Fira Code", Consolas, monospace                          |
| Document Text   | Inter (or Source Serif Pro if available) | Georgia, serif                                                       |

### Type Scale

| Element       | Size | Weight | Line Height | Letter Spacing     |
| ------------- | ---- | ------ | ----------- | ------------------ |
| H1            | 32px | 700    | 1.2         | -0.02em            |
| H2            | 24px | 600    | 1.3         | -0.01em            |
| H3            | 20px | 600    | 1.4         | 0                  |
| H4            | 16px | 600    | 1.4         | 0                  |
| Body Large    | 18px | 400    | 1.6         | 0                  |
| Body          | 16px | 400    | 1.6         | 0                  |
| Body Small    | 14px | 400    | 1.5         | 0                  |
| Caption       | 12px | 500    | 1.4         | 0.01em             |
| Label         | 12px | 600    | 1.4         | 0.04em (uppercase) |
| Button        | 14px | 600    | 1           | 0.01em             |
| Input         | 16px | 400    | 1.5         | 0                  |
| Document Text | 16px | 400    | 1.8         | 0                  |
| Code          | 14px | 400    | 1.5         | 0                  |

### Readability Rules

- Body text minimum 16px
- Line height minimum 1.5 for body, 1.6 for body large, 1.8 for document text
- Maximum line length: 75 characters (body), 65 characters (document text)
- Document text rendered in readable font with generous line spacing
- Legal terminology shown on hover/tooltip with plain-language explanation

---

## 6. Spacing & Layout System

### Spacing Scale (4px base)

| Token        | Value | Usage                           |
| ------------ | ----- | ------------------------------- |
| `--space-1`  | 4px   | Tight spacing (icon-label gaps) |
| `--space-2`  | 8px   | Small gaps                      |
| `--space-3`  | 12px  | Inline element spacing          |
| `--space-4`  | 16px  | Card padding, form spacing      |
| `--space-5`  | 20px  | Component internal spacing      |
| `--space-6`  | 24px  | Section spacing                 |
| `--space-8`  | 32px  | Card margins, section gaps      |
| `--space-10` | 40px  | Large section spacing           |
| `--space-12` | 48px  | Page section padding            |
| `--space-16` | 64px  | Page top/bottom padding         |

### Layout

| Element                        | Value           |
| ------------------------------ | --------------- |
| Page margin (desktop)          | 48px horizontal |
| Page margin (tablet)           | 24px horizontal |
| Page margin (mobile)           | 16px horizontal |
| Container max-width (desktop)  | 1200px          |
| Container max-width (analysis) | 960px           |
| Container max-width (reading)  | 720px           |
| Sidebar width (desktop)        | 280px           |
| Grid gap                       | 24px            |

### Border Radius

| Element        | Radius |
| -------------- | ------ |
| Cards          | 8px    |
| Buttons        | 6px    |
| Inputs         | 6px    |
| Modals/Dialogs | 12px   |
| Badges         | 4px    |
| Avatars        | 50%    |

### Shadows

| Level            | Value                                                      |
| ---------------- | ---------------------------------------------------------- |
| Card             | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`   |
| Elevated (modal) | `0 10px 25px rgba(0,0,0,0.1), 0 6px 10px rgba(0,0,0,0.08)` |
| Dropdown         | `0 4px 12px rgba(0,0,0,0.1)`                               |
| Toast            | `0 6px 16px rgba(0,0,0,0.12)`                              |

### Borders

| Element           | Width | Color            |
| ----------------- | ----- | ---------------- |
| Cards             | 1px   | `--color-border` |
| Inputs (default)  | 1px   | `--color-border` |
| Inputs (focus)    | 2px   | `--color-focus`  |
| Dividers          | 1px   | `--color-border` |
| Buttons (default) | 1px   | transparent      |

---

## 7. Responsive Design

### Breakpoints

| Name    | Width          | Target         |
| ------- | -------------- | -------------- |
| Mobile  | < 768px        | Phones         |
| Tablet  | 768px – 1024px | Tablets        |
| Desktop | > 1024px       | Desktops       |
| Wide    | > 1440px       | Large monitors |

### Screen-Specific Behavior

| Feature       | Desktop                                       | Tablet                               | Mobile                                 |
| ------------- | --------------------------------------------- | ------------------------------------ | -------------------------------------- |
| Navigation    | Sidebar (280px)                               | Collapsed sidebar (icon-only toggle) | Bottom tab bar or hamburger menu       |
| Dashboard     | Multi-column grid                             | 2-column grid                        | Single column stack                    |
| Upload        | Drag-drop zone side panel                     | Full-width drag-drop                 | Full-width drag-drop, smaller preview  |
| Analysis      | Left panel (document) + right panel (results) | Stacked                              | Stacked, section accordions            |
| Q&A           | Input beside history                          | Input above history                  | Input above history, compact responses |
| Comparison    | Side-by-side columns                          | Stacked columns                      | Stacked with tab switcher              |
| Tables        | Full table                                    | Horizontal scroll                    | Horizontal scroll, simplified columns  |
| Modals        | Centered, 480px max                           | Centered, 90% width                  | Bottom sheet, 95% width                |
| Touch targets | 44px minimum                                  | 44px minimum                         | 48px minimum                           |

### Mobile-Specific Rules

- Navigation collapses to hamburger menu or bottom tab bar
- Document content remains readable (font-size stays 16px, no horizontal scroll)
- Comparison views switch to tabbed view (Document A tab, Document B tab)
- AI responses never overflow horizontally (max-width: 100%, word-wrap)
- All buttons ≥ 48px touch target
- Cards stack vertically
- Form fields stack vertically

---

## 8. Navigation

### Desktop Navigation (≥ 1025px)

```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] LegalEase-AI │ Dashboard Documents Upload Compare History Settings │ [User ▼] │
└────────────────────────────────────────────────────────────────┘
```

- **Sidebar** (left, 280px) with:
  - Logo + product name at top
  - Navigation items with icons + text
  - "Upload" button (prominent, primary style)
  - User profile area at bottom

### Mobile Navigation (< 768px)

- **Bottom tab bar** with: Dashboard, Documents, Upload, Compare, History
- Settings accessible via profile icon in top-right
- Logo visible in top bar (collapsed)

### Navigation States

| State    | Visual                                                                      |
| -------- | --------------------------------------------------------------------------- |
| Default  | `--color-text-secondary`, no background                                     |
| Hover    | `--color-text-primary`, `--color-primary-light` background                  |
| Active   | `--color-primary` text, `--color-primary-light` background, 3px left border |
| Focus    | 2px `--color-focus` outline                                                 |
| Disabled | `--color-disabled`, no hover                                                |

### User Profile Area

- User avatar (Google OAuth photo or initial)
- User email (truncated, secondary text)
- Dropdown: Profile, Settings, Logout
- Logout action: "Sign out" — clearly labeled, no confirmation needed for this low-risk action

---

## 9. Information Architecture

### Primary Structure

```
Landing (public)
├── Sign In (Google OAuth)
│
Dashboard (authenticated)
├── Upload Page
├── Document Analysis
│   ├── Summary
│   ├── Key Clauses
│   ├── Obligations
│   ├── Important Dates
│   ├── Financial Information
│   ├── Risk / Attention Areas
│   └── Next Steps
├── Document Q&A
├── Comparison (select 2 documents)
│   └── Comparison Results
├── Document Reader (original text + simplified)
└── History
    ├── Document list
    └── Analysis history
Settings
├── Account
├── Privacy
├── AI Limitations
└── Logout
```

### Breadcrumb Structure

```
Dashboard > Document Name > Analysis
Dashboard > Compare > Document A vs Document B
Dashboard > History > Document Name
```

---

## 10. Core User Flows

### Primary Flow

```
Landing → Sign In → Dashboard → Upload → Processing → Analysis → Review → Q&A/Compare → Next Steps
```

### Flow Details

| Step | Screen     | User Action                  | System Response                |
| ---- | ---------- | ---------------------------- | ------------------------------ |
| 1    | Landing    | Click "Sign In"              | Google OAuth dialog            |
| 2    | Dashboard  | Click "Upload Document"      | Navigate to upload page        |
| 3    | Upload     | Select file                  | Validate, show progress        |
| 4    | Processing | Wait                         | Show progress stages           |
| 5    | Analysis   | Review results               | AI results displayed           |
| 6    | Review     | Read summary, clauses, risks | Expand sections, check sources |
| 7    | Q&A        | Ask question                 | Grounded answer with sources   |
| 8    | Compare    | Select 2nd document          | Comparison results displayed   |
| 9    | Next Steps | Review checklist             | Actionable guidance displayed  |

### Error Flows

Each step has defined error states with retry actions (see §18).

---

## 11. Screen Specifications

### 11.1 Landing

**Purpose:** Communicate value proposition and guide to sign-in/upload.

**Layout (Desktop):**

```
┌──────────────────────────────────────────────────┐
│  Logo  LegalEase-AI         Sign In (Google)    │
│                                                  │
│         Understand your legal documents          │
│         without being a legal expert.            │
│                                                  │
│    [Upload a Document →]  [Learn More ↓]        │
│                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Upload│ │Analyze│ │Compare│ │Q&A  │           │
│  └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                  │
│  "AI-powered document understanding              │
│   powered by responsible AI."                    │
│                                                  │
│  [AI Disclaimer — small, visible]                │
│                                                  │
│         Footer                                   │
└──────────────────────────────────────────────────┘
```

**Components:**

- Hero section with product name and one-line description
- Primary CTA: "Upload a Document" → leads to sign-in if not authenticated, upload if authenticated
- Secondary CTA: "Learn How It Works" → scroll to How It Works section
- 4 capability cards (Upload, Analyze, Compare, Q&A)
- AI disclaimer (small, visible at bottom)
- Privacy/security messaging section
- Footer

**AI Transparency:**

- Small label: "Powered by Google Gemini AI" near primary CTA
- Disclaimer text visible

**Responsive:**

- Mobile: Stack hero text, CTA buttons full-width, capability cards 2x2 grid

---

### 11.2 Authentication

**Purpose:** Secure sign-in via Google OAuth.

**Layout:**

```
┌──────────────────────────────────────────────────┐
│                                                   │
│              [Logo] LegalEase-AI                 │
│                                                   │
│         Welcome to LegalEase-AI                  │
│                                                   │
│    ┌──────────────────────────────────┐          │
│    │  🔍 Continue with Google         │          │
│    └──────────────────────────────────┘          │
│                                                   │
│    [AI Disclaimer — small]                        │
│                                                   │
│    "This tool helps you understand documents.    │
│     It does not provide legal advice."           │
│                                                   │
└──────────────────────────────────────────────────┘
```

**States:**

- Default: Google sign-in button, disclaimer
- Loading: Google button shows spinner, "Connecting..."
- Error: "Sign-in failed. Please try again." + Retry button

**Security Messaging:**

- Small text: "Your documents are private and stored securely."
- Disclaimer visible (general AI disclaimer)

**Rules:**

- Single Google sign-in button (clean, simple)
- No password fields
- No unnecessary form fields
- Clear loading state
- Clear error state with retry

---

### 11.3 Dashboard

**Purpose:** Central workspace for document management.

**Layout (Desktop):**

```
┌────────────────────────────────────────────────────────────────────┐
│ [Sidebar]                                                          │
│  📄 Dashboard (active)                                             │
│  📁 Documents                                                      │
│  ⬆️ Upload                                                         │
│  🔄 Compare                                                        │
│  🕐 History                                                        │
│  ⚙️ Settings                                                       │
│  ──────────────                                                     │
│  [User Avatar] user@email.com ▼                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Welcome back, [Name] 👋                                           │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ⬆️ Upload Document            🔄 Compare Documents          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Recent Documents (3)                       [View All →]           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 📄 Lease Agreement 2024-06-12  ● Analyzed     [View →]      │ │
│  │ 📄 Employment Contract 2024-06-10 ● Processing... [View →]  │ │
│  │ 📄 Vendor Terms - Draft ● Uploaded    [View →]              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Recent Activity                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Analysis completed: Lease Agreement          2 hours ago     │ │
│  │ Comparison completed: Vendor A vs Vendor B   1 day ago      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [Disclaimer — small, bottom of page]                              │
└────────────────────────────────────────────────────────────────────┘
```

**Empty State (No Documents):**

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Icon: Document]                                            │
│                                                              │
│  No documents yet                                            │
│                                                              │
│  Upload your first legal document to get started.            │
│  Supports PDF, DOCX, and TXT files (max 10 MB).             │
│                                                              │
│  [Upload Document →]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Components:**

- Quick action buttons (Upload, Compare) — prominent
- Recent Documents list (filename, date, status badge)
- Recent Activity feed
- Document status badges (Analyzed, Processing, Uploaded)
- Search/filter bar (by filename)
- User profile area

**States:**

- Loading: Skeleton cards
- Empty: Illustrated empty state with CTA
- Error: "Something went wrong loading your documents." + Retry

---

### 11.4 Upload

**Purpose:** Accept, validate, and store legal documents securely.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard    Upload Document                       │
│                                                              │
│  Drag & Drop                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │     📄  Drop your document here                        │ │
│  │         or click to browse files                       │ │
│  │                                                        │ │
│  │     Supported: PDF, DOCX, TXT    Max: 10 MB           │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Or select file ▼                                            │
│                                                              │
│  ──────────── OR ────────────                                │
│                                                              │
│  [Privacy note: "Documents are processed securely and        │
│   stored only for your account."]                            │
│                                                              │
│  [Disclaimer — small]                                        │
└──────────────────────────────────────────────────────────────┘
```

**Upload Progress State:**

```
┌──────────────────────────────────────────────────────────────┐
│  Lease_Agreement.pdf                                         │
│                                                              │
│  Uploading ████████████░░░░░░░░ 45%                      │
│                                                              │
│  Validating file type ✓                                      │
│  Extracting text ● (in progress)                             │
│                                                              │
│  [Cancel]                                                    │
└──────────────────────────────────────────────────────────────┘
```

**Validation Rules (Visible):**

- Supported formats: PDF, DOCX, TXT
- Maximum size: 10 MB
- Files must contain readable text

**Error States:**

- Invalid type: "Please upload a PDF, DOCX, or TXT file." + "Choose a different file" button
- Too large: "File exceeds 10 MB limit. Please upload a smaller file."
- Corrupted: "Could not read the document. Please try another file."
- Empty: "Document contains no readable text. Try a different file."

**Security Messaging:**

- "Documents are processed securely and stored only for your account."
- Shown below upload zone, persistent

---

### 11.5 Processing

**Purpose:** Show real-time document processing progress with understandable stages.

**Design Philosophy:**
Show **what** is happening, not technical implementation details. User should know it's in progress, whether to wait, and what to do if it fails.

**Processing Stages (Sequential):**

```
┌──────────────────────────────────────────────────────────────┐
│  Processing: Lease_Agreement.pdf                               │
│                                                              │
│  ✅ Uploading                                                │
│  ✅ Validating                                               │
│  ● Extracting text                                           │
│  ○ Preparing analysis                                        │
│  ○ Generating insights with AI                               │
│                                                              │
│  Estimated: A few moments. Please wait.                      │
│                                                              │
│  [Do not close this page. Your document is being processed.] │
│                                                              │
│  [Disclaimer — small]                                        │
└──────────────────────────────────────────────────────────────┘
```

**Stage Design:**

- Each stage shows: icon + label
- Completed: green checkmark + label
- In progress: spinner + label + subtle highlight
- Pending: gray/empty circle + label
- Never show fake percentages (e.g., "47% complete")

**Error During Processing:**

```
┌──────────────────────────────────────────────────────────────┐
│  ❌ Processing Failed                                        │
│                                                              │
│  We couldn't process this document right now.               │
│                                                              │
│  Possible reasons:                                           │
│  • The file may be corrupted or encrypted                    │
│  • The document may be too large                             │
│                                                              │
│  [Retry]    [Upload a different document]                    │
│                                                              │
│  [Contact support if this continues]                         │
└──────────────────────────────────────────────────────────────┘
```

**Success Transition:**

- Brief "Complete" indicator
- Auto-navigate to Document Analysis page after 1 second

---

### 11.6 Document Analysis

**Purpose:** Core product screen. Display all AI-generated insights from the uploaded document.

**Layout (Desktop):**

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard    Lease_Agreement.pdf       ● Analyzed         │
│                                                                    │
│  [AI Badge] AI Analysis — for informational purposes only        │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ DISCLAIMER: This is educational information generated by  │  │
│  │ AI. It does not constitute legal advice and may contain    │  │
│  │ errors. Consult a qualified legal professional for         │  │
│  │ advice specific to your situation. [Learn More →]          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────┐  ┌───────────────────────────────┐  │
│  │  Document Summary        │  │  Document Details             │  │
│  │  ┌─────────────────────┐│  │  Type: Residential Lease       │  │
│  │  │ This is a          ││  │  Parties: [Landlord, Tenant]  │  │
│  │  │ 12-month lease...  ││  │  Effective: 2024-07-01         │  │
│  │  └─────────────────────┘│  │  Pages: 14                     │  │
│  └─────────────────────────┘  └───────────────────────────────┘  │
│                                                                    │
│  ┌─ Key Clauses ──────────────────────────────────────────────┐   │
│  │ [+] Termination Clause    (Section 9.1 · Page 8)  [Review]  │   │
│  │ [+] Auto-Renewal Clause   (Section 12.3 · Page 11) [Review]│   │
│  │ [+] Security Deposit      (Section 5.2 · Page 5)  [Low]    │   │
│  │ [+] Indemnification       (Section 14.1 · Page 13) [Review]│   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ Obligations ──────────────────────────────────────────────┐   │
│  │ Landlord: [Provide habitable premises · Section 4.1]        │   │
│  │ Tenant: [Pay rent by 1st · Section 3.1 · Page 3]            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ Important Dates ──────────────────────────────────────────┐   │
│  │ Lease Start: July 1, 2024 · Page 1                         │   │
│  │ Lease End: June 30, 2025 · Page 1                          │   │
│  │ Renewal Deadline: June 1, 2025 · Page 11                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ Risk / Attention Areas ───────────────────────────────────┐   │
│  │ ▲ Auto-Renewal Clause (High Attention)                     │   │
│  │   May deserve attention: Automatic renewal if not...       │   │
│  │   Consider reviewing the renewal terms. [Explain →]        │   │
│  │                                                            │   │
│  │ △ Indemnification (Review)                                 │   │
│  │   Potential concern: Broad indemnification may...          │   │
│  │   Consider discussing with a qualified legal professional. │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ Recommended Next Steps ──────────────────────────────────┐   │
│  │ □ Review auto-renewal clause before June 1               │   │
│  │ □ Clarify maintenance responsibilities with landlord     │   │
│  │ □ Ask your lawyer about indemnification scope            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  [AI Badge] All above results were generated by AI.              │
│  [Disclaimer — small]                                            │
└────────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

- Summary in a prominent card at the top
- All sections use accordion/expandable by default (collapse to conserve space)
- AI Badge visible at top and bottom of results
- Disclaimer prominent but not overwhelming
- Source references in parentheses after clause names
- Risk levels labeled with text + icon (never color alone)

---

### 11.7 Key Clauses

**Purpose:** Present individual clauses clearly with progressive disclosure.

**Clause Card Design:**

```
┌──────────────────────────────────────────────────────────────┐
│ ▼ Termination Clause                        [Review]          │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ **What it says (paraphrased):**                              │
│ Either party may terminate this agreement with 30 days'      │
│ written notice...                                            │
│                                                              │
│ **Why it matters:**                                          │
│ You may lose your lease if you don't provide notice in       │
│ time. This could affect your housing costs and moving plans. │
│                                                              │
│ **What to clarify:**                                         │
│ - What counts as "written notice"?                          │
│ - Is there a penalty for late notice?                         │
│                                                              │
│ **Source:** Section 9.1 · Page 8                             │
│                                                              │
│ [Show original text]    [Explain in plain language]          │
└──────────────────────────────────────────────────────────────┘
```

**Design Rules:**

- Start collapsed (show title + importance level)
- Expand on click (accordion behavior)
- Plain-language explanation always visible when expanded
- Original text available via "Show original text" toggle
- Source reference always visible at bottom of card
- Importance badge (Low/Review/High) visible in header

**"Explain This Clause" (Optional Feature):**

- Click "Explain" on any clause
- Gemini provides plain-language explanation, why it matters, what to clarify
- Displayed below the clause card in a highlighted box
- Marked as AI-generated with source reference

---

### 11.8 Risk / Attention Areas

**Purpose:** Highlight clauses that may deserve attention with responsible, educational language.

**Risk Item Design:**

```
┌──────────────────────────────────────────────────────────────┐
│ ▲ High Attention: Auto-Renewal Clause                        │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ This clause may automatically renew the lease if you don't   │
│ provide notice before June 1, 2025.                          │
│                                                              │
│ **Why this may deserve attention:**                          │
│ Automatic renewal can lock you into an extended commitment   │
│ without your explicit consent. You may want to...            │
│                                                              │
│ **What you may want to clarify:**                            │
│ - How long is the renewal term?                             │
│ - Can you opt out after renewal?                              │
│ - Are renewal terms different from the original lease?       │
│                                                              │
│ Consider discussing this with a qualified legal professional │
│ if this affects your housing decisions.                      │
│                                                              │
│ **Source:** Section 12.3 · Page 11                           │
└──────────────────────────────────────────────────────────────┘
```

**Risk Categories:**

- Liability
- Termination
- Indemnity
- Auto-Renewal
- Limitation of Liability
- Confidentiality
- Intellectual Property Assignment
- Jurisdiction
- Payment Obligations
- Penalties

**Language Rules:**

- Use "may deserve attention"
- Use "consider reviewing"
- Use "potential concern"
- Use "consider discussing with a qualified legal professional"
- NEVER use "illegal", "invalid", "guaranteed risk", "you will lose"

**Visual Encoding:**

- Each risk shows: icon + level text + title + explanation
- Level: ▲ High Attention (red icon + text) / △ Review (amber icon + text) / ○ Low Attention (green icon + text)
- Color is supplementary, never the only indicator

---

### 11.9 Document Q&A

**Purpose:** Allow users to ask questions about their uploaded document and receive grounded, source-attributed answers.

**Layout:**

```
┌────────────────────────────────────────────────────────────────────┐
│ Document Q&A — Lease_Agreement.pdf                                │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Ask a question about your document...                    │  │
│  │                                              [Ask →]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Suggested Questions:                                              │
│  [What is the termination notice period?]                         │
│  [When does the lease expire?]                                    │
│  [Can the landlord enter my unit?]                                │
│                                                                    │
│  ─────────────────────────────────────────────────────────────   │
│                                                                    │
│  [Your Question]                                                 │
│                                                                    │
│  ● Generating answer... [0/3 sections reviewed]                   │
│                                                                    │
│  ─────────────────────────────────────────────────────────────   │
│  What is the termination notice period?                          │
│                                                                    │
│  According to the document, termination requires 30 days'        │
│  written notice. [↗ Section 9.1 · Page 8]                         │
│                                                                    │
│  The notice must be delivered before the renewal deadline.         │
│  [↗ Section 12.3 · Page 11]                                       │
│                                                                    │
│  I'm moderately confident in this answer based on the document.   │
│                                                                    │
│  ⚠ Disclaimer: This is educational information, not legal advice │
│  It may contain errors. Verify important information with a       │
│  qualified legal professional.                                    │
│                                                                    │
│  ─────────────────────────────────────────────────────────────   │
│                                                                    │
│  [Ask follow-up]  [This was helpful]  [Report an issue]           │
└────────────────────────────────────────────────────────────────────┘
```

**States:**

| State     | Display                                                                                      |
| --------- | -------------------------------------------------------------------------------------------- |
| Empty     | "Ask a question about your document" with suggested questions                                |
| Loading   | Spinner + "Analyzing your question against the document"                                     |
| Answer    | Question + AI response + source links + confidence + disclaimer                              |
| Not Found | "This information is not present in the uploaded document. Try asking a different question." |
| Error     | "We couldn't answer right now. Please try again." + Retry button                             |
| Uncertain | AI says "I'm not confident about this detail based on the document" + suggestion             |

**Design Rules:**

- "Answer based on your document." label always visible above answers
- Source references shown as clickable links (open document at that section)
- Confidence shown as text ("highly confident", "moderately confident", "limited information")
- Disclaimer always below AI answer
- Q&A input clearly separated from answers
- No generic chatbot appearance — context tied to specific document always visible

---

### 11.10 Document Comparison

**Purpose:** Compare two legal documents and identify meaningful differences.

**Layout (Desktop):**

```
┌────────────────────────────────────────────────────────────────────┐
│ Document Comparison                                                │
│                                                                    │
│  [Document A▼] vs [Document B▼]                                    │
│                                                                    │
│  ┌────────────────────┐  ┌────────────────────────────────────┐  │
│  │ Lease v2           │  │ Lease v1                           │  │
│  │ ● Analyzed         │  │ ● Analyzed                         │  │
│  └────────────────────┘  └────────────────────────────────────┘  │
│                                                                    │
│  Differences Found: 8                                              │
│                                                                    │
│  ┌─ Added Clauses ────────────────────────────────────┐   │
│  │ + Late Fee Provision (v2 only)                             │   │
│  │ + Pet Policy (v2 only)                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ Removed Clauses ──────────────────────────────────┐   │
│  │ – Early Termination Option (v1 only)                       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ Modified Clauses ─────────────────────────────────┐   │
│  │ ▼ Rent Amount                                              │   │
│  │   v1: $1,500/month                                         │   │
│  │   v2: $1,600/month   [Changed]                             │   │
│  │                                                            │   │
│  │ ▼ Security Deposit                                         │   │
│  │   v1: One month's rent                                     │   │
│  │   v2: Two months' rent                                     │   │
│  │     [Changed]                                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ⚠ These documents appear to be similar types. Comparison is      │
│  most meaningful for documents of the same type.                 │
│                                                                    │
│  ┌─ Recommended Next Steps ───────────────────────────┐   │
│  │ □ Review the rent increase in Section 4.2                  │   │
│  │ □ Compare pet policies if you have pets                    │   │
│  │ □ Ask a lawyer about the new late fee provision            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  [AI Badge] Comparison generated by AI. [Disclaimer]              │
└────────────────────────────────────────────────────────────────────┘
```

**Mobile Layout:**

- Tab switcher: "Document A" / "Document B"
- Comparison results in stacked cards
- "Differences Found" section with expandable categories

**Incompatible Document Warning:**

```
⚠ These documents appear to be different types (Contract vs. Lease).
Comparison may not be meaningful. Results are shown below for reference.
[Continue anyway]  [Cancel]
```

**Design Rules:**

- Added/removed/modified clearly categorized and labeled
- Changes shown with visual indicators (+, –, ▼) plus text
- Source references where available
- Next steps specific to comparison results
- Responsive: side-by-side on desktop, stacked/tabbed on mobile

---

### 11.11 Next Steps

**Purpose:** Provide actionable guidance based on document analysis.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ Recommended Next Steps                                       │
│                                                              │
│  ┌─ Action Items ─────────────────────────────────────────┐  │
│  │ ☐ Review auto-renewal clause before June 1, 2025       │  │
│  │ ☐ Clarify maintenance responsibilities with landlord   │  │
│  │ ☐ Compare security deposit terms between lease versions│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Questions to Ask a Lawyer ────────────────────────────┐  │
│  │ • What are the tax implications of the rent increase?   │  │
│  │ • Is the indemnification clause enforceable in my     │  │
│  │   jurisdiction?                                        │  │
│  │ • Can I negotiate the auto-renewal terms?              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Documents You May Need ───────────────────────────────┐  │
│  │ · Previous lease agreement (if available)                │  │
│  │ · Records of communication with landlord                  │  │
│  │ · Income verification documents                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Things to Clarify with the Other Party ──────────────┐  │
│  │ · Maintenance responsibility boundaries               │  │
│  │ · Notice delivery method                              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Consider professional legal help if:                        │
│  The document involves significant financial commitment,     │
│  long-term obligations, or you have concerns about fairness. │
│                                                              │
│  [AI Badge] Guidance generated by AI. [Disclaimer]           │
└──────────────────────────────────────────────────────────────┘
```

**Design Rules:**

- Checkbox-style action items (actionable, not prescriptive)
- Lawyer questions in open-ended format (not yes/no)
- Documents list practical and specific
- "Consider professional legal help" section for high-risk situations
- All items specific to document content (not generic)
- AI badge and disclaimer visible

---

### 11.12 History

**Purpose:** Secure document history for authenticated users.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ Document History                                             │
│                                                              │
│  🔍 Search documents...                                      │
│                                                              │
│  Filters: [All] [Analyzed] [Processing] [Uploaded]           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 Lease Agreement 2024-06-12  ● Analyzed              │  │
│  │    Uploaded: June 12, 2024  Pages: 14  Clauses: 23     │  │
│  │    [View Analysis]  [Compare]  [Delete 🗑]              │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 Employment Contract 2024-06-10 ● Processing...      │  │
│  │    Uploaded: June 10, 2024  Pages: 8  Clauses: 15      │  │
│  │    [Retry Analysis]  [Delete 🗑]                       │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 Vendor Terms - Draft 2024-06-08 ○ Uploaded          │  │
│  │    Uploaded: June 8, 2024  Pages: 5  Clauses: 12       │  │
│  │    [View Analysis]  [Compare]  [Delete 🗑]              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [No results matching "non-compete"]                         │
│  Try different search terms or clear filters.                │
│                                                              │
│  [Delete All] (with confirmation dialog)                     │
└──────────────────────────────────────────────────────────────┘
```

**States:**

- Empty: "No documents yet" + Upload CTA
- Search no results: "No results matching 'X'. Try different terms."
- Error: "Couldn't load history. Please try again." + Retry

**Delete Confirmation:**

```
┌──────────────────────────────────────────────────────────────┐
│ Delete Document?                                             │
│                                                              │
│ "Lease_Agreement.pdf" will be permanently deleted from       │
│ your account. This action cannot be undone.                  │
│                                                              │
│ This will also delete all analysis results and Q&A history   │
│ associated with this document.                               │
│                                                              │
│ [Cancel]                          [Delete Permanently]       │
└──────────────────────────────────────────────────────────────┘
```

---

### 11.13 Settings

**Purpose:** Account management, privacy information, and AI transparency.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ Settings                                                     │
│                                                              │
│  ┌─ Account ──────────────────────────────────────────────┐  │
│  │ Email: user@email.com                                  │  │
│  │ Sign-in method: Google OAuth                           │  │
│  │ Account created: [Date]                                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ AI Limitations ───────────────────────────────────────┐  │
│  │ This tool uses AI to analyze documents. Results are      │  │
│  │ educational and may contain errors. This tool does not   │  │
│  │ provide legal advice and does not replace a lawyer.      │  │
│  │ [Learn more about AI limitations →]                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Privacy ──────────────────────────────────────────────┐  │
│  │ Documents are stored securely and privately under your   │  │
│  │ account. They are not shared with third parties.         │  │
│  │ [Read our privacy approach →]                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Danger Zone ──────────────────────────────────────────┐  │
│  │ [Delete Account] — Permanently removes all data        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [Sign Out]                                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. AI Interaction Design

### AI Badge

A small, consistent visual indicator showing content is AI-generated.

**Design:**

```
[🤖 AI-Generated]
```

**Styles:**

- Badge text: `--color-ai` color, 12px, 500 weight, uppercase tracking
- Background: `--color-ai-bg`
- Padding: 4px 8px
- Border-radius: 4px
- Always visible near AI-generated content

### AI Response Container

AI responses displayed in a distinct but subtle container:

- Background: `--color-ai-bg` (very light purple)
- Left border: 3px solid `--color-ai`
- Padding: 16px
- Border-radius: 8px
- No heavy shadows or gradients

**Purpose:** Visually distinguish AI output from user content, source text, and system UI — without making it look like an authoritative ruling.

### Source Citation Style

```
↗ Section 9.1 · Page 8
```

- Shown as a clickable inline link
- Icon: arrow pointing up-right (↗)
- Color: `--color-secondary`
- Hover: `--color-primary`
- Click navigates to source section in document viewer
- If source unavailable: omit citation, do not fabricate

### Confidence / Uncertainty Presentation

When AI expresses uncertainty:

- Inline text: "I'm moderately confident in this answer based on the document."
- Confidence level: "highly confident" / "moderately confident" / "limited information"
- Never use numerical confidence scores (e.g., "87% sure") — these imply false precision
- When confidence is low, add: "Consider verifying this with a qualified legal professional."

### Loading State

**AI Processing Indicator (Document Analysis):**

```
● Generating summary...
● Identifying key clauses...
● Detecting risk areas...
○ Preparing next steps...
```

- Circles indicate progress: filled = complete, ring = in progress, empty = pending
- Never use fake percentages
- Never use a determinate progress bar that pretends to know completion percentage
- Text describes what stage the AI is currently processing

**AI Processing Indicator (Q&A):**

```
● Analyzing your question against the document...
```

### AI Error State

```
We couldn't complete the AI analysis right now.

This may be due to a temporary issue. Please try again.

[Retry]  [Upload a different document]  [Contact support]
```

- Human-readable, non-technical
- Clear action options
- No stack traces, no error codes

### Disclaimer Component

**Three Levels:**

| Level                 | When                                                     | Placement                  | Size                        |
| --------------------- | -------------------------------------------------------- | -------------------------- | --------------------------- |
| General AI Disclaimer | Landing page, settings                                   | Small text block           | 12-14px, secondary text     |
| Analysis Disclaimer   | Every AI analysis output                                 | Above results, persistent  | 14px, warning-styled banner |
| High-Risk Disclaimer  | Detected high-risk document type (inferred from clauses) | Within analysis, prominent | 14px, highlighted banner    |

**General AI Disclaimer Text:**

> "This tool uses AI for informational purposes. It does not provide legal advice and may contain errors."

**Analysis Disclaimer Text:**

> "This is educational information generated by AI based on your uploaded document. It does not constitute legal advice and may contain errors. Verify important information with a qualified legal professional."

**High-Risk Disclaimer Text:**

> "This document appears to contain provisions that may significantly affect your rights or obligations. Professional legal review is strongly recommended."

---

## 13. Source & Evidence Design

### Source Reference Component

Every AI claim that references document content must show a source reference.

**Format:**

```
Source: Section 9.1 · Page 8
```

**Component Properties:**

- Inline, clickable link
- Opens document viewer at that section/page
- Color: `--color-secondary` (visually secondary to the main answer)
- Icon: ↗ (arrow pointing up-right)
- On mobile: same styling, wraps if needed
- If source unavailable: **never fabricate** — omit the reference entirely

### Evidence Display

For important AI findings, show evidence context:

```
**Finding:** Termination requires 30 days' notice.

**Evidence from document:**
> "Either party may terminate this agreement with 30 days' prior written notice to the other party."
>
> — Section 9.1, Page 8
```

- Evidence shown in quote styling
- Clearly labeled "Evidence from document"
- Source reference below the evidence
- AI finding labeled as AI-generated

---

## 14. Legal Disclaimer Design

### Disclaimer Placement Rules

- **Never hidden** — always visible to users
- **Proportionate** — not so large it dominates the experience
- **Consistent** — same language patterns across all contexts
- **Layered** — general (small) → specific (larger) → high-risk (most prominent)

### Component Behavior

- General disclaimer: collapsed by default, expandable via "Learn more"
- Analysis disclaimer: visible by default on analysis pages
- High-risk disclaimer: prominent banner, not dismissible without acknowledgment

### Copy Guidelines

- Use plain language
- Avoid legal jargon
- Be honest about limitations
- Mention the document context ("based on your uploaded document")
- Recommend professional consultation
- Never claim AI output is verified, accurate, or authoritative

---

## 15. Component System

### Button

| Property      | Value                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Height        | 40px (primary), 36px (secondary)                                           |
| Padding       | 16px horizontal                                                            |
| Border-radius | 6px                                                                        |
| Font          | 14px, 600 weight                                                           |
| Primary       | Background: `--color-primary`, Text: `#FFFFFF`                             |
| Secondary     | Background: transparent, Border: `--color-border`, Text: `--color-primary` |
| Danger        | Background: `--color-error`, Text: `#FFFFFF`                               |
| Disabled      | Opacity: 0.5, cursor: not-allowed                                          |
| Hover         | Primary: darken 8%. Secondary: background `--color-primary-light`          |
| Focus         | 2px `--color-focus` outline, 2px offset                                    |

States: default, hover, focus, active, disabled, loading

### Input

| Property      | Value                                                       |
| ------------- | ----------------------------------------------------------- |
| Height        | 44px                                                        |
| Padding       | 12px horizontal                                             |
| Border-radius | 6px                                                         |
| Border        | 1px `--color-border` (default), 2px `--color-focus` (focus) |
| Font          | 16px (prevents mobile zoom)                                 |
| Placeholder   | `--color-text-muted`                                        |

States: default, hover, focus, disabled, error (red border + error text below), valid (subtle green border)

### Card

| Property      | Value                |
| ------------- | -------------------- |
| Background    | `--color-surface`    |
| Border        | 1px `--color-border` |
| Border-radius | 8px                  |
| Padding       | 20px–24px            |
| Shadow        | `--shadow-card`      |

### Badge

| Property                  | Value                                                     |
| ------------------------- | --------------------------------------------------------- |
| Font                      | 12px, 500 weight                                          |
| Padding                   | 4px 8px                                                   |
| Border-radius             | 4px                                                       |
| AI Badge                  | Background: `--color-ai-bg`, Text: `--color-ai`           |
| Status Badge (Analyzed)   | Background: `--color-success-bg`, Text: `--color-success` |
| Status Badge (Processing) | Background: `--color-info-bg`, Text: `--color-info`       |
| Status Badge (Error)      | Background: `--color-error-bg`, Text: `--color-error`     |

### Modal/Dialog

| Property      | Value                                           |
| ------------- | ----------------------------------------------- |
| Max-width     | 480px (center), 95% viewport width (mobile)     |
| Border-radius | 12px                                            |
| Background    | `--color-surface-elevated`                      |
| Shadow        | `--shadow-elevated`                             |
| Backdrop      | Semi-transparent dark overlay (rgba(0,0,0,0.4)) |
| Padding       | 24px                                            |
| Escape key    | Closes modal                                    |
| Focus trap    | Focus contained within modal while open         |

### Toast/Alert

| Property      | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Position      | Bottom-right (desktop), bottom-center (mobile)             |
| Duration      | 5 seconds auto-dismiss (non-error), manual dismiss (error) |
| Max-width     | 400px                                                      |
| Border-radius | 8px                                                        |
| Shadow        | `--shadow-toast`                                           |

Types: success (green accent), error (red accent), warning (amber accent), info (blue accent). Each with icon + text + optional action button.

### Accordion

| Property             | Value                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Header               | 16px, 600 weight, clickable                                               |
| Icon                 | Chevron right (▶) → chevron down (▼) when expanded                        |
| Content padding-left | 16px                                                                      |
| Animation            | 200ms ease-out, reduced-motion respected                                  |
| ARIA                 | `aria-expanded` on header, `aria-labelledby` connecting header to content |

### Skeleton/Spinner

**Skeleton:**

- Shimmer animation (gray pulse)
- Matches shape of loading content (rectangle, circle, text lines)
- Respects `prefers-reduced-motion` (static gray instead of animation)

**Spinner:**

- 20px diameter
- 2px border, `--color-primary` top border
- Rotation animation 0.8s linear infinite
- Respects `prefers-reduced-motion`

### Empty State

| Property    | Value                                      |
| ----------- | ------------------------------------------ |
| Icon        | 64px, `--color-text-muted`                 |
| Title       | 18px, 600 weight, `--color-text-primary`   |
| Description | 14px, 400 weight, `--color-text-secondary` |
| CTA         | Primary button below description           |
| Padding     | 48px vertical                              |

### File Upload Component

| Property       | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Drop zone      | Dashed border (2px `--color-border`), 16px padding                      |
| Drag-over      | Border changes to `--color-primary`, background `--color-primary-light` |
| Accepted types | Text below drop zone                                                    |
| Max size       | Text below drop zone                                                    |
| Progress       | Shows upload + validation progress                                      |

### Risk Badge

| Level  | Color | Icon | Label            |
| ------ | ----- | ---- | ---------------- |
| Low    | Green | ○    | "Low attention"  |
| Medium | Amber | △    | "Review"         |
| High   | Red   | ▲    | "High attention" |

All include text label. Color is supplementary.

### Clause Card

Collapsible card with title + importance badge + source reference. Expands to show plain-language explanation, evidence, and source detail.

### Comparison Row

| Property         | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Layout           | Side-by-side (desktop), stacked/tabbed (mobile)      |
| Column header    | Document name + version                              |
| Same content     | Neutral styling                                      |
| Added            | Green left border + "+" prefix                       |
| Removed          | Red left border + "–" prefix                         |
| Modified         | Amber left border + "▼" prefix + before/after values |
| Source reference | Below each difference                                |

### Search

| Property     | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Input height | 44px                                                   |
| Placeholder  | "Search documents..."                                  |
| Icon         | Search icon inside input (left)                        |
| Clear button | X icon inside input (right), appears when text entered |
| Keyboard     | Enter submits search                                   |
| Debounce     | 300ms                                                  |

---

## 16. UI States

Every interactive component must support the following states:

| State    | Description                | Visual Treatment                          |
| -------- | -------------------------- | ----------------------------------------- |
| Default  | Initial appearance         | Per component spec                        |
| Hover    | Mouse pointer over element | Darken primary 8%, background tint        |
| Focus    | Keyboard navigation target | 2px `--color-focus` outline, 2px offset   |
| Active   | Element pressed/clicked    | Scale 0.98, no hover effect               |
| Disabled | Non-interactive            | Opacity 0.5, cursor not-allowed, no hover |
| Loading  | Processing or waiting      | Spinner or skeleton, no hover effects     |
| Success  | Completed successfully     | Green accent + icon + text confirmation   |
| Warning  | Attention needed           | Amber accent + icon + text                |
| Error    | Failed or invalid          | Red accent + icon + text + action         |
| Empty    | No data to display         | Icon + message + CTA                      |

**Critical:** No component should exist with only a happy path. Every important feature must handle loading, error, empty, success, and default states.

### Specific Empty States

| Context                 | Empty State Message                                                  | CTA                       |
| ----------------------- | -------------------------------------------------------------------- | ------------------------- |
| Dashboard (no docs)     | "No documents yet. Upload your first legal document to get started." | Upload Document           |
| Q&A (no questions)      | "Ask a question about your document."                                | Suggested questions shown |
| Comparison (no history) | "No comparisons yet."                                                | Compare Documents         |
| Search (no results)     | "No results matching 'X'. Try different terms."                      | Clear filters             |
| Analysis (not analyzed) | "This document hasn't been analyzed yet."                            | Analyze Document          |
| History (no history)    | "No recent activity."                                                | Upload Document           |

---

## 17. Loading & Progress

### Principles

- Never fake progress — never show a percentage you don't know
- Show meaningful stages, not abstract numbers
- Respect `prefers-reduced-motion` (static states instead of animations)
- Always give users a way to cancel or get help

### Document Upload Progress

```
Uploading ████████░░░░░░░░ 45%
Validating ✓
Extracting text ●
```

### AI Analysis Progress

```
AI Analysis In Progress:

✓ Uploading document
✓ Validating file
✓ Extracting text
● Preparing AI analysis
○ Identifying key clauses
○ Detecting risk areas
○ Generating next steps

Estimated: A few moments. Please wait.

[Do not close this page. Your document is being processed.]
```

### Q&A Loading

```
● Analyzing your question against the document...
```

### Cancel Option

- Cancel button available during upload and processing
- Cancel → confirmation: "Are you sure? Processing will stop." [Cancel] [Stop Processing]

---

## 18. Error Handling UX

### Principles

- Human-readable, actionable, non-technical, calm, concise
- Never expose: stack traces, API keys, tokens, internal URLs
- Always provide: what happened + what the user can do next
- Where appropriate: Retry button, Go back, Upload another, Contact/support

### Error Examples

| Context                 | Error Message                                                                     | Actions                  |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| Invalid file type       | "Please upload a PDF, DOCX, or TXT file."                                         | Choose a different file  |
| File too large          | "File exceeds 10 MB limit. Please upload a smaller file."                         | Choose a different file  |
| Corrupted file          | "Could not read the document. Please try another file."                           | Choose a different file  |
| Empty document          | "Document contains no readable text. Try a different file."                       | Choose a different file  |
| AI timeout              | "Analysis timed out. Please try again."                                           | Retry                    |
| AI failure              | "AI service is temporarily unavailable. Please try again later."                  | Retry                    |
| Unauthorized access     | "You don't have access to this document."                                         | Go back to dashboard     |
| Network failure         | "Connection lost. Check your network and try again."                              | Retry                    |
| Q&A not found           | "This information is not present in the uploaded document."                       | Ask a different question |
| Comparison incompatible | "These documents appear to be different types. Comparison may not be meaningful." | Continue anyway / Cancel |
| Session expired         | "Your session has expired. Please sign in again."                                 | Sign in                  |
| Malformed AI output     | "Analysis result could not be processed. Please try again."                       | Retry                    |

### Error Display Format

```
┌──────────────────────────────────────────────────────────────┐
│ ⚠ [Error Icon]                                               │
│                                                              │
│ Human-readable message                                       │
│ Brief explanation of what happened                           │
│                                                              │
│ [Primary Action]  [Secondary Action]                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 19. Empty States

### Design Pattern

Every empty state includes:

1. Icon (64px, muted color)
2. Title (18px, semibold)
3. Description (14px, secondary color) — explains what's missing and why it matters
4. Call-to-action button — what the user can do next

### Specific Empty States

| Context                | Icon     | Title              | Description                                                                 | CTA                        |
| ---------------------- | -------- | ------------------ | --------------------------------------------------------------------------- | -------------------------- |
| Dashboard (new user)   | Document | No documents yet   | Upload your first legal document to get started. Supports PDF, DOCX, TXT.   | Upload Document            |
| Analysis (not started) | Search   | No analysis yet    | Upload and analyze a document to see AI insights.                           | Go to Upload               |
| Q&A (no questions)     | Chat     | Ask a question     | Type any question about your document. AI will answer based on its content. | Suggested questions shown  |
| Comparison (none)      | Compare  | No comparisons yet | Select two documents to compare and find key differences.                   | Compare Documents          |
| History (empty)        | Clock    | No recent activity | Documents you upload will appear here.                                      | Upload Document            |
| Search (no results)    | Search   | No results found   | No documents match your search. Try different terms.                        | Clear Search               |
| Settings (minimal)     | Gear     | —                  | —                                                                           | (No empty states expected) |

---

## 20. Microinteractions & Motion

### Approved Animations

| Animation                 | Duration      | Easing      | Purpose                         |
| ------------------------- | ------------- | ----------- | ------------------------------- |
| Toast appearance          | 300ms         | ease-out    | Draw attention to notifications |
| Accordion expand/collapse | 200ms         | ease-out    | Reveal/hide content smoothly    |
| Page transitions          | 250ms         | ease-in-out | Navigation context              |
| Button press              | 100ms         | ease-in     | Tactile feedback on click       |
| AI spinner                | 0.8s infinite | linear      | Processing indicator            |
| Skeleton shimmer          | 1.5s infinite | ease-in-out | Loading placeholder             |
| Upload progress           | Continuous    | linear      | Reflects actual progress        |

### Reduced Motion

All animations respect `prefers-reduced-motion`:

- Toast: instant appear/disappear
- Accordion: instant expand/collapse (no animation)
- Page transitions: none
- Skeleton: static gray block (no shimmer)
- Spinner: instant (no rotation)

### Anti-Patterns

- No continuous background animations
- No parallax scrolling
- No bouncing or shaking on error
- No auto-playing content
- No decorative motion unrelated to function
- No animations that reduce readability
- No infinite scrolling without clear load-more patterns

---

## 21. Accessibility

### WCAG 2.1 AA Compliance

| Requirement           | Implementation                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| Color contrast        | Normal text ≥ 4.5:1, large text ≥ 3:1 against background                             |
| Focus visibility      | 2px solid `--color-focus` outline on all interactive elements                        |
| Keyboard navigation   | All interactive elements reachable via Tab, Enter/Space to activate, Escape to close |
| Screen reader support | ARIA labels, semantic HTML, live regions for dynamic content                         |
| Form labels           | All inputs have associated `<label>` elements                                        |
| Error identification  | Errors described in text, linked to relevant fields via `aria-describedby`           |
| Responsive design     | Usable at 320px width minimum, no horizontal scrolling                               |
| Touch targets         | Minimum 44x44px (48px on mobile)                                                     |
| Color independence    | All status information includes icon + text, not color alone                         |

### Specific Accessibility Features

- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`
- Headings: logical hierarchy (H1 → H2 → H3 → ...)
- ARIA: `aria-live="polite"` for dynamic content (processing status, AI responses)
- ARIA: `aria-expanded` on accordions
- ARIA: `aria-label` on icon-only buttons
- Focus management: focus moves to modal content when modal opens, returns to trigger on close
- Skip navigation link: available at top of every page

### AI Output Accessibility

- AI responses read naturally by screen readers
- Source citations announced as links
- AI badges announced (e.g., "AI-Generated content")
- Confidence indicators included in text (not only visual)
- Disclaimer text read before or after AI content depending on context

### Mobile Accessibility

- All features usable on mobile
- Touch-friendly targets (48px minimum)
- Readable text without zoom (minimum 16px)
- Responsive layout without horizontal scrolling
- Mobile keyboard optimized (input types correct)

---

## 22. Security & Privacy UX

### Trust Messaging Guidelines

Use precise, defensible language:

- ✅ "Your documents are stored securely in your account."
- ✅ "Documents are processed only for analysis purposes."
- ✅ "Your data is not shared with third parties."
- ✅ "Files are encrypted at rest."
- ❌ "Your data is 100% secure." (unverifiable)
- ❌ "We guarantee your privacy." (unverifiable)

### Destructive Actions

Document deletion requires confirmation dialog:

- Document name shown
- Clear consequence stated: "Permanently deleted from your account"
- Cancel button always available
- Confirm button clearly labeled: "Delete Permanently"
- No undo after confirmation

### AI Transparency in UX

- AI badge visible near all AI-generated content
- AI processing states clearly communicated
- AI limitations always disclosed
- No attempt to make AI output look authoritative or legal
- User reminded of AI nature at key decision points

### Session Management

- User visible: "You are signed in as [email]"
- Logout clear and accessible in all views
- Session expiry message: "Your session has expired. Please sign in again."

---

## 23. Design Tokens

### Complete Token System

```css
/* Colors */
--color-primary: #1e3a5f;
--color-primary-hover: #152d4a;
--color-primary-light: #e8edf3;
--color-secondary: #5b7d99;
--color-secondary-hover: #4a6a82;
--color-background: #f7f8fa;
--color-surface: #ffffff;
--color-text-primary: #1a1a2e;
--color-text-secondary: #5e6b7a;
--color-text-muted: #8a95a3;
--color-border: #dde1e7;
--color-border-strong: #b8c0c9;
--color-focus: #3b7cb5;
--color-success: #2e7d4a;
--color-success-bg: #e8f5e9;
--color-warning: #b7791f;
--color-warning-bg: #fef5e7;
--color-error: #c0392b;
--color-error-bg: #fdedec;
--color-info: #3b7cb5;
--color-info-bg: #ebf3fb;
--color-ai: #6c5ce7;
--color-ai-bg: #f3f1ff;
--color-disabled: #b0b7c0;
--color-risk-low: #2e7d4a;
--color-risk-medium: #b7791f;
--color-risk-high: #c0392b;

/* Spacing (4px base) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* Typography */
--font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
--font-body: 16px;
--font-body-large: 18px;
--font-small: 14px;
--font-caption: 12px;

/* Radii */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-full: 50%;

/* Shadows */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-elevated: 0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.08);
--shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-toast: 0 6px 16px rgba(0, 0, 0, 0.12);

/* Layout */
--sidebar-width: 280px;
--container-max: 1200px;
--container-analysis: 960px;
--container-reading: 720px;

/* Breakpoints */
--mobile: 768px;
--tablet: 1024px;
--wide: 1440px;

/* Transitions */
--transition-fast: 100ms ease-in;
--transition-normal: 200ms ease-out;
--transition-page: 250ms ease-in-out;

/* Z-Index */
--z-dropdown: 100;
--z-modal: 200;
--z-toast: 300;
```

### Implementation Notes

- Tokens implementable as CSS custom properties or Tailwind config
- No design framework required beyond CSS + component library
- Use Tailwind CSS for utility-first styling if available
- Define tokens in shared config file

---

## 24. Iconography

### Icon Guidelines

- Icons support comprehension, never replace text
- All interactive icons have accessible labels (aria-label)
- Consistent 24x24px viewBox
- Stroke-style icons (not filled) for consistency
- 1.5px stroke weight

### Required Icons

| Purpose          | Context                               |
| ---------------- | ------------------------------------- |
| Upload           | Upload button, drag-drop zone         |
| Document         | Dashboard cards, file type indicators |
| AI / Sparkle     | AI badge, AI processing indicators    |
| Search           | Search inputs, empty states           |
| Compare          | Compare button, comparison page       |
| History          | History page, recent activity         |
| Settings         | Settings page, user menu              |
| Delete           | Document deletion, danger zone        |
| Expand/Collapse  | Accordions, section toggles           |
| Source/Reference | Source citations, evidence links      |
| Warning          | Error states, risk indicators         |
| Success          | Success states, completion            |
| Error            | Error states, validation              |
| Info             | Informational messages                |
| Check            | Completed stages, checked items       |
| Arrow Right      | Navigation, CTAs                      |
| Menu (hamburger) | Mobile navigation                     |
| Close (X)        | Modals, dismiss, clear input          |

### Icon Anti-Patterns

- No decorative icon clusters
- No icon-only buttons without accessible labels
- No icons that replace important text content
- No inconsistent icon styles

---

## 25. Illustration & Graphics

### Style

- **Abstract, document-oriented** illustrations for empty states
- **Simple geometric** visuals for features
- **Subtle** accent graphics, never dominant
- **Professional** — modern flat style, no 3D
- **Monochrome or primary color accents only** — no rainbow illustrations

### Use Cases

| Context                | Illustration Type                                  |
| ---------------------- | -------------------------------------------------- |
| Empty states           | Simple document/paper icon in muted color          |
| Error states           | Warning triangle with subtle emphasis              |
| Landing page hero      | Abstract document with analysis lines              |
| Onboarding (if needed) | Step-by-step document flow diagram                 |
| Processing states      | Spinner + progress stages (no illustration needed) |

### Avoid

- Stock photos of lawyers or courtrooms
- Clip-art style imagery
- Generic "tech" illustrations (circuit boards, robots)
- Heavy illustration programs that compete with content
- Courtroom or legal-symbol imagery (gavels, scales)

---

## 26. Design Anti-Patterns

Explicitly prohibited:

| Anti-Pattern                                                    | Why Prohibited                                   |
| --------------------------------------------------------------- | ------------------------------------------------ |
| Fake AI confidence percentages                                  | Implies false precision                          |
| "Verified by AI" claims                                         | Implies authority AI doesn't have                |
| Declarative legal language ("illegal", "invalid", "guaranteed") | Unsubstantiated, dangerous                       |
| Excessive gradients                                             | Distracts from content, feels gimmicky           |
| Glassmorphism                                                   | Reduces readability, feels trendy not functional |
| Excessive rounded cards                                         | Looks generic, reduces professionalism           |
| Giant animations                                                | Distracts from document content                  |
| Color-only risk indicators                                      | Inaccessible to color-blind users                |
| Misleading progress bars                                        | Lies about known state                           |
| Hidden disclaimers                                              | Undermines AI transparency                       |
| Confusing AI vs source content                                  | User can't distinguish AI from original          |
| Fake chatbot interface                                          | Implies unrestricted AI, not document-grounded   |
| Unnecessary popups/popovers                                     | Reduces trust, increases cognitive load          |
| Excessive notifications                                         | Desensitizes user, reduces trust                 |
| Cluttered dashboard                                             | Defeats purpose of clarity-first design          |
| "100% accurate" claims                                          | Unverifiable, dangerous in legal context         |
| "Replaces lawyers" claims                                       | Against product principles                       |
| "Guarantees legal compliance" claims                            | Unsubstantiated, dangerous                       |
| Dark patterns                                                   | Against trust principles                         |
| Decorative icon clusters                                        | Reduces clarity                                  |
| Generic AI chatbot aesthetic                                    | Misrepresents document-grounded nature           |

---

## 27. Hackathon Demo UX

### Demo Interface Optimization

The interface must be optimized for a **4-minute live demonstration** with live input and dynamic AI output.

### Primary Demo Flow (Visually Obvious)

```
Landing → Login → Dashboard → Upload → Processing → Analysis →
Summary → Clauses → Risks → Q&A → Comparison → Next Steps
```

### Demo Screen Priority

| Priority | Screen                  | Why                                  |
| -------- | ----------------------- | ------------------------------------ |
| Critical | Dashboard               | Entry point, shows documents         |
| Critical | Upload                  | Live demo of document intake         |
| Critical | Processing              | Shows real-time AI pipeline          |
| Critical | Analysis (full results) | Core value — summary, clauses, risks |
| Critical | Q&A                     | Interactive AI capability            |
| High     | Comparison              | Two-document feature                 |
| High     | Next Steps              | Actionable guidance                  |
| Low      | Settings                | Not demoed                           |

### Demo Design Considerations

- Important AI output visible **without excessive scrolling** — summary, key clauses, risks all above the fold on desktop
- AI Badge and disclaimer **immediately visible** — judges can see AI transparency
- Processing stages **interesting to watch** — shows real AI work
- Demo documents chosen for **clear, interesting analysis results** (obvious clauses, clear risks)
- Q&A pre-planned question demonstrates grounding with clear source citation
- Comparison chosen to show **meaningful, easy-to-spot differences**
- Edge case pre-planned: out-of-scope question → "not present" response (demonstrates safety)
- All demo interactions are **live and dynamic** — no hardcoded results

### Demo Presentation Tips

- UI readable from judge's seat (font sizes, contrast)
- Cursor visible and deliberate
- Clear narration of what each screen demonstrates
- AI processing visible (spinner/indicator) during analysis
- Source citations clickable (demonstrate grounding)
- Risk explanations use careful language (demonstrate responsibility)
- Disclaimer visible at all times (demonstrates AI transparency)

### Backup Demo Plan

If issues arise during demo:

1. If upload fails: use pre-analyzed results (clearly labeled as backup)
2. If AI fails: use pre-prepared screenshots (clearly labeled as backup)
3. If network fails: use local copies of demo documents and results
4. Always have 2 backup documents ready

---

## 28. Implementation Guidelines

### Implementation Decision Required: Component Library

**Decision:** Whether to use an existing component library (e.g., Radix UI, shadcn/ui) or build custom components.

**Recommendation:** Use shadcn/ui or similar for: Button, Input, Dialog, Tabs, Accordion, Select, Badge, Skeleton, Toast. Build custom for: AI Response, Clause Card, Risk Badge, Source Reference, Comparison Row, Document Card, Risk Badge, Disclaimer.

### Screen Implementation Order

Implement screens in this order for best demo readiness:

1. Landing (static — quick to implement)
2. Authentication (Firebase integration)
3. Dashboard (data display, depends on auth)
4. Upload (file handling)
5. Processing (depends on upload + Gemini)
6. Analysis (core screen, depends on processing)
7. Q&A (depends on analysis)
8. Comparison (depends on analysis of two documents)
9. Next Steps (depends on analysis)
10. History (data display)
11. Settings (static-ish)

### Layout Guidelines

- Use CSS custom variables or Tailwind config for design tokens
- Implement responsive layouts with mobile-first CSS
- Use Flexbox for component-level layout, Grid for page-level layouts
- Implement skip-navigation link as first element on every page
- Use semantic HTML by default (header, main, nav, section, article)

### No Implementation Details Not Defined

If a design decision depends on an implementation detail not yet defined, mark it as:

> **Implementation decision required:** [specific decision needed]

Do not invent backend behavior, state management, or API response structures not defined in PRD.md or architecture.md.

---

## 29. Design QA Checklist

- [ ] Visual consistency (components, spacing, typography follow tokens)
- [ ] Responsive design (mobile, tablet, desktop all usable)
- [ ] Accessibility (WCAG 2.1 AA, keyboard nav, screen reader)
- [ ] Keyboard navigation (Tab, Enter, Escape all work)
- [ ] AI transparency (AI badge visible on all AI content)
- [ ] Source attribution (citations shown where available)
- [ ] Legal disclaimer (visible on all AI outputs)
- [ ] Error states (all important flows have error handling)
- [ ] Empty states (all lists have meaningful empty states)
- [ ] Loading states (all important operations show progress)
- [ ] Upload states (progress, validation, success, error)
- [ ] Security/privacy messaging (visible, accurate)
- [ ] Document readability (legal text comfortable to read)
- [ ] Q&A usability (input clear, answers grounded, sources visible)
- [ ] Comparison usability (differences clear, responsive layout)
- [ ] Risk presentation (educational language, no fake authority)
- [ ] Mobile usability (touch targets, readable text, no overflow)
- [ ] Hackathon demo flow (primary flow visually obvious, demo-able in 4 min)
- [ ] No misleading legal claims (no "accurate", "verified", "guaranteed")
- [ ] No fake AI confidence (no percentage scores, text-based uncertainty)
- [ ] No unsupported product claims (no features claimed that aren't built)

---

_Design system for LegalEase-AI — PromptWars Virtual hackathon._

_Based on PRD.md (product requirements) and architecture.md (technical architecture)._

_Design priority order: CLARITY → TRUST → READABILITY → AI TRANSPARENCY → ACCESSIBILITY → RESPONSIVENESS → VISUAL POLISH._

_LegalEase-AI helps users understand legal documents. It does not replace a lawyer._
