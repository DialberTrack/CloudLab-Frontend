import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

type PendingConfirm = { options: ConfirmOptions; resolve: (accepted: boolean) => void };

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Provee `useConfirm()`: un `await confirm(...)` que reemplaza a `window.confirm`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setPending((previous) => {
          previous?.resolve(false);
          return { options, resolve };
        });
      }),
    []
  );

  const settle = (accepted: boolean) => {
    pending?.resolve(accepted);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <ConfirmDialog
          {...pending.options}
          onConfirm={() => settle(true)}
          onClose={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  }
  return context;
};
