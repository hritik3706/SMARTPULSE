import { formatPercent, formatSpeed, metricStatus } from "../utils/format";

function Tick({ label, value, sub, tone }) {
  return (
    <div className="metric-tick">
      <div className="kicker">{label}</div>
      <div className="tick-value tabular">{value}</div>
      {sub ? <div className="tick-sub">{sub}</div> : null}
      {tone ? <span className={`status-dot ${tone === "success" ? "online" : tone === "danger" ? "offline" : ""}`} style={{ marginTop: 6 }} /> : null}
    </div>
  );
}

export function MetricsPanel({ metrics, ai }) {
  const gpuOk = Boolean(metrics?.gpu_available);
  const health = ai?.health_score;
  const status = metricStatus(typeof health === "number" ? 100 - health : metrics?.ram, { warn: 20, crit: 50 });

  return (
    <aside className="metrics-rail" aria-label="Live metrics">
      <Tick label="Health" value={typeof health === "number" ? String(health) : "—"} sub={ai?.severity || "Waiting"} />
      <Tick label="CPU" value={formatPercent(metrics?.cpu)} sub={metrics?.cpu_name ? String(metrics.cpu_name).split(" ").slice(-2).join(" ") : "—"} />
      <Tick label="Memory" value={formatPercent(metrics?.ram)} sub={metrics?.ram_used_gb != null ? `${metrics.ram_used_gb}/${metrics.total_ram_gb} GB` : "—"} />
      <Tick label="GPU" value={gpuOk ? formatPercent(metrics?.gpu) : "—"} sub={gpuOk && metrics?.gpu_temperature != null ? `${metrics.gpu_temperature}°C` : "Not detected"} />
      <Tick label="Storage" value={formatPercent(metrics?.disk)} sub={metrics?.disk_free_gb != null ? `${metrics.disk_free_gb} GB free` : "—"} />
      <Tick label="Network" value={formatSpeed(metrics?.download_speed)} sub={`↑ ${formatSpeed(metrics?.upload_speed)}`} />
      <Tick
        label="Status"
        value={status.label}
        tone={status.tone}
        sub={metrics?.hostname || ""}
      />
    </aside>
  );
}
