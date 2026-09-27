import { memo } from 'react';
import type { SensorExpiryStatus } from '@/hooks/useSensorExpiry';
import {
  getTrendArrowFromPrediction,
  getTrendDescription,
  predictGlucoseTrend,
} from '@/utils/trend-prediction';

interface GraphDataPoint {
  time: Date;
  value: number;
}

interface GlucoseDisplayProps {
  glucose?: number;
  daysToExpire: number | null;
  sensorStatus: SensorExpiryStatus;
  graphData?: GraphDataPoint[];
}

const getExpiryStyles = (status: SensorExpiryStatus) => {
  switch (status) {
    case 'critical':
      return { color: '#d32f2f', fontWeight: 500 as const };
    case 'warning':
      return { color: '#f57c00', fontWeight: 500 as const };
    default:
      return { color: '#666', fontWeight: 400 as const };
  }
};

const getSensorStatusLabel = (status: SensorExpiryStatus): string => {
  switch (status) {
    case 'critical':
      return 'Critical - sensor expiring soon';
    case 'warning':
      return 'Warning - sensor expiring in a few days';
    default:
      return 'Normal - sensor operating normally';
  }
};

/**
 * Memoized glucose display component
 * Shows current glucose value, sensor expiry, and trend prediction
 */
const GlucoseDisplay = memo(function GlucoseDisplay({
  glucose,
  daysToExpire,
  sensorStatus,
  graphData,
}: GlucoseDisplayProps) {
  const expiryStyles = getExpiryStyles(sensorStatus);

  // Calculate trend prediction from graph data
  const trendPrediction = graphData && graphData.length > 0 ? predictGlucoseTrend(graphData) : null;

  const trendArrow = trendPrediction
    ? getTrendArrowFromPrediction(trendPrediction.predictedChange)
    : null;

  // Calculate predicted glucose value in 15 minutes
  const predictedGlucose15min = trendPrediction
    ? (glucose ?? 0) + trendPrediction.predictedChange15min
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-start',
      }}
      role="region"
      aria-label="Glucose monitoring display"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h3 style={{ margin: 0 }} aria-live="polite" aria-atomic="true">
          {glucose?.toFixed(1) ?? '--'} mmol/L
        </h3>
        {trendArrow && (
          <span
            style={{ fontSize: '20px' }}
            aria-label={`Glucose trend: ${
              trendPrediction?.predictedChange15min
                ? `${trendPrediction.predictedChange15min > 0 ? 'rising' : 'falling'} to ${(glucose ?? 0) + trendPrediction.predictedChange15min} mmol/L`
                : 'stable'
            }`}
            title={
              trendPrediction
                ? `Predicted: ${predictedGlucose15min?.toFixed(1)} mmol/L in 15 min`
                : undefined
            }
          >
            {trendArrow}
          </span>
        )}
      </div>
      {daysToExpire !== null && (
        <p
          className={`sensor-expiry ${sensorStatus}`}
          style={{
            margin: 0,
            fontSize: '13px',
            ...expiryStyles,
          }}
          aria-label={`Sensor expiry: ${getSensorStatusLabel(sensorStatus)}, ${daysToExpire} day${daysToExpire !== 1 ? 's' : ''} remaining`}
        >
          Sensor ends in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}
        </p>
      )}
      {trendPrediction && predictedGlucose15min !== null && (
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color:
              trendPrediction.predictedChange > 0.1
                ? '#f57c00'
                : trendPrediction.predictedChange < -0.1
                  ? '#1976d2'
                  : '#666',
          }}
          aria-label={`Predicted glucose: ${predictedGlucose15min.toFixed(1)} mmol/L in 15 minutes`}
        >
          {trendPrediction.confidence === 'high' && '↑ '}
          {trendPrediction.predictedChange15min > 0
            ? 'rising'
            : trendPrediction.predictedChange15min < 0
              ? 'falling'
              : 'stable'}
          ({predictedGlucose15min.toFixed(1)} mmol/L in 15 min)
        </p>
      )}
    </div>
  );
});

export default GlucoseDisplay;
