import { memo, ReactNode } from 'react';
import './FormField.css';

export interface FormFieldProps {
  label: string;
  helpText?: string;
  children: ReactNode;
  id?: string;
}

/**
 * Molecule FormField component
 * Wraps form inputs with label and optional help text
 */
const FormField = memo(function FormField({ label, helpText, children, id }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      {children}
      {helpText && <p className="form-field__help">{helpText}</p>}
    </div>
  );
});

export default FormField;