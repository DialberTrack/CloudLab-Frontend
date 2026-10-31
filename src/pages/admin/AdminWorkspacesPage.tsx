import { useCallback, useEffect, useState } from 'react';
import { Alert } from '../../components/Alert';
import { Loading } from '../../components/Loading';
import { PageHeader } from '../../components/PageHeader';
import { adminApi, workspaceApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { Workspace } from '../../types/api';
import { statusLabel, statusStyles } from '../../features/workspaces/workspacePresentation';
import { Link } from 'react-router-dom';

export function AdminWorkspacesPage() {
    const [items, setItems] = useState<Workspace[]>([]);
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const load = useCallback(
        () =>
            adminApi
                .workspaces({ q: query, limit: 100 })
                .then((response) => setItems(response.data)),
        [query]
    );
    useEffect(() => {
        load()
            .catch((reason) => setError(messageOf(reason)))
            .finally(() => setLoading(false));
    }, [load]);
    const action = async (
        id: string,
        operation: 'start' | 'stop' | 'restart' | 'retry' | 'delete'
    ) => {
        if (operation === 'delete' && !window.confirm('¿Eliminar este workspace?')) return;
        setBusy(id + operation);
        try {
            if (operation === 'delete') {
                await workspaceApi.remove(id);
            } else {
                await workspaceApi.action(id, operation);
            }
            await load();
        } catch (reason) {
            setError(messageOf(reason));
        } finally {
            setBusy('');
        }
    };
    return (
        <>
            <PageHeader
                title="Todos los workspaces"
                subtitle="Supervisa los entornos de todos los usuarios."
            />
            {error && (
                <div className="mb-6">
                    <Alert message={error} onClose={() => setError('')} />
                </div>
            )}
            <section className="panel">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="section-title">Inventario global</h2>
                    <input
                        className="field mt-0 max-w-xs"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && load()}
                        placeholder="Buscar workspace..."
                    />
                </div>
                {loading ? (
                    <Loading />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Workspace</th>
                                    <th>Imagen</th>
                                    <th>Estado</th>
                                    <th>Propietario</th>
                                    <th>Creado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const operationLocked =
                                        Boolean(busy) ||
                                        item.status === 'creating' ||
                                        item.status === 'deleting';
                                    return (
                                        <tr key={item.id}>
                                            <td className="font-medium text-slate-200">
                                                <Link
                                                    className="hover:text-violet-300"
                                                    to={`/workspaces/${item.id}`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </td>
                                            <td>{item.image_name}</td>
                                            <td>
                                                <span
                                                    className={`status ${statusStyles[item.status]}`}
                                                >
                                                    {statusLabel[item.status]}
                                                </span>
                                            </td>
                                            <td className="font-mono text-xs">
                                                {item.user_id ?? '—'}
                                            </td>
                                            <td>
                                                {new Date(item.created_at).toLocaleDateString(
                                                    'es-MX'
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    <button
                                                        className="small-button"
                                                        disabled={
                                                            operationLocked ||
                                                            item.status === 'running'
                                                        }
                                                        onClick={() => action(item.id, 'start')}
                                                    >
                                                        Iniciar
                                                    </button>
                                                    <button
                                                        className="small-button"
                                                        disabled={
                                                            operationLocked ||
                                                            item.status === 'stopped'
                                                        }
                                                        onClick={() => action(item.id, 'stop')}
                                                    >
                                                        Detener
                                                    </button>
                                                    {item.status === 'error' ? (
                                                        <button
                                                            className="small-button small-button-primary"
                                                            disabled={operationLocked}
                                                            onClick={() => action(item.id, 'retry')}
                                                        >
                                                            Reintentar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="small-button"
                                                            disabled={
                                                                operationLocked ||
                                                                item.status !== 'running'
                                                            }
                                                            onClick={() =>
                                                                action(item.id, 'restart')
                                                            }
                                                        >
                                                            Reiniciar
                                                        </button>
                                                    )}
                                                    <button
                                                        className="small-button text-rose-300"
                                                        disabled={operationLocked}
                                                        onClick={() => action(item.id, 'delete')}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}
