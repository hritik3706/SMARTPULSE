import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Sparkles,
  ShieldCheck,
  Gauge,
  Download,
  RefreshCw,
  FileText,
  Wrench
} from "lucide-react";

function MetricCard({
  title,
  value,
  subtitle,
  color,
  icon,
  glow
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02
      }}
      className={`card ${glow}`}
      style={{
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        minWidth: 230
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span
          style={{
            color: "#888",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          {title}
        </span>

        {icon}
      </div>

      <h1
        style={{
          fontSize: 38,
          color,
          fontWeight: 800
        }}
      >
        {value}
      </h1>

      <span
        style={{
          color: "#666"
        }}
      >
        {subtitle}
      </span>
    </motion.div>
  );
}

function HealthRing({ score }) {
  const radius = 90;
  const stroke = 12;

  const normalized = radius - stroke * 2;

  const circumference =
    normalized *
    2 *
    Math.PI;

  const offset =
    circumference -
    (score / 100) *
      circumference;

  return (
    <motion.div
      className="card orange-glow"
      style={{
        padding: 35,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 340
      }}
    >
      <svg
        width="220"
        height="220"
      >
        <circle
          stroke="#202020"
          fill="transparent"
          strokeWidth={stroke}
          r={normalized}
          cx="110"
          cy="110"
        />

        <motion.circle
          stroke="#d84e27"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalized}
          cx="110"
          cy="110"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          animate={{
            strokeDashoffset: offset
          }}
          transition={{
            duration: 1
          }}
          transform="rotate(-90 110 110)"
        />
      </svg>

      <div
        style={{
          marginTop: -145,
          textAlign: "center"
        }}
      >
        <h1
          style={{
            fontSize: 54,
            fontWeight: 900
          }}
        >
          {score}
        </h1>

        <p
          style={{
            color: "#999"
          }}
        >
          HEALTH SCORE
        </p>
      </div>

      <div
        style={{
          marginTop: 60
        }}
      >
        <ShieldCheck
          size={34}
          color="#10b981"
        />
      </div>
    </motion.div>
  );
}

export default function Dashboard({
  metrics,
  ai,
  optimizePC,
  exportReport
}) {
  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: -30
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="card orange-glow"
        style={{
          padding: 30,
          marginBottom: 30
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 900
              }}
            >
              SMARTPULSE
            </h1>

            <p
              style={{
                color: "#888",
                marginTop: 8
              }}
            >
              AI Powered PC Performance Center
            </p>
          </div>

          <Sparkles
            size={42}
            color="#d84e27"
          />
        </div>
      </motion.div>      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: 25,
          marginBottom: 30
        }}
      >
        <HealthRing
          score={ai.health_score}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,minmax(240px,1fr))",
            gap: 20
          }}
        >
          <MetricCard
            title="CPU"
            value={`${metrics.cpu}%`}
            subtitle={metrics.cpu_name}
            color="#ff7849"
            glow="orange-glow"
            icon={<Cpu size={30} color="#ff7849" />}
          />

          <MetricCard
            title="RAM"
            value={`${metrics.ram}%`}
            subtitle={`${metrics.total_ram_gb} GB Installed`}
            color="#10b981"
            glow="green-glow"
            icon={<Activity size={30} color="#10b981" />}
          />

          <MetricCard
            title="GPU"
            value={`${metrics.gpu}%`}
            subtitle={metrics.gpu_name}
            color="#3b82f6"
            glow="blue-glow"
            icon={<Monitor size={30} color="#3b82f6" />}
          />

          <MetricCard
            title="DISK"
            value={`${metrics.disk}%`}
            subtitle={`${metrics.disk_free_gb} GB Free`}
            color="#8b5cf6"
            glow="purple-glow"
            icon={<HardDrive size={30} color="#8b5cf6" />}
          />
        </div>
      </div>

      <motion.div
        className="card"
        style={{
          padding: 25,
          marginBottom: 30
        }}
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800
              }}
            >
              AI STATUS
            </h2>

            <p
              style={{
                color: "#777",
                marginTop: 5
              }}
            >
              Live Intelligence Report
            </p>
          </div>

          <Gauge
            size={34}
            color="#d84e27"
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15
          }}
        >
          <div
            className="glass"
            style={{
              padding: 18,
              borderRadius: 16
            }}
          >
            <h3
              style={{
                color: "#10b981",
                fontWeight: 700
              }}
            >
              System Status
            </h3>

            <p
              style={{
                marginTop: 8,
                color: "#aaa"
              }}
            >
              {ai.severity.toUpperCase()}
            </p>
          </div>

          {ai.alerts.map((alert, index) => (
            <div
              key={index}
              className="glass"
              style={{
                padding: 16,
                borderRadius: 14,
                color: "#ffb347"
              }}
            >
              {alert}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="card"
        style={{
          padding: 25
        }}
      >
        <h2
          style={{
            marginBottom: 20,
            fontSize: 24
          }}
        >
          Quick Actions
        </h2>

        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap"
          }}
        >
          <button
            className="rust-button"
            onClick={optimizePC}
            style={{
              padding: "15px 28px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <Wrench size={18} />
            Optimize
          </button>

          <button
            className="rust-button"
            onClick={exportReport}
            style={{
              padding: "15px 28px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <FileText size={18} />
            Report
          </button>

          <button
            className="rust-button"
            style={{
              padding: "15px 28px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            className="rust-button"
            style={{
              padding: "15px 28px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <Download size={18} />
            Export JSON
          </button>
        </div>
      </motion.div>      <motion.div
        className="card"
        style={{
          padding: 25,
          marginTop: 30
        }}
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
      >
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 25
          }}
        >
          Hardware Summary
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(320px,1fr))",
            gap: 20
          }}
        >
          <div className="glass" style={{ padding: 20, borderRadius: 18 }}>
            <h3 style={{ color: "#ff7849", marginBottom: 12 }}>
              Processor
            </h3>

            <p style={{ color: "#ccc" }}>
              {metrics.cpu_name}
            </p>

            <p style={{ color: "#777", marginTop: 10 }}>
              {metrics.physical_cores} Physical Cores
            </p>

            <p style={{ color: "#777" }}>
              {metrics.logical_cores} Logical Cores
            </p>
          </div>

          <div className="glass" style={{ padding: 20, borderRadius: 18 }}>
            <h3 style={{ color: "#3b82f6", marginBottom: 12 }}>
              Graphics
            </h3>

            <p style={{ color: "#ccc" }}>
              {metrics.gpu_name}
            </p>

            <p style={{ color: "#777", marginTop: 10 }}>
              GPU Usage : {metrics.gpu}%
            </p>

            <p style={{ color: "#777" }}>
              VRAM : {metrics.gpu_memory_used} / {metrics.gpu_memory_total} MB
            </p>
          </div>

          <div className="glass" style={{ padding: 20, borderRadius: 18 }}>
            <h3 style={{ color: "#10b981", marginBottom: 12 }}>
              Memory
            </h3>

            <p style={{ color: "#ccc" }}>
              Installed : {metrics.total_ram_gb} GB
            </p>

            <p style={{ color: "#777", marginTop: 10 }}>
              Usage : {metrics.ram}%
            </p>
          </div>

          <div className="glass" style={{ padding: 20, borderRadius: 18 }}>
            <h3 style={{ color: "#8b5cf6", marginBottom: 12 }}>
              Storage
            </h3>

            <p style={{ color: "#ccc" }}>
              Total : {metrics.disk_total_gb} GB
            </p>

            <p style={{ color: "#777", marginTop: 10 }}>
              Free : {metrics.disk_free_gb} GB
            </p>

            <p style={{ color: "#777" }}>
              Used : {metrics.disk}%
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card"
        style={{
          padding: 25,
          marginTop: 30
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 20
          }}
        >
          System Information
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(250px,1fr))",
            gap: 20
          }}
        >
          <div className="glass" style={{ padding: 18, borderRadius: 16 }}>
            <span style={{ color: "#777" }}>
              Operating System
            </span>

            <h3 style={{ marginTop: 8 }}>
              {metrics.os}
            </h3>
          </div>

          <div className="glass" style={{ padding: 18, borderRadius: 16 }}>
            <span style={{ color: "#777" }}>
              System Uptime
            </span>

            <h3 style={{ marginTop: 8 }}>
              {metrics.uptime}
            </h3>
          </div>

          <div className="glass" style={{ padding: 18, borderRadius: 16 }}>
            <span style={{ color: "#777" }}>
              Network Sent
            </span>

            <h3 style={{ marginTop: 8 }}>
              {metrics.network_sent_mb} MB
            </h3>
          </div>

          <div className="glass" style={{ padding: 18, borderRadius: 16 }}>
            <span style={{ color: "#777" }}>
              Network Received
            </span>

            <h3 style={{ marginTop: 8 }}>
              {metrics.network_recv_mb} MB
            </h3>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass"
        style={{
          marginTop: 30,
          padding: 18,
          borderRadius: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h3
            style={{
              color: "#10b981"
            }}
          >
            Backend Connected
          </h3>

          <p
            style={{
              color: "#888",
              marginTop: 5
            }}
          >
            Live monitoring active
          </p>
        </div>

        <div
          style={{
            textAlign: "right"
          }}
        >
          <h2
            style={{
              color: "#ff7849",
              fontWeight: 900
            }}
          >
            SMARTPULSE
          </h2>

          <p
            style={{
              color: "#666"
            }}
          >
            AI Performance Suite
          </p>
        </div>
      </motion.div>

    </>
  );
}