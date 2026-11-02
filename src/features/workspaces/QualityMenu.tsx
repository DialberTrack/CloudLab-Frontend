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
        <div ref={menuRef} className="quality-menu">
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
                <div className="quality-panel">
                    <div className="quality-panel-header">
                        <h2 className="quality-panel-title">Calidad KasmVNC</h2>
                        <button type="button" className="small-button" onClick={forceImageMode}>
                            Forzar modo imagen
                        </button>
                    </div>
                    <div className="quality-panel-controls">
                        {QUALITY_CONTROLS.map((control) => (
                            <label key={control.name} className="quality-control">
                                <span className="quality-control-label">
                                    <span>{control.label}</span>
                                    {control.type === 'range' && (
                                        <output className="quality-control-value">
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
                                        onChange={(event) =>
                                            updateValue(control.name, event.target.value)
                                        }
                                    />
                                )}
                            </label>
                        ))}
                    </div>
                    <div className="quality-panel-actions">
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
