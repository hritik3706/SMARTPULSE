export function DashboardGrid({ columns = 1, gap = 16, children }) {
  return (
    <div
      className="dashboard-grid"
      role="region"
      style={{
        display: "grid",
        gridTemplateColumns: columns === 1 ? "1fr" : `repeat(${columns}, minmax(0, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
}
