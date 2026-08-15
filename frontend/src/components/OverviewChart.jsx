import { memo } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

function OverviewChartInner({ data, series }) {
  return (
    <div className="chart-body">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} strokeWidth={1} />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-dim)", fontSize: 11 }}
            minTickGap={36}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--text-dim)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
          {series.map((item) => (
            item.visible ? (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            ) : null
          ))}
          {series[0]?.visible ? (
            <Area
              type="monotone"
              dataKey={series[0].key}
              stroke="none"
              fill={series[0].color}
              fillOpacity={0.06}
              isAnimationActive={false}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export const OverviewChart = memo(OverviewChartInner);
