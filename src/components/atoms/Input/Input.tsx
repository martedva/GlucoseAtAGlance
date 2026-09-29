import { memo, InputHTMLAttributes } from 'react';
import styles from './Input.module.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  error?: string;
  wrapperClassName?: string;
}

/**
 * Atomic Input component
 * Reusable input field with optional label, help text, and error states
 */
const Input = memo(function Input({
  label,
  helpText,
  error,
  wrapperClassName = '',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;
  const classNames = [
    styles.input,
    error && styles['input--error'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles['input-wrapper']} ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className={styles['input-label']}>
          {label}
        </label>
      )}
      <input id={inputId} className={classNames} {...props} />
      {helpText && !error && (
        <p className={styles['input-help']}>{helpText}</p>
      )}
      {error && (
        <p className={styles['input-error']} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;