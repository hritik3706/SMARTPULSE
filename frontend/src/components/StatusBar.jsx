import { formatPercent, formatSpeed, scoreState } from "../utils/format";

const PAGE_LABELS = {
  dashboard: "dashboard",
  performance: "performance",
  processes: "processes",
  doctor: "diagnostics",
  optimizer: "optimizer",
  advisor: "advisor",
  reports: "reports",
  settings: "settings",
};

export function StatusBar({ metrics, ai, online, page }) {
  const score = scoreState(ai?.health_score, metrics);
  const scoreClass = score.tone === "danger" ? "bad" : score.tone === "warning" ? "warn" : "ok";
  return (
    <footer className="status-bar" aria-label="Live engine readout">
      <span className={online ? "ok engine-live" : "bad"}>{online ? "ENGINE LIVE" : "OFFLINE"}</span>
      <span title="CPU utilization">CPU <strong className="tabular">{formatPercent(metrics?.cpu)}</strong></span>
      <span title="Memory utilization">MEM <strong className="tabular">{formatPercent(metrics?.ram)}</strong></span>
      <span title="GPU utilization">GPU <strong className="tabular">{metrics?.gpu_available ? formatPercent(metrics?.gpu) : "—"}</strong></span>
      <span title="Disk used">DSK <strong className="tabular">{formatPercent(metrics?.disk)}</strong></span>
      <span title="Download speed">NET <strong className="tabular">{formatSpeed(metrics?.download_speed)}</strong></span>
      <span className={scoreClass} title="SMARTPULSE health score">SCORE <strong className="tabular">{ai?.health_score ?? "—"} {score.label}</strong></span>
      <span style={{ marginLeft: "auto" }}>{PAGE_LABELS[page] || page}</span>
    </footer>
  );
}
