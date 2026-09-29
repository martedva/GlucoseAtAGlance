import { memo, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

/**
 * Atomic Button component
 * Reusable button with variants and sizes
 */
const Button = memo(function Button({
  variant = 'default',
  size = 'medium',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    variant !== 'default' && styles[`button--${variant}`],
    size === 'small' && styles['button--small'],
    size === 'icon' && styles['button--icon'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;