import type { BadgeTone } from '@/shared/ui/StatusBadge';
import type { WorkspaceStatus } from './types';

export const workspaceStatusLabel: Record<WorkspaceStatus, string> = {
  running: 'Activo',
  stopped: 'Detenido',
  creating: 'Creando',
  deleting: 'Eliminando',
  error: 'Con error',
};

export const workspaceStatusTone: Record<WorkspaceStatus, BadgeTone> = {
  running: 'success',
  stopped: 'neutral',
  creating: 'warning',
  deleting: 'caution',
  error: 'danger',
};
