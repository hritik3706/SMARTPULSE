import { useEffect, useRef } from "react";

export function Terminal({ logs }) {
  const scroller = useRef(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [logs]);

  return (
    <div className="events" ref={scroller} aria-label="Recent events">
      {(logs || []).slice(-12).map((entry, index) => (
        <div key={`${entry.time}-${index}`}>
          <span className="ts">{entry.time}</span>
          <span>{entry.message}</span>
        </div>
      ))}
      {(!logs || logs.length === 0) ? <div>Waiting for monitoring events…</div> : null}
    </div>
  );
}
