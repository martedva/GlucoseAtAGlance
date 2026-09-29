import { memo, InputHTMLAttributes } from 'react';
import './Input.css';

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
  const inputId = id || (props.name as string);
  const classNames = ['input', error && 'input--error', className].filter(Boolean).join(' ');

  return (
    <div className={`input-wrapper ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input id={inputId} className={classNames} {...props} />
      {helpText && !error && (
        <p className="input-help">{helpText}</p>
      )}
      {error && (
        <p className="input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;