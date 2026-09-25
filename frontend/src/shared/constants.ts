export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const SUPPORTED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;

export const LEGAL_DISCLAIMER = 'LegalLens AI provides informational document analysis and is not a substitute for advice from a qualified legal professional.';

export const RISK_CATEGORIES = [
  'Liability',
  'Termination',
  'Indemnity',
  'Auto-renewal',
  'Limitation of liability',
  'Confidentiality',
  'Intellectual property assignment',
  'Jurisdiction',
  'Payment',
  'Penalties',
] as const;

export const CONFIDENCE_LEVELS = [
  'Highly confident',
  'Moderately confident',
  'Limited information',
] as const;
