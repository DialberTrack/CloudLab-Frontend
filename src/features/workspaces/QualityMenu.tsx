import { useEffect, useRef, useState } from 'react';
import { QUALITY_CONTROLS } from './kasm-quality';
import { useKasmQuality } from './useKasmQuality';

type QualityMenuProps = ReturnType<typeof useKasmQuality>;

export function QualityMenu({
    values,
    available,
    readValues,
    updateValue,
    saveValues,
    forceImageMode,
}: QualityMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const toggle = () => {
        setOpen((current) => {
            const next = !current;
            if (next) readValues();
            return next;
        });
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                className="small-button small-button-primary"
                disabled={!available}
                onClick={toggle}
                title={!available ? 'El escritorio aún no está cargado' : undefined}
            >
                ⚙ Calidad
            </button>
            {open && (
                <div className="absolute right-0 z-10 mt-2 flex max-h-[calc(100dvh-6rem)] w-80 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111624] shadow-2xl">
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 p-4">
                        <h2 className="text-sm font-semibold text-slate-100">Calidad KasmVNC</h2>
                        <button type="button" className="small-button" onClick={forceImageMode}>
                            Forzar modo imagen
                        </button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                        {QUALITY_CONTROLS.map((control) => (
                            <label key={control.name} className="block text-xs text-slate-400">
                                <span className="mb-1 flex items-center justify-between gap-2">
                                    <span>{control.label}</span>
                                    {control.type === 'range' && (
                                        <output className="font-mono text-slate-200">
                                            {values[control.name] ?? '—'}
                                        </output>
                                    )}
                                </span>
                                {control.type === 'select' ? (
                                    <select
                                        className="field mt-0 py-2"
                                        value={values[control.name] ?? ''}
                                        onChange={(event) =>
                                            updateValue(control.name, event.target.value)
                                        }
                                    >
                                        {control.options.map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className={
                                            control.type === 'range'
                                                ? 'quality-range'
                                                : 'field mt-0 py-2'
                                        }
                                        type={control.type}
                                        min={control.min}
                                        max={control.max}
                                        value={values[control.name] ?? ''}
                                        onChange={(event) => updateValue(control.name, event.target.value)}
                                    />
                                )}
                            </label>
                        ))}
                    </div>
                    <div className="flex shrink-0 justify-end gap-2 border-t border-white/10 p-4">
                        <button
                            type="button"
                            className="small-button"
                            onClick={() => {
                                readValues();
                                setOpen(false);
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="small-button small-button-primary"
                            onClick={() => {
                                if (saveValues()) setOpen(false);
                            }}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
