import { motion } from "framer-motion";
import { StatCard } from "../components/StatCard";
import { SoftAreaChart, ActivityGrid } from "../components/SoftCharts";
import { ProcessIcon } from "../components/ProcessIcon";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { ScoreCard } from "../components/HealthScore";
import {
  formatGb,
  formatPercent,
  formatSpeed,
  healthCopy,
  sliceHistory,
  statsFromHistory,
} from "../utils/format";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export function Dashboard({
  metrics,
  ai,
  history,
  processes,
  loading,
  online,
  interval,
  displayName,
  onRetry,
  onNavigate,
}) {
  const cpuHist = sliceHistory(history?.cpu, 300, interval);
  const ramHist = sliceHistory(history?.ram, 300, interval);
  const gpuHist = sliceHistory(history?.gpu, 300, interval);
  const netHist = sliceHistory(history?.netDown, 300, interval);
  const cpuStats = statsFromHistory(cpuHist);
  const gpuOk = Boolean(metrics?.gpu_available);
  const top = (processes || []).slice(0, 6);

  if (loading && !metrics) return <LoadingSkeleton />;

  return (
    <div className="page" style={{ maxWidth: "none" }}>
      {!online ? (
        <ErrorState title="Engine offline" body="Live feed paused until the local backend reconnects." onRetry={onRetry} />
      ) : null}

      <motion.div className="dash-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="label">Welcome back</div>
        <h2>Hi, {displayName}</h2>
        <p className="muted">{healthCopy(ai?.health_score, ai?.severity)}</p>
      </motion.div>

      <motion.div className="bento" variants={stagger} initial="hidden" animate="show">
        <motion.div className="span-3" variants={fade}>
          <StatCard kind="cpu" tone="pink" label="CPU" percent={metrics?.cpu} history={cpuHist} hint={metrics?.cpu_name ? "Live utilization" : "Unavailable"} />
        </motion.div>
        <motion.div className="span-3" variants={fade}>
          <StatCard
            kind="memory"
            tone="orange"
            label="Memory"
            percent={metrics?.ram}
            history={ramHist}
            hint={metrics?.ram_used_gb != null ? `${metrics.ram_used_gb} / ${metrics.total_ram_gb} GB` : "Unavailable"}
          />
        </motion.div>
        <motion.div className="span-3" variants={fade}>
          <StatCard
            kind="gpu"
            tone="purple"
            label="GPU"
            value={gpuOk ? formatPercent(metrics?.gpu) : "—"}
            percent={gpuOk ? metrics?.gpu : null}
            history={gpuOk ? gpuHist : []}
            hint={gpuOk && metrics?.gpu_temperature != null ? `${metrics.gpu_temperature}°C` : "Not detected"}
          />
        </motion.div>
        <motion.div className="span-3" variants={fade}>
          <StatCard
            kind="disk"
            tone="green"
            label="Storage"
            percent={metrics?.disk}
            history={sliceHistory(history?.disk, 300, interval)}
            hint={metrics?.disk_free_gb != null ? `${formatGb(metrics.disk_free_gb)} free` : "Unavailable"}
          />
        </motion.div>

        <motion.section className="panel span-8 lift" variants={fade}>
          <div className="card-head">
            <div>
              <div className="section-title">System activity</div>
              <p className="muted" style={{ marginTop: 6 }}>CPU, memory, GPU, and disk over the last 5 minutes</p>
            </div>
            <div className="muted">Avg CPU {formatPercent(cpuStats.avg)} · Peak {formatPercent(cpuStats.peak)}</div>
          </div>
          <ActivityGrid
            cpu={cpuHist}
            ram={ramHist}
            gpu={gpuHist}
            disk={sliceHistory(history?.disk, 300, interval)}
            gpuOk={gpuOk}
            values={{
              cpu: formatPercent(metrics?.cpu),
              ram: formatPercent(metrics?.ram),
              gpu: formatPercent(metrics?.gpu),
              disk: formatPercent(metrics?.disk),
            }}
          />
        </motion.section>

        <motion.aside className="span-4" variants={fade}>
          <ScoreCard
            score={ai?.health_score}
            insight={ai?.insight}
            metrics={metrics}
            onOpen={() => onNavigate("doctor")}
          />
        </motion.aside>

        <motion.section className="panel span-6 lift" variants={fade}>
          <div className="card-head">
            <div>
              <div className="section-title">CPU load</div>
              <p className="muted" style={{ marginTop: 6 }}>{metrics?.cpu_name || "Live utilization"}</p>
            </div>
            <div className="muted">Avg {formatPercent(cpuStats.avg)}</div>
          </div>
          <SoftAreaChart data={cpuHist} color="#FA5A7D" name="CPU" height={240} />
        </motion.section>

        <motion.section className="panel span-6 lift" variants={fade}>
          <div className="card-head">
            <div>
              <div className="section-title">Memory pressure</div>
              <p className="muted" style={{ marginTop: 6 }}>{formatPercent(metrics?.ram)} in use</p>
            </div>
          </div>
          <SoftAreaChart data={ramHist} color="#FF947A" name="Memory" height={240} />
        </motion.section>

        <motion.section className="panel span-7 lift" variants={fade}>
          <div className="card-head">
            <div className="section-title">Running apps</div>
            <button type="button" className="btn" onClick={() => onNavigate("processes")}>View all</button>
          </div>
          <div className="panel-pad" style={{ paddingTop: 8 }}>
            {top.map((process) => (
              <div className="setting-row" key={process.pid}>
                <div className="proc-cell">
                  <ProcessIcon process={process} size={36} />
                  <div>
                    <strong>{process.name}</strong>
                    <div className="muted" style={{ fontSize: 13 }}>PID {process.pid}</div>
                  </div>
                </div>
                <div style={{ width: 160 }}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="muted">CPU</span>
                    <strong className="tabular">{Number(process.cpu || 0).toFixed(1)}%</strong>
                  </div>
                  <div className="bar"><span style={{ width: `${Math.min(Number(process.cpu || 0), 100)}%`, background: "#FA5A7D" }} /></div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="panel span-5 lift" variants={fade}>
          <div className="card-head">
            <div>
              <div className="section-title">Network</div>
              <p className="muted" style={{ marginTop: 6 }}>↓ {formatSpeed(metrics?.download_speed)} · ↑ {formatSpeed(metrics?.upload_speed)}</p>
            </div>
          </div>
          <SoftAreaChart data={netHist} color="#4C8DFF" name="Download" unit=" MB/s" height={220} domain={["auto", "auto"]} />
        </motion.section>
      </motion.div>
    </div>
  );
}
