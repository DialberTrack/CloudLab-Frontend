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
    <div className="empty-state">
      <p className="empty-state-text">{text}</p>
      {action && onClick && (
        <button className="ghost-button mt-4" onClick={onClick}>
          {action}
        </button>
      )}
    </div>
  );
}
