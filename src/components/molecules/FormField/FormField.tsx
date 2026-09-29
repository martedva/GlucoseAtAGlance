import { memo, ReactNode } from 'react';
import styles from './FormField.module.scss';

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
    <div className={styles.formField}>
      <label htmlFor={id} className={styles.formField__label}>
        {label}
      </label>
      {children}
      {helpText && <p className={styles.formField__help}>{helpText}</p>}
    </div>
  );
});

export default FormField;