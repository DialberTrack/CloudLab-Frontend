import { cx } from '@/shared/lib/cx';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-block size-3 shrink-0 animate-spin rounded-full motion-reduce:animate-[spin_2s_linear_infinite] border-2 border-current border-t-transparent',
        className
      )}
    />
  );
}
