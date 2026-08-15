import { ThemeToggle } from "../components/ThemeToggle";
import { Input } from "../components/Input";
import { API_URL } from "../services/api";
import { useBackendStatus } from "../hooks/useBackendStatus";

const INTERVALS = [
  { ms: 1000, label: "1 second" },
  { ms: 2000, label: "2 seconds" },
  { ms: 5000, label: "5 seconds" },
];

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
            <div className="muted">Configured via VITE_API_URL.</div>
          </div>
          <span className="mono">{API_URL}</span>
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
      </section>
    </div>
  );
}
