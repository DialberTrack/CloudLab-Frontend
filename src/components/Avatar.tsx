import type { User } from '../types/api';

export function Avatar({ user, large = false }: { user: User; large?: boolean }) {
  return (
    <div className={`avatar ${large ? 'avatar-large' : 'avatar-small'}`}>
      {user.name.slice(0, 1).toUpperCase()}
    </div>
  );
}
