import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { messageOf } from '@/shared/api/errors';
import { paths } from '@/shared/config/routes';
import { formatDateTime } from '@/shared/lib/format';
import { Alert } from '@/shared/ui/Alert';
import { Loading } from '@/shared/ui/Loading';
import { PageHeader } from '@/shared/ui/PageHeader';
import { QueryContent } from '@/shared/ui/QueryContent';
import { useAuth } from '@/features/auth/AuthContext';
import { MetricsPanel } from '../components/MetricsPanel';
import { WorkspaceStatusBadge } from '../components/WorkspaceStatusBadge';
import { workspaceKeys } from '../keys';
import { useWorkspaceOperations } from '../mutations';
import { useWorkspace, useWorkspaceMetrics } from '../queries';
import { interfaceSummary } from '@/features/container-images/presentation';
import { getActionState, supportsInterface } from '../rules';
import type { WorkspaceDetails } from '../types';

export function WorkspaceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const workspaceQuery = useWorkspace(id);
  const operations = useWorkspaceOperations();

  const refresh = () => queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(id) });

  const remove = async (workspace: WorkspaceDetails) => {
    if (await operations.remove(workspace)) navigate(paths.workspaces);
  };

  return (
    <>
      <Link
        to={paths.workspaces}
        className="inline-block mb-6 text-sm text-slate-500 hover:text-slate-200"
      >
        ← Volver a workspaces
      </Link>
      {operations.error && (
        <Alert className="mb-6" message={operations.error} onClose={operations.clearError} />
      )}
      <QueryContent query={workspaceQuery}>
        {(workspace) => {
          const busy = operations.isBusy(workspace.id);
          const { status } = workspace;
          return (
            <>
              <PageHeader
                title={workspace.name}
                subtitle={`${workspace.image_name} · ${workspace.image}`}
                action={
                  <div className="items-center gap-2 flex">
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={workspaceQuery.isFetching}
                      onClick={() => void refresh()}
                    >
                      {workspaceQuery.isFetching ? 'Actualizando...' : '↻ Refrescar'}
                    </button>
                    <WorkspaceStatusBadge status={status} />
                  </div>
                }
              />
              <div className="gap-6 grid lg:grid-cols-2">
                <section className="panel">
                  <h2 className="section-title">Operaciones</h2>
                  <div className="gap-2 flex flex-wrap mt-5">
                    {status === 'error' && (
                      <button
                        type="button"
                        className="small-button small-button-primary"
                        {...getActionState(status, 'retry', busy)}
                        onClick={() => void operations.run(workspace.id, 'retry')}
                      >
                        ↻ Reintentar
                      </button>
                    )}
                    {status === 'running' && supportsInterface(workspace, 'desktop') && (
                      <Link
                        className="small-button small-button-primary"
                        to={paths.workspaceDesktop(workspace.id)}
                      >
                        🖥️ Abrir escritorio
                      </Link>
                    )}
                    {status === 'running' && supportsInterface(workspace, 'terminal') && (
                      <Link
                        className={
                          workspace.interface_type === 'terminal'
                            ? 'small-button small-button-primary'
                            : 'small-button'
                        }
                        to={paths.workspaceTerminal(workspace.id)}
                      >
                        ⌨ Abrir terminal
                      </Link>
                    )}
                    <button
                      type="button"
                      className="small-button small-button-primary"
                      {...getActionState(status, 'start', busy)}
                      onClick={() => void operations.run(workspace.id, 'start')}
                    >
                      ▶ Iniciar
                    </button>
                    <button
                      type="button"
                      className="small-button"
                      {...getActionState(status, 'stop', busy)}
                      onClick={() => void operations.run(workspace.id, 'stop')}
                    >
                      ■ Detener
                    </button>
                    <button
                      type="button"
                      className="small-button"
                      {...getActionState(status, 'restart', busy)}
                      onClick={() => void operations.run(workspace.id, 'restart')}
                    >
                      ↻ Reiniciar
                    </button>
                    <button
                      type="button"
                      className="small-button text-rose-300"
                      {...getActionState(status, 'delete', busy)}
                      onClick={() => void remove(workspace)}
                    >
                      Eliminar
                    </button>
                  </div>
                  {workspace.error_message && (
                    <p className="mt-4 p-3 text-sm text-rose-300 rounded-lg bg-rose-500/10">
                      {workspace.error_message}
                    </p>
                  )}
                  <dl className="space-y-3 mt-8 text-sm">
                    <div className="justify-between flex">
                      <dt className="text-slate-500">Container</dt>
                      <dd className="font-mono text-xs">
                        {workspace.container_id ?? 'No asignado'}
                      </dd>
                    </div>
                    <div className="justify-between flex">
                      <dt className="text-slate-500">Interfaz</dt>
                      <dd>{interfaceSummary(workspace)}</dd>
                    </div>
                    <div className="justify-between flex">
                      <dt className="text-slate-500">Creado</dt>
                      <dd>{formatDateTime(workspace.created_at)}</dd>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="justify-between flex">
                        <dt className="text-slate-500">Dueño</dt>
                        <dd>
                          <Link
                            to={paths.adminUser(workspace.user_id)}
                            className="font-mono text-slate-200 hover:text-violet-400/80"
                          >
                            {workspace.user_id}
                          </Link>
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
                <section className="panel">
                  <h2 className="section-title">Métricas Docker</h2>
                  <MetricsSection id={workspace.id} running={status === 'running'} />
                </section>
              </div>
            </>
          );
        }}
      </QueryContent>
    </>
  );
}

function MetricsSection({ id, running }: { id: string; running: boolean }) {
  const metricsQuery = useWorkspaceMetrics(id, running);

  if (!running) {
    return (
      <p className="mt-5 text-sm text-slate-500">
        Las métricas están disponibles cuando el workspace está activo.
      </p>
    );
  }
  if (metricsQuery.isPending) return <Loading label="Cargando métricas..." />;
  if (metricsQuery.isError) {
    return <p className="mt-5 text-sm text-rose-300">{messageOf(metricsQuery.error)}</p>;
  }
  return (
    <div className="mt-5">
      <MetricsPanel metrics={metricsQuery.data} />
    </div>
  );
}
