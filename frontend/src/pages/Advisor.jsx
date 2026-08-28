import { useState } from "react";
import toast from "react-hot-toast";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { StatusBadge } from "../components/StatusBadge";
import { getUpgradeAdvice } from "../services/api";
import { displayText, formatGb } from "../utils/format";

function toneForLevel(level) {
  if (level === "HIGH") return "danger";
  if (level === "MEDIUM") return "warning";
  return "success";
}

export function Advisor({ metrics, online, onRetry }) {
  const [budget, setBudget] = useState(10000);
  const [advice, setAdvice] = useState(null);
  const [busy, setBusy] = useState(false);

  async function analyze() {
    setBusy(true);
    try {
      setAdvice(await getUpgradeAdvice(budget));
    } catch {
      toast.error("Could not analyze an upgrade path");
    } finally {
      setBusy(false);
    }
  }

  const system = advice?.system;
  const priorities = advice?.priorities || [];

  return (
    <div className="page">
      {!online && !metrics ? <ErrorState title="Backend unavailable" body="Upgrade analysis needs live hardware telemetry." onRetry={onRetry} /> : null}

      <div className="page-head">
        <h1>Upgrade advisor</h1>
        <p>Ranks RAM, storage, GPU, and CPU against live utilization, then suggests a spend path for your budget.</p>
      </div>

      <section className="panel diag-grid">
        <div className="diag-cell">
          <div className="label">CPU</div>
          <p style={{ marginTop: 8 }}>{displayText(system?.cpu || metrics?.cpu_name)}</p>
        </div>
        <div className="diag-cell">
          <div className="label">GPU</div>
          <p style={{ marginTop: 8 }}>{metrics?.gpu_available ? displayText(system?.gpu || metrics?.gpu_name) : "GPU telemetry unavailable"}</p>
        </div>
        <div className="diag-cell">
          <div className="label">Memory / storage</div>
          <p style={{ marginTop: 8 }}>{formatGb(system?.ram_gb ?? metrics?.total_ram_gb)} · {formatGb(system?.storage_gb ?? metrics?.disk_total_gb)}</p>
        </div>
      </section>

      <section className="panel panel-pad">
        <div className="field">
          <label htmlFor="budget">Budget</label>
          <div className="kpi-value" style={{ fontSize: 28 }}>₹{budget.toLocaleString("en-IN")}</div>
          <input id="budget" className="range" type="range" min="2000" max="100000" step="1000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
          <div className="seg" style={{ marginTop: 10 }}>
            {[5000, 10000, 25000, 50000].map((amount) => (
              <button
                key={amount}
                type="button"
                className={budget === amount ? "is-active" : ""}
                onClick={() => setBudget(amount)}
              >
                ₹{amount.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={analyze} disabled={busy || !online}>
          {busy ? "Analyzing…" : "Analyze upgrade"}
        </button>
      </section>

      {advice ? (
        <section className="panel panel-pad">
          <div className="label">Upgrade priority</div>
          {priorities.map((item) => (
            <div className="setting-row" key={item.component} style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ justifyContent: "flex-start", gap: 8 }}>
                  <strong>{item.component}</strong>
                  <StatusBadge tone={toneForLevel(item.level)}>{item.level}</StatusBadge>
                </div>
                <p className="muted" style={{ marginTop: 6 }}>{item.reason}</p>
                <p style={{ marginTop: 6 }}>{item.recommendation || "No change required at this budget."}</p>
              </div>
              <div className="priority-bar" style={{ width: 120 }}>
                <div className="bar"><span style={{ width: `${item.score}%` }} /></div>
              </div>
            </div>
          ))}
          <p className="muted" style={{ marginTop: 8 }}>Estimated gain {advice.estimated_gain}</p>
          {advice.priority?.length ? (
            <p className="muted" style={{ marginTop: 6 }}>Focus: {Array.isArray(advice.priority) ? advice.priority.join(", ") : advice.priority}</p>
          ) : null}
        </section>
      ) : (
        <EmptyState title="No analysis yet" body="Set a budget and analyze priority from real utilization." />
      )}
    </div>
  );
}
