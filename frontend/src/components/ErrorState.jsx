export function ErrorState({ title, body, actionLabel = "Reconnect", onRetry }) {
  return (
    <div className="banner">
      <div>
        <strong>{title}</strong>
        <div className="muted">{body}</div>
      </div>
      {onRetry ? (
        <button type="button" className="btn" onClick={onRetry}>{actionLabel}</button>
      ) : null}
    </div>
  );
}
