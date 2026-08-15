export function StatusBadge({ tone = "muted", children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
