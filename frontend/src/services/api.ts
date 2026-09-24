import { getIdToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
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
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  return apiClient('/health', { requiresAuth: false });
}
