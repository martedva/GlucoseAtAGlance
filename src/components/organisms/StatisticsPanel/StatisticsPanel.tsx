import { useState, useMemo } from 'react';
import { StatCard, TabButton } from '@/components/molecules';
import type { TransformedGraphDataPoint } from '@/hooks/useGlucoseData';
import './StatisticsPanel.css';

export type StatisticsPeriod = '12h' | '7d' | '14d';

export interface StatisticsPanelProps {
  graphData: TransformedGraphDataPoint[];
  logbookData?: TransformedGraphDataPoint[];
  targetLow?: number;
  targetHigh?: number;
  isLoading: boolean;
  uom: number; // 0 = mg/dL, 1 = mmol/L
}

interface Stats {
  avg: number;
  min: number;
  max: number;
  sd: number;
  tir: number;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Organism StatisticsPanel component
 * Shows glucose statistics for different time periods
 */
const StatisticsPanel = function StatisticsPanel({
  graphData,
  logbookData,
  targetLow = 70,
  targetHigh = 180,
  isLoading,
  uom,
}: StatisticsPanelProps) {
  const [period, setPeriod] = useState<StatisticsPeriod>('12h');

  // Merge graphData and logbookData, removing duplicates by timestamp
  const mergedData = useMemo(() => {
    if (!graphData || graphData.length === 0) return logbookData || [];
    if (!logbookData || logbookData.length === 0) return graphData;

    // Combine both arrays and remove duplicates based on timestamp
    const combined = [...graphData, ...logbookData];
    const uniqueMap = new Map<number, TransformedGraphDataPoint>();
    
    combined.forEach((point) => {
      const timestamp = point.time.getTime();
      // Keep the first occurrence (or could keep latest if needed)
      if (!uniqueMap.has(timestamp)) {
        uniqueMap.set(timestamp, point);
      }
    });

    // Convert back to array and sort by time
    return Array.from(uniqueMap.values()).sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [graphData, logbookData]);

  const stats = useMemo(
    () => calculateStatistics(mergedData, period, targetLow, targetHigh),
    [mergedData, period, targetLow, targetHigh]
  );
  const unit = uom === 0 ? 'mmol/L' : 'mg/dL';

  const periods: StatisticsPeriod[] = ['12h', '7d', '14d'];

  // Helper to format date with time (no seconds)
  const formatDateTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePeriodChange = (newPeriod: StatisticsPeriod) => {
    setPeriod(newPeriod);
  };

  if (isLoading) {
    return (
      <div className="statistics-panel">
        <div className="statistics-panel__cards">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="stat-card__label">Loading...</div>
              <div className="stat-card__value">--</div>
            </div>
          ))}
        </div>
        <div className="statistics-panel__tabs" role="tablist">
          {periods.map((p) => (
            <TabButton
              key={p}
              isActive={period === p}
              onClick={() => handlePeriodChange(p)}
              role="tab"
              aria-selected={period === p}
            >
              {p}
            </TabButton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-panel" role="region" aria-label="Glucose statistics">
      <div className="statistics-panel__cards">
        <StatCard
          label="Avg"
          value={stats.avg.toFixed(1)}
          unit={unit}
          subtext={`SD: ${stats.sd.toFixed(1)}`}
        />
        <StatCard
          label="Min"
          value={stats.min.toFixed(1)}
          unit={unit}
          subtext={formatDateTime(stats.minDate)}
        />
        <StatCard
          label="Max"
          value={stats.max.toFixed(1)}
          unit={unit}
          subtext={formatDateTime(stats.maxDate)}
        />
        <StatCard label="TIR" value={`${stats.tir.toFixed(0)}%`} subtext="Time in Range" />
      </div>
      <div className="statistics-panel__tabs" role="tablist">
        {periods.map((p) => (
          <TabButton
            key={p}
            isActive={period === p}
            onClick={() => handlePeriodChange(p)}
            role="tab"
            aria-selected={period === p}
          >
            {p}
          </TabButton>
        ))}
      </div>
    </div>
  );
}

function calculateStatistics(
  data: TransformedGraphDataPoint[],
  period: StatisticsPeriod,
  targetLow: number,
  targetHigh: number
): Stats {
  if (!data || data.length === 0) {
    return { avg: 0, min: 0, max: 0, sd: 0, tir: 0 };
  }

  // Filter data by period
  const now = Date.now();
  const hours = period === '12h' ? 12 : period === '7d' ? 168 : 336;
  const cutoffTime = now - hours * 60 * 60 * 1000;
  const filteredData = data.filter((d) => d.time.getTime() > cutoffTime);

  if (filteredData.length === 0) {
    return { avg: 0, min: 0, max: 0, sd: 0, tir: 0 };
  }

  const values = filteredData.map((d) => d.value);

  // Calculate average
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Find min and max with dates
  let min = values[0];
  let max = values[0];
  let minDate = filteredData[0].time;
  let maxDate = filteredData[0].time;

  for (let i = 1; i < values.length; i++) {
    if (values[i] < min) {
      min = values[i];
      minDate = filteredData[i].time;
    }
    if (values[i] > max) {
      max = values[i];
      maxDate = filteredData[i].time;
    }
  }

  // Calculate standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const sd = Math.sqrt(variance);

  // Calculate time in range
  const inRange = values.filter((v) => v >= targetLow && v <= targetHigh).length;
  const tir = (inRange / values.length) * 100;

  return { avg, min, max, sd, tir, minDate, maxDate };
}

export default StatisticsPanel;
