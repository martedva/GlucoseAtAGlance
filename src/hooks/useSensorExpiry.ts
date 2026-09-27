import { useMemo } from 'react';
import { SENSOR_CONFIG, UI_CONFIG } from '@/config';
import type { SensorData } from '@/types/api';

export type SensorExpiryStatus = 'normal' | 'warning' | 'critical' | 'unknown';

interface UseSensorExpiryReturn {
  daysToExpire: number | null;
  expiryDate: Date | null;
  sensorStatus: SensorExpiryStatus;
}

/**
 * Hook to calculate sensor expiry based on activation date
 * Sensors last 14 days from activation
 */
export function useSensorExpiry(sensor: SensorData | undefined): UseSensorExpiryReturn {
  return useMemo(() => {
    if (!sensor?.a) {
      return {
        daysToExpire: null,
        expiryDate: null,
        sensorStatus: 'unknown' as SensorExpiryStatus,
      };
    }

    const activationDate = new Date(sensor.a * 1000); // Convert Unix seconds to ms
    const expiryDate = new Date(
      activationDate.getTime() + SENSOR_CONFIG.LIFETIME_DAYS * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let sensorStatus: SensorExpiryStatus = 'normal';
    if (diffDays <= UI_CONFIG.SENSOR_EXPIRY_CRITICAL_DAYS) {
      sensorStatus = 'critical';
    } else if (diffDays <= UI_CONFIG.SENSOR_EXPIRY_WARNING_DAYS) {
      sensorStatus = 'warning';
    }

    return {
      daysToExpire: diffDays,
      expiryDate,
      sensorStatus,
    };
  }, [sensor]);
}