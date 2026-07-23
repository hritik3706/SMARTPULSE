import { motion } from "framer-motion";

import {
  Globe,
  Folder,
  Terminal,
  Cpu,
  Monitor,
  SquareCode,
} from "lucide-react";

function getIcon(name) {
  const lower = name.toLowerCase();

  if (lower.includes("chrome"))
    return <Globe color="#4285F4" size={26} />;

  if (lower.includes("code"))
    return <SquareCode color="#22c1ff" size={26} />;

  if (lower.includes("explorer"))
    return <Folder color="#facc15" size={26} />;

  if (lower.includes("powershell"))
    return <Terminal color="#3b82f6" size={26} />;

  return <Monitor color="#9ca3af" size={26} />;
}

function MemoryBar({ value }) {
  const width = Math.min((value / 900) * 100, 100);

  let color = "#10b981";

  if (value > 300) color = "#f59e0b";
  if (value > 600) color = "#ef4444";

  return (
    <div
      style={{
        width: "100%",
        height: 8,
        background: "#202020",
        borderRadius: 50,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          background: color,
          transition: ".5s",
        }}
      />
    </div>
  );
}

export default function Processes({ processes, killProcess }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 35,
        padding: 25,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            Running Processes
          </h2>

          <p
            style={{
              color: "#888",
              marginTop: 5,
            }}
          >
            Live Memory Consumption
          </p>
        </div>

        <Cpu size={34} color="#ff6b35" />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {processes.map((process, index) => (
          <motion.div
            key={process.pid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="glass"
            style={{
              padding: 20,
              borderRadius: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  flex: 1,
                }}
              >
                <div className="process-logo">
                  {getIcon(process.name)}
                </div>

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {process.name}
                  </h3>

                  <p
                    style={{
                      color: "#888",
                      marginTop: 4,
                    }}
                  >
                    PID : {process.pid}
                  </p>

                  <MemoryBar value={process.memory_mb} />
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  marginLeft: 20,
                }}
              >
                <h3
                  style={{
                    color: "#10b981",
                  }}
                >
                  {process.memory_mb.toFixed(2)} MB
                </h3>

                <button
                  className="rust-button"
                  style={{
                    marginTop: 10,
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                  onClick={() => killProcess(process.pid)}
                >
                  Kill
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}