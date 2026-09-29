import { SENSOR_CONFIG } from '@/config';

export interface GlucoseStats {
  timeInRange: number;        // Percentage (0-100)
  timeBelowRange: number;     // Percentage (0-100)
  timeAboveRange: number;     // Percentage (0-100)
  averageGlucose: number;     // mmol/L
  minGlucose: number;         // mmol/L
  maxGlucose: number;         // mmol/L
  readingsCount: number;      // Number of data points
  standardDeviation: number;  // Variability
  periodLabel: string;        // e.g., "Last 12 Hours"
}

interface DataPoint {
  time: Date;
  value: number;
}

/**
 * Filter data by time period
 */
export function filterDataByPeriod(
  data: DataPoint[],
  hours: number
): DataPoint[] {
  const now = Date.now();
  const cutoffTime = now - (hours * 60 * 60 * 1000);
  return data.filter((d) => d.time.getTime() > cutoffTime);
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate glucose statistics for a given dataset
 */
export function calculateGlucoseStats(
  data: DataPoint[],
  targetLowMgDl: number,
  targetHighMgDl: number,
  periodLabel: string
): GlucoseStats | null {
  if (!data || data.length < 3) {
    return null;
  }

  // Convert targets from mg/dL to mmol/L using fixed constant
  const targetLow = targetLowMgDl / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR;
  const targetHigh = targetHighMgDl / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR;

  const values = data.map((d) => d.value);
  const readingsCount = values.length;

  // Calculate average
  const averageGlucose = values.reduce((sum, val) => sum + val, 0) / readingsCount;

  // Calculate min/max
  const minGlucose = Math.min(...values);
  const maxGlucose = Math.max(...values);

  // Calculate standard deviation
  const standardDeviation = calculateStandardDeviation(values);

  // Calculate time in range percentages
  const inRange = values.filter((v) => v >= targetLow && v <= targetHigh).length;
  const below = values.filter((v) => v < targetLow).length;
  const above = values.filter((v) => v > targetHigh).length;

  const timeInRange = (inRange / readingsCount) * 100;
  const timeBelowRange = (below / readingsCount) * 100;
  const timeAboveRange = (above / readingsCount) * 100;

  return {
    timeInRange,
    timeBelowRange,
    timeAboveRange,
    averageGlucose,
    minGlucose,
    maxGlucose,
    readingsCount,
    standardDeviation,
    periodLabel,
  };
}

/**
 * Get TIR badge color and label
 */
export function getTirBadge(timeInRange: number): {
  color: string;
  label: string;
} {
  if (timeInRange >= 70) {
    return { color: '#4caf50', label: 'Excellent' };
  }
  if (timeInRange >= 50) {
    return { color: '#ff9800', label: 'Good' };
  }
  return { color: '#f44336', label: 'Needs Attention' };
}