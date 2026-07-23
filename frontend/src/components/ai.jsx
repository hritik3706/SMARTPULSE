import { useState } from "react";

import { motion } from "framer-motion";

import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Zap,
  TrendingUp,
  ArrowUpCircle
} from "lucide-react";

function ScoreCard({ score }) {
  const color =
    score >= 90
      ? "#10b981"
      : score >= 70
      ? "#f59e0b"
      : "#ef4444";

  return (
    <motion.div
      className="card"
      whileHover={{ y: -6 }}
      style={{
        padding: 28,
        textAlign: "center"
      }}
    >
      <Brain
        size={60}
        color={color}
      />

      <h1
        style={{
          fontSize: 56,
          marginTop: 20,
          color,
          fontWeight: 900
        }}
      >
        {score}
      </h1>

      <p
        style={{
          color: "#888",
          marginTop: 8
        }}
      >
        AI HEALTH SCORE
      </p>
    </motion.div>
  );
}

export default function AI({

  ai,

  metrics,

  advisor

}) {

  const [budget, setBudget] = useState(5000);

  const [upgrade, setUpgrade] = useState(null);

  async function getAdvice() {

    const result =
      await advisor(budget);

    if (result)
      setUpgrade(result);

  }

  return (

    <motion.div

      initial={{
        opacity:0,
        y:25
      }}

      animate={{
        opacity:1,
        y:0
      }}

      style={{
        marginTop:40
      }}

    >

      <h1

        style={{
          fontSize:34,
          fontWeight:900,
          marginBottom:25
        }}

      >
        AI Command Center
      </h1>

      <div

        style={{
          display:"grid",
          gridTemplateColumns:
          "340px 1fr",
          gap:25
        }}

      >

        <ScoreCard
          score={ai.health_score}
        />

        <div
          className="card"
          style={{
            padding:25
          }}
        >

          <div
            style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              marginBottom:20
            }}
          >

            <div>

              <h2>

                AI Diagnosis

              </h2>

              <p
                style={{
                  color:"#777",
                  marginTop:5
                }}
              >
                Live machine intelligence
              </p>

            </div>

            <Sparkles
              color="#ff6b35"
              size={34}
            />

          </div>

          <div

            style={{
              display:"flex",
              flexDirection:"column",
              gap:15
            }}

          >

            <div
              className="glass"
              style={{
                padding:18,
                borderRadius:15
              }}
            >

              <div
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:12
                }}
              >

                <CheckCircle2
                  color="#10b981"
                />

                <h3>

                  {ai.severity.toUpperCase()}

                </h3>

              </div>

            </div>

            {ai.alerts.map((item,index)=>(

              <div

                key={index}

                className="glass"

                style={{
                  padding:18,
                  borderRadius:15,
                  display:"flex",
                  gap:12,
                  alignItems:"center"
                }}

              >

                <AlertTriangle
                  color="#f59e0b"
                />

                <span>

                  {item}

                </span>

              </div>

            ))}

          </div>

        </div>        <motion.div
          className="card"
          style={{
            marginTop: 25,
            padding: 25
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
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800
              }}
            >
              AI Bottleneck Detector
            </h2>

            <Cpu
              size={30}
              color="#ff6b35"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 18
            }}
          >
            <div
              className="glass"
              style={{
                padding: 18,
                borderRadius: 15
              }}
            >
              <h4 style={{ color: "#888" }}>
                CPU
              </h4>

              <h2
                style={{
                  color:
                    metrics.cpu > 80
                      ? "#ef4444"
                      : "#10b981",
                  marginTop: 10
                }}
              >
                {metrics.cpu}%
              </h2>
            </div>

            <div
              className="glass"
              style={{
                padding: 18,
                borderRadius: 15
              }}
            >
              <h4 style={{ color: "#888" }}>
                RAM
              </h4>

              <h2
                style={{
                  color:
                    metrics.ram > 80
                      ? "#ef4444"
                      : "#10b981",
                  marginTop: 10
                }}
              >
                {metrics.ram}%
              </h2>
            </div>

            <div
              className="glass"
              style={{
                padding: 18,
                borderRadius: 15
              }}
            >
              <h4 style={{ color: "#888" }}>
                Disk
              </h4>

              <h2
                style={{
                  color:
                    metrics.disk > 90
                      ? "#ef4444"
                      : "#10b981",
                  marginTop: 10
                }}
              >
                {metrics.disk}%
              </h2>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card"
          style={{
            marginTop: 25,
            padding: 25
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20
            }}
          >
            <Zap
              color="#f59e0b"
            />

            <h2>
              AI Suggestions
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 15
            }}
          >
            {metrics.ram > 80 && (
              <div
                className="glass"
                style={{
                  padding: 16,
                  borderRadius: 14
                }}
              >
                RAM usage is high. Closing unnecessary applications can improve responsiveness.
              </div>
            )}

            {metrics.cpu > 80 && (
              <div
                className="glass"
                style={{
                  padding: 16,
                  borderRadius: 14
                }}
              >
                CPU usage is elevated. Check background processes or intensive workloads.
              </div>
            )}

            {metrics.disk > 85 && (
              <div
                className="glass"
                style={{
                  padding: 16,
                  borderRadius: 14
                }}
              >
                Disk utilization is high. Consider cleaning temporary files.
              </div>
            )}

            {metrics.cpu <= 80 &&
             metrics.ram <= 80 &&
             metrics.disk <= 85 && (
              <div
                className="glass"
                style={{
                  padding: 16,
                  borderRadius: 14
                }}
              >
                Your system is operating within healthy limits.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="card"
          style={{
            marginTop: 25,
            padding: 25
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20
            }}
          >
            <ArrowUpCircle
              color="#3b82f6"
            />

            <h2>
              Upgrade Advisor
            </h2>
          </div>

          <input
            type="range"
            min="2000"
            max="100000"
            step="1000"
            value={budget}
            onChange={(e) =>
              setBudget(
                Number(e.target.value)
              )
            }
            style={{
              width: "100%"
            }}
          />

          <h2
            style={{
              marginTop: 15,
              color: "#ff6b35"
            }}
          >
            ₹{budget}
          </h2>

          <button
            className="rust-button"
            style={{
              marginTop: 20,
              padding: "14px 26px",
              borderRadius: 12
            }}
            onClick={getAdvice}
          >
            Generate AI Upgrade Plan
          </button>

          {upgrade && (
            <motion.div
              initial={{
                opacity: 0,
                y: 15
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="glass"
              style={{
                marginTop: 25,
                padding: 20,
                borderRadius: 15
              }}
            >
              <h3
                style={{
                  color: "#10b981"
                }}
              >
                Recommendation
              </h3>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  marginTop: 12,
                  color: "#ddd",
                  fontFamily: "inherit"
                }}
              >
{JSON.stringify(upgrade, null, 2)}
              </pre>
            </motion.div>
          )}

        </motion.div>

      </div>

    </motion.div>

  );

}