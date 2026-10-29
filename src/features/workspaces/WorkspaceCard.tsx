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
    onAction: (id: string, operation: 'start' | 'stop' | 'restart' | 'delete') => void;
}) {
    const running = workspace.status === 'running';
    return (
        <article className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.05]">
            <div className="mb-5 flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-xl text-violet-300">◈</div><span className={`status ${statusStyles[workspace.status]}`}>{statusLabel[workspace.status]}</span></div>
            <Link to={`/workspaces/${workspace.id}`} className="font-semibold hover:text-violet-300">{workspace.name}</Link>
            <p className="mt-1 truncate text-xs text-slate-500">{workspace.image_name} · {workspace.image}</p>
            {workspace.status === 'error' && <p className="mt-3 rounded-lg bg-rose-500/10 p-2 text-xs text-rose-300">{workspace.error_message ?? 'El workspace necesita atención.'}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
                {running ? <button className="small-button" disabled={busy === workspace.id + 'stop'} onClick={() => onAction(workspace.id, 'stop')}>■ Detener</button> : <button className="small-button small-button-primary" disabled={busy === workspace.id + 'start'} onClick={() => onAction(workspace.id, 'start')}>▶ Iniciar</button>}
                <Link className="small-button flex-1 whitespace-nowrap text-center" to={`/workspaces/${workspace.id}`}>Ver métricas</Link>
                <button className="small-button" aria-label="Reiniciar workspace" title="Reiniciar" disabled={busy === workspace.id + 'restart'} onClick={() => onAction(workspace.id, 'restart')}>↻</button>
                <button className="small-button text-rose-300 hover:bg-rose-500/10" onClick={() => onAction(workspace.id, 'delete')}>Eliminar</button>
            </div>
        </article>
    );
}
