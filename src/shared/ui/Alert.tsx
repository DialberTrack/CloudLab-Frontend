import { cx } from '@/shared/lib/cx';

type AlertProps = {
  message: string;
  onClose?: () => void;
  className?: string;
};

export function Alert({ message, onClose, className }: AlertProps) {
  return (
    <div className={cx('alert', className)} role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar alerta">
          ×
        </button>
      )}
    </div>
  );
}
