import { StatusBadge } from '@/shared/ui/StatusBadge';

export function ImageStatusBadge({ active, className }: { active: boolean; className?: string }) {
  return (
    <StatusBadge tone={active ? 'success' : 'neutral'} className={className}>
      {active ? 'Activa' : 'Inactiva'}
    </StatusBadge>
  );
}
