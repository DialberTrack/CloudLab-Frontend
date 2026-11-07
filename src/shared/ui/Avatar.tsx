export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <div className={`avatar ${large ? 'avatar-large' : 'avatar-small'}`} aria-hidden="true">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
