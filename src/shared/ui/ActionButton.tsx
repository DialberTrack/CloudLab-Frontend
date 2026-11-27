import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/shared/lib/cx';
import { Spinner } from './Spinner';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  /** Texto mientras `loading` (por defecto, el mismo contenido). */
  loadingLabel?: ReactNode;
};

/** Botón que muestra un spinner y un texto de progreso mientras `loading`. */
export function ActionButton({
  loading = false,
  loadingLabel,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: ActionButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(className, loading && 'gap-1.5')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <Spinner />}
      {loading ? (loadingLabel ?? children) : children}
    </button>
  );
}
