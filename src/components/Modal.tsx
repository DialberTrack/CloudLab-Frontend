import type { ReactNode } from 'react';

export function Modal({
    title,
    subtitle,
    children,
    onClose,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="mb-6 flex justify-between gap-4">
                    <div>
                        <h2 className="section-title">{title}</h2>
                        {subtitle && <p className="section-subtitle">{subtitle}</p>}
                    </div>
                    <button className="icon-button" onClick={onClose} aria-label="Cerrar">
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
