import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/routes';
import { useListParams } from '@/shared/hooks/useListParams';
import { formatDate } from '@/shared/lib/format';
import { Alert } from '@/shared/ui/Alert';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Pagination } from '@/shared/ui/Pagination';
import { QueryContent } from '@/shared/ui/QueryContent';
import { SearchInput } from '@/shared/ui/SearchInput';
import { WorkspaceStatusBadge } from '../components/WorkspaceStatusBadge';
import { useWorkspaceOperations } from '../mutations';
import { useAdminWorkspaces } from '../queries';
import { getActionState } from '../rules';

const PAGE_SIZE = 20;

export function AdminWorkspacesPage() {
  const { params, q, setPage, setQuery } = useListParams(PAGE_SIZE);
  const workspacesQuery = useAdminWorkspaces(params);
  const operations = useWorkspaceOperations();

  return (
    <>
      <PageHeader
        title="Todos los workspaces"
        subtitle="Supervisa los entornos de todos los usuarios."
      />
      {operations.error && (
        <Alert className="mb-6" message={operations.error} onClose={operations.clearError} />
      )}
      <section className="panel">
        <div className="items-center justify-between gap-3 flex flex-wrap mb-5">
          <h2 className="section-title">Inventario global</h2>
          <SearchInput value={q} placeholder="Buscar workspace..." onSearch={setQuery} />
        </div>
        <QueryContent
          query={workspacesQuery}
          isEmpty={({ items }) => items.length === 0}
          empty={<EmptyState text="No se encontraron workspaces." />}
        >
          {({ items, pagination }) => (
            <>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Workspace</th>
                      <th scope="col">Imagen</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Propietario</th>
                      <th scope="col">Creado</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const busy = operations.isBusy(item.id);
                      return (
                        <tr key={item.id}>
                          <td className="font-medium text-slate-200">
                            <Link className="hover:text-violet-300" to={paths.workspace(item.id)}>
                              {item.name}
                            </Link>
                          </td>
                          <td>{item.image_name}</td>
                          <td>
                            <WorkspaceStatusBadge status={item.status} />
                          </td>
                          <td className="font-mono text-xs">
                            <Link
                              className="hover:text-violet-300"
                              to={paths.adminUser(item.user_id)}
                            >
                              {item.user_id}
                            </Link>
                          </td>
                          <td>{formatDate(item.created_at)}</td>
                          <td>
                            <div className="gap-1 flex flex-wrap">
                              <button
                                type="button"
                                className="small-button"
                                {...getActionState(item.status, 'start', busy)}
                                onClick={() => void operations.run(item.id, 'start')}
                              >
                                Iniciar
                              </button>
                              <button
                                type="button"
                                className="small-button"
                                {...getActionState(item.status, 'stop', busy)}
                                onClick={() => void operations.run(item.id, 'stop')}
                              >
                                Detener
                              </button>
                              {item.status === 'error' ? (
                                <button
                                  type="button"
                                  className="small-button small-button-primary"
                                  {...getActionState(item.status, 'retry', busy)}
                                  onClick={() => void operations.run(item.id, 'retry')}
                                >
                                  Reintentar
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="small-button"
                                  {...getActionState(item.status, 'restart', busy)}
                                  onClick={() => void operations.run(item.id, 'restart')}
                                >
                                  Reiniciar
                                </button>
                              )}
                              <button
                                type="button"
                                className="small-button text-rose-300"
                                {...getActionState(item.status, 'delete', busy)}
                                onClick={() => void operations.remove(item)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={pagination} onPageChange={setPage} />
            </>
          )}
        </QueryContent>
      </section>
    </>
  );
}
