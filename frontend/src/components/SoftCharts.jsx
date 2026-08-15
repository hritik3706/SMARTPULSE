import { memo, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

const CHART_COLORS = {
  cpu: "#FA5A7D",
  ram: "#FF947A",
  gpu: "#7C5CFC",
  disk: "#3D9B6E",
};

function Empty({ height }) {
  return (
    <div className="chart-soft" style={{ height, display: "grid", placeItems: "center" }}>
      <span className="muted">Waiting for live samples</span>
    </div>
  );
}

export const SoftAreaChart = memo(function SoftAreaChart({
  data,
  color = "#7C5CFC",
  dataKey = "value",
  name = "Value",
  unit = "%",
  height = 220,
  domain,
}) {
  const points = (data || []).filter((item) => item[dataKey] != null);
  if (!points.length) return <Empty height={height} />;
  const id = `fill-${color.replace("#", "")}-${dataKey}-${name.replace(/\s+/g, "")}`;
  return (
    <div className="chart-soft" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid)" vertical={false} strokeDasharray="4 8" />
          <XAxis dataKey="time" tick={{ fill: "var(--text-dim)", fontSize: 11, fontWeight: 600 }} minTickGap={36} axisLine={false} tickLine={false} />
          <YAxis
            domain={domain || (unit === "%" ? [0, 100] : ["auto", "auto"])}
            tick={{ fill: "var(--text-dim)", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: color, strokeWidth: 1.2, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={color}
            strokeWidth={2.4}
            fill={`url(#${id})`}
            isAnimationActive={false}
            connectNulls
            dot={false}
            activeDot={{ r: 5, strokeWidth: 3, stroke: "var(--surface)", fill: color }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export const SoftLineChart = memo(function SoftLineChart({ data, series, height = 280, showReference = true }) {
  const available = useMemo(() => (series || []).filter((item) => item.visible !== false), [series]);
  const [hidden, setHidden] = useState({});
  const visible = available.filter((item) => !hidden[item.key]);
  if (!data?.length) return <Empty height={height} />;

  function toggle(key) {
    setHidden((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <div className="chart-soft" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} strokeDasharray="4 8" />
            <XAxis dataKey="time" tick={{ fill: "var(--text-dim)", fontSize: 11, fontWeight: 600 }} minTickGap={40} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "var(--text-dim)", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--text-dim)", strokeWidth: 1, strokeDasharray: "3 6" }} />
            {showReference ? <ReferenceLine y={80} stroke="var(--danger)" strokeDasharray="5 6" strokeOpacity={0.35} /> : null}
            {visible.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                strokeWidth={2.2}
                fill="none"
                isAnimationActive={false}
                connectNulls
                dot={false}
                activeDot={{ r: 5, strokeWidth: 3, stroke: "var(--surface)", fill: item.color }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        {available.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`chart-legend-item ${hidden[item.key] ? "is-off" : ""}`}
            onClick={() => toggle(item.key)}
          >
            <i style={{ background: item.color }} />
            {item.name}
          </button>
        ))}
        {showReference ? (
          <span className="chart-legend-item is-static">
            <i style={{ background: "var(--danger)", opacity: 0.6 }} />
            80% pressure
          </span>
        ) : null}
      </div>
    </div>
  );
});

export function ActivityGrid({ cpu, ram, gpu, disk, gpuOk, values }) {
  return (
    <div className="activity-grid">
      <article className="activity-cell">
        <div className="activity-cell-head">
          <span>CPU</span>
          <strong className="tabular">{values?.cpu ?? "—"}</strong>
        </div>
        <SoftAreaChart data={cpu} color={CHART_COLORS.cpu} name="CPU" height={148} />
      </article>
      <article className="activity-cell">
        <div className="activity-cell-head">
          <span>Memory</span>
          <strong className="tabular">{values?.ram ?? "—"}</strong>
        </div>
        <SoftAreaChart data={ram} color={CHART_COLORS.ram} name="Memory" height={148} />
      </article>
      <article className="activity-cell">
        <div className="activity-cell-head">
          <span>GPU</span>
          <strong className="tabular">{gpuOk ? values?.gpu ?? "—" : "—"}</strong>
        </div>
        {gpuOk ? (
          <SoftAreaChart data={gpu} color={CHART_COLORS.gpu} name="GPU" height={148} />
        ) : (
          <Empty height={148} />
        )}
      </article>
      <article className="activity-cell">
        <div className="activity-cell-head">
          <span>Disk</span>
          <strong className="tabular">{values?.disk ?? "—"}</strong>
        </div>
        <SoftAreaChart data={disk} color={CHART_COLORS.disk} name="Disk" height={148} />
      </article>
    </div>
  );
}
