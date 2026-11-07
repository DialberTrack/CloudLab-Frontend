import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/routes';
import type { WorkspaceListItem } from '../types';
import { WorkspaceStatusBadge } from './WorkspaceStatusBadge';

export function WorkspaceRow({ workspace }: { workspace: WorkspaceListItem }) {
  return (
    <Link
      to={paths.workspace(workspace.id)}
      className="items-center justify-between flex px-3 py-3 rounded-xl transition hover:bg-white/4"
    >
      <div className="items-center gap-3 flex min-w-0">
        <div className="place-items-center grid shrink-0 h-9 w-9 text-violet-300 rounded-lg bg-violet-500/10">
          ◈
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{workspace.name}</p>
          <p className="truncate text-xs text-slate-600">{workspace.image}</p>
        </div>
      </div>
      <WorkspaceStatusBadge status={workspace.status} />
    </Link>
  );
}
