import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GlucoseDisplay from '@/components/organisms/GlucoseDisplay/GlucoseDisplay';

describe('GlucoseDisplay', () => {
  const defaultProps = {
    daysToExpire: 7,
    sensorStatus: 'normal' as const,
    graphData: [],
    uom: 0, // mmol/L
  };

  const mockGraphData = [
    { time: new Date(Date.now() - 30 * 60 * 1000), value: 5.0 },
    { time: new Date(Date.now() - 15 * 60 * 1000), value: 5.5 },
    { time: new Date(), value: 6.0 },
  ];

  it('should render glucose value with unit', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={5.5} graphData={mockGraphData} />);

    expect(screen.getByText('5.5')).toBeInTheDocument();
    expect(screen.getByText('mmol/L')).toBeInTheDocument();
  });

  it('should render mg/dL unit when uom is 1', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={100} graphData={mockGraphData} uom={1} />);

    expect(screen.getByText('mg/dL')).toBeInTheDocument();
  });

  it('should render nothing when glucose is undefined', () => {
    const { container } = render(<GlucoseDisplay {...defaultProps} glucose={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render sensor expiry message for warning status', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={5.5} daysToExpire={5} sensorStatus="warning" graphData={mockGraphData} />);

    expect(screen.getByText(/Expires in 5d/)).toBeInTheDocument();
  });

  it('should render critical sensor expiry message', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={5.5} daysToExpire={1} sensorStatus="critical" graphData={mockGraphData} />);

    expect(screen.getByText(/⚠️ Expires in 1d/)).toBeInTheDocument();
  });

  it('should not render expiry message when daysToExpire is null', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={5.5} daysToExpire={null} sensorStatus="unknown" graphData={mockGraphData} />);

    expect(screen.queryByText(/Expires in/)).not.toBeInTheDocument();
  });

  it('should show trend arrow when currentTrendArrow is provided', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={6.0} currentTrendArrow={4} graphData={mockGraphData} />);

    // Should show trend arrow (↑ for rising)
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('should show delta when there is a change', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={6.0} graphData={mockGraphData} />);

    expect(screen.getByText('+1 mmol/L/5min')).toBeInTheDocument();
  });

  it('should show time', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={6.0} graphData={mockGraphData} />);

    // Time should be displayed
    expect(screen.getByText(/Live data/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<GlucoseDisplay {...defaultProps} glucose={6.0} graphData={mockGraphData} />);

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('aria-label', 'Current glucose reading');
  });
});