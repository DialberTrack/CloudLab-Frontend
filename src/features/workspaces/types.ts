import type { ListParams } from '@/shared/api/types';

export type WorkspaceStatus = 'creating' | 'running' | 'stopped' | 'error' | 'deleting';

/** Elemento de los listados (`GET /workspaces`, `GET /admin/workspaces`). */
export type WorkspaceListItem = {
  id: string;
  user_id?: string;
  name: string;
  status: WorkspaceStatus;
  created_at: string;
  updated_at: string;
  image_id?: string;
  image_name: string;
  image: string;
};

/** Detalle de un workspace (`GET /workspaces/{id}` y operaciones). */
export type WorkspaceDetails = {
  id: string;
  user_id: string;
  name: string;
  status: WorkspaceStatus;
  container_id: string | null;
  port: number | null;
  error_message?: string | null;
  created_at: string;
  image_name: string;
  image: string;
};

export type CreateWorkspaceInput = {
  name: string;
  container_image_id: string;
};

/** Operaciones sobre el contenedor: `POST /workspaces/{id}/{operation}`. */
export type WorkspaceOperation = 'start' | 'stop' | 'restart' | 'retry';

/** Acciones disponibles en la UI (las operaciones más el borrado). */
export type WorkspaceAction = WorkspaceOperation | 'delete';

/** Parámetros del listado admin: los comunes más el filtro por propietario. */
export type AdminWorkspaceListParams = ListParams & { user_id?: string };

/** Salida de Docker Stats; su forma depende de Docker. */
export type DockerStats = Record<string, unknown>;
