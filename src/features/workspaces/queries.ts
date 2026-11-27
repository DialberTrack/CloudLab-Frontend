import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListParams } from '@/shared/api/types';
import { adminWorkspacesApi, workspacesApi } from './api';
import { waitForDesktop } from './desktop/waitForDesktop';
import { isTransitional } from './rules';
import type { AdminWorkspaceListParams } from './types';

const POLL_MS = 2000;
import { workspaceKeys } from './keys';

export const useWorkspaces = (params: ListParams) =>
  useQuery({
    queryKey: workspaceKeys.list(params),
    queryFn: () => workspacesApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.items.some((item) => isTransitional(item.status)) ? POLL_MS : false,
  });

export const useAdminWorkspaces = (params: AdminWorkspaceListParams) =>
  useQuery({
    queryKey: workspaceKeys.adminList(params),
    queryFn: () => adminWorkspacesApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.items.some((item) => isTransitional(item.status)) ? POLL_MS : false,
  });

export const useWorkspace = (id: string) =>
  useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => workspacesApi.get(id),
    refetchInterval: (query) =>
      query.state.data && isTransitional(query.state.data.status) ? POLL_MS : false,
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
    queryFn: async ({ signal }) => {
      await workspacesApi.createContainerSession(id);
      await waitForDesktop(id, { signal });
      return true;
    },
    gcTime: 0,
    retry: false,
    refetchOnReconnect: false,
  });
