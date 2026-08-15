import { memo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

function MetricChartInner({ data, color = "#FF6B35", unit = "%", domain }) {
  const points = (data || []).filter((item) => item.value != null && item.value !== undefined);
  if (!points.length) {
    return (
      <div className="chart-body" style={{ display: "grid", placeItems: "center" }}>
        <span className="muted">No telemetry yet</span>
      </div>
    );
  }
  const id = `area-${color.replace("#", "")}`;
  return (
    <div className="chart-body">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "var(--text-dim)", fontSize: 11 }} minTickGap={32} axisLine={false} tickLine={false} />
          <YAxis
            domain={domain || (unit === "%" ? [0, 100] : ["auto", "auto"])}
            tick={{ fill: "var(--text-dim)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="value"
            name="Value"
            stroke={color}
            strokeWidth={1.8}
            fill={`url(#${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const MetricChart = memo(MetricChartInner);
