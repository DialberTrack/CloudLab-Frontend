import type { WorkspaceStatus } from '../../types/api';

export const statusLabel: Record<WorkspaceStatus, string> = {
    running: 'Activo',
    stopped: 'Detenido',
    creating: 'Creando',
    deleting: 'Eliminando',
    error: 'Con error',
};

export const statusStyles: Record<WorkspaceStatus, string> = {
    running: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    stopped: 'bg-slate-500/10 text-slate-300 ring-slate-500/20',
    creating: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
    deleting: 'bg-orange-500/10 text-orange-300 ring-orange-500/20',
    error: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
};
