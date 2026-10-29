export function Loading({ label = 'Cargando...' }: { label?: string }) {
    return <div className="grid min-h-48 place-items-center text-sm text-slate-500">{label}</div>;
}
