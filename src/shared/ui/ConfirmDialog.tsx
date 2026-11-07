import { Modal } from './Modal';

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button type="button" className="ghost-button" onClick={onClose} autoFocus={danger}>
          Cancelar
        </button>
        <button
          type="button"
          className={danger ? 'danger-button' : 'primary-button'}
          onClick={onConfirm}
          autoFocus={!danger}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
