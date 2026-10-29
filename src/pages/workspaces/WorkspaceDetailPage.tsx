import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { Loading } from '../../components/Loading';
import { PageHeader } from '../../components/PageHeader';
import { workspaceApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { Workspace } from '../../types/api';
import { statusLabel, statusStyles } from '../../features/workspaces/workspacePresentation';
import { MetricsPanel } from '../../features/workspaces/MetricsPanel';

export function WorkspaceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const load = useCallback(async () => {
        if (!id) return;
        setRefreshing(true);
        try {
            const [details, data] = await Promise.allSettled([
                workspaceApi.get(id),
                workspaceApi.metrics(id),
            ]);
            if (details.status === 'fulfilled') {
                setWorkspace(details.value);
            }
            if (data.status === 'fulfilled') {
                setMetrics(data.value.data);
            }
            const rejected = [details, data].find((result) => result.status === 'rejected');
            if (rejected?.status === 'rejected') {
                setError(messageOf(rejected.reason));
            } else {
                setError('');
            }
        } catch (reason) {
            setError(messageOf(reason));
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [id]);
    useEffect(() => {
        void load();
    }, [load]);
    const run = async (operation: 'start' | 'stop' | 'restart') => {
        if (!id) return;
        setBusy(true);
        try { setWorkspace(await workspaceApi.action(id, operation)); } catch (reason) { setError(messageOf(reason)); } finally { setBusy(false); }
    };
    const remove = async () => {
        if (!id || !window.confirm('¿Eliminar este workspace?')) return;
        try { await workspaceApi.remove(id); navigate('/workspaces'); } catch (reason) { setError(messageOf(reason)); }
    };
    if (loading) return <Loading />;
    const operationLocked =
        Boolean(busy) || workspace?.status === 'creating' || workspace?.status === 'deleting';
    const startDisabled = operationLocked || workspace?.status === 'running';
    const stopDisabled = operationLocked || workspace?.status === 'stopped';
    const restartDisabled = operationLocked || workspace?.status !== 'running';
    return <>
        <Link to="/workspaces" className="mb-6 inline-block text-sm text-slate-500 hover:text-slate-200">← Volver a workspaces</Link>
        {error && <div className="mb-6"><Alert message={error} /></div>}
        {workspace && <><PageHeader title={workspace.name} subtitle={`${workspace.image_name} · ${workspace.image}`} action={<div className="flex items-center gap-2"><button className="ghost-button" disabled={refreshing} onClick={() => void load()}>{refreshing ? 'Actualizando...' : '↻ Refrescar'}</button><span className={`status ${statusStyles[workspace.status]}`}>{statusLabel[workspace.status]}</span></div>} /><div className="grid gap-6 lg:grid-cols-2"><section className="panel"><h2 className="section-title">Operaciones</h2><div className="mt-5 flex flex-wrap gap-2"><button className="small-button small-button-primary" disabled={startDisabled} title={startDisabled ? 'El workspace ya está activo o está cambiando de estado' : undefined} onClick={() => run('start')}>▶ Iniciar</button><button className="small-button" disabled={stopDisabled} title={stopDisabled ? 'El workspace ya está detenido o está cambiando de estado' : undefined} onClick={() => run('stop')}>■ Detener</button><button className="small-button" disabled={restartDisabled} title={restartDisabled ? 'Solo puedes reiniciar un workspace activo' : undefined} onClick={() => run('restart')}>↻ Reiniciar</button><button className="small-button text-rose-300" disabled={operationLocked} onClick={remove}>Eliminar</button></div><dl className="mt-8 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Container</dt><dd className="font-mono text-xs">{workspace.container_id ?? 'No asignado'}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Creado</dt><dd>{new Date(workspace.created_at).toLocaleString('es-MX')}</dd></div></dl></section><section className="panel"><h2 className="section-title">Métricas Docker</h2>{metrics ? <MetricsPanel value={metrics} /> : <p className="mt-5 text-sm text-slate-500">No hay métricas disponibles.</p>}</section></div></>}
    </>;
}
