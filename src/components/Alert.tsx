export function Alert({ message, onClose }: { message: string; onClose?: () => void }) {
    return (
        <div className="alert">
            <span>{message}</span>
            {onClose && <button onClick={onClose}>×</button>}
        </div>
    );
}
