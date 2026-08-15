export function LoadingSkeleton() {
  return (
    <div className="page" aria-hidden="true">
      <div className="panel panel-pad">
        <div className="skeleton" style={{ width: 180, height: 18, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: "55%", height: 28 }} />
      </div>
      <div className="panel kpi-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="kpi" key={index}>
            <div className="skeleton" style={{ width: 48, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 90, height: 26, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: "100%", height: 36 }} />
          </div>
        ))}
      </div>
      <div className="panel panel-pad">
        <div className="skeleton" style={{ width: "100%", height: 220 }} />
      </div>
    </div>
  );
}
