export function Panel({
  id,
  title,
  description,
  children,
  onRemove,
  minimizable = false,
  minimized = false,
  onMinimize,
  action,
}) {
  return (
    <section className="panel" data-panel-id={id} aria-label={title || undefined}>
      {(title || action || minimizable || onRemove) ? (
        <div className="panel-pad row" style={{ borderBottom: minimized ? 0 : "1px solid var(--border)" }}>
          <div>
            {title ? <div className="section-title">{title}</div> : null}
            {description ? <p className="muted" style={{ marginTop: 4 }}>{description}</p> : null}
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            {action}
            {minimizable ? (
              <button type="button" className="btn btn-tertiary" onClick={onMinimize} aria-expanded={!minimized}>
                {minimized ? "Expand" : "Minimize"}
              </button>
            ) : null}
            {onRemove ? (
              <button type="button" className="btn btn-tertiary" onClick={onRemove} aria-label="Hide panel">
                Hide
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {minimized ? null : children}
    </section>
  );
}
