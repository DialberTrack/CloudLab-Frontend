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
            <p className="text-sm leading-6 text-slate-400">{message}</p>
            <div className="mt-7 flex justify-end gap-3">
                <button className="ghost-button" onClick={onClose}>
                    Cancelar
                </button>
                <button
                    className={danger ? 'danger-button' : 'primary-button'}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
