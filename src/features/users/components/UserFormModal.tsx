import { useState } from 'react';
import type { FormEvent } from 'react';
import { messageOf } from '@/shared/api/errors';
import { roleLabel } from '@/features/auth/roles';
import type { Role } from '@/features/auth/types';
import { Alert } from '@/shared/ui/Alert';
import { SelectField, TextField } from '@/shared/ui/Fields';
import { Modal } from '@/shared/ui/Modal';
import { useCreateUser, useUpdateUser } from '../mutations';
import type { UpdateUserInput, User } from '../types';

type FormState = { name: string; email: string; password: string; role: Role };

const emptyForm: FormState = { name: '', email: '', password: '', role: 'user' };

const formFor = (user?: User): FormState =>
  user ? { name: user.name, email: user.email, password: '', role: user.role } : emptyForm;

type UserFormModalProps = {
  /** Con `user` el formulario edita; sin él, crea. */
  user?: User;
  onClose: () => void;
};

export function UserFormModal({ user, onClose }: UserFormModalProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [form, setForm] = useState(() => formFor(user));
  const mutation = user ? updateUser : createUser;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();

    if (!user) {
      createUser.mutate(
        { name, email, password: form.password, role: form.role },
        { onSuccess: onClose }
      );
      return;
    }

    const changes: UpdateUserInput = {};
    if (name !== user.name) changes.name = name;
    if (email !== user.email) changes.email = email;
    if (form.role !== user.role) changes.role = form.role;
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }
    updateUser.mutate({ id: user.id, input: changes }, { onSuccess: onClose });
  };

  return (
    <Modal
      title={user ? 'Editar usuario' : 'Crear usuario'}
      subtitle={
        user
          ? 'Actualiza los datos y permisos de la cuenta.'
          : 'Registra una cuenta nueva en CloudLab.'
      }
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={submit}>
        {mutation.isError && (
          <Alert message={messageOf(mutation.error)} onClose={() => mutation.reset()} />
        )}
        <TextField
          label="Nombre"
          placeholder="Nombre"
          required
          minLength={3}
          maxLength={100}
          autoComplete="off"
          value={form.name}
          onChange={(event) => set('name', event.target.value)}
        />
        <TextField
          label="Correo"
          type="email"
          placeholder="correo@ejemplo.com"
          required
          maxLength={255}
          autoComplete="off"
          value={form.email}
          onChange={(event) => set('email', event.target.value)}
        />
        {!user && (
          <TextField
            label="Contraseña"
            type="password"
            placeholder="Contraseña"
            required
            minLength={8}
            maxLength={255}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => set('password', event.target.value)}
          />
        )}
        <SelectField
          label="Rol"
          value={form.role}
          onChange={(event) => set('role', event.target.value as Role)}
        >
          <option value="user">{roleLabel.user}</option>
          <option value="admin">{roleLabel.admin}</option>
        </SelectField>
        <div className="justify-end gap-2 flex">
          {!user && (
            <button
              type="button"
              className="ghost-button text-rose-300"
              onClick={() => setForm(emptyForm)}
            >
              Limpiar
            </button>
          )}
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={mutation.isPending}>
            {user ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
