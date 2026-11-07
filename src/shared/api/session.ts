import { API_URL } from './config';
import { ApiError, NETWORK_ERROR_CODE } from './errors';
import type { ApiEnvelope } from './types';

/**
 * Estado de sesión a nivel de transporte: access token en memoria (el refresh
 * token vive en una cookie HTTP-only administrada por la API).
 */
let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;
const expiredListeners = new Set<() => void>();

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/** Suscripción al evento "la sesión ya no se puede renovar". */
export const onSessionExpired = (listener: () => void) => {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
};

export const notifySessionExpired = () => {
  accessToken = null;
  expiredListeners.forEach((listener) => listener());
};

const requestNewToken = async (): Promise<string | null> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0, NETWORK_ERROR_CODE);
  }
  if (!response.ok) {
    accessToken = null;
    return null;
  }
  const payload = (await response.json()) as ApiEnvelope<{ accessToken: string }>;
  accessToken = payload.data.accessToken;
  return accessToken;
};

/**
 * Renueva el access token. Las llamadas concurrentes comparten una sola
 * petición: el refresh token se rota en cada uso y reutilizarlo revoca la sesión.
 */
export const refreshSession = (): Promise<string | null> => {
  refreshInFlight ??= requestNewToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};
