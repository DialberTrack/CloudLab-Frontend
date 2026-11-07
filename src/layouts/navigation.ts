import { paths } from '@/shared/config/routes';

export type NavItem = {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
};

export const mainNavigation: NavItem[] = [
  { to: paths.dashboard, label: 'Resumen', icon: '⌂', end: true },
  { to: paths.workspaces, label: 'Workspaces', icon: '◈' },
  { to: paths.images, label: 'Imágenes', icon: '▣' },
  { to: paths.profile, label: 'Mi perfil', icon: '◉' },
];

export const adminNavigation: NavItem[] = [
  { to: paths.adminUsers, label: 'Usuarios', icon: '♙' },
  { to: paths.adminWorkspaces, label: 'Workspaces', icon: '◈' },
  { to: paths.adminImages, label: 'Imágenes', icon: '▣' },
];
