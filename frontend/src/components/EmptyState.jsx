export function EmptyState({ title, body, action }) {
  return (
    <div className="empty" role="status" aria-live="polite">
      <h3 style={{ color: "var(--text)", marginBottom: 6 }}>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
}
