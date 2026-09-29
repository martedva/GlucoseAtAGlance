import { memo } from 'react';
import './AlertBanner.css';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface AlertBannerProps {
  variant: AlertVariant;
  icon?: string;
  text: string;
  subtext?: string;
  className?: string;
}

/**
 * Molecule AlertBanner component
 * Displays status alerts with icon, text, and optional subtext
 */
const AlertBanner = memo(function AlertBanner({
  variant,
  icon,
  text,
  subtext,
  className = '',
}: AlertBannerProps) {
  const classNames = [
    'alert-banner',
    `alert-banner--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="status" aria-live="polite" aria-atomic="true">
      {icon && <span className="alert-banner__icon">{icon}</span>}
      <div className="alert-banner__content">
        <span className="alert-banner__text">{text}</span>
        {subtext && <span className="alert-banner__subtext">{subtext}</span>}
      </div>
    </div>
  );
});

export default AlertBanner;