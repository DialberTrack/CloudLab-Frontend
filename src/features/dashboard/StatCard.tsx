import { cx } from '@/shared/lib/cx';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: string;
  accent?: boolean;
};

export function StatCard({ label, value, icon, accent = false }: StatCardProps) {
  return (
    <div className="panel items-center gap-4 flex">
      <div
        className={cx(
          'grid h-12 w-12 place-items-center rounded-xl text-xl',
          accent ? 'bg-emerald-500/10 text-emerald-300' : 'bg-violet-500/10 text-violet-300'
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
