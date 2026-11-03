import { Modal } from './Modal';

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onClose,
  danger = false,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="ghost-button" onClick={onClose}>
          Cancelar
        </button>
        <button className={danger ? 'danger-button' : 'primary-button'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
