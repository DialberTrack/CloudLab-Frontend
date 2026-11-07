import { http } from '@/shared/api/http';
import type { ListParams } from '@/shared/api/types';
import type { CreateUserInput, ResetPasswordResult, UpdateUserInput, User } from './types';

export const usersApi = {
  list: (params?: ListParams) => http.page<User>('/admin/users', params),

  get: (id: string) => http.get<User>(`/admin/users/${id}`),

  create: (input: CreateUserInput) => http.post<User>('/admin/users', input),

  update: (id: string, input: UpdateUserInput) => http.patch<User>(`/admin/users/${id}`, input),

  remove: (id: string) => http.remove(`/admin/users/${id}`),

  resetPassword: (id: string) =>
    http.post<ResetPasswordResult>(`/admin/users/${id}/reset-password`),
};
