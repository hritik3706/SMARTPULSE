import { isProtectedProcess } from "../utils/processes";
import { StatusBadge } from "./StatusBadge";
import { ProcessIcon } from "./ProcessIcon";

export function ProcessRow({ process, onTerminate }) {
  const protectedProcess = isProtectedProcess(process);
  const cpu = Math.min(Math.max(Number(process.cpu || 0), 0), 100);
  const memory = Number(process.memory_mb || 0);
  const status = protectedProcess ? "System" : cpu >= 15 || memory >= 800 ? "High" : "Normal";
  const tone = status === "System" ? "muted" : status === "High" ? "warning" : "success";

  return (
    <tr>
      <td>
        <div className="proc-cell">
          <ProcessIcon process={process} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500 }}>{process.name || "Unknown"}</div>
            <div className="dim" style={{ fontSize: 11, fontFamily: "var(--mono)" }}>PID {process.pid}</div>
          </div>
        </div>
      </td>
      <td className="tabular">{cpu.toFixed(1)}%</td>
      <td className="tabular">{memory >= 1024 ? `${(memory / 1024).toFixed(2)} GB` : `${memory.toFixed(0)} MB`}</td>
      <td><StatusBadge tone={tone}>{status}</StatusBadge></td>
      <td style={{ textAlign: "right" }}>
        <button
          type="button"
          className="btn btn-tertiary"
          disabled={protectedProcess}
          title={protectedProcess ? "Protected system process" : "Terminate"}
          onClick={() => onTerminate(process)}
        >
          {protectedProcess ? "—" : "End"}
        </button>
      </td>
    </tr>
  );
}
