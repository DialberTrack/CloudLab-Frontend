import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { useErrorMessage } from '@/shared/hooks/useErrorMessage';
import { useConfirm } from '@/shared/ui/confirm';
import { workspacesApi } from './api';
import { workspaceKeys } from './keys';
import type { CreateWorkspaceInput, WorkspaceAction } from './types';

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspacesApi.create(input),
    onSuccess: (workspace) => {
      queryClient.setQueryData(workspaceKeys.detail(workspace.id), workspace);
      return queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

type OperationVariables = { id: string; action: WorkspaceAction };

/**
 * Operaciones del ciclo de vida (iniciar, detener, reiniciar, reintentar,
 * eliminar) compartidas por todas las pantallas que gestionan workspaces.
 */
export function useWorkspaceOperations() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { error, report, clear } = useErrorMessage();

  const mutation = useMutation({
    mutationKey: workspaceKeys.operation,
    mutationFn: async ({ id, action }: OperationVariables) => {
      if (action !== 'delete') return workspacesApi.run(id, action);
      await workspacesApi.remove(id);
      return undefined;
    },
    onSuccess: async (result, { id, action }) => {
      if (action !== 'delete' && result) {
        queryClient.setQueryData(workspaceKeys.detail(id), result);
        await queryClient.invalidateQueries({ queryKey: workspaceKeys.metrics(id) });
      }
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });

  const pendingIds = useMutationState({
    filters: { mutationKey: workspaceKeys.operation, status: 'pending' },
    select: (item) => (item.state.variables as OperationVariables).id,
  });

  const execute = async (variables: OperationVariables) => {
    clear();
    try {
      await mutation.mutateAsync(variables);
      return true;
    } catch (reason) {
      report(reason);
      return false;
    }
  };

  return {
    error,
    clearError: clear,
    isBusy: (id: string) => pendingIds.includes(id),
    run: (id: string, action: Exclude<WorkspaceAction, 'delete'>) => execute({ id, action }),
    /** Pide confirmación y elimina. Devuelve `true` solo si se eliminó. */
    remove: async (workspace: { id: string; name: string }) => {
      const accepted = await confirm({
        title: 'Eliminar workspace',
        message: `¿Eliminar "${workspace.name}"? También se eliminará su contenedor.`,
        confirmLabel: 'Eliminar',
        danger: true,
      });
      return accepted && execute({ id: workspace.id, action: 'delete' });
    },
  };
}
