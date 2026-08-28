export function StatusBadge({ tone = "muted", children }) {
  return <span className={`badge ${tone}`} role="status">{children}</span>;
}
