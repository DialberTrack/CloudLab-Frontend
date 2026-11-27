import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListParams } from '@/shared/api/types';
import { adminWorkspacesApi, workspacesApi } from './api';
import { waitForDesktop } from './desktop/waitForDesktop';
import { isTransitional } from './rules';
import type { AdminWorkspaceListParams } from './types';

const POLL_MS = 2000;
const MAX_POLL_MS = 15_000;

/** Espaciado creciente (2 s → 15 s) para no consultar sin pausa si algo se atasca. */
const pollInterval = (updates: number) =>
  Math.min(POLL_MS * 1.5 ** Math.max(updates - 1, 0), MAX_POLL_MS);
import { workspaceKeys } from './keys';

export const useWorkspaces = (params: ListParams) =>
  useQuery({
    queryKey: workspaceKeys.list(params),
    queryFn: () => workspacesApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.items.some((item) => isTransitional(item.status))
        ? pollInterval(query.state.dataUpdateCount)
        : false,
  });

export const useAdminWorkspaces = (params: AdminWorkspaceListParams) =>
  useQuery({
    queryKey: workspaceKeys.adminList(params),
    queryFn: () => adminWorkspacesApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.items.some((item) => isTransitional(item.status))
        ? pollInterval(query.state.dataUpdateCount)
        : false,
  });

export const useWorkspace = (id: string) =>
  useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => workspacesApi.get(id),
    refetchInterval: (query) =>
      query.state.data && isTransitional(query.state.data.status)
        ? pollInterval(query.state.dataUpdateCount)
        : false,
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
