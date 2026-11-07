import { StatusBadge } from '@/shared/ui/StatusBadge';
import { workspaceStatusLabel, workspaceStatusTone } from '../presentation';
import type { WorkspaceStatus } from '../types';

export function WorkspaceStatusBadge({
  status,
  className,
}: {
  status: WorkspaceStatus;
  className?: string;
}) {
  return (
    <StatusBadge tone={workspaceStatusTone[status]} className={className}>
      {workspaceStatusLabel[status]}
    </StatusBadge>
  );
}
