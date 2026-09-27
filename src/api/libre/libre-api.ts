import type { LibreViewResponse, LoginResponse } from '@/types/api';
import fetchJson from '@/api/fetchJson';
import { API_CONFIG } from '@/config';

const libreApiHeaders: Record<string, string> = {
  product: API_CONFIG.PRODUCT,
  version: API_CONFIG.VERSION,
};

/**
 * Fetch glucose graph data for a patient (requires authentication)
 */
export async function getLibreGraph(patientId: string): Promise<LibreViewResponse> {
  const route = `${API_CONFIG.BASE_URL}/connections/${patientId}/graph`;
  const response = await fetchJson<LibreViewResponse>(route, {
    customHeaders: libreApiHeaders,
    method: 'GET',
  });

  return response;
}

/**
 * Authenticate with LibreLinkUp API (no auth required for login)
 */
export async function getLibreToken(email: string, password: string): Promise<LoginResponse> {
  const route = `${API_CONFIG.BASE_URL}/auth/login`;

  // Login doesn't require auth headers, so we use fetch directly
  const response = await fetch(route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...libreApiHeaders,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Login failed: ${response.status}`);
  }

  return response.json();
}