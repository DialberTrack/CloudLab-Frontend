import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListParams } from '@/shared/api/types';
import { usersApi } from './api';
import { userKeys } from './keys';

export const useUsers = (params: ListParams) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.get(id),
  });
