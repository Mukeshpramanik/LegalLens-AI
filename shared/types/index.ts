export type DocumentStatus = 'processing' | 'analyzing' | 'complete' | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ConfidenceIndicator = 'Highly confident' | 'Moderately confident' | 'Limited information';

export interface SourceLocation {
  page?: number;
  section?: string;
  excerpt?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface LegalDocument {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  status: DocumentStatus;
  uploadedAt: string;
  updatedAt: string;
  pageCount?: number;
  charCount?: number;
  errorMessage?: string;
}

export interface Clause {
  id: string;
  title: string;
  text: string;
  category?: string;
  summary: string;
  location: SourceLocation;
  riskLevel: RiskLevel;
}

export interface Obligation {
  id: string;
  party: string;
  description: string;
  deadline?: string;
  location: SourceLocation;
}

export interface ImportantDate {
  id: string;
  date: string;
  event: string;
  location: SourceLocation;
  isActionRequired: boolean;
}

export interface RiskArea {
  id: string;
  title: string;
  category: string;
  description: string;
  recommendation: string;
  location: SourceLocation;
  riskLevel: RiskLevel;
}

export interface KeyParty {
  id: string;
  name: string;
  role: string;
  location?: SourceLocation;
}

export interface Right {
  id: string;
  party: string;
  description: string;
  location?: SourceLocation;
}

export interface PaymentTerm {
  id: string;
  amount: string;
  condition: string;
  dueDate?: string;
  location?: SourceLocation;
}

export interface TerminationTerm {
  id: string;
  condition: string;
  noticePeriod?: string;
  location?: SourceLocation;
}

export interface MissingInformation {
  id: string;
  description: string;
  impact: RiskLevel;
}

export interface AnalysisResult {
  id: string;
  documentId: string;
  userId: string;
  documentType: string | null;
  summary: string;
  keyParties: KeyParty[];
  importantDates: ImportantDate[];
  keyClauses: Clause[];
  obligations: Obligation[];
  rights: Right[];
  paymentTerms: PaymentTerm[];
  terminationTerms: TerminationTerm[];
  risks: RiskArea[];
  missingInformation: MissingInformation[];
  nextSteps: string[];
  disclaimer: string;
  analyzedAt: string;
}

export interface GroundedSource {
  section: string;
  excerpt: string;
}

export type QAConfidence = 'high' | 'medium' | 'low';

export interface QAPair {
  id: string;
  documentId: string;
  userId: string;
  question: string;
  answer: string;
  sources: GroundedSource[];
  confidence: QAConfidence;
  grounded: boolean;
  disclaimer: string;
  askedAt: string;
}

export type ChangeCategory = 'payment' | 'termination' | 'rights' | 'obligations' | 'liability' | 'confidentiality' | 'other';
export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface ClauseDifference {
  category: ChangeCategory;
  documentA: string;
  documentB: string;
  changeType: ChangeType;
  significance: RiskLevel;
}

export interface ComparisonResult {
  id: string;
  doc1Id: string;
  doc2Id: string;
  userId: string;
  doc1Title: string;
  doc2Title: string;
  summary: string;
  changes: ClauseDifference[];
  keyDifferences: string[];
  risks: RiskArea[];
  missingInformation: MissingInformation[];
  disclaimer: string;
  comparedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
