import { useCallback, useEffect, useState } from 'react';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { PageHeader } from '../../components/PageHeader';
import { workspaceApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { Workspace } from '../../types/api';
import { WorkspaceCard } from '../../features/workspaces/WorkspaceCard';

export function WorkspacesPage() {
    const [items, setItems] = useState<Workspace[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const load = useCallback(
        () => workspaceApi.list().then((response) => setItems(response.data)),
        []
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
            if (operation === 'delete') await workspaceApi.remove(id);
            else await workspaceApi.action(id, operation);
            await load();
        } catch (reason) {
            setError(messageOf(reason));
        } finally {
            setBusy('');
        }
    };
    return (
        <>
            <PageHeader title="Workspaces" subtitle="Controla tus entornos de desarrollo." />
            {error && (
                <div className="mb-6">
                    <Alert message={error} onClose={() => setError('')} />
                </div>
            )}
            {loading ? (
                <Loading />
            ) : items.length === 0 ? (
                <EmptyState text="No tienes workspaces todavía." />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                        <WorkspaceCard
                            key={item.id}
                            workspace={item}
                            busy={busy}
                            onAction={action}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
