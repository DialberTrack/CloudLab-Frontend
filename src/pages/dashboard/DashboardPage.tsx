import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { Loading } from '../../components/Loading';
import { workspaceApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { Workspace } from '../../types/api';
import { WorkspaceRow } from '../../features/workspaces/WorkspaceRow';

export function DashboardPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<Workspace[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        workspaceApi.list().then((response) => setItems(response.data)).catch((reason) => setError(messageOf(reason))).finally(() => setLoading(false));
    }, []);
    const running = items.filter((item) => item.status === 'running').length;
    return (
        <>
            <PageHeader title="Tu espacio de trabajo" subtitle="Todo lo que necesitas para desarrollar, en un solo lugar." />
            {error && <div className="mb-6"><Alert message={error} onClose={() => setError('')} /></div>}
            <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Workspaces totales" value={items.length} icon="◈" />
                <Stat label="En ejecución" value={running} icon="◉" accent />
                <Stat label="Disponibilidad" value="99.9%" icon="⌁" />
            </div>
            <section className="panel mt-8">
                <div className="mb-6 flex items-center justify-between">
                    <div><h2 className="section-title">Actividad reciente</h2><p className="section-subtitle">Tus entornos más recientes</p></div>
                    <Link className="ghost-button" to="/workspaces">Ver todos →</Link>
                </div>
                {loading ? <Loading /> : items.length === 0 ? <EmptyState text="Aún no tienes workspaces creados." action="Crear workspace" onClick={() => navigate('/workspaces')} /> : <div className="space-y-2">{items.slice(0, 5).map((item) => <WorkspaceRow key={item.id} workspace={item} />)}</div>}
            </section>
        </>
    );
}

function Stat({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent?: boolean }) {
    return <div className="panel flex items-center gap-4"><div className={`grid h-12 w-12 place-items-center rounded-xl text-xl ${accent ? 'bg-emerald-500/10 text-emerald-300' : 'bg-violet-500/10 text-violet-300'}`}>{icon}</div><div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div></div>;
}
