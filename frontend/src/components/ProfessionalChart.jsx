import { memo, useRef } from "react";
import {
  Brush,
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

function exportSvg(root) {
  const svg = root?.querySelector("svg");
  if (!svg) return;
  const blob = new Blob([`<?xml version="1.0"?>${svg.outerHTML}`], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "smartpulse-chart.svg";
  link.click();
  URL.revokeObjectURL(url);
}

function ProfessionalChartInner({
  data,
  series,
  height = 420,
  showBrush = true,
}) {
  const ref = useRef(null);
  const visible = (series || []).filter((item) => item.visible);

  return (
    <div ref={ref} className={`chart-body ${height >= 380 ? "is-hero" : ""}`} style={height ? { height } : undefined}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} horizontal strokeWidth={1} />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-dim)", fontSize: 10, fontFamily: "IBM Plex Mono, Consolas, monospace" }}
            minTickGap={28}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--text-dim)", fontSize: 10, fontFamily: "IBM Plex Mono, Consolas, monospace" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "3 3" }} />
          <ReferenceLine y={80} stroke="var(--warning)" strokeDasharray="4 4" strokeOpacity={0.35} />
          {visible.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              strokeWidth={1.6}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ))}
          {showBrush && data?.length > 12 ? (
            <Brush dataKey="time" height={18} stroke="var(--border-strong)" fill="var(--surface-2)" travellerWidth={8} />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
      <button type="button" className="btn btn-tertiary" style={{ position: "absolute", right: 8, top: 8 }} onClick={() => exportSvg(ref.current)}>
        Export
      </button>
    </div>
  );
}

export const ProfessionalChart = memo(ProfessionalChartInner);
