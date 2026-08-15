import { useCallback, useState } from "react";

const KEY = "smartpulse.settings";

const DEFAULTS = {
  displayName: "Hritik",
  interval: 2000,
  sidebarCollapsed: false,
};

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  const update = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, update };
}
