import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import type { ComponentType } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import type { RouteHandle } from '@/shared/config/routes';
import { Loading } from '@/shared/ui/Loading';
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './guards';

/** Carga diferida de una página exportada por nombre. */
const page = <M extends Record<string, unknown>>(
  load: () => Promise<M>,
  name: keyof M
): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load())[name] as ComponentType }),
});

const titled = (title: string): { handle: RouteHandle } => ({ handle: { title } });

const routes: RouteObject[] = [
  {
    HydrateFallback: () => <Loading label="Cargando..." />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: '/login',
            ...page(() => import('@/features/auth/pages/LoginPage'), 'LoginPage'),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                ...titled('Resumen'),
                ...page(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage'),
              },
              {
                path: 'workspaces',
                ...titled('Workspaces'),
                ...page(
                  () => import('@/features/workspaces/pages/WorkspacesPage'),
                  'WorkspacesPage'
                ),
              },
              {
                path: 'workspaces/:id',
                ...titled('Detalle del workspace'),
                ...page(
                  () => import('@/features/workspaces/pages/WorkspaceDetailPage'),
                  'WorkspaceDetailPage'
                ),
              },
              {
                path: 'workspaces/:id/desktop',
                ...titled('Escritorio'),
                ...page(
                  () => import('@/features/workspaces/pages/WorkspaceDesktopPage'),
                  'WorkspaceDesktopPage'
                ),
              },
              {
                path: 'workspaces/:id/terminal',
                ...titled('Terminal'),
                ...page(
                  () => import('@/features/workspaces/pages/WorkspaceTerminalPage'),
                  'WorkspaceTerminalPage'
                ),
              },
              {
                path: 'images',
                ...titled('Imágenes'),
                ...page(() => import('@/features/container-images/pages/ImagesPage'), 'ImagesPage'),
              },
              {
                path: 'profile',
                ...titled('Mi perfil'),
                ...page(() => import('@/features/auth/pages/ProfilePage'), 'ProfilePage'),
              },
              {
                element: <AdminRoute />,
                children: [
                  {
                    path: 'admin/users',
                    ...titled('Administración / Usuarios'),
                    ...page(
                      () => import('@/features/users/pages/AdminUsersPage'),
                      'AdminUsersPage'
                    ),
                  },
                  {
                    path: 'admin/users/:id',
                    ...titled('Administración / Usuario'),
                    ...page(
                      () => import('@/features/users/pages/AdminUserDetailPage'),
                      'AdminUserDetailPage'
                    ),
                  },
                  {
                    path: 'admin/workspaces',
                    ...titled('Administración / Workspaces'),
                    ...page(
                      () => import('@/features/workspaces/pages/AdminWorkspacesPage'),
                      'AdminWorkspacesPage'
                    ),
                  },
                  {
                    path: 'admin/images',
                    ...titled('Administración / Imágenes'),
                    ...page(
                      () => import('@/features/container-images/pages/AdminImagesPage'),
                      'AdminImagesPage'
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '*',
        ...page(() => import('./NotFoundPage'), 'NotFoundPage'),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
