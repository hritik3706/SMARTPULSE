import { HealthScore } from "../components/HealthScore";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { formatPercent, formatSpeed } from "../utils/format";

function toneFor(status) {
  if (status === "critical") return "danger";
  if (status === "warning") return "warning";
  if (status === "unavailable") return "muted";
  return "success";
}

function mark(status) {
  if (status === "critical") return "✗";
  if (status === "warning") return "⚠";
  if (status === "unavailable") return "–";
  return "✓";
}

export function AIDoctor({ ai, metrics, loading, online, onRetry, onRefresh }) {
  if (loading && !ai) return <LoadingSkeleton />;

  const sections = ai?.sections || [];
  const recommendations = ai?.recommendations || [];
  const timeline = ai?.timeline || [];

  function exportDiagnosis() {
    const blob = new Blob([JSON.stringify(ai || {}, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smartpulse-diagnosis.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      {!online ? <ErrorState title="Backend unavailable" body="Diagnostics need live telemetry." onRetry={onRetry} /> : null}

      <div className="page-head row">
        <div>
          <h1>Diagnostics</h1>
          <p>{ai?.engine || "SMARTPULSE Nexus"} scores CPU, RAM, GPU, and disk, then lists recommended fixes · last analyzed {ai?.analyzed_at ? new Date(ai.analyzed_at).toLocaleTimeString() : "just now"}</p>
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={onRefresh}>Refresh</button>
          <button type="button" className="btn" onClick={exportDiagnosis} disabled={!ai}>Export</button>
        </div>
      </div>

      <section className="panel summary">
        <div>
          <div className="label">Overall assessment</div>
          <h2 style={{ marginTop: 8 }}>{ai?.severity ? String(ai.severity) : "Unavailable"}</h2>
          <p className="muted" style={{ marginTop: 8 }}>{ai?.diagnosis}</p>
        </div>
        <HealthScore score={ai?.health_score} severity={ai?.severity} metrics={metrics} />
      </section>

      <section className="panel panel-pad">
        <div className="section-title">Diagnosis results</div>
        <div className="stack" style={{ marginTop: 12 }}>
          {sections.map((item) => (
            <div className="setting-row" key={item.category} style={{ alignItems: "flex-start" }}>
              <div>
                <strong>{mark(item.status)} {item.category}</strong>
                <p className="muted" style={{ marginTop: 4 }}>{item.message}</p>
                <p style={{ marginTop: 4 }}>{item.recommendation}</p>
              </div>
              <StatusBadge tone={toneFor(item.status)}>{item.status}</StatusBadge>
            </div>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 12 }}>
          CPU {formatPercent(metrics?.cpu)} · Memory {formatPercent(metrics?.ram)} · Down {formatSpeed(metrics?.download_speed)}
        </div>
      </section>

      <section className="panel panel-pad">
        <div className="label">Recommended actions</div>
        <ol className="step-list" style={{ marginTop: 8 }}>
          {recommendations.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>

      <section className="panel panel-pad">
        <div className="label">Timeline</div>
        <div className="stack" style={{ marginTop: 10 }}>
          {timeline.length === 0 ? (
            <p className="muted">Events appear when conditions change.</p>
          ) : (
            timeline.slice().reverse().map((event, index) => (
              <div className="row" key={`${event.time}-${index}`} style={{ justifyContent: "flex-start" }}>
                <span className="mono dim" style={{ width: 56 }}>{event.time}</span>
                <span>{event.message}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
