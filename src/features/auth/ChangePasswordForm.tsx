import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { messageOf } from '@/shared/api/errors';
import { Alert } from '@/shared/ui/Alert';
import { TextField } from '@/shared/ui/Fields';
import { authApi } from './api';

export function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      setCurrent('');
      setPassword('');
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    changePassword.mutate({ current, password });
  };

  return (
    <form onSubmit={submit}>
      <h2 className="section-title">Cambiar contraseña</h2>
      {changePassword.isSuccess && (
        <p className="mt-4 text-sm text-emerald-300" role="status">
          Contraseña actualizada correctamente.
        </p>
      )}
      {changePassword.isError && (
        <Alert className="mt-4" message={messageOf(changePassword.error)} />
      )}
      <div className="mt-5 space-y-4">
        <TextField
          label="Contraseña actual"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={255}
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />
        <TextField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={255}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <button type="submit" className="primary-button mt-6" disabled={changePassword.isPending}>
        {changePassword.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
      </button>
    </form>
  );
}
