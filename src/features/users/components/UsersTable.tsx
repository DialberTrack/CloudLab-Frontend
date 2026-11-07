import { Link } from 'react-router-dom';
import { roleLabel, roleTone } from '@/features/auth/roles';
import { paths } from '@/shared/config/routes';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import type { User } from '../types';
import { UserStatusBadge } from './UserStatusBadge';

type UsersTableProps = {
  users: User[];
  busy: boolean;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onResetPassword: (user: User) => void;
  onRemove: (user: User) => void;
};

const adminLock = (isAdmin: boolean, reason: string) => (isAdmin ? reason : undefined);

export function UsersTable({
  users,
  busy,
  onEdit,
  onToggleActive,
  onResetPassword,
  onRemove,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Usuario</th>
            <th scope="col">Rol</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isAdmin = user.role === 'admin';
            return (
              <tr key={user.id}>
                <td>
                  <Link
                    to={paths.adminUser(user.id)}
                    className="block font-medium text-slate-200 hover:text-violet-300"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs">{user.email}</p>
                </td>
                <td>
                  <StatusBadge tone={roleTone[user.role]}>{roleLabel[user.role]}</StatusBadge>
                </td>
                <td>
                  <UserStatusBadge active={user.is_active} />
                </td>
                <td className="space-x-2">
                  <button
                    type="button"
                    className="small-button"
                    disabled={isAdmin || busy}
                    title={adminLock(isAdmin, 'Los administradores no se pueden modificar')}
                    onClick={() => onEdit(user)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="small-button"
                    disabled={isAdmin || busy}
                    title={adminLock(isAdmin, 'Los administradores no se pueden desactivar')}
                    onClick={() => onToggleActive(user)}
                  >
                    {user.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    className="small-button"
                    disabled={isAdmin || busy}
                    title={adminLock(
                      isAdmin,
                      'No se puede restablecer la clave de un administrador'
                    )}
                    onClick={() => onResetPassword(user)}
                  >
                    Reset clave
                  </button>
                  <button
                    type="button"
                    className="small-button text-rose-300"
                    disabled={isAdmin || busy}
                    title={adminLock(isAdmin, 'Los administradores no se pueden eliminar')}
                    onClick={() => onRemove(user)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
