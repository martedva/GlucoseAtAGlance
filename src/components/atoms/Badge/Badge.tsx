import { memo } from 'react';
import './Badge.css';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/**
 * Atomic Badge component
 * Displays status labels with color coding
 */
const Badge = memo(function Badge({ variant, children, className = '' }: BadgeProps) {
  const classNames = ['badge', `badge--${variant}`, className].filter(Boolean).join(' ');
  return <span className={classNames}>{children}</span>;
});

export default Badge;