import { memo } from 'react';
import styles from './AlertBanner.module.scss';

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
    styles.alertBanner,
    styles[`alert-banner--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="status" aria-live="polite" aria-atomic="true">
      {icon && <span className={styles.alertBanner__icon}>{icon}</span>}
      <div className={styles.alertBanner__content}>
        <span className={styles.alertBanner__text}>{text}</span>
        {subtext && <span className={styles.alertBanner__subtext}>{subtext}</span>}
      </div>
    </div>
  );
});

export default AlertBanner;