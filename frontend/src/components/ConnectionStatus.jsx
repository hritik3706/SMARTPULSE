export function ConnectionStatus({ online }) {
  return (
    <span className={`badge ${online ? "success" : "danger"}`} role="status" aria-live="polite">
      <span className={`status-dot ${online ? "online" : "offline"}`} />
      {online ? "Engine live" : "Engine offline"}
    </span>
  );
}
