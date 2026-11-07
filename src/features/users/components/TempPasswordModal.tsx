import { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import type { ResetPasswordResult } from '../types';

export function TempPasswordModal({
  result,
  onClose,
}: {
  result: ResetPasswordResult;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.newPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      title="Contraseña temporal"
      subtitle={`Nueva contraseña para ${result.email}. Solo se muestra esta vez.`}
      onClose={onClose}
    >
      <div className="items-center gap-2 flex">
        <input
          className="field mt-0 font-mono"
          readOnly
          aria-label="Contraseña generada"
          value={result.newPassword}
          onFocus={(event) => event.target.select()}
        />
        <button type="button" className="small-button self-stretch shrink-0 px-3.5" onClick={copy}>
          {copied ? 'Copiada' : 'Copiar'}
        </button>
      </div>
      <div className="justify-end flex mt-6">
        <button type="button" className="primary-button" onClick={onClose}>
          Listo
        </button>
      </div>
    </Modal>
  );
}
