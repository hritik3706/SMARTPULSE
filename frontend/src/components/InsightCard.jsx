export function InsightCard({ insight }) {
  return (
    <div className="insight panel-pad" role="note">
      <div className="label">Insight</div>
      <h3>{insight?.title || "Collecting a baseline"}</h3>
      <p>{insight?.body || "The diagnostic engine is waiting for enough live telemetry."}</p>
      {insight?.action ? (
        <p style={{ marginTop: 12 }}>
          <span className="label">Recommended action</span>
          <br />
          {insight.action}
        </p>
      ) : null}
    </div>
  );
}
