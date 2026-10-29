export function EmptyState({
    text,
    action,
    onClick,
}: {
    text: string;
    action?: string;
    onClick?: () => void;
}) {
    return (
        <div className="grid place-items-center rounded-xl border border-dashed border-white/10 py-14 text-center">
            <p className="text-sm text-slate-500">{text}</p>
            {action && onClick && (
                <button className="ghost-button mt-4" onClick={onClick}>
                    {action}
                </button>
            )}
        </div>
    );
}
