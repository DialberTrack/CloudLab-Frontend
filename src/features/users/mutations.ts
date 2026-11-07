import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './api';
import { userKeys } from './keys';
import type { CreateUserInput, UpdateUserInput } from './types';

/** Tras cualquier cambio de usuarios se invalidan listados y detalles. */
function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useResetUserPassword() {
  return useMutation({ mutationFn: (id: string) => usersApi.resetPassword(id) });
}
