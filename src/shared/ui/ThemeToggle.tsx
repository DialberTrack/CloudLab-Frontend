import { useTheme } from '@/shared/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'claro' : 'oscuro';
  return (
    <button
      type="button"
      className="small-button"
      onClick={toggle}
      aria-label={`Cambiar a modo ${next}`}
      title={`Cambiar a modo ${next}`}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
