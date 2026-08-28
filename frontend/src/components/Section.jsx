export function Section({ title, description, action, collapsible = false, collapsed = false, onToggle, children }) {
  return (
    <section className="panel" aria-label={title}>
      <div className="panel-pad row" style={{ borderBottom: collapsed ? 0 : "1px solid var(--border)" }}>
        <div>
          <div className="section-title">{title}</div>
          {description ? <p className="muted" style={{ marginTop: 4 }}>{description}</p> : null}
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          {action}
          {collapsible ? (
            <button type="button" className="btn btn-tertiary" onClick={onToggle} aria-expanded={!collapsed}>
              {collapsed ? "Expand" : "Collapse"}
            </button>
          ) : null}
        </div>
      </div>
      {collapsed ? null : children}
    </section>
  );
}
