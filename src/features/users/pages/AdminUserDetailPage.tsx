import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { roleLabel } from '@/features/auth/roles';
import { WorkspaceStatusBadge } from '@/features/workspaces/components/WorkspaceStatusBadge';
import { useAdminWorkspaces } from '@/features/workspaces/queries';
import { paths } from '@/shared/config/routes';
import { formatDateTime } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Pagination } from '@/shared/ui/Pagination';
import { QueryContent } from '@/shared/ui/QueryContent';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { useUser } from '../queries';

const WORKSPACES_PAGE_SIZE = 10;

export function AdminUserDetailPage() {
  const { id = '' } = useParams();
  const userQuery = useUser(id);
  const [page, setPage] = useState(1);
  const workspacesQuery = useAdminWorkspaces({ user_id: id, page, limit: WORKSPACES_PAGE_SIZE });

  return (
    <>
      <Link
        to={paths.adminUsers}
        className="inline-block mb-6 text-sm text-slate-500 hover:text-slate-200"
      >
        ← Volver a usuarios
      </Link>
      <QueryContent query={userQuery}>
        {(user) => (
          <>
            <PageHeader title={user.name} subtitle="Información del usuario y sus workspaces." />
            <div className="gap-6 grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <section className="panel">
                <h2 className="section-title">Información</h2>
                <dl className="space-y-4 mt-5 text-sm">
                  <div>
                    <dt className="text-slate-500">Correo</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Rol</dt>
                    <dd>{roleLabel[user.role]}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Estado</dt>
                    <dd>
                      <UserStatusBadge active={user.is_active} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Creado</dt>
                    <dd>{formatDateTime(user.created_at)}</dd>
                  </div>
                </dl>
              </section>
              <section className="panel">
                <h2 className="section-title">Workspaces creados</h2>
                <div className="mt-5">
                  <QueryContent
                    query={workspacesQuery}
                    isEmpty={({ items }) => items.length === 0}
                    empty={<EmptyState text="Este usuario no tiene workspaces." />}
                  >
                    {({ items, pagination }) => (
                      <>
                        <div className="space-y-2">
                          {items.map((workspace) => (
                            <Link
                              key={workspace.id}
                              to={paths.workspace(workspace.id)}
                              className="items-center justify-between flex px-4 py-3 rounded-xl border border-white/6 transition hover:border-violet-400/30 hover:bg-white/4"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium">{workspace.name}</p>
                                <p className="truncate text-xs text-slate-500">
                                  {workspace.image_name} · {workspace.image}
                                </p>
                              </div>
                              <WorkspaceStatusBadge
                                status={workspace.status}
                                className="ml-3 shrink-0"
                              />
                            </Link>
                          ))}
                        </div>
                        <Pagination pagination={pagination} onPageChange={setPage} />
                      </>
                    )}
                  </QueryContent>
                </div>
              </section>
            </div>
          </>
        )}
      </QueryContent>
    </>
  );
}
