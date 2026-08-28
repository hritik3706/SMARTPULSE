import { memo } from "react";
import { metricStatus, trendDisplay } from "../utils/format";
import { StatusBadge } from "./StatusBadge";
import { Sparkline } from "./Sparkline";

function MetricCardInner({
  label,
  value,
  percent,
  lines = [],
  history,
  color,
  warn,
  crit,
  action,
}) {
  const status = metricStatus(typeof percent === "number" ? percent : null, { warn, crit });
  const trend = trendDisplay(history);

  return (
    <div className="kpi" aria-label={label}>
      <div className="row">
        <span className="label">{label}</span>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="row" style={{ marginBottom: 4 }}>
        <span className={trend.className}>{trend.text}</span>
      </div>
      <div className="kpi-meta">
        {lines.map((line) => <span key={line}>{line}</span>)}
      </div>
      <Sparkline data={history} color={color} />
      {action}
    </div>
  );
}

export const MetricCard = memo(MetricCardInner);
