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
        <div className="min-h-screen bg-[#080b14] text-slate-100">
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-white/[0.07] bg-[#0b0f1b] p-5 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center gap-3 px-2 py-4">
                    <Logo />
                    <span className="font-semibold tracking-tight">CloudLab</span>
                </div>
                <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Workspace
                </p>
                <nav className="space-y-1">
                    {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'nav-item-active' : ''}`
                                }
                            >
                                <span className="text-lg opacity-80">{link.icon}</span>
                                {link.label}
                            </NavLink>
                    ))}
                    {user?.role === 'admin' && (
                        <div className="mt-2 border-t border-white/[0.07] pt-3">
                            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                Administración
                            </p>
                            <NavLink to="/admin/users" className="nav-item text-xs">♙ Usuarios</NavLink>
                            <NavLink to="/admin/workspaces" className="nav-item text-xs">◈ Workspaces</NavLink>
                            <NavLink to="/admin/images" className="nav-item text-xs">▣ Imágenes</NavLink>
                        </div>
                    )}
                </nav>
                <div className="absolute bottom-5 left-5 right-5 border-t border-white/[0.07] pt-4">
                    {user && (
                        <div className="flex items-center gap-3 px-2">
                            <Avatar user={user} />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{user.name}</p>
                                <p className="truncate text-xs text-slate-500">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <div className="mt-5 border-t border-white/[0.07] pt-4">
                        <button className="logout-link" onClick={signOut}>
                            ↪ Cerrar sesión
                        </button>
                    </div>
                </div>
            </aside>
            {open && (
                <button className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú" />
            )}
            <div className="lg:pl-64">
                <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-white/[0.07] bg-[#080b14]/80 px-5 backdrop-blur-xl lg:px-10">
                    <button className="text-2xl text-slate-400 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
                        ☰
                    </button>
                    <p className="hidden text-xs font-medium uppercase tracking-[0.2em] text-slate-500 lg:block">
                        CloudLab / {current}
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-slate-500 sm:block">Sistema operativo</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                        {user && <div className="lg:hidden"><Avatar user={user} /></div>}
                    </div>
                </header>
                <main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-10 lg:py-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
