import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { PageHeader } from '../../components/PageHeader';
import { imageApi, workspaceApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { ContainerImage, Workspace } from '../../types/api';
import { WorkspaceCard } from '../../features/workspaces/WorkspaceCard';

export function WorkspacesPage() {
    const [searchParams] = useSearchParams();
    const requestedImage = searchParams.get('image');
    const [items, setItems] = useState<Workspace[]>([]);
    const [images, setImages] = useState<ContainerImage[]>([]);
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const load = useCallback(() => Promise.all([workspaceApi.list(), imageApi.list()]).then(([workspaces, available]) => {
        setItems(workspaces.data);
        setImages(available.data);
        setImage((current) =>
            requestedImage && available.data.some((item) => item.id === requestedImage)
                ? requestedImage
                : current || available.data[0]?.id || ''
        );
    }), [requestedImage]);
    useEffect(() => { load().catch((reason) => setError(messageOf(reason))).finally(() => setLoading(false)); }, [load]);
    const create = async () => {
        const normalizedName = name.trim();
        if (normalizedName.length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.');
            return;
        }
        if (!image) {
            setError('Selecciona una imagen de contenedor.');
            return;
        }
        setBusy('create');
        try { await workspaceApi.create(normalizedName, image); setName(''); await load(); } catch (reason) { setError(messageOf(reason)); } finally { setBusy(''); }
    };
    const action = async (id: string, operation: 'start' | 'stop' | 'restart' | 'delete') => {
        if (operation === 'delete' && !window.confirm('¿Eliminar este workspace?')) return;
        setBusy(id + operation);
        try {
            if (operation === 'delete') await workspaceApi.remove(id);
            else await workspaceApi.action(id, operation);
            await load();
        } catch (reason) { setError(messageOf(reason)); } finally { setBusy(''); }
    };
    return <>
        <PageHeader title="Workspaces" subtitle="Crea y controla tus entornos de desarrollo." />
        {error && <div className="mb-6"><Alert message={error} onClose={() => setError('')} /></div>}
        <section className="panel mb-8"><h2 className="section-title">Nuevo workspace</h2><p className="section-subtitle">Elige un nombre y una imagen para crear un entorno listo para usar.</p><div className="mt-4 flex flex-col gap-3 md:flex-row"><input className="field mt-0 flex-1" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="Nombre del workspace" aria-label="Nombre del workspace" /><select className="field mt-0 md:max-w-xs" value={image} onChange={(event) => { setImage(event.target.value); setError(''); }} aria-label="Imagen de contenedor"><option value="">Selecciona una imagen</option>{images.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button className="primary-button" disabled={busy === 'create' || loading} onClick={create}>+ Crear</button></div></section>
        {loading ? <Loading /> : items.length === 0 ? <EmptyState text="No tienes workspaces todavía." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <WorkspaceCard key={item.id} workspace={item} busy={busy} onAction={action} />)}</div>}
    </>;
}
