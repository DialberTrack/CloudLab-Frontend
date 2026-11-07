/** Sobre estándar de la API: `{ data }`. */
export type ApiEnvelope<T> = { data: T };

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Respuesta de listados paginados: `{ data: [...], pagination }`. */
export type ApiPage<T> = ApiEnvelope<T[]> & { pagination: Pagination };

/** Listado paginado ya desempaquetado. */
export type Paginated<T> = { items: T[]; pagination: Pagination };

/** Parámetros comunes de los listados (`page`, `limit`, `q`). */
export type ListParams = {
  page?: number;
  limit?: number;
  q?: string;
};
