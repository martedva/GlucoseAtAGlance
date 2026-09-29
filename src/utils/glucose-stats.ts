export interface GlucoseStats {
  timeInRange: number;        // Percentage (0-100)
  timeBelowRange: number;     // Percentage (0-100)
  timeAboveRange: number;     // Percentage (0-100)
  averageGlucose: number;     // User's preferred unit
  minGlucose: number;         // User's preferred unit
  maxGlucose: number;         // User's preferred unit
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
 * @param data - Glucose data points (values in user's preferred unit)
 * @param targetLow - Low target threshold (in user's preferred unit)
 * @param targetHigh - High target threshold (in user's preferred unit)
 * @param periodLabel - Label for the time period
 * @param uom - Unit of measure: 0 = mg/dL, 1 = mmol/L
 */
export function calculateGlucoseStats(
  data: DataPoint[],
  targetLow: number,
  targetHigh: number,
  periodLabel: string,
  uom: number = 1
): GlucoseStats | null {
  if (!data || data.length < 3) {
    return null;
  }

  // uom: 0 = mg/dL, 1 = mmol/L
  // Targets and data are both already in the user's preferred unit
  // No conversion needed - just compare directly
  const values = data.map((d) => d.value);
  const readingsCount = values.length;

  // Calculate average
  const averageGlucose = values.reduce((sum, val) => sum + val, 0) / readingsCount;

  // Calculate min/max
  const minGlucose = Math.min(...values);
  const maxGlucose = Math.max(...values);

  // Calculate standard deviation
  const standardDeviation = calculateStandardDeviation(values);

  // Calculate time in range percentages in a single pass
  const { inRange, below, above } = values.reduce(
    (acc, v) => {
      if (v >= targetLow && v <= targetHigh) {
        acc.inRange++;
      } else if (v < targetLow) {
        acc.below++;
      } else {
        acc.above++;
      }
      return acc;
    },
    { inRange: 0, below: 0, above: 0 }
  );

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