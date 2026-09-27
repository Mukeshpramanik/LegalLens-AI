import { getIdToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/** Extended error that carries the HTTP status code from the backend. */
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function isQuotaExceededError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 429 ||
      err.code === 'QUOTA_EXCEEDED' ||
      err.message.toLowerCase().includes('quota')
    );
  }
  if (err instanceof Error) {
    return (
      err.message.includes('429') ||
      err.message.toLowerCase().includes('quota') ||
      err.message.includes('rate limit')
    );
  }
  return false;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...customConfig } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requestHeaders['Content-Type'] === '') {
    delete requestHeaders['Content-Type'];
  }

  if (requiresAuth) {
    const token = await getIdToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...customConfig,
    headers: requestHeaders,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || `API error: ${response.status} ${response.statusText}`;
    const errorCode = data?.error?.code;
    throw new ApiError(errorMsg, response.status, errorCode);
  }

  return data as T;
}

export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  return apiClient('/health', { requiresAuth: false });
}
