import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListParams } from '@/shared/api/types';
import { adminWorkspacesApi, workspacesApi } from './api';
import type { AdminWorkspaceListParams } from './types';
import { workspaceKeys } from './keys';

export const useWorkspaces = (params: ListParams) =>
  useQuery({
    queryKey: workspaceKeys.list(params),
    queryFn: () => workspacesApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useAdminWorkspaces = (params: AdminWorkspaceListParams) =>
  useQuery({
    queryKey: workspaceKeys.adminList(params),
    queryFn: () => adminWorkspacesApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useWorkspace = (id: string) =>
  useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => workspacesApi.get(id),
  });

/** Las métricas solo existen mientras el contenedor está activo. */
export const useWorkspaceMetrics = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: workspaceKeys.metrics(id),
    queryFn: () => workspacesApi.metrics(id),
    enabled,
  });

/** Abre la sesión del escritorio remoto; se repite en cada montaje. */
export const useDesktopSession = (id: string) =>
  useQuery({
    queryKey: workspaceKeys.desktopSession(id),
    queryFn: async () => {
      await workspacesApi.createContainerSession(id);
      return true;
    },
    gcTime: 0,
    retry: false,
    refetchOnReconnect: false,
  });
