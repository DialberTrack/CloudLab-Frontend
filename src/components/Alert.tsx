export function Alert({ message, onClose }: { message: string; onClose?: () => void }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <span>{message}</span>
            {onClose && <button onClick={onClose}>×</button>}
        </div>
    );
}
