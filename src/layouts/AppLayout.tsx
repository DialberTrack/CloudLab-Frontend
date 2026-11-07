import { useState } from 'react';
import { NavLink, Outlet, useMatches } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import type { RouteHandle } from '@/shared/config/routes';
import { cx } from '@/shared/lib/cx';
import { Avatar } from '@/shared/ui/Avatar';
import { Logo } from '@/shared/ui/Logo';
import { adminNavigation, mainNavigation } from './navigation';
import type { NavItem } from './navigation';

function SidebarLink({
  item,
  compact = false,
  onNavigate,
}: {
  item: NavItem;
  compact?: boolean;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx('nav-item', compact && 'nav-item-compact', isActive && 'nav-item-active')
      }
    >
      <span className="app-sidebar-nav-icon">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}

export function AppLayout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const title = useMatches()
    .map((match) => (match.handle as RouteHandle | undefined)?.title)
    .findLast(Boolean);
  const close = () => setOpen(false);

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${open ? 'app-sidebar-open' : 'app-sidebar-closed'}`}>
        <div className="app-sidebar-brand">
          <Logo />
          <span className="font-semibold tracking-tight">CloudLab</span>
        </div>
        <p className="app-sidebar-section-label">Workspace</p>
        <nav className="app-sidebar-nav" aria-label="Principal">
          {mainNavigation.map((item) => (
            <SidebarLink key={item.to} item={item} onNavigate={close} />
          ))}
          {user?.role === 'admin' && (
            <div className="app-sidebar-admin">
              <p className="app-sidebar-admin-label">Administración</p>
              {adminNavigation.map((item) => (
                <SidebarLink key={item.to} item={item} compact onNavigate={close} />
              ))}
            </div>
          )}
        </nav>
        <div className="app-sidebar-user">
          {user && (
            <div className="app-sidebar-user-info">
              <Avatar name={user.name} />
              <div className="min-w-0">
                <p className="app-sidebar-user-name">{user.name}</p>
                <p className="app-sidebar-user-email">{user.email}</p>
              </div>
            </div>
          )}
          <div className="app-sidebar-logout">
            <button type="button" className="logout-link" onClick={() => void signOut()}>
              ↪ Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          type="button"
          className="app-mobile-overlay"
          onClick={close}
          aria-label="Cerrar menú"
        />
      )}
      <div className="app-content">
        <header className="app-header">
          <button
            type="button"
            className="app-mobile-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <p className="app-header-context">CloudLab / {title ?? 'Panel'}</p>
          <div className="app-header-status">
            <span className="app-header-status-label">Sistema operativo</span>
            <span className="app-header-status-indicator" />
            {user && (
              <div className="lg:hidden">
                <Avatar name={user.name} />
              </div>
            )}
          </div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
