import { StatusBadge } from '@/shared/ui/StatusBadge';

export function UserStatusBadge({ active }: { active: boolean }) {
  return (
    <StatusBadge tone={active ? 'success' : 'neutral'}>
      {active ? 'Activo' : 'Inactivo'}
    </StatusBadge>
  );
}
