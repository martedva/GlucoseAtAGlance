import { memo, useState, useMemo } from 'react';
import { StatCard, TabButton } from '@/components/molecules';
import { calculateGlucoseStats, filterDataByPeriod, getTirBadge } from '@/utils/glucose-stats';
import type { GlucoseStats } from '@/utils/glucose-stats';
import styles from './StatisticsPanel.module.scss';

interface GraphDataPoint {
  time: Date;
  value: number;
}

export interface StatisticsPanelProps {
  graphData: GraphDataPoint[];
  logbookData: GraphDataPoint[];
  targetLow?: number;
  targetHigh?: number;
  uom?: number;
  isLoading?: boolean;
}

type TabType = '12h' | '7d' | '14d';

/**
 * Organism StatisticsPanel component
 * Tabbed statistics panel showing Time in Range, Average, Min, Max glucose
 */
const StatisticsPanel = memo(function StatisticsPanel({
  graphData,
  logbookData,
  targetLow = 70,
  targetHigh = 180,
  uom = 1,
  isLoading = false,
}: StatisticsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('12h');

  const stats12h = useMemo(() => {
    if (!graphData || graphData.length < 3) return null;
    return calculateGlucoseStats(graphData, targetLow, targetHigh, 'Last 12 Hours', uom);
  }, [graphData, targetLow, targetHigh, uom]);

  const stats7d = useMemo(() => {
    if (!logbookData || logbookData.length < 3) return null;
    const filtered = filterDataByPeriod(logbookData, 7 * 24);
    if (filtered.length < 3) return null;
    return calculateGlucoseStats(filtered, targetLow, targetHigh, 'Last 7 Days', uom);
  }, [logbookData, targetLow, targetHigh, uom]);

  const stats14d = useMemo(() => {
    if (!logbookData || logbookData.length < 3) return null;
    const filtered = filterDataByPeriod(logbookData, 14 * 24);
    if (filtered.length < 3) return null;
    return calculateGlucoseStats(filtered, targetLow, targetHigh, 'Last 14 Days', uom);
  }, [logbookData, targetLow, targetHigh, uom]);

  const activeStats: GlucoseStats | null = useMemo(() => {
    switch (activeTab) {
      case '12h':
        return stats12h;
      case '7d':
        return stats7d;
      case '14d':
        return stats14d;
      default:
        return stats12h;
    }
  }, [activeTab, stats12h, stats7d, stats14d]);

  const tabs: Array<{ id: TabType; label: string; available: boolean }> = [
    { id: '12h', label: '12 Hours', available: !!stats12h },
    { id: '7d', label: '7 Days', available: !!stats7d },
    { id: '14d', label: '14 Days', available: !!stats14d },
  ];

  const tirBadge = activeStats ? getTirBadge(activeStats.timeInRange) : null;

  if (isLoading) {
    return (
      <div className={styles.statisticsPanel} role="status" aria-label="Loading statistics">
        <div className={styles.statisticsPanel__tabs}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                minWidth: '80px',
                height: '32px',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className={styles.statisticsPanel__cards}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                height: '80px',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!activeStats) {
    return null;
  }

  return (
    <div className={styles.statisticsPanel} role="region" aria-label="Glucose statistics">
      <div className={styles.statisticsPanel__tabs} role="tablist" aria-label="Statistics time period">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => tab.available && setActiveTab(tab.id)}
            disabled={!tab.available}
            aria-selected={activeTab === tab.id}
            aria-label={`${tab.label} statistics`}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      <div className={styles.statisticsPanel__cards} role="tabpanel" aria-label={`${activeStats.periodLabel} statistics`}>
        <StatCard
          label="Time in Range"
          value={`${activeStats.timeInRange.toFixed(0)}%`}
          subtext={tirBadge?.label}
        />
        <StatCard
          label="Average"
          value={activeStats.averageGlucose.toFixed(1)}
          unit="mmol/L"
        />
        <StatCard
          label="Min"
          value={activeStats.minGlucose.toFixed(1)}
          unit="mmol/L"
        />
        <StatCard
          label="Max"
          value={activeStats.maxGlucose.toFixed(1)}
          unit="mmol/L"
        />
      </div>

      <p className={styles.statisticsPanel__readingCount} aria-label={`Based on ${activeStats.readingsCount} readings`}>
        Based on {activeStats.readingsCount} readings
      </p>
    </div>
  );
});

export default StatisticsPanel;