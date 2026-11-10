import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/routes';
import { interfaceSummary } from '@/features/container-images/presentation';
import { getActionState } from '../rules';
import type { WorkspaceListItem, WorkspaceOperation } from '../types';
import { WorkspaceStatusBadge } from './WorkspaceStatusBadge';

type WorkspaceCardProps = {
  workspace: WorkspaceListItem;
  busy: boolean;
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

export function WorkspaceCard({ workspace, busy, onRun, onDelete }: WorkspaceCardProps) {
  const { status } = workspace;
  const primary = primaryAction(status);

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
      <p className="workspace-meta">{interfaceSummary(workspace)}</p>
      {status === 'error' && <p className="workspace-error">El workspace necesita atención.</p>}
      <div className="workspace-actions">
        <button
          type="button"
          className={primary.primary ? 'small-button small-button-primary' : 'small-button'}
          {...getActionState(status, primary.operation, busy)}
          onClick={() => onRun(primary.operation)}
        >
          {primary.label}
        </button>
        <Link
          className="small-button flex-1 whitespace-nowrap text-center"
          to={paths.workspace(workspace.id)}
        >
          Ver métricas
        </Link>
        <button
          type="button"
          className="small-button"
          aria-label="Reiniciar workspace"
          {...getActionState(status, 'restart', busy)}
          onClick={() => onRun('restart')}
        >
          ↻
        </button>
        <button
          type="button"
          className="small-button text-rose-300 hover:bg-rose-500/10"
          {...getActionState(status, 'delete', busy)}
          onClick={onDelete}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
