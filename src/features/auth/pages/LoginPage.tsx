import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { messageOf } from '@/shared/api/errors';
import { Alert } from '@/shared/ui/Alert';
import { TextField } from '@/shared/ui/Fields';
import { Logo } from '@/shared/ui/Logo';
import { useAuth } from '../AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useMutation({ mutationFn: signIn });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ email: email.trim(), password });
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
      </form>
    </main>
  );
}
