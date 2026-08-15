export function ConnectionStatus({ online }) {
  return (
    <span className={`badge ${online ? "success" : "danger"}`} aria-live="polite">
      <span className={`status-dot ${online ? "online" : "offline"}`} />
      {online ? "Connected" : "Unavailable"}
    </span>
  );
}
