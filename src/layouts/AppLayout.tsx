import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { Avatar } from '../components/Avatar';
import { Logo } from '../components/Logo';

const links = [
  { to: '/', label: 'Resumen', icon: '⌂', end: true },
  { to: '/workspaces', label: 'Workspaces', icon: '◈' },
  { to: '/images', label: 'Imágenes', icon: '▣' },
  { to: '/profile', label: 'Mi perfil', icon: '◉' },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = links.find((link) => link.to === location.pathname)?.label ?? 'CloudLab';

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${open ? 'app-sidebar-open' : 'app-sidebar-closed'}`}>
        <div className="app-sidebar-brand">
          <Logo />
          <span className="font-semibold tracking-tight">CloudLab</span>
        </div>
        <p className="app-sidebar-section-label">Workspace</p>
        <nav className="app-sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <span className="app-sidebar-nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <div className="app-sidebar-admin">
              <p className="app-sidebar-admin-label">Administración</p>
              <NavLink to="/admin/users" className="nav-item text-xs">
                ♙ Usuarios
              </NavLink>
              <NavLink to="/admin/workspaces" className="nav-item text-xs">
                ◈ Workspaces
              </NavLink>
              <NavLink to="/admin/images" className="nav-item text-xs">
                ▣ Imágenes
              </NavLink>
            </div>
          )}
        </nav>
        <div className="app-sidebar-user">
          {user && (
            <div className="app-sidebar-user-info">
              <Avatar user={user} />
              <div className="min-w-0">
                <p className="app-sidebar-user-name">{user.name}</p>
                <p className="app-sidebar-user-email">{user.email}</p>
              </div>
            </div>
          )}
          <div className="app-sidebar-logout">
            <button className="logout-link" onClick={signOut}>
              ↪ Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="app-mobile-overlay"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        />
      )}
      <div className="app-content">
        <header className="app-header">
          <button
            className="app-mobile-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <p className="app-header-context">CloudLab / {current}</p>
          <div className="app-header-status">
            <span className="app-header-status-label">Sistema operativo</span>
            <span className="app-header-status-indicator" />
            {user && (
              <div className="lg:hidden">
                <Avatar user={user} />
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
