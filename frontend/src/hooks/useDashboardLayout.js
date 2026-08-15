import { useCallback, useState } from "react";

const KEY = "smartpulse.dashboardLayout";

const DEFAULT_LAYOUT = {
  order: ["summary", "metrics", "chart", "insight", "activity"],
  hidden: [],
  collapsed: {},
};

function load() {
  try {
    return { ...DEFAULT_LAYOUT, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState(load);

  const updateLayout = useCallback((partial) => {
    setLayout((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleHidden = useCallback((id) => {
    setLayout((prev) => {
      const hidden = prev.hidden.includes(id)
        ? prev.hidden.filter((item) => item !== id)
        : [...prev.hidden, id];
      const next = { ...prev, hidden };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback((id) => {
    setLayout((prev) => {
      const next = { ...prev, collapsed: { ...prev.collapsed, [id]: !prev.collapsed[id] } };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_LAYOUT));
    setLayout(DEFAULT_LAYOUT);
  }, []);

  return { layout, updateLayout, toggleHidden, toggleCollapsed, resetLayout };
}
