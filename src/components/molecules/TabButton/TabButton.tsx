import { memo, ButtonHTMLAttributes } from 'react';
import './TabButton.css';

export interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  children: React.ReactNode;
}

/**
 * Molecule TabButton component
 * Button for tab navigation with active state styling
 */
const TabButton = memo(function TabButton({
  isActive = false,
  className = '',
  children,
  disabled,
  ...props
}: TabButtonProps) {
  const classNames = [
    'tab-button',
    isActive && 'tab-button--active',
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

export default TabButton;