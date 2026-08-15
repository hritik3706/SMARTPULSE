import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getAi, getLive, getProcesses } from "../services/api";

const HISTORY_LIMIT = 2000;

function asSample(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pushPoint(list, value) {
  return [
    ...list,
    {
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      value: asSample(value),
    },
  ].slice(-HISTORY_LIMIT);
}

function pushCorePoint(list, cores) {
  if (!Array.isArray(cores) || !cores.length) return list;
  const point = {
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
  cores.forEach((value, index) => {
    point[`c${index + 1}`] = asSample(value);
  });
  return [...list, point].slice(-HISTORY_LIMIT);
}

function appendLog(logs, message) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return [...logs, { time, message }].slice(-180);
}

export function useSystemData(interval = 2000) {
  const [metrics, setMetrics] = useState(null);
  const [ai, setAi] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [processCount, setProcessCount] = useState(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState({
    cpu: [],
    ram: [],
    gpu: [],
    disk: [],
    netDown: [],
    netUp: [],
    diskRead: [],
    diskWrite: [],
    cores: [],
  });

  const onlineRef = useRef(false);
  const scoreRef = useRef(null);
  const bootedRef = useRef(false);

  const markOnline = useCallback((isOnline) => {
    if (bootedRef.current) {
      if (isOnline && !onlineRef.current) {
        setLogs((prev) => appendLog(prev, "MONITORING ENGINE ONLINE"));
        toast.success("Backend reconnected");
      }
      if (!isOnline && onlineRef.current) {
        setLogs((prev) => appendLog(prev, "BACKEND DISCONNECTED"));
        toast.error("Backend disconnected");
      }
    } else {
      if (isOnline) setLogs((prev) => appendLog(prev, "MONITORING ENGINE ONLINE"));
      bootedRef.current = true;
    }
    onlineRef.current = isOnline;
    setOnline(isOnline);
  }, []);

  const ingestLive = useCallback((live) => {
    setMetrics(live);
    setLastUpdated(Date.now());
    setProcessCount(live.process_count ?? null);
    setHistory((prev) => ({
      cpu: pushPoint(prev.cpu, live.cpu),
      ram: pushPoint(prev.ram, live.ram),
      gpu: pushPoint(prev.gpu, live.gpu),
      disk: pushPoint(prev.disk, live.disk),
      netDown: pushPoint(prev.netDown, live.download_speed),
      netUp: pushPoint(prev.netUp, live.upload_speed),
      diskRead: pushPoint(prev.diskRead, live.disk_read_speed),
      diskWrite: pushPoint(prev.diskWrite, live.disk_write_speed),
      cores: pushCorePoint(prev.cores, live.cpu_per_core),
    }));
  }, []);

  const refreshLive = useCallback(async () => {
    try {
      const live = await getLive();
      ingestLive(live);
      markOnline(true);
    } catch {
      markOnline(false);
    } finally {
      setLoading(false);
    }
  }, [ingestLive, markOnline]);

  const refreshAi = useCallback(async () => {
    try {
      const data = await getAi();
      setAi(data);
      if (scoreRef.current !== data.health_score) {
        scoreRef.current = data.health_score;
        setLogs((prev) => appendLog(prev, `HEALTH SCORE UPDATED · ${data.health_score}`));
      }
    } catch {
      /* live endpoint owns connectivity */
    }
  }, []);

  const refreshProcesses = useCallback(async () => {
    try {
      const data = await getProcesses();
      setProcesses((data.processes || []).filter((item) => {
        const name = String(item.name || "").trim().toLowerCase();
        return Number(item.pid) !== 0 && name !== "idle" && name !== "system idle process";
      }));
      setProcessCount(data.count ?? data.processes?.length ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  const retry = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshLive(), refreshAi(), refreshProcesses()]);
    setLoading(false);
  }, [refreshAi, refreshLive, refreshProcesses]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      await refreshLive();
      if (cancelled) return;
      await Promise.all([refreshAi(), refreshProcesses()]);
      if (!cancelled) setLoading(false);
    }
    boot();
    const liveTimer = setInterval(refreshLive, interval);
    const aiTimer = setInterval(refreshAi, Math.max(interval * 3, 6000));
    const processTimer = setInterval(refreshProcesses, Math.max(interval * 2, 4000));
    return () => {
      cancelled = true;
      clearInterval(liveTimer);
      clearInterval(aiTimer);
      clearInterval(processTimer);
    };
  }, [interval, refreshAi, refreshLive, refreshProcesses]);

  return {
    metrics,
    ai,
    processes,
    processCount,
    online,
    loading,
    lastUpdated,
    history,
    logs,
    retry,
    refreshLive,
    refreshAi,
    refreshProcesses,
  };
}
