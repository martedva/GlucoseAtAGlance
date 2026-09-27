/**
 * Calculate glucose trend prediction using linear regression
 * Returns predicted glucose value and trend direction
 */

export interface TrendPrediction {
  predictedValue: number;
  predictedChange: number; // mmol/L per minute
  predictedChange15min: number; // predicted change in 15 minutes
  predictedChange30min: number; // predicted change in 30 minutes
  predictedChange60min: number; // predicted change in 60 minutes
  confidence: 'low' | 'medium' | 'high';
}

interface DataPoint {
  time: Date;
  value: number;
}

/**
 * Calculate linear regression slope (rate of change)
 * Uses least squares method
 */
function calculateSlope(data: DataPoint[]): number {
  if (data.length < 2) return 0;

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  const baseTime = data[0].time.getTime();

  for (let i = 0; i < n; i++) {
    const x = (data[i].time.getTime() - baseTime) / (1000 * 60); // minutes
    const y = data[i].value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return 0;

  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Calculate prediction confidence based on data quality
 */
function calculateConfidence(data: DataPoint[], slope: number): 'low' | 'medium' | 'high' {
  // Need minimum data points
  if (data.length < 3) return 'low';

  // Check data consistency (standard deviation)
  const values = data.map((d) => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // High variance = low confidence
  if (stdDev > 3) return 'low';
  if (stdDev > 1.5) return 'medium';

  // Check if we have recent data (last 30 minutes)
  const now = Date.now();
  const thirtyMinAgo = now - 30 * 60 * 1000;
  const recentPoints = data.filter((d) => d.time.getTime() > thirtyMinAgo);

  if (recentPoints.length < 2) return 'low';
  if (recentPoints.length < 4) return 'medium';

  return 'high';
}

/**
 * Predict glucose trend based on historical data
 * @param data - Array of glucose readings with timestamps
 * @param lookbackMinutes - How many minutes of data to consider (default: 60)
 * @returns Trend prediction with confidence level
 */
export function predictGlucoseTrend(
  data: Array<{ time: Date; value: number }>,
  lookbackMinutes: number = 60
): TrendPrediction | null {
  if (!data || data.length < 2) {
    return null;
  }

  // Filter data to lookback window
  const now = Date.now();
  const cutoffTime = now - lookbackMinutes * 60 * 1000;
  const recentData = data.filter((d) => d.time.getTime() > cutoffTime);

  if (recentData.length < 2) {
    return null;
  }

  // Sort by time
  recentData.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Calculate slope (mg/dL per minute)
  const slope = calculateSlope(recentData);

  // Get current value (most recent)
  const currentValue = recentData[recentData.length - 1].value;

  // Calculate predictions
  const predictedChange15min = slope * 15;
  const predictedChange30min = slope * 30;
  const predictedChange60min = slope * 60;

  // Calculate confidence
  const confidence = calculateConfidence(recentData, slope);

  return {
    predictedValue: currentValue + predictedChange15min,
    predictedChange: slope,
    predictedChange15min,
    predictedChange30min,
    predictedChange60min,
    confidence,
  };
}

/**
 * Get trend arrow based on predicted change
 * @param changePerMinute - Rate of change in mmol/L per minute
 * @returns Arrow emoji representing trend direction
 */
export function getTrendArrowFromPrediction(changePerMinute: number): string {
  if (changePerMinute > 0.3) return '↗️'; // Rising fast
  if (changePerMinute > 0.1) return '↑'; // Rising
  if (changePerMinute < -0.3) return '↘️'; // Falling fast
  if (changePerMinute < -0.1) return '↓'; // Falling
  return '→'; // Stable
}

/**
 * Get trend description text
 */
export function getTrendDescription(prediction: TrendPrediction): string {
  const { predictedChange15min, confidence } = prediction;

  if (Math.abs(predictedChange15min) < 0.5) {
    return 'Stable';
  }

  const direction = predictedChange15min > 0 ? 'rising' : 'falling';
  const magnitude = Math.abs(predictedChange15min).toFixed(1);

  return `${direction} (${magnitude} mmol/L in 15 min)`;
}
