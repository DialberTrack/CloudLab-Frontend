import { useSearchParams } from 'react-router-dom';
import type { ListParams } from '@/shared/api/types';

const toPage = (value: string | null) => {
  const page = Number.parseInt(value ?? '', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

/**
 * Página y búsqueda de un listado sincronizadas con la URL (`?page=2&q=foo`),
 * de modo que el estado sobrevive a recargas y al botón "atrás".
 */
export function useListParams(limit: number) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = toPage(searchParams.get('page'));
  const q = searchParams.get('q') ?? '';

  const update = (change: (next: URLSearchParams) => void) =>
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      change(next);
      return next;
    });

  const params: ListParams = { page, limit, q: q || undefined };

  return {
    params,
    page,
    q,
    setPage: (value: number) =>
      update((next) => (value <= 1 ? next.delete('page') : next.set('page', String(value)))),
    setQuery: (value: string) =>
      update((next) => {
        next.delete('page');
        if (value) next.set('q', value);
        else next.delete('q');
      }),
  };
}
