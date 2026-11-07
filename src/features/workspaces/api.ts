import { http } from '@/shared/api/http';
import type { ListParams } from '@/shared/api/types';
import type {
  AdminWorkspaceListParams,
  CreateWorkspaceInput,
  DockerStats,
  WorkspaceDetails,
  WorkspaceListItem,
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

  metrics: (id: string) => http.get<DockerStats>(`/workspaces/${id}/metrics`),

  /** Establece la cookie temporal con la que el proxy autoriza el escritorio. */
  createContainerSession: (id: string) => http.post(`/workspaces/${id}/container-session`),
};

export const adminWorkspacesApi = {
  list: (params?: AdminWorkspaceListParams) =>
    http.page<WorkspaceListItem>('/admin/workspaces', params),
};
