import os
import time
import socket
import platform
from collections import deque

import psutil

try:
    import GPUtil
except ImportError:
    GPUtil = None


# =====================================================
# SMARTPULSE V2
# Live Monitoring Engine
# =====================================================

START_TIME = time.time()

_prev_disk = psutil.disk_io_counters()
_prev_net = psutil.net_io_counters()
_prev_time = time.time()

cpu_history = deque(maxlen=300)
ram_history = deque(maxlen=300)
gpu_history = deque(maxlen=300)
disk_history = deque(maxlen=300)


# =====================================================
# CPU
# =====================================================

def cpu_usage():
    return round(psutil.cpu_percent(interval=None), 1)


def cpu_per_core():
    return psutil.cpu_percent(interval=None, percpu=True)


def cpu_frequency():
    freq = psutil.cpu_freq()

    if freq is None:
        return 0

    return round(freq.current, 0)


def cpu_info():

    return {

        "name": platform.processor(),

        "physical_cores": psutil.cpu_count(False),

        "logical_cores": psutil.cpu_count(True),

        "frequency": cpu_frequency()

    }


# =====================================================
# RAM
# =====================================================

def ram_info():

    ram = psutil.virtual_memory()

    return {

        "percent": round(ram.percent, 1),

        "used_gb": round(ram.used / (1024 ** 3), 2),

        "free_gb": round(ram.available / (1024 ** 3), 2),

        "total_gb": round(ram.total / (1024 ** 3), 2)

    }


# =====================================================
# DISK
# =====================================================

def disk_info():

    disk = psutil.disk_usage("/")

    return {

        "percent": round(disk.percent, 1),

        "free_gb": round(disk.free / (1024 ** 3), 2),

        "total_gb": round(disk.total / (1024 ** 3), 2)

    }


def disk_speed():

    global _prev_disk

    current = psutil.disk_io_counters()

    read = (
        current.read_bytes -
        _prev_disk.read_bytes
    ) / 1024 / 1024

    write = (
        current.write_bytes -
        _prev_disk.write_bytes
    ) / 1024 / 1024

    _prev_disk = current

    return {

        "read_mb_s": round(read, 2),

        "write_mb_s": round(write, 2)

    }


# =====================================================
# GPU
# =====================================================

def gpu_info():

    if GPUtil is None:

        return {

            "name": "Unknown",

            "usage": 0,

            "memory_used": 0,

            "memory_total": 0,

            "temperature": 0

        }

    try:

        gpu = GPUtil.getGPUs()[0]

        return {

            "name": gpu.name,

            "usage": round(gpu.load * 100, 1),

            "memory_used": gpu.memoryUsed,

            "memory_total": gpu.memoryTotal,

            "temperature": gpu.temperature

        }

    except:

        return {

            "name": "Unknown",

            "usage": 0,

            "memory_used": 0,

            "memory_total": 0,

            "temperature": 0

        }# =====================================================
# NETWORK
# =====================================================

def network_speed():

    global _prev_net
    global _prev_time

    current = psutil.net_io_counters()

    now = time.time()

    elapsed = max(now - _prev_time, 1)

    upload = (
        current.bytes_sent -
        _prev_net.bytes_sent
    ) / elapsed / 1024 / 1024

    download = (
        current.bytes_recv -
        _prev_net.bytes_recv
    ) / elapsed / 1024 / 1024

    _prev_net = current

    _prev_time = now

    return {

        "upload": round(upload, 2),

        "download": round(download, 2)

    }


def network_total():

    net = psutil.net_io_counters()

    return {

        "sent_mb": round(net.bytes_sent / 1024 / 1024, 2),

        "recv_mb": round(net.bytes_recv / 1024 / 1024, 2)

    }


# =====================================================
# BATTERY
# =====================================================

def battery_info():

    battery = psutil.sensors_battery()

    if battery is None:

        return {

            "available": False,

            "percent": 0,

            "plugged": False,

            "time_left": "Unknown"

        }

    if battery.secsleft == psutil.POWER_TIME_UNLIMITED:

        remaining = "Charging"

    elif battery.secsleft == psutil.POWER_TIME_UNKNOWN:

        remaining = "Unknown"

    else:

        hrs = battery.secsleft // 3600

        mins = (battery.secsleft % 3600) // 60

        remaining = f"{hrs}h {mins}m"

    return {

        "available": True,

        "percent": battery.percent,

        "plugged": battery.power_plugged,

        "time_left": remaining

    }


# =====================================================
# SYSTEM
# =====================================================

def system_info():

    return {

        "hostname": socket.gethostname(),

        "platform": platform.system(),

        "release": platform.release(),

        "version": platform.version(),

        "machine": platform.machine(),

        "processor": platform.processor()

    }


def uptime():

    seconds = int(time.time() - START_TIME)

    hrs = seconds // 3600

    mins = (seconds % 3600) // 60

    secs = seconds % 60

    return f"{hrs}h {mins}m {secs}s"


# =====================================================
# PROCESSES
# =====================================================

