import {
  ArrowUpCircle,
  FileText,
  HeartPulse,
  LayoutDashboard,
  List,
  Settings,
  Activity,
  Wrench,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "performance", label: "Performance", icon: Activity },
      { id: "processes", label: "Processes", icon: List },
    ],
  },
  {
    label: "Health",
    items: [
      { id: "doctor", label: "Diagnostics", icon: HeartPulse },
      { id: "optimizer", label: "Optimizer", icon: Wrench },
      { id: "advisor", label: "Advisor", icon: ArrowUpCircle },
    ],
  },
  {
    label: "System",
    items: [
      { id: "reports", label: "Reports", icon: FileText },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const NAV_ITEMS = GROUPS.flatMap((group) => group.items);

export function Sidebar({ page, onNavigate, collapsed, open }) {
  function onKeyDown(event) {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const index = NAV_ITEMS.findIndex((item) => item.id === page);
    if (event.key === "Home") {
      event.preventDefault();
      onNavigate(NAV_ITEMS[0].id);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      onNavigate(NAV_ITEMS[NAV_ITEMS.length - 1].id);
      return;
    }
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = NAV_ITEMS[(index + delta + NAV_ITEMS.length) % NAV_ITEMS.length];
    event.preventDefault();
    onNavigate(next.id);
  }

  return (
    <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Primary" onKeyDown={onKeyDown}>
      <div className="brand">
        <BrandLogo size={42} />
        <span>
            <strong>SMARTPULSE</strong>
            <em>Nexus</em>
        </span>
      </div>

      {GROUPS.map((group) => (
        <div className="nav-group" key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-btn ${active ? "is-active" : ""}`}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
