const LOCALE = 'es-MX';

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString(LOCALE);

export const formatDateTime = (iso: string) => new Date(iso).toLocaleString(LOCALE);

export const formatBytes = (value = 0) => {
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = value;
  let unit = -1;
  do {
    size /= 1024;
    unit += 1;
  } while (size >= 1024 && unit < units.length - 1);
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
};
