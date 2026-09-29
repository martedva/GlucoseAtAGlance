import { useMemo, useState } from 'react';
import { calculateGlucoseStats, filterDataByPeriod, getTirBadge } from '@/utils/glucose-stats';
import type { GlucoseStats } from '@/utils/glucose-stats';

interface GraphDataPoint {
  time: Date;
  value: number;
}

interface StatisticsPanelProps {
  graphData: GraphDataPoint[];      // 12-hour data from graph endpoint
  logbookData: GraphDataPoint[];    // 14-day data from logbook endpoint
  targetLow?: number;               // in user's preferred unit
  targetHigh?: number;              // in user's preferred unit
  uom?: number;                     // 1 = mmol/L, 2 = mg/dL
  isLoading?: boolean;
}

type TabType = '12h' | '7d' | '14d';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
}

const StatCard = ({ label, value, unit, subtext }: StatCardProps) => (
  <div
    style={{
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      minWidth: 0,
      boxSizing: 'border-box',
    }}
    role="article"
    aria-label={`${label}: ${value}${unit || ''}`}
  >
    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '4px', whiteSpace: 'nowrap' }}>
      {label}
    </div>
    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', wordBreak: 'break-word' }}>
      {value}
      {unit && <span style={{ fontSize: '14px', color: '#666', marginLeft: '2px' }}>{unit}</span>}
    </div>
    {subtext && (
      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', whiteSpace: 'nowrap' }}>{subtext}</div>
    )}
  </div>
);

const StatisticsPanel = ({
  graphData,
  logbookData,
  targetLow = 70,
  targetHigh = 180,
  uom = 1,
  isLoading = false,
}: StatisticsPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('12h');

  // Calculate stats for each period
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

  // Get active stats based on selected tab
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

  // Hide panel if no data for active tab
  if (!isLoading && !activeStats) {
    return null;
  }

  const tabs: Array<{ id: TabType; label: string; available: boolean }> = [
    { id: '12h', label: '12 Hours', available: !!stats12h },
    { id: '7d', label: '7 Days', available: !!stats7d },
    { id: '14d', label: '14 Days', available: !!stats14d },
  ];

  const tirBadge = activeStats ? getTirBadge(activeStats.timeInRange) : null;

  if (isLoading) {
    return (
      <div style={{ marginTop: '16px', width: '100%', boxSizing: 'border-box' }} role="status" aria-label="Loading statistics">
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                minWidth: '80px',
                height: '32px',
                boxSizing: 'border-box',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '12px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                height: '80px',
                boxSizing: 'border-box',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px', width: '100%', boxSizing: 'border-box' }} role="region" aria-label="Glucose statistics">
      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px',
        }}
        role="tablist"
        aria-label="Statistics time period"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => tab.available && setActiveTab(tab.id)}
            disabled={!tab.available}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab.id ? '#007bff' : '#f0f0f0',
              color: activeTab === tab.id ? '#ffffff' : tab.available ? '#333' : '#999',
              border: 'none',
              borderRadius: '4px',
              cursor: tab.available ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              opacity: tab.available ? 1 : 0.5,
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
            }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-label={`${tab.label} statistics`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      {activeStats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '12px',
            width: '100%',
            boxSizing: 'border-box',
          }}
          role="tabpanel"
          aria-label={`${activeStats.periodLabel} statistics`}
        >
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
      )}

      {/* Reading count disclaimer */}
      {activeStats && (
        <p
          style={{
            fontSize: '11px',
            color: '#999',
            marginTop: '8px',
            textAlign: 'center',
          }}
          aria-label={`Based on ${activeStats.readingsCount} readings`}
        >
          Based on {activeStats.readingsCount} readings
        </p>
      )}
    </div>
  );
};

export default StatisticsPanel;