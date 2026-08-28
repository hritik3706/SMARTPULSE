export function ProgressBar({ value = 0, label, status = "normal" }) {
  const tone = status === "danger" ? "var(--danger)" : status === "warning" ? "var(--warning)" : "var(--success)";
  const width = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div>
      {label ? <div className="row" style={{ marginBottom: 6 }}><span className="label">{label}</span><span className="tabular">{width}%</span></div> : null}
      <div className="pressure" role="progressbar" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100} aria-label={label || "Usage"}>
        <span style={{ width: `${width}%`, background: tone }} />
      </div>
    </div>
  );
}
