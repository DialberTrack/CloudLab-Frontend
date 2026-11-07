export type Role = 'user' | 'admin';

/** Perfil de la sesión actual (`GET /auth/me`). */
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
};

export type LoginInput = { email: string; password: string };

export type ChangePasswordInput = { current: string; password: string };

type AccessTokenData = { accessToken: string };

export type LoginData = AccessTokenData & {
  user: Pick<UserProfile, 'id' | 'email' | 'role'>;
};

export type RefreshData = AccessTokenData;
