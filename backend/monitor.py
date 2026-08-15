import os
import socket
import subprocess
import threading
import time
import platform
from collections import deque

import psutil

try:
    import GPUtil
except ImportError:
    GPUtil = None

try:
    import winreg
except ImportError:
    winreg = None


START_TIME = time.time()
CREATE_NO_WINDOW = 0x08000000

_prev_disk = None
_prev_net = None
_prev_io_time = None
_first_io_sample = True
_io_lock = threading.Lock()
_cpu_lock = threading.Lock()
_cpu_cache = {"at": 0, "overall": None, "per_core": None}
_proc_lock = threading.Lock()
_proc_cache = {"at": 0, "list": None}
_latest_lock = threading.Lock()
_latest_metrics = {"at": 0, "data": None}
_gpu_lock = threading.Lock()
_gpu_cache = {"at": 0, "data": None}

cpu_history = deque(maxlen=120)
ram_history = deque(maxlen=120)
gpu_history = deque(maxlen=120)
disk_history = deque(maxlen=120)

PROTECTED_PROCESS_NAMES = {
    "system",
    "registry",
    "smss.exe",
    "csrss.exe",
    "wininit.exe",
    "winlogon.exe",
    "services.exe",
    "lsass.exe",
    "svchost.exe",
    "dwm.exe",
    "explorer.exe",
    "fontdrvhost.exe",
    "conhost.exe",
    "memory compression",
    "secure system",
    "idle",
    "system idle process",
    "lsm.exe",
    "spoolsv.exe",
    "csrss",
    "ntoskrnl.exe",
}

PROTECTED_PIDS = {0, 4}


def _run_hidden(args, timeout=8):
    kwargs = {
        "capture_output": True,
        "text": True,
        "timeout": timeout,
    }
    if os.name == "nt":
        kwargs["creationflags"] = CREATE_NO_WINDOW
    return subprocess.run(args, **kwargs)


def _unavailable_gpu():
    return {
        "available": False,
        "name": None,
        "usage": None,
        "memory_used": None,
        "memory_total": None,
        "temperature": None,
    }


def cpu_snapshot(min_interval=1.0):
    """One locked sample for overall + per-core usage.

    A blocking interval is required on Windows; interval=None plus concurrent
    /api/live, /api/ai, and /api/processes calls otherwise reports 0% or 100%.
    """
    with _cpu_lock:
        now = time.time()
        if _cpu_cache["overall"] is not None and now - _cpu_cache["at"] < min_interval:
            return _cpu_cache["overall"], list(_cpu_cache["per_core"] or [])
        per_core = [round(value, 1) for value in psutil.cpu_percent(interval=0.2, percpu=True)]
        overall = round(sum(per_core) / len(per_core), 1) if per_core else 0.0
        _cpu_cache["at"] = now
        _cpu_cache["overall"] = overall
        _cpu_cache["per_core"] = per_core
        return overall, list(per_core)


def cpu_usage():
    overall, _ = cpu_snapshot()
    return overall


def cpu_per_core():
    _, cores = cpu_snapshot()
    return cores


def cpu_frequency():
    freq = psutil.cpu_freq()
    if freq is None or not freq.current:
        return None
    return round(freq.current / 1000, 2) if freq.current > 20 else round(freq.current, 2)


def cpu_frequency_mhz():
    freq = psutil.cpu_freq()
    if freq is None or not freq.current:
        return None
    current = freq.current
    if current < 20:
        current *= 1000
    return round(current, 0)


def cpu_name():
    if winreg is not None:
        try:
            key = winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                r"HARDWARE\DESCRIPTION\System\CentralProcessor\0",
            )
            name, _ = winreg.QueryValueEx(key, "ProcessorNameString")
            winreg.CloseKey(key)
            if name:
                return name.strip()
        except OSError:
            pass

    name = platform.processor()
    return name.strip() if name else None


