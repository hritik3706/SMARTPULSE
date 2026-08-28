import { ThemeToggle } from "../components/ThemeToggle";
import { Input } from "../components/Input";
import { API_URL } from "../services/api";
import { useBackendStatus } from "../hooks/useBackendStatus";
import { ALLOWED_INTERVALS } from "../hooks/useSettings";

const INTERVAL_LABELS = {
  1000: "1 second",
  2000: "2 seconds",
  5000: "5 seconds",
  10000: "10 seconds",
};

const INTERVALS = ALLOWED_INTERVALS.map((ms) => ({ ms, label: INTERVAL_LABELS[ms] || `${ms} ms` }));
const ENGINE_ORIGIN = API_URL || (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:5000");

export function Settings({ settings, update, online }) {
  const status = useBackendStatus();
  return (
    <div className="page">
      <div className="page-head">
        <h1>Settings</h1>
        <p>Appearance, monitoring cadence, and connection details.</p>
      </div>

      <section className="panel panel-pad">
        <div className="section-title">Appearance</div>
        <div className="setting-row">
          <div>
            <strong>Theme</strong>
            <div className="muted">Light, dark, or follow the system.</div>
          </div>
          <ThemeToggle />
        </div>
        <div className="setting-row">
          <div>
            <strong>Display name</strong>
            <div className="muted">Used in the dashboard greeting.</div>
          </div>
          <Input
            id="display-name"
            type="text"
            value={settings.displayName}
            onChange={(event) => update({ displayName: event.target.value })}
            aria-label="Display name"
          />
        </div>
      </section>

      <section className="panel panel-pad">
        <div className="section-title">Monitoring</div>
        <div className="setting-row">
          <div>
            <strong>Refresh interval</strong>
            <div className="muted">How often live metrics are requested.</div>
          </div>
          <div className="seg">
            {INTERVALS.map((item) => (
              <button
                key={item.ms}
                type="button"
                className={settings.interval === item.ms ? "is-active" : ""}
                onClick={() => update({ interval: item.ms })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel-pad">
        <div className="section-title">Backend</div>
        <div className="setting-row">
          <div>
            <strong>API origin</strong>
            <div className="muted">Local Vite proxies /api to the engine. Hosted UI uses 127.0.0.1:5000.</div>
          </div>
          <span className="mono">{ENGINE_ORIGIN}</span>
        </div>
        <div className="setting-row">
          <div>
            <strong>Status</strong>
            <div className="muted">Current monitoring engine reachability.</div>
          </div>
          <span>{online || status.connected ? `Connected${status.latency != null ? ` · ${status.latency} ms` : ""}` : "Unavailable"}</span>
        </div>
      </section>

      <section className="panel panel-pad">
        <div className="section-title">About</div>
        <div className="setting-row">
          <div>
            <strong>SMARTPULSE Nexus</strong>
            <div className="muted">Live system intelligence · Diagnostic Engine v3</div>
          </div>
          <span className="muted">3.0</span>
        </div>
        <div className="setting-row">
          <div>
            <strong>Source</strong>
            <div className="muted">Repository and hosted interface.</div>
          </div>
          <span className="row" style={{ gap: 8 }}>
            <a className="btn" href="https://github.com/hritik3706/SMARTPULSE" target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn" href="https://smartpulse-lovat.vercel.app" target="_blank" rel="noreferrer">Live UI</a>
          </span>
        </div>
      </section>
    </div>
  );
}
