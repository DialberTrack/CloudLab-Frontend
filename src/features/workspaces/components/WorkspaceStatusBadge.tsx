import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Spinner } from '@/shared/ui/Spinner';
import { workspaceStatusLabel, workspaceStatusTone } from '../presentation';
import { isTransitional } from '../rules';
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
      {isTransitional(status) && <Spinner className="mr-1.5 size-2.5" />}
      {workspaceStatusLabel[status]}
    </StatusBadge>
  );
}
