import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/ThemeProvider";

const OPTIONS = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle({ compact = false }) {
  const { mode, setMode } = useTheme();

  if (compact) {
    const next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    const Current = OPTIONS.find((item) => item.id === mode)?.icon || Sun;
    return (
      <button
        type="button"
        className="icon-btn"
        onClick={() => setMode(next)}
        title={`Theme: ${mode}`}
        aria-label={`Theme ${mode}. Click to switch.`}
      >
        <Current size={15} />
      </button>
    );
  }

  return (
    <div className="seg" role="group" aria-label="Theme">
      {OPTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={mode === item.id ? "is-active" : ""}
            onClick={() => setMode(item.id)}
          >
            <Icon size={13} /> {item.label}
          </button>
        );
      })}
    </div>
  );
}
