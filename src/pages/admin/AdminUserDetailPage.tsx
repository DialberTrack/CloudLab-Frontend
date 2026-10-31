import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { PageHeader } from '../../components/PageHeader';
import { adminApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { User, Workspace } from '../../types/api';
import { statusLabel, statusStyles } from '../../features/workspaces/workspacePresentation';

export function AdminUserDetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!id) return;
        const [userResponse, workspaceResponse] = await Promise.all([
            adminApi.getUser(id),
            adminApi.workspaces({ user_id: id, limit: 100 }),
        ]);
        setUser(userResponse);
        setWorkspaces(workspaceResponse.data);
    }, [id]);

    useEffect(() => {
        void load()
            .catch((reason) => setError(messageOf(reason)))
            .finally(() => setLoading(false));
    }, [load]);

    if (loading) return <Loading />;

    return (
        <>
            <Link to="/admin/users" className="mb-6 inline-block text-sm text-slate-500 hover:text-slate-200">
                ← Volver a usuarios
            </Link>
            {error && <div className="mb-6"><Alert message={error} onClose={() => setError('')} /></div>}
            {user && (
                <>
                    <PageHeader title={user.name} subtitle="Información del usuario y sus workspaces." />
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <section className="panel">
                            <h2 className="section-title">Información</h2>
                            <dl className="mt-5 space-y-4 text-sm">
                                <div><dt className="text-slate-500">Correo</dt><dd>{user.email}</dd></div>
                                <div><dt className="text-slate-500">Rol</dt><dd>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</dd></div>
                                <div><dt className="text-slate-500">Estado</dt><dd>{user.is_active === false ? 'Inactivo' : 'Activo'}</dd></div>
                                {user.created_at && <div><dt className="text-slate-500">Creado</dt><dd>{new Date(user.created_at).toLocaleString('es-MX')}</dd></div>}
                            </dl>
                        </section>
                        <section className="panel">
                            <h2 className="section-title">Workspaces creados</h2>
                            {workspaces.length === 0 ? <EmptyState text="Este usuario no tiene workspaces." /> : <div className="mt-5 space-y-2">{workspaces.map((workspace) => <Link key={workspace.id} to={`/workspaces/${workspace.id}`} className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3 transition hover:border-violet-400/30 hover:bg-white/[0.04]"><div className="min-w-0"><p className="truncate font-medium">{workspace.name}</p><p className="truncate text-xs text-slate-500">{workspace.image_name} · {workspace.image}</p></div><span className={`status ml-3 shrink-0 ${statusStyles[workspace.status]}`}>{statusLabel[workspace.status]}</span></Link>)}</div>}
                        </section>
                    </div>
                </>
            )}
        </>
    );
}
