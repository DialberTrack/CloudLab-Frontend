import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';

type ModalProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, subtitle, children, onClose }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-header">
          <div>
            <h2 id={titleId} className="section-title">
              {title}
            </h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
