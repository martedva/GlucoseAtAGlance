import { memo, ButtonHTMLAttributes } from 'react';
import './Button.css';

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
    'btn',
    `btn--${variant}`,
    size === 'small' && 'btn--small',
    size === 'icon' && 'btn--icon',
    className,
  ].filter(Boolean).join(' ');

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