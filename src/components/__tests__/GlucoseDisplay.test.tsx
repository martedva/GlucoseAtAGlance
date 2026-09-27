import { render, screen } from '@testing-library/react';
import GlucoseDisplay from '../GlucoseDisplay';

describe('GlucoseDisplay', () => {
  const defaultProps = {
    daysToExpire: 7,
    sensorStatus: 'normal' as const,
    graphData: [],
  };

  const mockGraphData = [
    { time: new Date(Date.now() - 30 * 60 * 1000), value: 5.0 },
    { time: new Date(Date.now() - 15 * 60 * 1000), value: 5.5 },
    { time: new Date(), value: 6.0 },
  ];

  it('should render glucose value with one decimal place', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={5.5} />);

    expect(screen.getByText('5.5 mmol/L')).toBeInTheDocument();
  });

  it('should render placeholder when glucose is undefined', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={undefined} />);

    expect(screen.getByText('-- mmol/L')).toBeInTheDocument();
  });

  it('should render sensor expiry message', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={5.5} />);

    expect(screen.getByText('Sensor ends in 7 days')).toBeInTheDocument();
  });

  it('should use singular "day" when daysToExpire is 1', () => {
    render(<GlucoseDisplay {...defaultProps} daysToExpire={1} sensorStatus="normal" />);

    expect(screen.getByText('Sensor ends in 1 day')).toBeInTheDocument();
  });

  it('should not render expiry message when daysToExpire is null', () => {
    render(<GlucoseDisplay {...defaultProps} daysToExpire={null} sensorStatus="unknown" />);

    expect(screen.queryByText(/Sensor ends in/)).not.toBeInTheDocument();
  });

  it('should apply critical styling for critical status', () => {
    const { container } = render(
      <GlucoseDisplay {...defaultProps} daysToExpire={1} sensorStatus="critical" />
    );

    const expiryText = container.querySelector('.sensor-expiry.critical');
    expect(expiryText).toBeInTheDocument();
    expect(expiryText).toHaveStyle('color: #d32f2f');
    expect(expiryText).toHaveStyle('font-weight: 500');
  });

  it('should apply warning styling for warning status', () => {
    const { container } = render(
      <GlucoseDisplay {...defaultProps} daysToExpire={2} sensorStatus="warning" />
    );

    const expiryText = container.querySelector('.sensor-expiry.warning');
    expect(expiryText).toBeInTheDocument();
    expect(expiryText).toHaveStyle('color: #f57c00');
    expect(expiryText).toHaveStyle('font-weight: 500');
  });

  it('should apply normal styling for normal status', () => {
    const { container } = render(
      <GlucoseDisplay {...defaultProps} daysToExpire={7} sensorStatus="normal" />
    );

    const expiryText = container.querySelector('.sensor-expiry.normal');
    expect(expiryText).toBeInTheDocument();
    expect(expiryText).toHaveStyle('color: #666');
    expect(expiryText).toHaveStyle('font-weight: 400');
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<GlucoseDisplay {...defaultProps} glucose={5.5} />);

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('aria-label', 'Glucose monitoring display');

    const heading = screen.getByRole('heading');
    expect(heading).toHaveAttribute('aria-live', 'polite');
    expect(heading).toHaveAttribute('aria-atomic', 'true');
  });

  it('should show trend prediction with predicted glucose value', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={6.0} graphData={mockGraphData} />);

    // Should show predicted glucose value in 15 min
    expect(screen.getByText(/mmol\/L in 15 min/)).toBeInTheDocument();
  });

  it('should show trend direction (rising/falling/stable)', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={6.0} graphData={mockGraphData} />);

    expect(screen.queryByText(/rising|falling|stable/)).toBeInTheDocument();
  });

  it('should not show trend when no graph data', () => {
    render(<GlucoseDisplay {...defaultProps} glucose={6.0} graphData={[]} />);

    expect(screen.queryByText(/mmol\/L in 15 min/)).not.toBeInTheDocument();
  });
});
