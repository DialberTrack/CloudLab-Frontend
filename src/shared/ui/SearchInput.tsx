import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

type SearchInputProps = {
  /** Término aplicado actualmente (fuente de verdad externa, p. ej. la URL). */
  value: string;
  placeholder?: string;
  onSearch: (term: string) => void;
};

export function SearchInput({ value, placeholder = 'Buscar...', onSearch }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [appliedValue, setAppliedValue] = useState(value);

  // Si el término aplicado cambia desde fuera (p. ej. "atrás"), el borrador lo sigue.
  if (value !== appliedValue) {
    setAppliedValue(value);
    setDraft(value);
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(draft.trim());
  };

  const clear = () => {
    setDraft('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <form className="flex items-center gap-2" role="search" onSubmit={submit}>
      <div className="relative max-w-xs">
        <input
          ref={inputRef}
          className="field mt-0 pr-9"
          type="search"
          aria-label={placeholder}
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        {draft && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            title="Limpiar"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        className="small-button self-stretch shrink-0 px-3.5"
        aria-label="Buscar"
        title="Buscar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
