import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { AppShell } from "./components/AppShell";
import { useSystemData } from "./hooks/useSystemData";
import { useSettings } from "./hooks/useSettings";
import { useTheme } from "./hooks/useTheme";
import { Advisor } from "./pages/Advisor";
import { AIDoctor } from "./pages/AIDoctor";
import { Dashboard } from "./pages/Dashboard";
import { Optimizer } from "./pages/Optimizer";
import { Performance } from "./pages/Performance";
import { Processes } from "./pages/Processes";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

const PATHS = {
  "/": "dashboard",
  "/performance": "performance",
  "/processes": "processes",
  "/doctor": "doctor",
  "/optimizer": "optimizer",
  "/advisor": "advisor",
  "/reports": "reports",
  "/settings": "settings",
};

export default function App() {
  const { settings, update } = useSettings();
  const { resolved } = useTheme();
  const system = useSystemData(settings.interval);
  const location = useLocation();
  const navigate = useNavigate();
  const page = PATHS[location.pathname] || "dashboard";
  const [mobile, setMobile] = useState(() => window.innerWidth <= 900);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const collapsed = Boolean(settings.sidebarCollapsed);

  useEffect(() => {
    function onResize() {
      const isMobile = window.innerWidth <= 900;
      setMobile(isMobile);
      if (!isMobile) setSidebarOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function onNavigate(next) {
    navigate(next === "dashboard" ? "/" : `/${next}`);
    setSidebarOpen(false);
  }

  function onToggleSidebar() {
    if (mobile) setSidebarOpen((open) => !open);
    else update({ sidebarCollapsed: !collapsed });
  }

  const shared = {
    metrics: system.metrics,
    ai: system.ai,
    history: system.history,
    logs: system.logs,
    loading: system.loading,
    online: system.online,
    interval: settings.interval,
    onRetry: system.retry,
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolved === "dark" ? "#111111" : "#ffffff",
            color: resolved === "dark" ? "#f5f5f5" : "#1a2233",
            border: `1px solid ${resolved === "dark" ? "#222222" : "#e6edf5"}`,
            fontFamily: "Plus Jakarta Sans, Segoe UI, sans-serif",
            fontSize: 15,
          },
        }}
      />
      <AppShell
        page={page}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
        mobile={mobile}
        online={system.online}
        lastUpdated={system.lastUpdated}
        metrics={system.metrics}
        ai={system.ai}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes>
            <Route
              path="/"
              element={(
                <Dashboard
                  {...shared}
                  processes={system.processes}
                  displayName={settings.displayName || "Hritik"}
                  onNavigate={onNavigate}
                />
              )}
            />
            <Route path="/performance" element={<Performance {...shared} />} />
            <Route
              path="/processes"
              element={(
                <Processes
                  processes={system.processes}
                  processCount={system.processCount}
                  loading={system.loading}
                  online={system.online}
                  onRetry={system.retry}
                  onKilled={system.refreshProcesses}
                />
              )}
            />
            <Route path="/doctor" element={<AIDoctor ai={system.ai} metrics={system.metrics} loading={system.loading} online={system.online} onRetry={system.retry} onRefresh={system.refreshAi} />} />
            <Route path="/optimizer" element={<Optimizer online={system.online} onRetry={system.retry} />} />
            <Route path="/advisor" element={<Advisor metrics={system.metrics} online={system.online} onRetry={system.retry} />} />
            <Route path="/reports" element={<Reports ai={system.ai} online={system.online} onRetry={system.retry} />} />
            <Route path="/settings" element={<Settings settings={settings} update={update} online={system.online} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AppShell>
    </>
  );
}
