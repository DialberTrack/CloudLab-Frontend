import type { ReactNode } from 'react';

type EmptyStateProps = {
  text: string;
  /** Acción opcional (un `Link` o `button` ya estilizado). */
  action?: ReactNode;
};

export function EmptyState({ text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state-text">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
