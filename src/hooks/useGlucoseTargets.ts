import { useMemo } from 'react';
import type { LibreViewResponse } from '@/types/api';
import { SENSOR_CONFIG } from '@/config';

export interface GlucoseTargets {
  targetLow?: number;      // In mmol/L for graph display
  targetHigh?: number;     // In mmol/L for graph display
  targetLowRaw?: number;   // Raw value from API (user's preferred unit)
  targetHighRaw?: number;  // Raw value from API (user's preferred unit)
  uom: number;             // 0 = mg/dL, 1 = mmol/L
}

/**
 * Hook for extracting and converting glucose target ranges from API data
 * Handles unit conversion between mg/dL and mmol/L
 * 
 * @param data - LibreView API response data
 * @returns GlucoseTargets object with both raw and converted values
 */
export function useGlucoseTargets(data: LibreViewResponse['data'] | undefined): GlucoseTargets {
  return useMemo(() => {
    const targetLowRaw = data?.connection.targetLow;
    const targetHighRaw = data?.connection.targetHigh;
    const uom = data?.connection.uom ?? 1; // 0 = mg/dL, 1 = mmol/L

    // Convert targets to mmol/L for graph display (graph y-axis is 0-21 mmol/L)
    const isMgDl = uom === 0;
    const targetLow = targetLowRaw !== undefined
      ? (isMgDl ? targetLowRaw / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR : targetLowRaw)
      : undefined;
    const targetHigh = targetHighRaw !== undefined
      ? (isMgDl ? targetHighRaw / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR : targetHighRaw)
      : undefined;

    return {
      targetLow,
      targetHigh,
      targetLowRaw,
      targetHighRaw,
      uom,
    };
  }, [data?.connection.targetLow, data?.connection.targetHigh, data?.connection.uom]);
}