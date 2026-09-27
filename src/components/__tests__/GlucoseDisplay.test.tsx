import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlucoseDisplay from '../GlucoseDisplay';

describe('GlucoseDisplay', () => {
  const defaultProps = {
    daysToExpire: 7,
    sensorStatus: 'normal' as const,
    onRefresh: jest.fn(),
    onLogout: jest.fn(),
  };

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

  it('should call onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const onRefresh = jest.fn();

    render(<GlucoseDisplay {...defaultProps} onRefresh={onRefresh} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh glucose data' });
    await user.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should call onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    render(<GlucoseDisplay {...defaultProps} onLogout={onLogout} />);

    const logoutButton = screen.getByRole('button', { name: 'Log out of account' });
    await user.click(logoutButton);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('should have button type="button" for accessibility', () => {
    render(<GlucoseDisplay {...defaultProps} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh glucose data' });
    const logoutButton = screen.getByRole('button', { name: 'Log out of account' });

    expect(refreshButton).toHaveAttribute('type', 'button');
    expect(logoutButton).toHaveAttribute('type', 'button');
  });
});