import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";

export function AppShell({
  page,
  onNavigate,
  collapsed,
  onToggleSidebar,
  sidebarOpen,
  mobile,
  online,
  lastUpdated,
  metrics,
  ai,
  children,
}) {
  return (
    <div className={`app-shell ${collapsed && !mobile ? "is-collapsed" : ""}`}>
      <Sidebar
        page={page}
        onNavigate={onNavigate}
        collapsed={collapsed}
        open={sidebarOpen || !mobile}
      />
      <Header
        page={page}
        online={online}
        lastUpdated={lastUpdated}
        collapsed={collapsed}
        onToggleSidebar={onToggleSidebar}
        onNavigate={onNavigate}
        mobile={mobile}
        metrics={metrics}
      />
      {mobile && sidebarOpen ? (
        <button type="button" className="sidebar-scrim" aria-label="Close navigation" onClick={onToggleSidebar} />
      ) : null}
      <main className="main">{children}</main>
      <StatusBar metrics={metrics} ai={ai} online={online} page={page} />
    </div>
  );
}
