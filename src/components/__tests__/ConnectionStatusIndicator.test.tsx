import { render, screen } from '@testing-library/react';
import ConnectionStatusIndicator from '../ConnectionStatusIndicator';

describe('ConnectionStatusIndicator', () => {
  it('should show online status with green styling', () => {
    const lastFetch = new Date('2024-01-01T10:00:00');
    render(
      <ConnectionStatusIndicator status="online" lastSuccessfulFetch={lastFetch} />
    );

    expect(screen.getByText('Live data')).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should show offline status with red styling', () => {
    render(
      <ConnectionStatusIndicator status="offline" lastSuccessfulFetch={null} />
    );

    expect(screen.getByText('No connection')).toBeInTheDocument();
    expect(screen.getByText('Unable to fetch latest data')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('should show stale status with warning styling', () => {
    const lastFetch = new Date('2024-01-01T08:00:00');
    render(
      <ConnectionStatusIndicator status="stale" lastSuccessfulFetch={lastFetch} />
    );

    expect(screen.getByText('Data may be outdated')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should show "Just now" when online with no last fetch time', () => {
    render(
      <ConnectionStatusIndicator status="online" lastSuccessfulFetch={null} />
    );

    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const lastFetch = new Date('2024-01-01T10:00:00');
    const { container } = render(
      <ConnectionStatusIndicator status="online" lastSuccessfulFetch={lastFetch} />
    );

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
    expect(statusElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('should format last fetch time correctly', () => {
    const lastFetch = new Date('2024-01-01T10:30:00');
    render(
      <ConnectionStatusIndicator status="stale" lastSuccessfulFetch={lastFetch} />
    );

    // Should show the time in local format
    expect(screen.getByText(/Last updated:.*10:30/)).toBeInTheDocument();
  });
});