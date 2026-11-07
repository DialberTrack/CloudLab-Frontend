import { useState } from 'react';
import { useListParams } from '@/shared/hooks/useListParams';
import { useErrorMessage } from '@/shared/hooks/useErrorMessage';
import { Alert } from '@/shared/ui/Alert';
import { useConfirm } from '@/shared/ui/confirm';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Pagination } from '@/shared/ui/Pagination';
import { QueryContent } from '@/shared/ui/QueryContent';
import { SearchInput } from '@/shared/ui/SearchInput';
import { TempPasswordModal } from '../components/TempPasswordModal';
import { UserFormModal } from '../components/UserFormModal';
import { UsersTable } from '../components/UsersTable';
import { useDeleteUser, useResetUserPassword, useUpdateUser } from '../mutations';
import { useUsers } from '../queries';
import type { ResetPasswordResult, User } from '../types';

const PAGE_SIZE = 20;

type FormTarget = { user?: User } | null;

export function AdminUsersPage() {
  const { params, q, setPage, setQuery } = useListParams(PAGE_SIZE);
  const usersQuery = useUsers(params);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();
  const confirm = useConfirm();
  const { error, report, clear } = useErrorMessage();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [tempPassword, setTempPassword] = useState<ResetPasswordResult | null>(null);

  const busy = updateUser.isPending || deleteUser.isPending || resetPassword.isPending;

  const toggleActive = async (user: User) => {
    clear();
    try {
      await updateUser.mutateAsync({ id: user.id, input: { is_active: !user.is_active } });
    } catch (reason) {
      report(reason);
    }
  };

  const remove = async (user: User) => {
    const accepted = await confirm({
      title: 'Eliminar usuario',
      message: `¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!accepted) return;
    clear();
    try {
      await deleteUser.mutateAsync(user.id);
    } catch (reason) {
      report(reason);
    }
  };

  const reset = async (user: User) => {
    const accepted = await confirm({
      title: 'Restablecer contraseña',
      message: `Se generará una contraseña temporal para ${user.email} y se cerrarán sus sesiones.`,
      confirmLabel: 'Restablecer',
    });
    if (!accepted) return;
    clear();
    try {
      setTempPassword(await resetPassword.mutateAsync(user.id));
    } catch (reason) {
      report(reason);
    }
  };

  return (
    <>
      <PageHeader
        title="Administración"
        subtitle="Gestiona usuarios y permisos de la plataforma."
        action={
          <button type="button" className="primary-button" onClick={() => setFormTarget({})}>
            + Nuevo usuario
          </button>
        }
      />
      {error && <Alert className="mb-6" message={error} onClose={clear} />}
      <section className="panel">
        <div className="items-center justify-between gap-3 flex flex-wrap mb-5">
          <h2 className="section-title">Usuarios</h2>
          <SearchInput value={q} onSearch={setQuery} />
        </div>
        <QueryContent
          query={usersQuery}
          isEmpty={({ items }) => items.length === 0}
          empty={<EmptyState text="No se encontraron usuarios." />}
        >
          {({ items, pagination }) => (
            <>
              <UsersTable
                users={items}
                busy={busy}
                onEdit={(user) => setFormTarget({ user })}
                onToggleActive={(user) => void toggleActive(user)}
                onResetPassword={(user) => void reset(user)}
                onRemove={(user) => void remove(user)}
              />
              <Pagination pagination={pagination} onPageChange={setPage} />
            </>
          )}
        </QueryContent>
      </section>
      {formTarget && <UserFormModal user={formTarget.user} onClose={() => setFormTarget(null)} />}
      {tempPassword && (
        <TempPasswordModal result={tempPassword} onClose={() => setTempPassword(null)} />
      )}
    </>
  );
}
