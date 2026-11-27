export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // almacenamiento no disponible: se usa la preferencia del sistema
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // sin persistencia: el tema sigue aplicado en esta sesión
  }
}
