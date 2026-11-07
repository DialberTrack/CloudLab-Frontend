import type { BadgeTone } from '@/shared/ui/StatusBadge';
import type { Role } from './types';

export const roleLabel: Record<Role, string> = {
  admin: 'Administrador',
  user: 'Usuario',
};

export const roleTone: Record<Role, BadgeTone> = {
  admin: 'accent',
  user: 'neutral',
};
