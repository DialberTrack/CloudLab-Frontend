import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { Alert } from '../../components/Alert';
import { ContainerImageIcon } from '../../components/ContainerImageIcon';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { PageHeader } from '../../components/PageHeader';
import { imageApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { ContainerImage } from '../../types/api';

export function ImagesPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<ContainerImage[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        imageApi.list()
            .then((response) => setItems(response.data))
            .catch((reason) => setError(messageOf(reason)))
            .finally(() => setLoading(false));
    }, []);
    return <>
        <PageHeader title="Imágenes" subtitle="Imágenes disponibles para tus entornos." />
        {error && <Alert message={error} onClose={() => setError('')} />}
        {loading ? <Loading /> : items.length === 0 ? <EmptyState text="No hay imágenes disponibles." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article className="panel flex flex-col" key={item.id}><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><ContainerImageIcon name={item.name} icon={item.icon} /><h2 className="truncate font-semibold">{item.name}</h2></div><span className={`status shrink-0 ${item.is_active ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20' : 'bg-slate-500/10 text-slate-400 ring-slate-500/20'}`}>{item.is_active ? 'Activa' : 'Inactiva'}</span></div><p className="mt-3 font-mono text-xs text-slate-500">{item.image}</p>{item.description && <p className="mt-3 text-sm text-slate-400">{item.description}</p>}{item.is_active || user?.role === 'admin' ? <Link className="primary-button mt-5 text-center" to={`/workspaces?image=${encodeURIComponent(item.id)}`}>{item.is_active ? 'Usar en workspace' : 'Usar como administrador'}</Link> : <span className="mt-5 rounded-xl border border-white/10 px-4 py-2.5 text-center text-sm text-slate-600" title="Activa esta imagen desde administración para usarla">No disponible</span>}</article>)}</div>}
    </>;
}
