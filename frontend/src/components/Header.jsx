import { useEffect, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderVitals } from "./HeaderVitals";
import { relativeTime } from "../utils/format";

const TITLES = {
  dashboard: "Dashboard",
  performance: "Performance",
  processes: "Processes",
  doctor: "Diagnostics",
  optimizer: "Optimizer",
  advisor: "Advisor",
  reports: "Reports",
  settings: "Settings",
};

export function Header({
  page,
  online,
  lastUpdated,
  collapsed,
  onToggleSidebar,
  onNavigate,
  mobile,
  metrics,
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {mobile ? <Menu size={16} /> : collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <h1>{TITLES[page] || "SMARTPULSE"}</h1>
      </div>
      <HeaderVitals metrics={metrics} />
      <div className="topbar-right">
        <ConnectionStatus online={online} />
        <span className="muted" style={{ fontSize: 14, fontWeight: 600 }} aria-live="polite">
          {relativeTime(lastUpdated)}
        </span>
        <ThemeToggle compact />
        <button type="button" className="icon-btn" onClick={() => onNavigate("settings")} aria-label="Settings">
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
