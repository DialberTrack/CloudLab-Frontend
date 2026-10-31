import type { Workspace } from '../../types/api';
import { Link } from 'react-router-dom';
import { statusLabel, statusStyles } from './workspacePresentation';

export function WorkspaceRow({ workspace }: { workspace: Workspace }) {
    return (
        <Link
            to={`/workspaces/${workspace.id}`}
            className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/[0.04]"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-300">◈</div>
                <div className="min-w-0"><p className="truncate text-sm font-medium">{workspace.name}</p><p className="truncate text-xs text-slate-600">{workspace.image}</p></div>
            </div>
            <span className={`status ${statusStyles[workspace.status]}`}>{statusLabel[workspace.status]}</span>
        </Link>
    );
}
