import fetchJson from '@/api/fetchJson';
import { API_CONFIG } from '@/config';
import type { LogbookResponse } from '@/types/api';

const libreApiHeaders: Record<string, string> = {
  product: API_CONFIG.PRODUCT,
  version: API_CONFIG.VERSION,
};

/**
 * Fetch logbook data for a patient (requires authentication)
 * Returns approximately 14 days of historical glucose events
 */
export async function getLibreLogbook(patientId: string): Promise<LogbookResponse> {
  const route = `${API_CONFIG.BASE_URL}/connections/${patientId}/logbook`;
  const response = await fetchJson<LogbookResponse>(route, {
    customHeaders: libreApiHeaders,
    method: 'GET',
  });

  return response;
}