def cpu_info():
    return {
        "name": cpu_name(),
        "physical_cores": psutil.cpu_count(logical=False),
        "logical_cores": psutil.cpu_count(logical=True),
        "frequency": cpu_frequency(),
        "frequency_mhz": cpu_frequency_mhz(),
    }


def ram_info():
    ram = psutil.virtual_memory()
    return {
        "percent": round(ram.percent, 1),
        "used_gb": round(ram.used / (1024 ** 3), 2),
        "free_gb": round(ram.available / (1024 ** 3), 2),
        "total_gb": round(ram.total / (1024 ** 3), 2),
        "available_gb": round(ram.available / (1024 ** 3), 2),
    }


def _primary_disk_path():
    if os.name == "nt":
        system_drive = os.environ.get("SystemDrive", "C:")
        return system_drive + "\\"
    return "/"


def disk_partitions_info():
    partitions = []
    for part in psutil.disk_partitions(all=False):
        opts = (part.opts or "").lower()
        if "cdrom" in opts or not part.fstype:
            continue
        try:
            usage = psutil.disk_usage(part.mountpoint)
        except (PermissionError, OSError):
            continue
        partitions.append({
            "device": part.device,
            "mountpoint": part.mountpoint,
            "fstype": part.fstype,
            "percent": round(usage.percent, 1),
            "free_gb": round(usage.free / (1024 ** 3), 2),
            "total_gb": round(usage.total / (1024 ** 3), 2),
            "used_gb": round(usage.used / (1024 ** 3), 2),
        })
    return partitions


def disk_info():
    path = _primary_disk_path()
    try:
        disk = psutil.disk_usage(path)
    except (PermissionError, OSError):
        partitions = disk_partitions_info()
        if not partitions:
            return {
                "percent": None,
                "free_gb": None,
                "total_gb": None,
                "used_gb": None,
                "mountpoint": path,
            }
        primary = partitions[0]
        return {
            "percent": primary["percent"],
            "free_gb": primary["free_gb"],
            "total_gb": primary["total_gb"],
            "used_gb": primary["used_gb"],
            "mountpoint": primary["mountpoint"],
        }

    return {
        "percent": round(disk.percent, 1),
        "free_gb": round(disk.free / (1024 ** 3), 2),
        "total_gb": round(disk.total / (1024 ** 3), 2),
        "used_gb": round(disk.used / (1024 ** 3), 2),
        "mountpoint": path,
    }


def _io_rates():
    with _io_lock:
        return _io_rates_locked()


def _io_rates_locked():
    global _prev_disk, _prev_net, _prev_io_time, _first_io_sample

    now = time.time()
    disk_now = psutil.disk_io_counters()
    net_now = psutil.net_io_counters()

    if _first_io_sample or _prev_disk is None or _prev_net is None or _prev_io_time is None:
        _prev_disk = disk_now
        _prev_net = net_now
        _prev_io_time = now
        _first_io_sample = False
        return {
            "read_mb_s": 0.0,
            "write_mb_s": 0.0,
            "upload": 0.0,
            "download": 0.0,
        }

    elapsed = max(now - _prev_io_time, 0.001)

    read = 0.0
    write = 0.0
    if disk_now is not None:
        read = (disk_now.read_bytes - _prev_disk.read_bytes) / elapsed / (1024 ** 2)
        write = (disk_now.write_bytes - _prev_disk.write_bytes) / elapsed / (1024 ** 2)
        _prev_disk = disk_now

    upload = (net_now.bytes_sent - _prev_net.bytes_sent) / elapsed / (1024 ** 2)
    download = (net_now.bytes_recv - _prev_net.bytes_recv) / elapsed / (1024 ** 2)

    _prev_net = net_now
    _prev_io_time = now

    return {
        "read_mb_s": round(max(read, 0), 2),
        "write_mb_s": round(max(write, 0), 2),
        "upload": round(max(upload, 0), 2),
        "download": round(max(download, 0), 2),
    }


