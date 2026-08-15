import { ProcessRow } from "./ProcessRow";

export function ProcessTable({ data, onKillProcess, page, pageSize, onSort }) {
  const start = (page - 1) * pageSize;
  const rows = data.slice(start, start + pageSize);

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Process</th>
            <th><button type="button" className="btn btn-tertiary" onClick={() => onSort("cpu")}>CPU</button></th>
            <th><button type="button" className="btn btn-tertiary" onClick={() => onSort("memory_mb")}>Memory</button></th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((process) => (
            <ProcessRow key={process.pid} process={process} onTerminate={onKillProcess} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
