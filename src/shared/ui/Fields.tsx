import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '@/shared/lib/cx';

type FieldProps<T extends 'input' | 'select' | 'textarea'> = ComponentPropsWithoutRef<T> & {
  label: string;
};

export function TextField({ label, className, ...props }: FieldProps<'input'>) {
  return (
    <label className="field-label">
      {label}
      <input className={cx('field', className)} {...props} />
    </label>
  );
}

export function TextAreaField({ label, className, ...props }: FieldProps<'textarea'>) {
  return (
    <label className="field-label">
      {label}
      <textarea className={cx('field', className)} {...props} />
    </label>
  );
}

export function SelectField({ label, className, children, ...props }: FieldProps<'select'>) {
  return (
    <label className="field-label">
      {label}
      <select className={cx('field', className)} {...props}>
        {children}
      </select>
    </label>
  );
}

export function CheckboxField({ label, ...props }: Omit<FieldProps<'input'>, 'type'>) {
  return (
    <label className="checkbox-field">
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}
