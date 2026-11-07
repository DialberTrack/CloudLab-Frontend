import { Link } from 'react-router-dom';
import { paths } from '@/shared/config/routes';
import { useListParams } from '@/shared/hooks/useListParams';
import { Alert } from '@/shared/ui/Alert';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Pagination } from '@/shared/ui/Pagination';
import { QueryContent } from '@/shared/ui/QueryContent';
import { SearchInput } from '@/shared/ui/SearchInput';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { useWorkspaceOperations } from '../mutations';
import { useWorkspaces } from '../queries';

const PAGE_SIZE = 12;

export function WorkspacesPage() {
  const { params, q, setPage, setQuery } = useListParams(PAGE_SIZE);
  const workspacesQuery = useWorkspaces(params);
  const operations = useWorkspaceOperations();

  return (
    <>
      <PageHeader
        title="Workspaces"
        subtitle="Controla tus entornos de desarrollo."
        action={
          <Link className="primary-button" to={paths.images}>
            + Nuevo workspace
          </Link>
        }
      />
      {operations.error && (
        <Alert className="mb-6" message={operations.error} onClose={operations.clearError} />
      )}
      <div className="mb-5 flex justify-end">
        <SearchInput value={q} placeholder="Buscar workspace..." onSearch={setQuery} />
      </div>
      <QueryContent
        query={workspacesQuery}
        isEmpty={({ items }) => items.length === 0}
        empty={
          <EmptyState
            text={
              q
                ? 'No hay workspaces que coincidan con la búsqueda.'
                : 'No tienes workspaces todavía.'
            }
            action={
              !q && (
                <Link className="ghost-button" to={paths.images}>
                  Crear workspace
                </Link>
              )
            }
          />
        }
      >
        {({ items, pagination }) => (
          <>
            <div className="gap-4 grid md:grid-cols-2 xl:grid-cols-3">
              {items.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  busy={operations.isBusy(workspace.id)}
                  onRun={(operation) => void operations.run(workspace.id, operation)}
                  onDelete={() => void operations.remove(workspace)}
                />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </QueryContent>
    </>
  );
}
