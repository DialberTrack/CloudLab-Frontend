import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { messageOf } from '@/shared/api/errors';
import { Alert } from '@/shared/ui/Alert';
import { TextField } from '@/shared/ui/Fields';
import { Logo } from '@/shared/ui/Logo';
import { useAuth } from '../AuthContext';

const DEMO_USERS = [
  {
    role: 'admin',
    name: 'Administrador',
    email: 'admin@cloudlab.local',
    password: 'password123',
  },
] as const;

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useMutation({ mutationFn: signIn });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ email: email.trim(), password });
  };

  const loginAsDemo = (user: (typeof DEMO_USERS)[number]) => {
    setEmail(user.email);
    setPassword(user.password);
    login.mutate({ email: user.email, password: user.password });
  };

  return (
    <main className="auth-page">
      <div className="background-orb background-orb-violet" />
      <div className="background-orb background-orb-cyan" />
      <form onSubmit={submit} className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">CloudLab</span>
          </div>
          <p className="auth-eyebrow">Panel de control</p>
          <h1 className="auth-title">Bienvenido de vuelta</h1>
          <p className="auth-description">Administra tus entornos desde un solo lugar.</p>
        </div>
        {login.isError && <Alert className="mb-4" message={messageOf(login.error)} />}
        <div className="space-y-4">
          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@empresa.com"
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            maxLength={255}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="primary-button mt-7 w-full" disabled={login.isPending}>
          {login.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-fg-subtle">
            Cuentas de demostración
          </p>
          <div className="grid gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                type="button"
                disabled={login.isPending}
                onClick={() => loginAsDemo(user)}
                className="flex w-full items-center justify-between rounded-xl border border-line bg-fill-hover px-4 py-3 text-left transition hover:border-line-strong hover:bg-fill-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  <span className="block text-sm font-medium">{user.name}</span>
                  <span className="block text-xs text-fg-subtle">{user.email}</span>
                </span>
                <span className="rounded-full bg-fill-strong px-2.5 py-1 text-xs font-medium">
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </main>
  );
}
