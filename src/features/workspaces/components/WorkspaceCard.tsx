import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/routes';
import { ActionButton } from '@/shared/ui/ActionButton';
import { workspaceActionProgress } from '../presentation';
import { getActionState } from '../rules';
import type { WorkspaceAction, WorkspaceListItem, WorkspaceOperation } from '../types';
import { WorkspaceStatusBadge } from './WorkspaceStatusBadge';

type WorkspaceCardProps = {
  workspace: WorkspaceListItem;
  pending?: WorkspaceAction;
  onRun: (operation: WorkspaceOperation) => void;
  onDelete: () => void;
};

const primaryAction = (status: WorkspaceListItem['status']) => {
  if (status === 'error')
    return { operation: 'retry', label: '↻ Reintentar', primary: true } as const;
  if (status === 'running')
    return { operation: 'stop', label: '■ Detener', primary: false } as const;
  return { operation: 'start', label: '▶ Iniciar', primary: true } as const;
};

export function WorkspaceCard({ workspace, pending, onRun, onDelete }: WorkspaceCardProps) {
  const { status } = workspace;
  const primary = primaryAction(status);
  const busy = pending !== undefined;

  return (
    <article className="workspace-card">
      <div className="workspace-card-header">
        <div className="workspace-icon">◈</div>
        <WorkspaceStatusBadge status={status} />
      </div>
      <Link to={paths.workspace(workspace.id)} className="font-semibold hover:text-violet-300">
        {workspace.name}
      </Link>
      <p className="workspace-meta">
        {workspace.image_name} · {workspace.image}
      </p>
      {status === 'error' && <p className="workspace-error">El workspace necesita atención.</p>}
      <div className="workspace-actions">
        <ActionButton
          className={primary.primary ? 'small-button small-button-primary' : 'small-button'}
          {...getActionState(status, primary.operation, busy)}
          loading={pending === primary.operation}
          loadingLabel={workspaceActionProgress[primary.operation]}
          onClick={() => onRun(primary.operation)}
        >
          {primary.label}
        </ActionButton>
        {status === 'running' && (
          <Link
            className="small-button small-button-primary whitespace-nowrap"
            to={paths.workspaceDesktop(workspace.id)}
          >
            🖥️ Escritorio
          </Link>
        )}
        <Link
          className="small-button flex-1 whitespace-nowrap text-center"
          to={paths.workspace(workspace.id)}
        >
          Ver métricas
        </Link>
        <ActionButton
          className="small-button"
          aria-label="Reiniciar workspace"
          {...getActionState(status, 'restart', busy)}
          loading={pending === 'restart'}
          loadingLabel=""
          onClick={() => onRun('restart')}
        >
          ↻
        </ActionButton>
        <ActionButton
          className="small-button text-rose-300 hover:bg-rose-500/10"
          {...getActionState(status, 'delete', busy)}
          loading={pending === 'delete'}
          loadingLabel={workspaceActionProgress.delete}
          onClick={onDelete}
        >
          Eliminar
        </ActionButton>
      </div>
    </article>
  );
}
