import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { ProcessTable } from "../components/ProcessTable";
import { ConfirmModal } from "../components/ConfirmModal";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { isProtectedProcess } from "../utils/processes";
import { killProcess } from "../services/api";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "cpu", label: "High CPU" },
  { id: "memory", label: "High memory" },
];

export function Processes({ processes, processCount, loading, online, onRetry, onKilled }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("cpu");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const rows = useMemo(() => {
    const list = [...(processes || [])];
    const q = query.trim().toLowerCase();
    return list
      .filter((item) => {
        if (q && !String(item.name || "").toLowerCase().includes(q) && !String(item.pid).includes(q)) return false;
        if (filter === "cpu") return Number(item.cpu || 0) >= 8;
        if (filter === "memory") return Number(item.memory_mb || 0) >= 300;
        return true;
      })
      .sort((a, b) => Number(b[sortKey] || 0) - Number(a[sortKey] || 0));
  }, [filter, processes, query, sortKey]);

  async function confirmKill() {
    if (!pending || isProtectedProcess(pending)) {
      setPending(null);
      return;
    }
    setBusy(true);
    try {
      const result = await killProcess(pending.pid);
      if (result.success) {
        toast.success(result.message || "Process terminated");
        onKilled?.();
      } else {
        toast.error(result.message || "Failed to terminate process");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to terminate process");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  if (loading && (!processes || processes.length === 0)) return <LoadingSkeleton />;

  return (
    <div className="page">
      {!online ? <ErrorState title="Backend unavailable" body="Process list cannot refresh." onRetry={onRetry} /> : null}

      <div className="page-head row">
        <div>
          <h1>Processes</h1>
          <p>{processCount ?? rows.length} running</p>
        </div>
      </div>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <div className="search-wrap">
          <Search size={14} />
          <input
            className="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search processes"
            aria-label="Search processes"
          />
        </div>
        <div className="seg">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? "is-active" : ""}
              onClick={() => {
                setFilter(item.id);
                setPage(1);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        {rows.length === 0 ? (
          <EmptyState title="No process data available" body="Nothing matches this search, or the engine has not returned a list yet." action={<button type="button" className="btn" onClick={onRetry}>Retry</button>} />
        ) : (
          <>
            <ProcessTable data={rows} onKillProcess={setPending} page={page} pageSize={pageSize} onSort={setSortKey} />
            <div className="row panel-pad">
              <div className="seg">
                {[25, 50, 100].map((size) => (
                  <button key={size} type="button" className={pageSize === size ? "is-active" : ""} onClick={() => { setPageSize(size); setPage(1); }}>
                    {size}
                  </button>
                ))}
              </div>
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                <span className="muted">Page {page} of {Math.max(1, Math.ceil(rows.length / pageSize))}</span>
                <button type="button" className="btn" disabled={page >= Math.ceil(rows.length / pageSize)} onClick={() => setPage((value) => value + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </section>

      {pending ? (
        <ConfirmModal
          title="Terminate process?"
          body={`${pending.name} · PID ${pending.pid}. This will close the process. Unsaved work may be lost.`}
          confirmLabel={busy ? "Working…" : "Terminate"}
          danger
          onCancel={() => setPending(null)}
          onConfirm={confirmKill}
        />
      ) : null}
    </div>
  );
}
