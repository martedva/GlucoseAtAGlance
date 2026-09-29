import { memo, LabelHTMLAttributes } from 'react';
import './Label.css';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  inline?: boolean;
  className?: string;
}

/**
 * Atomic Label component
 * Reusable label with optional required indicator
 */
const Label = memo(function Label({
  children,
  required,
  inline,
  className = '',
  ...props
}: LabelProps) {
  const classNames = [
    'label',
    inline && 'label--inline',
    required && 'label--required',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label className={classNames} {...props}>
      {children}
    </label>
  );
});

export default Label;