import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatisticsPanel from '@/components/organisms/StatisticsPanel/StatisticsPanel';

const mockGraphData = [
  { time: new Date(Date.now() - 1000 * 60 * 15), value: 6.0 },
  { time: new Date(Date.now() - 1000 * 60 * 30), value: 7.5 },
  { time: new Date(Date.now() - 1000 * 60 * 45), value: 8.2 },
  { time: new Date(Date.now() - 1000 * 60 * 60), value: 5.5 },
  { time: new Date(Date.now() - 1000 * 60 * 75), value: 12.0 },
];

describe('StatisticsPanel', () => {
  it('renders loading state when isLoading', () => {
    render(
      <StatisticsPanel
        graphData={[]}
        isLoading={true}
        uom={0}
      />
    );
    // Loading state shows 4 stat cards with "Loading..." labels
    const loadingLabels = screen.getAllByText('Loading...');
    expect(loadingLabels.length).toBe(4);
  });

  it('displays statistics for 12 hours with mmol/L', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        targetLow={4.0}
        targetHigh={10.0}
        uom={0}
      />
    );
    expect(screen.getByText('Time in Range')).toBeInTheDocument();
    // Multiple stat cards have the unit, so use getAllByText
    const mmolUnits = screen.getAllByText('mmol/L');
    expect(mmolUnits.length).toBeGreaterThanOrEqual(1);
  });

  it('displays statistics with mg/dL when uom is 1', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        targetLow={70}
        targetHigh={180}
        uom={1}
      />
    );
    const mgdlUnits = screen.getAllByText('mg/dL');
    expect(mgdlUnits.length).toBeGreaterThanOrEqual(1);
  });

  it('switches tabs when clicked', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        targetLow={4.0}
        targetHigh={10.0}
        uom={0}
      />
    );

    const sevenDaysTab = screen.getByRole('tab', { name: '7d' });
    fireEvent.click(sevenDaysTab);

    expect(sevenDaysTab).toHaveAttribute('aria-selected', 'true');
  });

  it('displays TIR percentage', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        targetLow={4.0}
        targetHigh={10.0}
        uom={0}
      />
    );

    // TIR should be displayed as a percentage
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it('shows average value', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        targetLow={4.0}
        targetHigh={10.0}
        uom={0}
      />
    );

    // Average should be displayed
    expect(screen.getByText('Avg')).toBeInTheDocument();
  });

  it('shows min and max values', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        targetLow={4.0}
        targetHigh={10.0}
        uom={0}
      />
    );

    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('uses default target values when not provided', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        uom={0}
      />
    );

    expect(screen.getByText('Time in Range')).toBeInTheDocument();
  });
});