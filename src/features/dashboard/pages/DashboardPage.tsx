import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/routes';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { QueryContent } from '@/shared/ui/QueryContent';
import { WorkspaceRow } from '@/features/workspaces/components/WorkspaceRow';
import { useWorkspaces } from '@/features/workspaces/queries';
import { StatCard } from '../StatCard';

const RECENT_LIMIT = 5;
// Máximo que admite la API por página (openapi.yaml → parámetro `limit`).
const SUMMARY_LIMIT = 100;

export function DashboardPage() {
  const workspacesQuery = useWorkspaces({ limit: SUMMARY_LIMIT });
  const { items = [], pagination } = workspacesQuery.data ?? {};
  const countBy = (status: string) => items.filter((item) => item.status === status).length;

  return (
    <>
      <PageHeader
        title="Tu espacio de trabajo"
        subtitle="Todo lo que necesitas para desarrollar, en un solo lugar."
      />
      <div className="gap-4 grid sm:grid-cols-3">
        <StatCard label="Workspaces totales" value={pagination?.total ?? '—'} icon="◈" />
        <StatCard
          label="En ejecución"
          value={workspacesQuery.data ? countBy('running') : '—'}
          icon="◉"
          accent
        />
        <StatCard
          label="Con error"
          value={workspacesQuery.data ? countBy('error') : '—'}
          icon="⚠"
        />
      </div>
      <section className="panel mt-8">
        <div className="items-center justify-between flex mb-6">
          <div>
            <h2 className="section-title">Actividad reciente</h2>
            <p className="section-subtitle">Tus entornos más recientes</p>
          </div>
          <Link className="ghost-button" to={paths.workspaces}>
            Ver todos →
          </Link>
        </div>
        <QueryContent
          query={workspacesQuery}
          isEmpty={(page) => page.items.length === 0}
          empty={
            <EmptyState
              text="Aún no tienes workspaces creados."
              action={
                <Link className="ghost-button" to={paths.images}>
                  Crear workspace
                </Link>
              }
            />
          }
        >
          {(page) => (
            <div className="space-y-2">
              {page.items.slice(0, RECENT_LIMIT).map((workspace) => (
                <WorkspaceRow key={workspace.id} workspace={workspace} />
              ))}
            </div>
          )}
        </QueryContent>
      </section>
    </>
  );
}
