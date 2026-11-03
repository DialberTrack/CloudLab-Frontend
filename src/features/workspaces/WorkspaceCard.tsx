import type { Workspace } from '../../types/api';
import { Link } from 'react-router-dom';
import { statusLabel, statusStyles } from './workspacePresentation';

export function WorkspaceCard({
  workspace,
  busy,
  onAction,
}: {
  workspace: Workspace;
  busy: string;
  onAction: (id: string, operation: 'start' | 'stop' | 'restart' | 'retry' | 'delete') => void;
}) {
  const running = workspace.status === 'running';
  return (
    <article className="workspace-card">
      <div className="workspace-card-header">
        <div className="workspace-icon">◈</div>
        <span className={`status ${statusStyles[workspace.status]}`}>
          {statusLabel[workspace.status]}
        </span>
      </div>
      <Link to={`/workspaces/${workspace.id}`} className="font-semibold hover:text-violet-300">
        {workspace.name}
      </Link>
      <p className="workspace-meta">
        {workspace.image_name} · {workspace.image}
      </p>
      {workspace.status === 'error' && (
        <p className="workspace-error">
          {workspace.error_message ?? 'El workspace necesita atención.'}
        </p>
      )}
      <div className="workspace-actions">
        {workspace.status === 'error' ? (
          <button
            className="small-button small-button-primary"
            disabled={busy === workspace.id + 'retry'}
            onClick={() => onAction(workspace.id, 'retry')}
          >
            ↻ Reintentar
          </button>
        ) : running ? (
          <button
            className="small-button"
            disabled={busy === workspace.id + 'stop'}
            onClick={() => onAction(workspace.id, 'stop')}
          >
            ■ Detener
          </button>
        ) : (
          <button
            className="small-button small-button-primary"
            disabled={busy === workspace.id + 'start'}
            onClick={() => onAction(workspace.id, 'start')}
          >
            ▶ Iniciar
          </button>
        )}
        <Link
          className="small-button flex-1 whitespace-nowrap text-center"
          to={`/workspaces/${workspace.id}`}
        >
          Ver métricas
        </Link>
        <button
          className="small-button"
          aria-label="Reiniciar workspace"
          title="Reiniciar"
          disabled={busy === workspace.id + 'restart'}
          onClick={() => onAction(workspace.id, 'restart')}
        >
          ↻
        </button>
        <button
          className="small-button text-rose-300 hover:bg-rose-500/10"
          onClick={() => onAction(workspace.id, 'delete')}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