def network_total():
    net = psutil.net_io_counters()
    return {
        "sent_mb": round(net.bytes_sent / (1024 ** 2), 2),
        "recv_mb": round(net.bytes_recv / (1024 ** 2), 2),
    }


def network_interface():
    try:
        stats = psutil.net_if_stats()
        pernic = psutil.net_io_counters(pernic=True)
    except Exception:
        return None

    best_name = None
    best_bytes = -1
    for name, counters in pernic.items():
        lowered = name.lower()
        if lowered.startswith("loopback") or lowered.startswith("lo"):
            continue
        if name in stats and not stats[name].isup:
            continue
        total = counters.bytes_sent + counters.bytes_recv
        if total > best_bytes:
            best_bytes = total
            best_name = name
    return best_name


def _gpu_from_nvidia_smi():
    try:
        result = _run_hidden([
            "nvidia-smi",
            "--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu",
            "--format=csv,noheader,nounits",
        ], timeout=2.5)
        if result.returncode != 0 or not result.stdout.strip():
            return None
        line = result.stdout.strip().splitlines()[0]
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 5:
            return None

        def maybe_float(value):
            try:
                return float(value)
            except (TypeError, ValueError):
                return None

        usage = maybe_float(parts[1])
        mem_used = maybe_float(parts[2])
        mem_total = maybe_float(parts[3])
        temp = maybe_float(parts[4])

        return {
            "available": True,
            "name": parts[0] or None,
            "usage": round(usage, 1) if usage is not None else None,
            "memory_used": round(mem_used, 1) if mem_used is not None else None,
            "memory_total": round(mem_total, 1) if mem_total is not None else None,
            "temperature": round(temp, 1) if temp is not None else None,
        }
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None


def gpu_info():
    with _gpu_lock:
        now = time.time()
        if _gpu_cache["data"] is not None and now - _gpu_cache["at"] < 2.0:
            return _gpu_cache["data"]
        data = _gpu_info_uncached()
        _gpu_cache["at"] = now
        _gpu_cache["data"] = data
        return data


def _gpu_info_uncached():
    smi = _gpu_from_nvidia_smi()
    if smi is not None:
        return smi

    if GPUtil is None:
        return _unavailable_gpu()

    try:
        gpus = GPUtil.getGPUs()
        if not gpus:
            return _unavailable_gpu()
        gpu = gpus[0]
        temp = getattr(gpu, "temperature", None)
        if temp is not None and temp <= 0:
            temp = None
        usage = round(gpu.load * 100, 1) if gpu.load is not None else None
        return {
            "available": True,
            "name": gpu.name or None,
            "usage": usage,
            "memory_used": round(gpu.memoryUsed, 1) if gpu.memoryUsed is not None else None,
            "memory_total": round(gpu.memoryTotal, 1) if gpu.memoryTotal is not None else None,
            "temperature": round(temp, 1) if temp is not None else None,
        }
    except Exception:
        return _unavailable_gpu()


def battery_info():
    battery = psutil.sensors_battery()
    if battery is None:
        return {
            "available": False,
            "percent": None,
            "plugged": None,
            "status": None,
            "time_left": None,
        }

    if battery.power_plugged:
        status = "Charging" if battery.percent < 100 else "Plugged in"
    else:
        status = "On battery"

    remaining = None
    if battery.secsleft == psutil.POWER_TIME_UNLIMITED:
        remaining = None
    elif battery.secsleft == psutil.POWER_TIME_UNKNOWN or battery.secsleft < 0:
        remaining = None
    else:
        hrs = battery.secsleft // 3600
        mins = (battery.secsleft % 3600) // 60
        remaining = f"{hrs}h {mins}m"

    return {
        "available": True,
        "percent": round(battery.percent, 0),
        "plugged": battery.power_plugged,
        "status": status,
        "time_left": remaining,
    }


