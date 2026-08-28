import { Cpu, HardDrive, MemoryStick, CircuitBoard } from "lucide-react";
import { formatPercent, trendDisplay } from "../utils/format";

const ICONS = {
  cpu: Cpu,
  memory: MemoryStick,
  gpu: CircuitBoard,
  disk: HardDrive,
};

export function StatCard({ kind, label, value, percent, history, hint, tone = "pink" }) {
  const Icon = ICONS[kind] || Cpu;
  const trend = trendDisplay(history);
  return (
    <article className={`stat-card tone-${tone}`} aria-label={label}>
      <div className={`stat-ico tone-${tone}`}>
        <Icon size={22} />
      </div>
      <div className="stat-value tabular">{value ?? formatPercent(percent)}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-foot">
        <span className={trend.className}>{trend.text}</span>
        {hint ? <span className="muted">{hint}</span> : null}
      </div>
    </article>
  );
}
