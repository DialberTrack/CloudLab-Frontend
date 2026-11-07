import type { ReactNode } from 'react';
import { cx } from '@/shared/lib/cx';

export type BadgeTone = 'success' | 'neutral' | 'warning' | 'caution' | 'danger' | 'accent';

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  neutral: 'bg-slate-500/10 text-slate-300 ring-slate-500/20',
  warning: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  caution: 'bg-orange-500/10 text-orange-300 ring-orange-500/20',
  danger: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  accent: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
};

type StatusBadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return <span className={cx('status', toneClasses[tone], className)}>{children}</span>;
}