def top_processes(limit=10):

    plist = []

    for proc in psutil.process_iter(

        [

            "pid",

            "name",

            "memory_info",

            "cpu_percent"

        ]

    ):

        try:

            plist.append({

                "pid": proc.info["pid"],

                "name": proc.info["name"] or "Unknown",

                "memory_mb": round(

                    proc.info["memory_info"].rss /

                    1024 /

                    1024,

                    1

                ),

                "cpu": proc.info["cpu_percent"]

            })

        except (

            psutil.NoSuchProcess,

            psutil.AccessDenied,

            psutil.ZombieProcess

        ):

            pass

    plist.sort(

        key=lambda x: x["memory_mb"],

        reverse=True

    )

    return plist[:limit]


# =====================================================
# HISTORY
# =====================================================

def push_history(

    cpu,

    ram,

    gpu,

    disk

):

    cpu_history.append(cpu)

    ram_history.append(ram)

    gpu_history.append(gpu)

    disk_history.append(disk)


def history():

    return {

        "cpu": list(cpu_history),

        "ram": list(ram_history),

        "gpu": list(gpu_history),

        "disk": list(disk_history)

    }# =====================================================
# MAIN METRICS ENGINE
# =====================================================

def get_metrics():

    cpu = cpu_usage()

    ram = ram_info()

    gpu = gpu_info()

    disk = disk_info()

    disk_io = disk_speed()

    network = network_speed()

    total_network = network_total()

    battery = battery_info()

    system = system_info()

    cpu_details = cpu_info()

    processes = top_processes()

    push_history(

        cpu,

        ram["percent"],

        gpu["usage"],

        disk["percent"]

    )

    return {

        # ---------------- CPU ----------------

        "cpu": cpu,

        "cpu_name": cpu_details["name"],

        "physical_cores": cpu_details["physical_cores"],

        "logical_cores": cpu_details["logical_cores"],

        "cpu_frequency": cpu_details["frequency"],

        "cpu_per_core": cpu_per_core(),

        # ---------------- RAM ----------------

        "ram": ram["percent"],

        "ram_used_gb": ram["used_gb"],

        "ram_free_gb": ram["free_gb"],

        "total_ram_gb": ram["total_gb"],

        # ---------------- GPU ----------------

        "gpu": gpu["usage"],

        "gpu_name": gpu["name"],

        "gpu_temperature": gpu["temperature"],

        "gpu_memory_used": gpu["memory_used"],

        "gpu_memory_total": gpu["memory_total"],

        # ---------------- Disk ----------------

        "disk": disk["percent"],

        "disk_free_gb": disk["free_gb"],

        "disk_total_gb": disk["total_gb"],

        "disk_read_speed": disk_io["read_mb_s"],

        "disk_write_speed": disk_io["write_mb_s"],

        # ---------------- Network ----------------

        "upload_speed": network["upload"],

        "download_speed": network["download"],

        "network_sent_mb": total_network["sent_mb"],

        "network_recv_mb": total_network["recv_mb"],

        # ---------------- Battery ----------------

        "battery": battery,

        # ---------------- System ----------------

        "system": system,

        "uptime": uptime(),

        # ---------------- Processes ----------------

        "processes": processes,

        # ---------------- History ----------------

        "history": history()

    }


# =====================================================
# PROCESS CONTROL
# =====================================================

def kill_process(pid):

    try:

        process = psutil.Process(pid)

        process.terminate()

        return {

            "success": True,

            "message": f"Process {pid} terminated."

        }

    except psutil.NoSuchProcess:

        return {

            "success": False,

            "message": "Process not found."

        }

    except psutil.AccessDenied:

        return {

            "success": False,

            "message": "Access denied."

        }

    except Exception as e:

        return {

            "success": False,

            "message": str(e)

        }


# =====================================================
# HEALTH SCORE
# =====================================================

def health_score(metrics):

    score = 100

    if metrics["cpu"] > 90:
        score -= 25
    elif metrics["cpu"] > 75:
        score -= 15

    if metrics["ram"] > 90:
        score -= 25
    elif metrics["ram"] > 80:
        score -= 15

    if metrics["disk"] > 90:
        score -= 10

    if metrics["gpu"] > 95:
        score -= 10

    return max(score, 0)


# =====================================================
# AI SUMMARY
# =====================================================

def ai_summary(metrics):

    alerts = []

    if metrics["cpu"] > 85:
        alerts.append("High CPU usage detected.")

    if metrics["ram"] > 85:
        alerts.append("RAM usage is critically high.")

    if metrics["disk"] > 90:
        alerts.append("Disk utilization is very high.")

    if metrics["gpu"] > 90:
        alerts.append("GPU load is near maximum.")

    if metrics["gpu_temperature"] > 85:
        alerts.append("GPU temperature is too high.")

    if len(alerts) == 0:
        alerts.append("System is healthy.")

    return {

        "health_score": health_score(metrics),

        "alerts": alerts,

        "severity": (

            "critical"

            if health_score(metrics) < 50

            else "warning"

            if health_score(metrics) < 80

            else "healthy"

        )

    }