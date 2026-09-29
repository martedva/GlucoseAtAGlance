import { render, screen, fireEvent } from '@testing-library/react';
import StatisticsPanel from '../StatisticsPanel';

const mockGraphData = [
  { time: new Date(Date.now() - 1000 * 60 * 15), value: 6.0 },
  { time: new Date(Date.now() - 1000 * 60 * 30), value: 7.5 },
  { time: new Date(Date.now() - 1000 * 60 * 45), value: 8.2 },
  { time: new Date(Date.now() - 1000 * 60 * 60), value: 5.5 },
  { time: new Date(Date.now() - 1000 * 60 * 75), value: 12.0 },
];

const mockLogbookData = mockGraphData.concat(
  Array.from({ length: 50 }, (_, i) => ({
    time: new Date(Date.now() - 1000 * 60 * 60 * (i + 2)),
    value: 6.0 + Math.random() * 4,
  }))
);

describe('StatisticsPanel', () => {
  it('renders loading skeleton when isLoading', () => {
    render(
      <StatisticsPanel
        graphData={[]}
        logbookData={[]}
        isLoading={true}
      />
    );
    expect(screen.getByLabelText('Loading statistics')).toBeInTheDocument();
  });

  it('hides panel when insufficient data', () => {
    const { container } = render(
      <StatisticsPanel
        graphData={[]}
        logbookData={[]}
        isLoading={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays statistics for 12 hours', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={mockLogbookData}
        targetLow={70}
        targetHigh={180}
      />
    );
    expect(screen.getByText('Time in Range')).toBeInTheDocument();
    expect(screen.getByText(/mmol\/L/)).toBeInTheDocument();
    expect(screen.getByText(/Based on \d+ readings/)).toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={mockLogbookData}
        targetLow={70}
        targetHigh={180}
      />
    );

    const sevenDaysTab = screen.getByRole('tab', { name: '7 Days statistics' });
    fireEvent.click(sevenDaysTab);

    expect(sevenDaysTab).toHaveAttribute('aria-selected', 'true');
  });

  it('disables tab when data not available', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={[]}
        targetLow={70}
        targetHigh={180}
      />
    );

    const sevenDaysTab = screen.getByRole('tab', { name: '7 Days statistics' });
    expect(sevenDaysTab).toBeDisabled();
  });

  it('displays TIR badge with correct label', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={mockLogbookData}
        targetLow={70}
        targetHigh={180}
      />
    );

    // TIR should be 80% (4 out of 5 in range), which is "Excellent"
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('shows correct average value', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={mockLogbookData}
        targetLow={70}
        targetHigh={180}
      />
    );

    // Average should be approximately 7.8 mmol/L
    expect(screen.getByText('7.8 mmol/L')).toBeInTheDocument();
  });

  it('shows min and max values', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={mockLogbookData}
        targetLow={70}
        targetHigh={180}
      />
    );

    expect(screen.getByText('5.5 mmol/L')).toBeInTheDocument(); // Min
    expect(screen.getByText('12.0 mmol/L')).toBeInTheDocument(); // Max
  });

  it('uses default target values when not provided', () => {
    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={mockLogbookData}
      />
    );

    expect(screen.getByText('Time in Range')).toBeInTheDocument();
  });

  it('hides 7-day and 14-day tabs when logbook data is insufficient', () => {
    const insufficientLogbookData = [
      { time: new Date(Date.now() - 1000 * 60 * 60), value: 7.0 },
      { time: new Date(Date.now() - 1000 * 60 * 120), value: 8.0 },
    ];

    render(
      <StatisticsPanel
        graphData={mockGraphData}
        logbookData={insufficientLogbookData}
        targetLow={70}
        targetHigh={180}
      />
    );

    const sevenDaysTab = screen.getByRole('tab', { name: '7 Days statistics' });
    const fourteenDaysTab = screen.getByRole('tab', { name: '14 Days statistics' });

    expect(sevenDaysTab).toBeDisabled();
    expect(fourteenDaysTab).toBeDisabled();
  });
});