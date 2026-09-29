import { memo } from 'react';
import styles from './Icon.module.scss';

export type IconSize = 'small' | 'medium' | 'large';
export type IconVariant = 
  | 'trend-up'
  | 'trend-down'
  | 'trend-stable'
  | 'status-success'
  | 'status-warning'
  | 'status-error'
  | 'default';

export interface IconProps {
  children: React.ReactNode;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  'aria-label'?: string;
  title?: string;
}

/**
 * Atomic Icon component
 * Displays icons with semantic color coding
 */
const Icon = memo(function Icon({
  children,
  size = 'medium',
  variant = 'default',
  className = '',
  ...props
}: IconProps) {
  const classNames = [
    styles.icon,
    styles[`icon--${size}`],
    variant !== 'default' && styles[`icon--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
});

export default Icon;