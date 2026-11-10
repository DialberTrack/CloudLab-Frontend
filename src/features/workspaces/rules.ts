import type { InterfaceType, WorkspaceAction, WorkspaceInterfaces, WorkspaceStatus } from './types';

type Availability = { allowed: true } | { allowed: false; reason: string };

const allow: Availability = { allowed: true };
const deny = (reason: string): Availability => ({ allowed: false, reason });

export const isTransitional = (status: WorkspaceStatus) =>
  status === 'creating' || status === 'deleting';

/** Fuente única de verdad sobre qué acciones admite cada estado. */
export function getActionAvailability(
  status: WorkspaceStatus,
  action: WorkspaceAction
): Availability {
  if (isTransitional(status)) return deny('El workspace está cambiando de estado');

  switch (action) {
    case 'start':
      return status === 'running' ? deny('El workspace ya está activo') : allow;
    case 'stop':
      return status === 'stopped' ? deny('El workspace ya está detenido') : allow;
    case 'restart':
      return status === 'running' ? allow : deny('Solo puedes reiniciar un workspace activo');
    case 'retry':
      return status === 'error' ? allow : deny('Solo puedes reintentar un workspace con error');
    case 'delete':
      return allow;
  }
}

/** Props `disabled` / `title` listas para esparcir sobre un `<button>`. */
export function getActionState(status: WorkspaceStatus, action: WorkspaceAction, busy = false) {
  const availability = getActionAvailability(status, action);
  return {
    disabled: busy || !availability.allowed,
    title: availability.allowed ? undefined : availability.reason,
  };
}

/**
 * Indica si el workspace ofrece la interfaz pedida (misma regla que la API): las de escritorio
 * solo el escritorio, más la terminal si tienen `has_terminal`; las de terminal solo la terminal.
 */
export const supportsInterface = (workspace: WorkspaceInterfaces, target: InterfaceType) =>
  target === 'desktop'
    ? workspace.interface_type === 'desktop'
    : workspace.interface_type === 'terminal' || workspace.has_terminal;
