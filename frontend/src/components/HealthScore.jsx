import { scoreState } from "../utils/format";

function ScoreRing({ score, tone }) {
  const radius = 26;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const safe = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;
  const offset = circumference - (safe / 100) * circumference;
  const color = tone === "danger" ? "var(--danger)" : tone === "warning" ? "var(--warning)" : tone === "success" ? "var(--success)" : "var(--text-dim)";

  return (
    <svg className="score-ring" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={typeof score === "number" ? offset : circumference}
      />
    </svg>
  );
}

export function HealthScore({ score, metrics }) {
  const state = scoreState(score, metrics);
  return (
    <div className="health-compact" role="img" aria-label={`Health score ${score ?? "unavailable"}`}>
      <ScoreRing score={score} tone={state.tone} />
      <div className="health-copy">
        <div className="label">SMARTPULSE score</div>
        <strong className="tabular">{typeof score === "number" ? score : "—"}</strong>
        <span className={`score-pill is-${state.tone}`}>{state.label}</span>
      </div>
    </div>
  );
}

export function ScoreCard({ score, insight, metrics, onOpen }) {
  const state = scoreState(score, metrics);
  const body = insight?.body || insight?.title || state.copy;

  return (
    <aside className={`score-card is-${state.tone}`}>
      <div className="score-card-top">
        <ScoreRing score={score} tone={state.tone} />
        <div>
          <div className="label">SMARTPULSE score</div>
          <div className="score-value tabular">{typeof score === "number" ? score : "—"}</div>
          <span className={`score-pill is-${state.tone}`}>{state.label}</span>
        </div>
      </div>
      <p className="score-copy">{body}</p>
      <button
        type="button"
        className={`btn ${state.tone === "danger" ? "btn-danger" : "btn-primary"}`}
        onClick={onOpen}
        aria-label="Open diagnostics for this health score"
      >
        Open diagnostics
      </button>
    </aside>
  );
}
