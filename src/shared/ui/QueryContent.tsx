import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { messageOf } from '@/shared/api/errors';
import { Alert } from './Alert';
import { Loading } from './Loading';

type QueryContentProps<T> = {
  query: UseQueryResult<T>;
  loadingLabel?: string;
  /** Si devuelve `true` y hay `empty`, se muestra éste en lugar del contenido. */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
};

/** Resuelve los estados cargando / error / vacío / éxito de una consulta. */
export function QueryContent<T>({
  query,
  loadingLabel,
  isEmpty,
  empty,
  children,
}: QueryContentProps<T>) {
  if (query.isPending) return <Loading label={loadingLabel} />;

  if (query.isError) {
    return (
      <div className="space-y-3">
        <Alert message={messageOf(query.error)} />
        <button type="button" className="ghost-button" onClick={() => void query.refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (empty && isEmpty?.(query.data)) return <>{empty}</>;

  return (
    <div className={query.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
      {children(query.data)}
    </div>
  );
}
