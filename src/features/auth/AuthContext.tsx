import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onSessionExpired } from '@/shared/api/session';
import { authApi } from './api';
import type { LoginInput, UserProfile } from './types';

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi
      .restore()
      .then((profile) => active && setUser(profile))
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Si la API ya no puede renovar el token, se cierra la sesión local.
  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null);
        queryClient.clear();
      }),
    [queryClient]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (input) => setUser(await authApi.login(input)),
      signOut: async () => {
        await authApi.logout().catch(() => undefined);
        setUser(null);
        queryClient.clear();
      },
    }),
    [loading, queryClient, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
