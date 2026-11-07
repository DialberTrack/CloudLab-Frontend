import { ApiError } from '@/shared/api/errors';
import { http } from '@/shared/api/http';
import { refreshSession, setAccessToken } from '@/shared/api/session';
import type { ChangePasswordInput, LoginData, LoginInput, RefreshData, UserProfile } from './types';

export const authApi = {
  /** `POST /auth/login` + `GET /auth/me` (el login no devuelve el nombre). */
  async login(input: LoginInput): Promise<UserProfile> {
    const { accessToken } = await http.post<LoginData>('/auth/login', input, { auth: false });
    setAccessToken(accessToken);
    return authApi.me();
  },

  /** Recupera la sesión desde la cookie de refresh (`POST /auth/refresh`). */
  async restore(): Promise<UserProfile> {
    if (!(await refreshSession())) {
      throw new ApiError('Tu sesión ha expirado.', 401, 'SESSION_EXPIRED');
    }
    return authApi.me();
  },

  me: () => http.get<UserProfile>('/auth/me'),

  /** `POST /auth/logout`. El token local se descarta aunque la petición falle. */
  async logout(): Promise<void> {
    try {
      await http.post('/auth/logout', undefined, { auth: false });
    } finally {
      setAccessToken(null);
    }
  },

  /** `POST /auth/change-password`: la API rota la sesión y devuelve un token nuevo. */
  async changePassword(input: ChangePasswordInput): Promise<void> {
    const { accessToken } = await http.post<RefreshData>('/auth/change-password', input);
    setAccessToken(accessToken);
  },
};
