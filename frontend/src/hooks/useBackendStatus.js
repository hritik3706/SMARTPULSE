import { useEffect, useState } from "react";
import { getRoot } from "../services/api";

export function useBackendStatus(interval = 5000) {
  const [connected, setConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const started = performance.now();
      try {
        await getRoot();
        if (!cancelled) {
          setConnected(true);
          setLatency(Math.round(performance.now() - started));
          setLastCheck(Date.now());
        }
      } catch {
        if (!cancelled) {
          setConnected(false);
          setLatency(null);
          setLastCheck(Date.now());
        }
      }
    }
    check();
    const timer = setInterval(check, interval);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [interval]);

  return { connected, lastCheck, latency };
}
