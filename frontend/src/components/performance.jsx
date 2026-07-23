import { motion } from "framer-motion";

import {

    ResponsiveContainer,

    AreaChart,

    Area,

    LineChart,

    Line,

    XAxis,

    Tooltip,

    CartesianGrid

} from "recharts";

import {

    Cpu,

    Activity,

    HardDrive,

    Monitor,

    Thermometer,

    Wifi

} from "lucide-react";

function MetricCard({

    title,

    value,

    unit,

    color,

    icon

}) {

    return (

        <motion.div

            whileHover={{

                y:-5,

                scale:1.02

            }}

            className="card"

            style={{

                padding:22,

                flex:1,

                minWidth:220

            }}

        >

            <div

                style={{

                    display:"flex",

                    justifyContent:"space-between",

                    alignItems:"center"

                }}

            >

                <span

                    style={{

                        color:"#888",

                        fontWeight:600

                    }}

                >

                    {title}

                </span>

                {icon}

            </div>

            <h1

                style={{

                    fontSize:38,

                    color,

                    marginTop:18,

                    fontWeight:800

                }}

            >

                {value}{unit}

            </h1>

        </motion.div>

    );

}

export default function Performance({

    metrics,

    history

}){

    const cpuData=history.cpu;

    const ramData=history.ram;

    const gpuData=history.gpu;

    const diskData=history.disk;

    return(

        <motion.div

            initial={{

                opacity:0,

                y:20

            }}

            animate={{

                opacity:1,

                y:0

            }}

            style={{

                marginTop:35

            }}

        >

            <h1

                style={{

                    fontSize:34,

                    fontWeight:900,

                    marginBottom:25

                }}

            >

                Live Performance Monitor

            </h1>

            <div

                style={{

                    display:"grid",

                    gridTemplateColumns:

                    "repeat(auto-fit,minmax(230px,1fr))",

                    gap:20

                }}

            >

                <MetricCard

                    title="CPU"

                    value={metrics.cpu}

                    unit="%"

                    color="#ff6b35"

                    icon={

                        <Cpu

                            color="#ff6b35"

                        />

                    }

                />

                <MetricCard

                    title="RAM"

                    value={metrics.ram}

                    unit="%"

                    color="#10b981"

                    icon={

                        <Activity

                            color="#10b981"

                        />

                    }

                />

                <MetricCard

                    title="GPU"

                    value={metrics.gpu}

                    unit="%"

                    color="#3b82f6"

                    icon={

                        <Monitor

                            color="#3b82f6"

                        />

                    }

                />

                <MetricCard

                    title="Disk"

                    value={metrics.disk}

                    unit="%"

                    color="#8b5cf6"

                    icon={

                        <HardDrive

                            color="#8b5cf6"

                        />

                    }

                />

            </div>

            <div

                style={{

                    display:"grid",

                    gridTemplateColumns:

                    "1fr 1fr",

                    gap:25,

                    marginTop:30

                }}

            >

                <div

                    className="card"

                    style={{

                        padding:25

                    }}

                >

                    <h2

                        style={{

                            marginBottom:20

                        }}

                    >

                        CPU Usage History

                    </h2>

                    <ResponsiveContainer

                        width="100%"

                        height={260}

                    >

                        <AreaChart

                            data={cpuData}

                        >

                            <defs>

                                <linearGradient

                                    id="cpuFill"

                                    x1="0"

                                    y1="0"

                                    x2="0"

                                    y2="1"

                                >

                                    <stop

                                        offset="5%"

                                        stopColor="#ff6b35"

                                        stopOpacity={0.8}

                                    />

                                    <stop

                                        offset="95%"

                                        stopColor="#ff6b35"

                                        stopOpacity={0}

                                    />

                                </linearGradient>

                            </defs>

                            <CartesianGrid

                                stroke="#222"

                            />

                            <XAxis

                                dataKey="time"

                                tick={{

                                    fill:"#777",

                                    fontSize:10

                                }}

                            />

                            <Tooltip/>

                            <Area

                                type="monotone"

                                dataKey="value"

                                stroke="#ff6b35"

                                fill="url(#cpuFill)"

                                strokeWidth={3}

                                animationDuration={300}

                            />

                        </AreaChart>

                    </ResponsiveContainer>

                </div>                <div

                    className="card"

                    style={{

                        padding:25

                    }}

                >

                    <h2

                        style={{

                            marginBottom:20

                        }}

                    >

                        RAM Usage History

                    </h2>

                    <ResponsiveContainer

                        width="100%"

                        height={260}

                    >

                        <LineChart

                            data={ramData}

                        >

                            <CartesianGrid

                                stroke="#222"

                            />

                            <XAxis

                                dataKey="time"

                                tick={{

                                    fill:"#777",

                                    fontSize:10

                                }}

                            />

                            <Tooltip/>

                            <Line

                                type="monotone"

                                dataKey="value"

                                stroke="#10b981"

                                strokeWidth={3}

                                dot={false}

                                isAnimationActive

                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

                <div

                    className="card"

                    style={{

                        padding:25

                    }}

                >

                    <h2

                        style={{

                            marginBottom:20

                        }}

                    >

                        GPU Usage History

                    </h2>

                    <ResponsiveContainer

                        width="100%"

                        height={260}

                    >

                        <AreaChart

                            data={gpuData}

                        >

                            <defs>

                                <linearGradient

                                    id="gpuFill"

                                    x1="0"

                                    y1="0"

                                    x2="0"

                                    y2="1"

                                >

                                    <stop

                                        offset="5%"

                                        stopColor="#3b82f6"

                                        stopOpacity={0.8}

                                    />

                                    <stop

                                        offset="95%"

                                        stopColor="#3b82f6"

                                        stopOpacity={0}

                                    />

                                </linearGradient>

                            </defs>

                            <CartesianGrid

                                stroke="#222"

                            />

                            <XAxis

                                dataKey="time"

                                tick={{

                                    fill:"#777",

                                    fontSize:10

                                }}

                            />

                            <Tooltip/>

                            <Area

                                type="monotone"

                                dataKey="value"

                                stroke="#3b82f6"

                                fill="url(#gpuFill)"

                                strokeWidth={3}

                                animationDuration={300}

                            />

                        </AreaChart>

                    </ResponsiveContainer>

                </div>

                <div

                    className="card"

                    style={{

                        padding:25

                    }}

                >

                    <h2

                        style={{

                            marginBottom:20

                        }}

                    >

                        Disk Usage History

                    </h2>

                    <ResponsiveContainer

                        width="100%"

                        height={260}

                    >

                        <LineChart

                            data={diskData}

                        >

                            <CartesianGrid

                                stroke="#222"

                            />

                            <XAxis

                                dataKey="time"

                                tick={{

                                    fill:"#777",

                                    fontSize:10

                                }}

                            />

                            <Tooltip/>

                            <Line

                                type="monotone"

                                dataKey="value"

                                stroke="#8b5cf6"

                                strokeWidth={3}

                                dot={false}

                                isAnimationActive

                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

            <div

                style={{

                    display:"grid",

                    gridTemplateColumns:

                    "repeat(auto-fit,minmax(280px,1fr))",

                    gap:20,

                    marginTop:30

                }}

            >

                <MetricCard

                    title="CPU Temperature"

                    value={metrics.cpu_temp}

                    unit="°C"

                    color="#ef4444"

                    icon={

                        <Thermometer

                            color="#ef4444"

                        />

                    }

                />

                <MetricCard

                    title="Network Sent"

                    value={metrics.network_sent_mb}

                    unit=" MB"

                    color="#3b82f6"

                    icon={

                        <Wifi

                            color="#3b82f6"

                        />

                    }

                />

                <MetricCard

                    title="Network Received"

                    value={metrics.network_recv_mb}

                    unit=" MB"

                    color="#10b981"

                    icon={

                        <Wifi

                            color="#10b981"

                        />

                    }

                />            </div>

            <motion.div

                className="card"

                initial={{
                    opacity:0,
                    y:20
                }}

                animate={{
                    opacity:1,
                    y:0
                }}

                style={{

                    marginTop:35,

                    padding:25

                }}

            >

                <h2

                    style={{

                        fontSize:26,

                        fontWeight:800,

                        marginBottom:25

                    }}

                >

                    Hardware Information

                </h2>

                <div

                    style={{

                        display:"grid",

                        gridTemplateColumns:
                        "repeat(auto-fit,minmax(260px,1fr))",

                        gap:20

                    }}

                >

                    <div

                        className="glass"

                        style={{

                            padding:20,

                            borderRadius:18

                        }}

                    >

                        <h4
                            style={{
                                color:"#888"
                            }}
                        >
                            Processor
                        </h4>

                        <h3
                            style={{
                                marginTop:10
                            }}
                        >
                            {metrics.cpu_name}
                        </h3>

                    </div>

                    <div

                        className="glass"

                        style={{

                            padding:20,

                            borderRadius:18

                        }}

                    >

                        <h4
                            style={{
                                color:"#888"
                            }}
                        >
                            GPU
                        </h4>

                        <h3
                            style={{
                                marginTop:10
                            }}
                        >
                            {metrics.gpu_name}
                        </h3>

                    </div>

                    <div

                        className="glass"

                        style={{

                            padding:20,

                            borderRadius:18

                        }}

                    >

                        <h4
                            style={{
                                color:"#888"
                            }}
                        >
                            RAM Installed
                        </h4>

                        <h3
                            style={{
                                marginTop:10
                            }}
                        >
                            {metrics.total_ram_gb} GB
                        </h3>

                    </div>

                    <div

                        className="glass"

                        style={{

                            padding:20,

                            borderRadius:18

                        }}

                    >

                        <h4
                            style={{
                                color:"#888"
                            }}
                        >
                            Disk Space
                        </h4>

                        <h3
                            style={{
                                marginTop:10
                            }}
                        >
                            {metrics.disk_free_gb} GB Free
                        </h3>

                    </div>

                    <div

                        className="glass"

                        style={{

                            padding:20,

                            borderRadius:18

                        }}

                    >

                        <h4
                            style={{
                                color:"#888"
                            }}
                        >
                            Physical Cores
                        </h4>

                        <h3
                            style={{
                                marginTop:10
                            }}
                        >
                            {metrics.physical_cores}
                        </h3>

                    </div>

                    <div

                        className="glass"

                        style={{

                            padding:20,

                            borderRadius:18

                        }}

                    >

                        <h4
                            style={{
                                color:"#888"
                            }}
                        >
                            Logical Cores
                        </h4>

                        <h3
                            style={{
                                marginTop:10
                            }}
                        >
                            {metrics.logical_cores}
                        </h3>

                    </div>

                </div>

            </motion.div>

            <motion.div

                className="glass"

                style={{

                    marginTop:30,

                    padding:20,

                    borderRadius:18,

                    display:"flex",

                    justifyContent:"space-between",

                    alignItems:"center",

                    flexWrap:"wrap",

                    gap:15

                }}

            >

                <div>

                    <h2

                        style={{
                            color:"#10b981"
                        }}

                    >

                        Live Monitoring Active

                    </h2>

                    <p

                        style={{
                            color:"#888",
                            marginTop:6
                        }}

                    >

                        Refresh Rate : 1 Second

                    </p>

                </div>

                <div

                    style={{
                        textAlign:"right"
                    }}

                >

                    <h2

                        style={{
                            color:"#ff6b35"
                        }}

                    >

                        SMARTPULSE

                    </h2>

                    <p

                        style={{
                            color:"#666"
                        }}

                    >

                        Real Time Performance Engine

                    </p>

                </div>

            </motion.div>

        </motion.div>

    );

}