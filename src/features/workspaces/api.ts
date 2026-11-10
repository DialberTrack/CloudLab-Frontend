import { http } from '@/shared/api/http';
import type { ListParams } from '@/shared/api/types';
import type {
  AdminWorkspaceListParams,
  CreateWorkspaceInput,
  InterfaceType,
  WorkspaceDetails,
  WorkspaceListItem,
  WorkspaceMetrics,
  WorkspaceOperation,
} from './types';

export const workspacesApi = {
  list: (params?: ListParams) => http.page<WorkspaceListItem>('/workspaces', params),

  get: (id: string) => http.get<WorkspaceDetails>(`/workspaces/${id}`),

  create: (input: CreateWorkspaceInput) => http.post<WorkspaceDetails>('/workspaces', input),

  /** start | stop | restart | retry */
  run: (id: string, operation: WorkspaceOperation) =>
    http.post<WorkspaceDetails>(`/workspaces/${id}/${operation}`),

  remove: (id: string) => http.remove(`/workspaces/${id}`),

  metrics: (id: string) => http.get<WorkspaceMetrics>(`/workspaces/${id}/metrics`),

  /**
   * Establece la cookie temporal con la que el proxy autoriza el escritorio o la terminal.
   * Sin `target` la API usa la interfaz principal de la imagen. El cuerpo siempre se envía
   * (aunque sea `{}`) porque la API lo valida.
   */
  createContainerSession: (id: string, target?: InterfaceType) =>
    http.post(`/workspaces/${id}/container-session`, { target }),
};

export const adminWorkspacesApi = {
  list: (params?: AdminWorkspaceListParams) =>
    http.page<WorkspaceListItem>('/admin/workspaces', params),
};
