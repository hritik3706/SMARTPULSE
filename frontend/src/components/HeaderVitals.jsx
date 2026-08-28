import { Battery, BatteryCharging, BatteryLow, Clock, Monitor, Layers } from "lucide-react";
import { formatPercent } from "../utils/format";

function Vital({ icon: Icon, label, value, tone = "muted", className = "" }) {
  return (
    <span className={`vital is-${tone} ${className}`.trim()} title={label}>
      <Icon size={14} />
      <strong>{value}</strong>
    </span>
  );
}

function batteryTone(battery) {
  if (!battery?.available || battery.percent == null) return "muted";
  if (battery.percent <= 15 && !battery.plugged) return "danger";
  if (battery.percent <= 30 && !battery.plugged) return "warning";
  return "success";
}

export function HeaderVitals({ metrics }) {
  const battery = metrics?.battery;
  const BatteryIcon = !battery?.available
    ? Battery
    : battery.plugged
      ? BatteryCharging
      : battery.percent <= 20
        ? BatteryLow
        : Battery;

  const batteryValue = battery?.available
    ? `${formatPercent(battery.percent)}${battery.plugged ? " · AC" : ""}`
    : "Desktop";

  return (
    <div className="topbar-vitals" aria-label="System vitals">
      <Vital icon={BatteryIcon} label="Battery" value={batteryValue} tone={batteryTone(battery)} />
      <Vital icon={Clock} label="PC uptime" value={metrics?.uptime || "—"} />
      <Vital icon={Layers} label="Processes" value={metrics?.process_count != null ? String(metrics.process_count) : "—"} />
      <Vital icon={Monitor} label="Host" value={metrics?.hostname || metrics?.os || "—"} className="vital-host" />
    </div>
  );
}
