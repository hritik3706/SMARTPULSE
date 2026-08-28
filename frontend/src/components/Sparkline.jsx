import { memo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

function SparklineInner({ data, color = "var(--accent)" }) {
  const points = (data || []).filter((item) => item.value != null);
  if (points.length < 2) return <div className="spark" />;
  const id = `sp-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div className="spark" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.4}
            fill={`url(#${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const Sparkline = memo(SparklineInner);
