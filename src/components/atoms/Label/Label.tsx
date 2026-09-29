import { memo, LabelHTMLAttributes } from 'react';
import styles from './Label.module.scss';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  inline?: boolean;
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
    styles.label,
    inline && styles['label--inline'],
    required && styles['label--required'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classNames} {...props}>
      {children}
    </label>
  );
});

export default Label;