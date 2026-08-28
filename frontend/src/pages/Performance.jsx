import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { ProgressBar } from "../components/ProgressBar";
import { SoftAreaChart, ActivityGrid } from "../components/SoftCharts";
import {
  displayText,
  formatGb,
  formatMhzOrGhz,
  formatPercent,
  formatSpeed,
  metricStatus,
  sliceHistory,
  statsFromHistory,
} from "../utils/format";

function Spec({ label, value }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div style={{ marginTop: 6, fontWeight: 800, fontSize: 18 }}>{value}</div>
    </div>
  );
}

export function Performance({ metrics, history, loading, online, interval, onRetry }) {
  if (loading && !metrics) return <LoadingSkeleton />;

  const gpuOk = Boolean(metrics?.gpu_available);
  const battery = metrics?.battery;
  const cpuHist = sliceHistory(history?.cpu, 300, interval);
  const ramHist = sliceHistory(history?.ram, 300, interval);
  const gpuHist = sliceHistory(history?.gpu, 300, interval);
  const diskHist = sliceHistory(history?.disk, 300, interval);
  const netHist = sliceHistory(history?.netDown, 300, interval);
  const cpuStats = statsFromHistory(cpuHist);

  return (
    <div className="page" style={{ maxWidth: "none" }}>
      {!online ? <ErrorState title="Backend unavailable" body="Live telemetry is paused." onRetry={onRetry} /> : null}

      <div className="page-head">
        <h1>Performance</h1>
        <p>Live specs and charts for CPU, memory, GPU, storage, battery, and network.</p>
      </div>

      <div className="bento">
        <section className="panel span-8 lift">
          <div className="card-head">
            <div>
              <div className="section-title">Overview</div>
              <p className="muted" style={{ marginTop: 6 }}>All series, last 5 minutes</p>
            </div>
            <StatusBadge tone={metricStatus(metrics?.cpu).tone}>{metricStatus(metrics?.cpu).label}</StatusBadge>
          </div>
          <ActivityGrid
            cpu={cpuHist}
            ram={ramHist}
            gpu={gpuHist}
            disk={diskHist}
            gpuOk={gpuOk}
            values={{
              cpu: formatPercent(metrics?.cpu),
              ram: formatPercent(metrics?.ram),
              gpu: formatPercent(metrics?.gpu),
              disk: formatPercent(metrics?.disk),
            }}
          />
        </section>

        <section className="health-banner span-4">
          <div className="label" style={{ color: "rgba(255,255,255,0.8)" }}>CPU now</div>
          <div className="kpi-value tabular">{formatPercent(metrics?.cpu)}</div>
          <p style={{ marginTop: 10, fontSize: 16 }}>Average {formatPercent(cpuStats.avg)} · Peak {formatPercent(cpuStats.peak)}</p>
          <p style={{ marginTop: 8, opacity: 0.9 }}>{displayText(metrics?.cpu_name)}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
            <Spec label="Cores" value={metrics?.physical_cores ?? "—"} />
            <Spec label="Threads" value={metrics?.logical_cores ?? "—"} />
          </div>
        </section>

        <section className="panel span-6 lift">
          <div className="card-head">
            <div>
              <div className="section-title">CPU load</div>
              <p className="muted" style={{ marginTop: 6 }}>{formatMhzOrGhz(metrics?.cpu_frequency, metrics?.cpu_frequency_mhz)} · {metrics?.logical_cores ?? "—"} threads</p>
            </div>
            <div className="muted">Avg {formatPercent(cpuStats.avg)}</div>
          </div>
          <SoftAreaChart data={cpuHist} color="#FA5A7D" name="CPU" height={240} />
        </section>

        <section className="panel span-6 lift">
          <div className="card-head">
            <div>
              <div className="section-title">Memory</div>
              <p className="muted" style={{ marginTop: 6 }}>
                {metrics?.ram_used_gb != null ? `${metrics.ram_used_gb} / ${metrics.total_ram_gb} GB` : "Unavailable"}
              </p>
            </div>
            <StatusBadge tone={metricStatus(metrics?.ram).tone}>
              {metrics?.ram >= 80 ? "High" : metricStatus(metrics?.ram).label}
            </StatusBadge>
          </div>
          <div className="panel-pad" style={{ paddingTop: 8 }}>
            <ProgressBar
              value={metrics?.ram}
              label="Pressure"
              status={metrics?.ram >= 90 ? "danger" : metrics?.ram >= 80 ? "warning" : "normal"}
            />
          </div>
          <SoftAreaChart data={ramHist} color="#FF947A" name="Memory" height={200} />
        </section>

        <section className="panel span-6 lift">
          <div className="card-head">
            <div>
              <div className="section-title">GPU</div>
              <p className="muted" style={{ marginTop: 6 }}>{gpuOk ? displayText(metrics?.gpu_name) : "Telemetry unavailable"}</p>
            </div>
            <div className="kpi-value" style={{ fontSize: 28 }}>{gpuOk ? formatPercent(metrics?.gpu) : "—"}</div>
          </div>
          {gpuOk ? (
            <SoftAreaChart data={gpuHist} color="#7C5CFC" name="GPU" height={220} />
          ) : (
            <EmptyState title="GPU not detected" body="No utilization or temperature is being invented." />
          )}
        </section>

        <section className="panel span-6 lift">
          <div className="card-head">
            <div>
              <div className="section-title">Storage</div>
              <p className="muted" style={{ marginTop: 6 }}>{formatGb(metrics?.disk_free_gb)} free · {formatPercent(metrics?.disk)} used</p>
            </div>
          </div>
          <SoftAreaChart data={diskHist} color="#3D9B6E" name="Disk" height={220} />
        </section>

        <section className="panel span-8 lift">
          <div className="card-head">
            <div>
              <div className="section-title">Network</div>
              <p className="muted" style={{ marginTop: 6 }}>↓ {formatSpeed(metrics?.download_speed)} · ↑ {formatSpeed(metrics?.upload_speed)}</p>
            </div>
            <span className="label">{displayText(metrics?.network_interface, "Interface not detected")}</span>
          </div>
          <SoftAreaChart data={netHist} color="#4C8DFF" name="Download" unit=" MB/s" height={220} domain={["auto", "auto"]} />
        </section>

        <section className="panel span-4 panel-pad lift">
          <div className="section-title">Battery</div>
          {battery?.available ? (
            <>
              <div className="kpi-value" style={{ marginTop: 12 }}>{formatPercent(battery.percent)}</div>
              <p className="muted" style={{ marginTop: 10, fontSize: 16 }}>{battery.status || (battery.plugged ? "Charging" : "On battery")}</p>
              <p className="muted">Remaining {battery.time_left || "Unavailable"}</p>
            </>
          ) : (
            <EmptyState title="No battery data" body="This system does not expose battery telemetry." />
          )}
        </section>
      </div>
    </div>
  );
}
