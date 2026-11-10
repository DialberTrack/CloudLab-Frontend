export const paths = {
  login: '/login',
  dashboard: '/',
  workspaces: '/workspaces',
  workspace: (id: string) => `/workspaces/${id}`,
  workspaceDesktop: (id: string) => `/workspaces/${id}/desktop`,
  workspaceTerminal: (id: string) => `/workspaces/${id}/terminal`,
  images: '/images',
  profile: '/profile',
  adminUsers: '/admin/users',
  adminUser: (id: string) => `/admin/users/${id}`,
  adminWorkspaces: '/admin/workspaces',
  adminImages: '/admin/images',
} as const;

/** Metadatos que cada ruta expone vía `handle` (ver `useMatches`). */
export type RouteHandle = { title: string };
