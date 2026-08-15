export function isUnavailable(value) {
  return value === null || value === undefined || Number.isNaN(value);
}

export function formatNumber(value, digits = 1) {
  if (isUnavailable(value)) return "Unavailable";
  return Number(value).toFixed(digits);
}

export function formatPercent(value) {
  if (isUnavailable(value)) return "Unavailable";
  return `${Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 1)}%`;
}

export function formatGb(value) {
  if (isUnavailable(value)) return "Unavailable";
  return `${Number(value).toFixed(1)} GB`;
}

export function formatMhzOrGhz(ghz, mhz) {
  if (!isUnavailable(ghz)) return `${Number(ghz).toFixed(2)} GHz`;
  if (!isUnavailable(mhz)) return `${Math.round(mhz)} MHz`;
  return "Unavailable";
}

export function formatSpeed(value) {
  if (isUnavailable(value)) return "Unavailable";
  return `${Number(value).toFixed(2)} MB/s`;
}

export function formatBytes(bytes) {
  if (isUnavailable(bytes)) return "Unavailable";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = Number(bytes);
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  const digits = n >= 10 || i === 0 ? 0 : 1;
  return `${n.toFixed(digits)} ${units[i]}`;
}

export function greeting() {
  return "Hi";
}

export function relativeTime(timestamp) {
  if (!timestamp) return "Waiting";
  const seconds = Math.max(0, (Date.now() - timestamp) / 1000);
  if (seconds < 1) return "just now";
  if (seconds < 10) return `${seconds.toFixed(1)}s ago`;
  return `${Math.round(seconds)}s ago`;
}

export function metricTone(value, { warn = 75, crit = 90 } = {}) {
  if (isUnavailable(value)) return "muted";
  if (value >= crit) return "danger";
  if (value >= warn) return "warning";
  return "success";
}

export function metricStatus(value, { warn = 75, crit = 90 } = {}) {
  if (isUnavailable(value)) return { label: "Not detected", tone: "muted" };
  if (value >= crit) return { label: "Critical", tone: "danger" };
  if (value >= warn) return { label: "Warning", tone: "warning" };
  return { label: "Normal", tone: "success" };
}

export function trendFromHistory(points) {
  if (!points || points.length < 4) return { delta: null, direction: "flat" };
  const recent = points[points.length - 1]?.value;
  const older = points[Math.max(0, points.length - 8)]?.value;
  if (isUnavailable(recent) || isUnavailable(older)) {
    return { delta: null, direction: "flat" };
  }
  const delta = Number((recent - older).toFixed(1));
  if (Math.abs(delta) < 0.4) return { delta, direction: "flat" };
  return { delta, direction: delta > 0 ? "up" : "down" };
}

export function scoreState(score, metrics = {}) {
  const cpu = metrics.cpu;
  const ram = metrics.ram;
  const disk = metrics.disk;
  const crossed =
    (typeof score === "number" && score < 60) ||
    (typeof cpu === "number" && cpu >= 90) ||
    (typeof ram === "number" && ram >= 90) ||
    (typeof disk === "number" && disk >= 95);
  const watching =
    (typeof score === "number" && score < 80) ||
    (typeof cpu === "number" && cpu >= 80) ||
    (typeof ram === "number" && ram >= 80) ||
    (typeof disk === "number" && disk >= 90);

  if (typeof score !== "number" && !crossed && !watching) {
    return { tone: "muted", label: "Waiting", copy: "Collecting a live baseline." };
  }
  if (crossed) {
    return { tone: "danger", label: "Critical", copy: "A health boundary has been crossed." };
  }
  if (watching) {
    return { tone: "warning", label: "Pressure", copy: "The system is approaching a limit." };
  }
  return { tone: "success", label: "Safe", copy: "All key metrics are inside safe bounds." };
}

export function healthCopy(score, severity) {
  if (isUnavailable(score)) {
    return "Hardware information unavailable.";
  }
  if (severity === "critical") return "Your system needs attention.";
  if (severity === "warning") return "Your system is under pressure.";
  if (score >= 90) return "Your system is operating normally.";
  return "Your system is operational.";
}

export function trendDisplay(points, invert = true) {
  const trend = trendFromHistory(points);
  if (trend.delta === null) return { text: "—", className: "trend flat" };
  const sign = trend.delta > 0 ? "+" : "";
  const worse = invert ? trend.direction === "up" : trend.direction === "down";
  const className = trend.direction === "flat" ? "trend flat" : worse ? "trend worse" : "trend better";
  return { text: `${sign}${trend.delta}%`, className, delta: trend.delta };
}

export function statsFromHistory(points) {
  const values = (points || []).map((item) => item.value).filter((value) => !isUnavailable(value));
  if (!values.length) return { avg: null, peak: null };
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    avg: Number((sum / values.length).toFixed(1)),
    peak: Number(Math.max(...values).toFixed(1)),
  };
}

export function sliceHistory(points, seconds, intervalMs) {
  const count = Math.max(8, Math.ceil(seconds / Math.max(intervalMs / 1000, 0.5)));
  return (points || []).slice(-count);
}

export function displayText(value, fallback = "Unavailable") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}
