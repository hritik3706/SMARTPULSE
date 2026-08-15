import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmModal } from "../components/ConfirmModal";
import { ErrorState } from "../components/ErrorState";
import { runOptimize, scanOptimizer } from "../services/api";
import { formatBytes } from "../utils/format";

const ACTIONS = [
  { id: "temp", label: "Temporary files", help: "User and Windows temp folders only." },
  { id: "cache", label: "Internet cache", help: "INetCache. Does not modify system files." },
  { id: "thumbnails", label: "Thumbnail cache", help: "Explorer thumbcache files." },
  { id: "dns", label: "DNS resolver", help: "Flush DNS cache. No files deleted." },
  { id: "recycle", label: "Recycle Bin", help: "Permanently empties the Recycle Bin." },
];

const HISTORY_KEY = "smartpulse.optimizeHistory";

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function Optimizer({ online, onRetry }) {
  const [scan, setScan] = useState(null);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [mode, setMode] = useState("manual");
  const [historyLog, setHistoryLog] = useState(readHistory);
  const [selected, setSelected] = useState(() => new Set(["temp", "cache", "thumbnails", "dns"]));
  const [steps, setSteps] = useState([]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleScan() {
    setScanning(true);
    setResult(null);
    try {
      setScan(await scanOptimizer());
    } catch (error) {
      toast.error(error.response?.data?.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await scanOptimizer();
        if (!cancelled) setScan(data);
      } catch {
        if (!cancelled) setScan(null);
      }
    }
    if (online) load();
    return () => {
      cancelled = true;
    };
  }, [online]);

  async function handleOptimize() {
    setRunning(true);
    setConfirm(false);
    const chosen = [...selected];
    setSteps(chosen.map((id) => ({ id, state: "pending" })));
    try {
      const data = await runOptimize(chosen);
      const details = data.details?.details || data.details || [];
      setSteps(chosen.map((id) => {
        const item = (Array.isArray(details) ? details : []).find((entry) => entry.id === id);
        return { id, state: item?.ok ? "done" : "skip", bytes: item?.bytes || 0 };
      }));
      if (data.success) {
        setResult(data);
        const entry = { at: new Date().toISOString(), recovered: data.recovered_bytes || 0 };
        const next = [entry, ...historyLog].slice(0, 8);
        setHistoryLog(next);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        toast.success("Maintenance complete");
        handleScan();
      } else {
        toast.error(data.message || "Optimization failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Optimization failed");
    } finally {
      setRunning(false);
    }
  }

  const items = scan?.items || [];
  const details = result?.details?.details || result?.details || [];
  const recoverable = scan?.total_bytes || 0;

  return (
    <div className="page">
      {!online ? <ErrorState title="Engine offline" body="Maintenance needs the local backend." onRetry={onRetry} /> : null}

      <div className="page-head">
        <h1>Optimizer</h1>
        <p>Scan first. Only the selected caches are cleared. Installed apps are not touched.</p>
      </div>

      <div className="opt-grid">
        <section className="opt-card">
          <div className="label">Recoverable</div>
          <div className="opt-pnl tabular">{scanning ? "Scanning…" : formatBytes(recoverable)}</div>
          <p className="muted" style={{ marginTop: 6 }}>Measured from temp, cache, and thumbnails on this machine.</p>
          <div className="row" style={{ marginTop: 14, justifyContent: "flex-start" }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={running || !online}
              onClick={() => {
                setSelected(new Set(["temp", "cache", "thumbnails", "dns"]));
                setMode("quick");
                setConfirm(true);
              }}
            >
              Run safe clean
            </button>
            <button type="button" className="btn" onClick={handleScan} disabled={scanning || running || !online}>
              {scanning ? "Scanning…" : "Rescan"}
            </button>
          </div>
        </section>

        <section className="opt-card">
          <div className="label">Last run</div>
          <div className="kpi-value tabular" style={{ fontSize: 26 }}>
            {result ? formatBytes(result.recovered_bytes) : historyLog[0] ? formatBytes(historyLog[0].recovered) : "—"}
          </div>
          <p className="muted" style={{ marginTop: 6 }}>
            {result ? "This session" : historyLog[0] ? new Date(historyLog[0].at).toLocaleString() : "No run yet"}
          </p>
          {steps.length ? (
            <div style={{ marginTop: 10 }}>
              {steps.map((step) => (
                <div className="opt-step" key={step.id}>
                  <span className={step.state === "done" ? "ok" : step.state === "skip" ? "warn" : "muted"}>
                    {step.state === "done" ? "Done" : step.state === "skip" ? "Skip" : running ? "Working" : "Queued"}
                  </span>
                  <span>{ACTIONS.find((item) => item.id === step.id)?.label}</span>
                  <span className="tabular" style={{ marginLeft: "auto" }}>{step.bytes ? formatBytes(step.bytes) : ""}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <section className="panel panel-pad">
        <div className="row">
          <div>
            <div className="section-title">Actions</div>
            <p className="muted" style={{ marginTop: 4 }}>Select what to clear. Recycle Bin stays off unless you enable it.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setMode("manual");
              setConfirm(true);
            }}
            disabled={running || selected.size === 0 || !online}
          >
            {running ? "Working…" : "Run selected"}
          </button>
        </div>

        <div style={{ marginTop: 8 }}>
          {ACTIONS.map((action) => {
            const scanned = items.find((item) => item.id === action.id);
            const on = selected.has(action.id);
            return (
              <label className={`check-row ${on ? "is-on" : ""}`} key={action.id}>
                <span>
                  <input type="checkbox" checked={on} onChange={() => toggle(action.id)} />
                  {" "}
                  <strong>{action.label}</strong>
                  <div className="muted" style={{ marginTop: 2 }}>{action.help}</div>
                </span>
                <strong className="tabular">{scanned ? formatBytes(scanned.bytes) : action.id === "dns" ? "Ready" : "—"}</strong>
              </label>
            );
          })}
        </div>
      </section>

      {result ? (
        <section className="panel panel-pad">
          <div className="label">Execution report</div>
          {(Array.isArray(details) ? details : []).map((item) => (
            <div className="check-row" key={item.id || item.label}>
              <span>{item.ok ? "Done" : "Skipped"} · {item.label}</span>
              {item.bytes ? <span className="muted tabular">{formatBytes(item.bytes)}</span> : null}
            </div>
          ))}
        </section>
      ) : null}

      {historyLog.length ? (
        <section className="panel panel-pad">
          <div className="label">History</div>
          {historyLog.map((item) => (
            <div className="report-row" key={item.at}>
              <span>{new Date(item.at).toLocaleString()}</span>
              <strong className="tabular">{formatBytes(item.recovered)}</strong>
            </div>
          ))}
        </section>
      ) : null}

      {confirm ? (
        <ConfirmModal
          title={mode === "quick" ? "Run safe clean?" : "Run selected maintenance?"}
          body="Clears only the items you checked. System files and installed applications are not modified."
          confirmLabel="Run"
          onCancel={() => setConfirm(false)}
          onConfirm={handleOptimize}
        />
      ) : null}
    </div>
  );
}
