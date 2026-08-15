export function ChartTooltip({ active, payload, label, unit = "%" }) {
  if (!active || !payload?.length) return null;
  const rows = [];
  const seen = new Set();
  payload.forEach((entry) => {
    if (entry.value == null || entry.tooltipType === "none") return;
    const key = entry.name || entry.dataKey;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(entry);
  });
  if (!rows.length) return null;
  return (
    <div className="tooltip">
      <div className="tooltip-time">{label}</div>
      {rows.map((entry) => (
        <div key={entry.dataKey} className="tooltip-row">
          <span><i style={{ background: entry.color }} />{entry.name}</span>
          <strong className="tabular">
            {`${Number(entry.value).toFixed(1)}${unit}`}
          </strong>
        </div>
      ))}
    </div>
  );
}
