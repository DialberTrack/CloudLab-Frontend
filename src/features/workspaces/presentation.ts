import type { BadgeTone } from '@/shared/ui/StatusBadge';
import type { WorkspaceAction, WorkspaceStatus } from './types';

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

export const workspaceActionProgress: Record<WorkspaceAction, string> = {
  start: 'Iniciando...',
  stop: 'Deteniendo...',
  restart: 'Reiniciando...',
  retry: 'Reintentando...',
  delete: 'Eliminando...',
};

export const workspaceActionDone: Record<WorkspaceAction, string> = {
  start: 'Workspace iniciado',
  stop: 'Workspace detenido',
  restart: 'Workspace reiniciado',
  retry: 'Reintento en curso',
  delete: 'Workspace eliminado',
};
