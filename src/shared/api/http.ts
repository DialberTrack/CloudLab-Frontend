import { API_URL } from './config';
import { ApiError, NETWORK_ERROR_CODE } from './errors';
import { getAccessToken, notifySessionExpired, refreshSession } from './session';
import type { ApiEnvelope, ApiPage, Paginated } from './types';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

type RequestOptions = {
  query?: QueryParams;
  body?: unknown;
  /** `false` para endpoints sin bearer (login, logout). Por defecto `true`. */
  auth?: boolean;
};

type ErrorPayload = { error?: string; code?: string; issues?: unknown };

const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la solicitud.';

const buildUrl = (path: string, query?: QueryParams) => {
  const search = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const suffix = search.toString();
  return `${API_URL}${path}${suffix ? `?${suffix}` : ''}`;
};

const parseBody = async (response: Response): Promise<unknown> =>
  response.status === 204 ? undefined : response.json().catch(() => undefined);

const send = async (
  method: Method,
  path: string,
  options: RequestOptions = {},
  retried = false
): Promise<unknown> => {
  const { query, body, auth = true } = options;

  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (auth && token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0, NETWORK_ERROR_CODE);
  }

  if (response.status === 401 && auth && !retried) {
    if (await refreshSession()) return send(method, path, options, true);
    notifySessionExpired();
  }

  const payload = await parseBody(response);
  if (!response.ok) {
    const { error, code, issues } = (payload ?? {}) as ErrorPayload;
    throw new ApiError(error ?? DEFAULT_ERROR_MESSAGE, response.status, code, issues);
  }
  return payload;
};

const unwrap = <T>(payload: unknown): T => (payload as ApiEnvelope<T> | undefined)?.data as T;

/**
 * Cliente HTTP único de la aplicación. Contrato uniforme:
 * - `get/post/patch` devuelven el contenido de `{ data }` (o `undefined` en 204).
 * - `page` devuelve `{ items, pagination }`.
 * - `remove` no devuelve nada.
 * - Cualquier fallo lanza `ApiError`.
 */
export const http = {
  get: async <T>(path: string, query?: QueryParams) =>
    unwrap<T>(await send('GET', path, { query })),

  page: async <T>(path: string, query?: QueryParams): Promise<Paginated<T>> => {
    const payload = (await send('GET', path, { query })) as ApiPage<T>;
    return { items: payload.data, pagination: payload.pagination };
  },

  post: async <T = void>(path: string, body?: unknown, options?: Pick<RequestOptions, 'auth'>) =>
    unwrap<T>(await send('POST', path, { body, ...options })),

  patch: async <T>(path: string, body: unknown) => unwrap<T>(await send('PATCH', path, { body })),

  remove: async (path: string): Promise<void> => {
    await send('DELETE', path);
  },
};
