export function Loading({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      {label}
    </div>
  );
}
