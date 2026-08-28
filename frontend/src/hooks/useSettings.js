import { useCallback, useState } from "react";

const KEY = "smartpulse.settings";
export const ALLOWED_INTERVALS = [1000, 2000, 5000, 10000];

const DEFAULTS = {
  displayName: "Hritik",
  interval: 2000,
  sidebarCollapsed: false,
};

function sanitize(raw) {
  const name = String(raw.displayName ?? DEFAULTS.displayName).trim().slice(0, 32) || DEFAULTS.displayName;
  const interval = ALLOWED_INTERVALS.includes(Number(raw.interval)) ? Number(raw.interval) : DEFAULTS.interval;
  return {
    ...DEFAULTS,
    ...raw,
    displayName: name,
    interval,
    sidebarCollapsed: Boolean(raw.sidebarCollapsed),
  };
}

function load() {
  try {
    return sanitize({ ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") });
  } catch {
    return { ...DEFAULTS };
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  const update = useCallback((partial) => {
    setSettings((prev) => {
      const next = sanitize({ ...prev, ...partial });
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, update };
}
