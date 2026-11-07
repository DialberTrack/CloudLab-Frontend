import type { ListParams } from '@/shared/api/types';
import type { AdminWorkspaceListParams } from './types';

export const workspaceKeys = {
  all: ['workspaces'] as const,

  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (params: ListParams) => [...workspaceKeys.lists(), 'mine', params] as const,
  adminList: (params: AdminWorkspaceListParams) =>
    [...workspaceKeys.lists(), 'admin', params] as const,

  detail: (id: string) => [...workspaceKeys.all, 'detail', id] as const,
  metrics: (id: string) => [...workspaceKeys.detail(id), 'metrics'] as const,
  desktopSession: (id: string) => [...workspaceKeys.detail(id), 'desktop-session'] as const,

  operation: ['workspaces', 'operation'] as const,
};
