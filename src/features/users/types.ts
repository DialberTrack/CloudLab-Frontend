import type { Role } from '@/features/auth/types';

/** Usuario tal como lo devuelve la administración (`/admin/users`). */
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export type UpdateUserInput = Partial<Pick<User, 'name' | 'email' | 'role' | 'is_active'>>;

/** La contraseña temporal solo se entrega una vez. */
export type ResetPasswordResult = {
  id: string;
  email: string;
  newPassword: string;
};
