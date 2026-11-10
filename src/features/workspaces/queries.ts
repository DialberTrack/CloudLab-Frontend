import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListParams } from '@/shared/api/types';
import { adminWorkspacesApi, workspacesApi } from './api';
import type { AdminWorkspaceListParams, InterfaceType } from './types';
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

/** Abre la sesión del escritorio o la terminal; se repite en cada montaje. */
export const useContainerSession = (id: string, target: InterfaceType) =>
  useQuery({
    queryKey: workspaceKeys.containerSession(id, target),
    queryFn: async () => {
      await workspacesApi.createContainerSession(id, target);
      return true;
    },
    gcTime: 0,
    retry: false,
    refetchOnReconnect: false,
  });
