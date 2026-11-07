import type { Pagination as PaginationData } from '@/shared/api/types';

type PaginationProps = {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
};

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Paginación">
      <p className="pagination-summary">
        Página {page} de {totalPages} · {total} resultados
      </p>
      <div className="pagination-actions">
        <button
          type="button"
          className="small-button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Anterior
        </button>
        <button
          type="button"
          className="small-button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente →
        </button>
      </div>
    </nav>
  );
}
