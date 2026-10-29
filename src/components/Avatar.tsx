import type { User } from '../types/api';

export function Avatar({ user, large = false }: { user: User; large?: boolean }) {
    return (
        <div
            className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 font-semibold text-white ${large ? 'h-20 w-20 text-2xl' : 'h-9 w-9 text-xs'}`}
        >
            {user.name.slice(0, 1).toUpperCase()}
        </div>
    );
}
