import { useRef } from 'react';

type SearchInputProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export function SearchInput({
  value,
  placeholder = 'Buscar...',
  onChange,
  onSearch,
  onClear,
}: SearchInputProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2">
      <div className="relative max-w-xs">
        <input
          ref={searchRef}
          className="field mt-0 pr-9"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onSearch()}
        />
        {value && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            title="Limpiar"
            onClick={() => {
              onClear();
              searchRef.current?.focus();
            }}
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
        type="button"
        className="small-button self-stretch shrink-0 px-3.5"
        aria-label="Buscar"
        title="Buscar"
        onClick={onSearch}
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
    </div>
  );
}
