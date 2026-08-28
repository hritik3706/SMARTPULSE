import { useState } from "react";
import { iconUrl } from "../services/api";

export function ProcessIcon({ process, size = 32 }) {
  const [failed, setFailed] = useState(false);
  const name = process?.name || "?";
  const initial = name.replace(/\.exe$/i, "").slice(0, 1).toUpperCase();
  const src = process?.icon_id ? iconUrl(process.icon_id) : null;

  if (!src || failed) {
    return (
      <span className="proc-fallback" style={{ width: size, height: size }} aria-hidden="true">
        {initial}
      </span>
    );
  }

  return (
    <img
      className="proc-icon"
      src={src}
      alt={`${name} icon`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
