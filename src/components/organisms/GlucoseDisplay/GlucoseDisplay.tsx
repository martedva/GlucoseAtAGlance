import { memo } from 'react';
import { Icon } from '@/components/atoms';
import { predictGlucoseTrend } from '@/utils/trend-prediction';
import type { SensorExpiryStatus } from '@/hooks/useSensorExpiry';
import styles from './GlucoseDisplay.module.scss';

interface GraphDataPoint {
  time: Date;
  value: number;
  trendArrow?: number;
}

export interface GlucoseDisplayProps {
  glucose?: number;
  daysToExpire: number | null;
  sensorStatus: SensorExpiryStatus;
  graphData?: GraphDataPoint[];
  currentTrendArrow?: number;
}

const getExpiryClassName = (status: SensorExpiryStatus): string => {
  switch (status) {
    case 'critical':
      return styles.critical;
    case 'warning':
      return styles.warning;
    default:
      return '';
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

const getTrendArrowFromApi = (arrowCode: number | undefined): string | null => {
  if (arrowCode === undefined) return null;
  switch (arrowCode) {
    case 1:
      return '↓';
    case 2:
      return '↘️';
    case 3:
      return '→';
    case 4:
      return '↗️';
    case 5:
      return '↑';
    default:
      return '→';
  }
};

const getTrendDescriptionFromApi = (arrowCode: number | undefined): string => {
  if (arrowCode === undefined) return 'stable';
  switch (arrowCode) {
    case 1:
      return 'falling fast';
    case 2:
      return 'falling';
    case 3:
      return 'stable';
    case 4:
      return 'rising';
    case 5:
      return 'rising fast';
    default:
      return 'stable';
  }
};

const getTrendColorClass = (arrowCode: number | undefined): string => {
  if (arrowCode === undefined) return styles.stable;
  if (arrowCode >= 4) return styles.rising;
  if (arrowCode <= 2) return styles.falling;
  return styles.stable;
};

/**
 * Organism GlucoseDisplay component
 * Shows current glucose value, sensor expiry, and trend
 */
const GlucoseDisplay = memo(function GlucoseDisplay({
  glucose,
  daysToExpire,
  sensorStatus,
  graphData,
  currentTrendArrow,
}: GlucoseDisplayProps) {
  const trendArrow = getTrendArrowFromApi(currentTrendArrow);
  const trendDescription = getTrendDescriptionFromApi(currentTrendArrow);
  const trendColorClass = getTrendColorClass(currentTrendArrow);

  const predictedGlucose15min =
    graphData && graphData.length > 0
      ? (glucose ?? 0) + (predictGlucoseTrend(graphData)?.predictedChange15min ?? 0)
      : null;

  return (
    <div className={styles.glucoseDisplay} role="region" aria-label="Glucose monitoring display">
      <div className={styles.glucoseDisplay__main}>
        <h3 className={styles.glucoseDisplay__value} aria-live="polite" aria-atomic="true">
          {glucose?.toFixed(1) ?? '--'} mmol/L
        </h3>
        {trendArrow && (
          <Icon
            size="medium"
            variant={
              currentTrendArrow && currentTrendArrow >= 4
                ? 'trend-up'
                : currentTrendArrow && currentTrendArrow <= 2
                  ? 'trend-down'
                  : 'trend-stable'
            }
            className={styles.glucoseDisplay__trend}
            aria-label={`Glucose trend: ${trendDescription}`}
            title={trendDescription}
          >
            {trendArrow}
          </Icon>
        )}
      </div>
      {daysToExpire !== null && (
        <p
          className={`${styles.glucoseDisplay__sensorExpiry} ${getExpiryClassName(sensorStatus)}`}
          aria-label={`Sensor expiry: ${getSensorStatusLabel(sensorStatus)}, ${daysToExpire} day${daysToExpire !== 1 ? 's' : ''} remaining`}
        >
          Sensor ends in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}
        </p>
      )}
      {currentTrendArrow !== undefined && (
        <p
          className={`${styles.glucoseDisplay__trendDescription} ${trendColorClass}`}
          aria-label={`Predicted glucose trend: ${trendDescription}`}
        >
          {trendDescription.charAt(0).toUpperCase() + trendDescription.slice(1)}{' '}
          {predictedGlucose15min !== null &&
            ` (${predictedGlucose15min.toFixed(1)} mmol/L in 15 min)`}
        </p>
      )}
    </div>
  );
});

export default GlucoseDisplay;