def system_info():
    return {
        "hostname": socket.gethostname(),
        "platform": platform.system(),
        "release": platform.release(),
        "version": platform.version(),
        "machine": platform.machine(),
        "processor": cpu_name(),
        "os": f"{platform.system()} {platform.release()}".strip(),
    }


def format_duration(seconds):
    seconds = max(int(seconds), 0)
    days = seconds // 86400
    hrs = (seconds % 86400) // 3600
    mins = (seconds % 3600) // 60
    secs = seconds % 60
    if days:
        return f"{days}d {hrs}h {mins}m"
    return f"{hrs}h {mins}m {secs}s"


def uptime():
    return format_duration(time.time() - psutil.boot_time())


def app_uptime():
    return format_duration(time.time() - START_TIME)


def process_count():
    try:
        return len(psutil.pids())
    except Exception:
        return None


_exe_cache = {}


def _process_exe(pid):
    if pid in _exe_cache:
        return _exe_cache[pid]
    path = None
    try:
        path = psutil.Process(pid).exe()
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess, OSError):
        path = None
    _exe_cache[pid] = path
    return path


def top_processes(limit=80):
    from icons import register_icon, flush_icon_index

    with _proc_lock:
        now = time.time()
        if _proc_cache["list"] is not None and now - _proc_cache["at"] < 1.25:
            cached = _proc_cache["list"]
            return cached[:limit] if limit else cached

        plist = []
        cores = max(psutil.cpu_count(logical=True) or 1, 1)
        for proc in psutil.process_iter(["pid", "name", "memory_info", "cpu_percent"]):
            try:
                info = proc.info
                pid = info.get("pid")
                name = (info.get("name") or "Unknown").strip()
                lowered = name.lower()
                if pid in {0} or lowered in {"idle", "system idle process"}:
                    continue
                memory = info.get("memory_info")
                memory_mb = round(memory.rss / (1024 ** 2), 1) if memory else 0.0
                raw_cpu = float(info.get("cpu_percent") or 0.0)
                cpu = round(min(max(raw_cpu / cores, 0.0), 100.0), 1)
                exe = _process_exe(pid)
                plist.append({
                    "pid": pid,
                    "name": name or "Unknown",
                    "memory_mb": memory_mb,
                    "cpu": cpu,
                    "icon_id": register_icon(exe),
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue

        plist.sort(key=lambda item: (item["cpu"], item["memory_mb"]), reverse=True)
        flush_icon_index()
        _proc_cache["at"] = now
        _proc_cache["list"] = plist
        return plist[:limit] if limit else plist


def push_history(cpu, ram, gpu, disk):
    cpu_history.append(cpu)
    ram_history.append(ram)
    gpu_history.append(gpu)
    disk_history.append(disk)


def history():
    return {
        "cpu": list(cpu_history),
        "ram": list(ram_history),
        "gpu": list(gpu_history),
        "disk": list(disk_history),
    }


_hw_cache = {"at": 0, "data": None}


def hardware_inventory():
    now = time.time()
    if _hw_cache["data"] and now - _hw_cache["at"] < 300:
        return _hw_cache["data"]
    data = {
        "cpu": cpu_info(),
        "system": system_info(),
    }
    _hw_cache["at"] = now
    _hw_cache["data"] = data
    return data


def get_latest_metrics(max_age=4):
    with _latest_lock:
        data = _latest_metrics["data"]
        age = time.time() - _latest_metrics["at"]
    if data and age <= max_age:
        return data
    return None


def get_metrics(include_processes=True):
    cpu, per_core = cpu_snapshot()
    ram = ram_info()
    gpu = gpu_info()
    disk = disk_info()
    io_rates = _io_rates()
    total_network = network_total()
    battery = battery_info()
    inventory = hardware_inventory()
    system = inventory["system"]
    cpu_details = inventory["cpu"]
    processes = top_processes() if include_processes else []

    push_history(
        cpu,
        ram["percent"],
        gpu["usage"],
        disk["percent"],
    )

    payload = {
        "cpu": cpu,
        "cpu_name": cpu_details["name"],
        "physical_cores": cpu_details["physical_cores"],
        "logical_cores": cpu_details["logical_cores"],
        "cpu_frequency": cpu_details["frequency"],
        "cpu_frequency_mhz": cpu_details["frequency_mhz"],
        "cpu_per_core": per_core,
        "ram": ram["percent"],
        "ram_used_gb": ram["used_gb"],
        "ram_free_gb": ram["free_gb"],
        "ram_available_gb": ram["available_gb"],
        "total_ram_gb": ram["total_gb"],
        "gpu": gpu["usage"],
        "gpu_available": gpu["available"],
        "gpu_name": gpu["name"],
        "gpu_temperature": gpu["temperature"],
        "gpu_memory_used": gpu["memory_used"],
        "gpu_memory_total": gpu["memory_total"],
        "disk": disk["percent"],
        "disk_free_gb": disk["free_gb"],
        "disk_total_gb": disk["total_gb"],
        "disk_used_gb": disk.get("used_gb"),
        "disk_mountpoint": disk.get("mountpoint"),
        "disk_partitions": disk_partitions_info() if include_processes else [],
        "disk_read_speed": io_rates["read_mb_s"],
        "disk_write_speed": io_rates["write_mb_s"],
        "upload_speed": io_rates["upload"],
        "download_speed": io_rates["download"],
        "network_sent_mb": total_network["sent_mb"],
        "network_recv_mb": total_network["recv_mb"],
        "network_interface": network_interface(),
        "battery": battery,
        "system": system,
        "os": system["os"],
        "hostname": system["hostname"],
        "uptime": uptime(),
        "app_uptime": app_uptime(),
        "process_count": process_count(),
        "processes": processes,
        "history": history(),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    with _latest_lock:
        _latest_metrics["at"] = time.time()
        _latest_metrics["data"] = payload
    return payload


def is_protected_process(process):
    if process.pid in PROTECTED_PIDS:
        return True
    if process.pid == os.getpid():
        return True
    try:
        name = (process.name() or "").strip().lower()
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        return True
    if name in PROTECTED_PROCESS_NAMES:
        return True
    try:
        if process.username() and "nt authority\\system" in process.username().lower() and name in {
            "services.exe",
            "lsass.exe",
            "csrss.exe",
            "wininit.exe",
            "winlogon.exe",
        }:
            return True
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        pass
    return False


def kill_process(pid):
    try:
        pid = int(pid)
    except (TypeError, ValueError):
        return {"success": False, "message": "Invalid process ID."}

    if pid in PROTECTED_PIDS:
        return {"success": False, "message": "That process is protected and cannot be terminated."}

    if not psutil.pid_exists(pid):
        return {"success": False, "message": "Process not found."}

    try:
        process = psutil.Process(pid)
        name = process.name()
        if is_protected_process(process):
            return {
                "success": False,
                "message": f"{name} is a protected system process and cannot be terminated.",
            }
        process.terminate()
        try:
            process.wait(timeout=2)
        except psutil.TimeoutExpired:
            process.kill()
        return {
            "success": True,
            "message": f"{name} (PID {pid}) terminated.",
        }
    except psutil.NoSuchProcess:
        return {"success": False, "message": "Process not found."}
    except psutil.AccessDenied:
        return {"success": False, "message": "Access denied. SMARTPULSE may need elevated permissions."}
    except psutil.ZombieProcess:
        return {"success": False, "message": "Process is no longer running."}
    except Exception as exc:
        return {"success": False, "message": str(exc)}


# Prime CPU percent counters so the first live sample is not always 0.
psutil.cpu_percent(interval=None, percpu=True)
for _proc in psutil.process_iter(["cpu_percent"]):
    pass
