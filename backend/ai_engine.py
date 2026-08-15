import time
from collections import deque
from datetime import datetime

from monitor import get_metrics

_ai_cache = {"at": 0, "payload": None}


_timeline = deque(maxlen=40)
_previous = {
    "cpu_high": False,
    "ram_high": False,
    "disk_high": False,
    "gpu_high": False,
    "gpu_hot": False,
}


def _push_event(message, level="info"):
    last = _timeline[-1]["message"] if _timeline else None
    if last == message:
        return
    _timeline.append({
        "time": datetime.now().strftime("%H:%M"),
        "message": message,
        "level": level,
    })


def _num(value):
    return value if isinstance(value, (int, float)) else None


def health_score(metrics):
    score = 100
    cpu = _num(metrics.get("cpu"))
    ram = _num(metrics.get("ram"))
    disk = _num(metrics.get("disk"))
    gpu = _num(metrics.get("gpu")) if metrics.get("gpu_available") else None
    gpu_temp = _num(metrics.get("gpu_temperature")) if metrics.get("gpu_available") else None

    if cpu is not None:
        if cpu > 90:
            score -= 20
        elif cpu > 75:
            score -= 10

    if ram is not None:
        if ram > 90:
            score -= 20
        elif ram > 75:
            score -= 10

    if disk is not None:
        if disk > 90:
            score -= 15
        elif disk > 85:
            score -= 8

    if gpu is not None:
        if gpu > 95:
            score -= 10
        elif gpu > 85:
            score -= 5

    if gpu_temp is not None and gpu_temp > 85:
        score -= 10

    return max(int(round(score)), 0)


def severity_from_score(score):
    if score < 50:
        return "critical"
    if score < 80:
        return "warning"
    return "healthy"


def bottleneck(metrics):
    candidates = []
    mapping = [
        ("CPU", metrics.get("cpu"), 75, 90),
        ("MEMORY", metrics.get("ram"), 75, 90),
        ("DISK", metrics.get("disk"), 85, 95),
    ]
    if metrics.get("gpu_available"):
        mapping.append(("GPU", metrics.get("gpu"), 85, 95))

    for name, value, warn, crit in mapping:
        if not isinstance(value, (int, float)):
            continue
        if value >= crit:
            candidates.append((name, value, "CRITICAL"))
        elif value >= warn:
            candidates.append((name, value, "WARNING"))

    if not candidates:
        return None

    name, value, level = max(candidates, key=lambda item: item[1])
    return {
        "component": name,
        "value": value,
        "severity": level,
    }


def recommendations(metrics):
    tips = []
    cpu = _num(metrics.get("cpu"))
    ram = _num(metrics.get("ram"))
    disk = _num(metrics.get("disk"))
    gpu = _num(metrics.get("gpu")) if metrics.get("gpu_available") else None
    gpu_temp = _num(metrics.get("gpu_temperature")) if metrics.get("gpu_available") else None

    if ram is not None and ram > 80:
        tips.append("Close unnecessary background applications to relieve memory pressure.")
        tips.append("Review startup applications that remain resident after login.")
        if metrics.get("total_ram_gb") and metrics["total_ram_gb"] <= 16:
            tips.append("Consider additional RAM if usage remains high during normal work.")

    if cpu is not None and cpu > 85:
        tips.append("Identify high-CPU processes and close workloads you are not using.")

    if disk is not None and disk > 90:
        tips.append("Free disk space by removing temporary files and unused applications.")

    if gpu is not None and gpu > 90:
        tips.append("Reduce GPU load by closing overlays or lowering graphics settings.")

    if gpu_temp is not None and gpu_temp > 85:
        tips.append("GPU temperature is elevated. Check airflow and cooling.")

    if not tips:
        tips.append("No immediate action required. Continue normal monitoring.")

    return tips


def diagnosis_text(metrics, neck):
    if neck is None:
        return "No significant bottleneck detected during the last monitoring period."

    component = neck["component"]
    if component == "MEMORY":
        return "Memory pressure is elevated during multitasking."
    if component == "CPU":
        return "Processor utilization is high enough to affect responsiveness."
    if component == "DISK":
        return "Storage capacity is constrained and may slow application loads."
    if component == "GPU":
        return "Graphics processor load is elevated."
    return f"{component} is currently the primary constraint."


def insight_from_metrics(metrics, neck, score):
    ram = _num(metrics.get("ram"))
    cpu = _num(metrics.get("cpu"))
    disk = _num(metrics.get("disk"))

    if neck and neck["component"] == "MEMORY":
        return {
            "title": "SMARTPULSE INSIGHT",
            "body": f"RAM usage is {ram}% and is contributing to reduced headroom.",
            "action": "Close unnecessary background applications.",
        }
    if neck and neck["component"] == "CPU":
        return {
            "title": "SMARTPULSE INSIGHT",
            "body": f"CPU usage is {cpu}% and may affect foreground responsiveness.",
            "action": "Review high-CPU processes in the Processes view.",
        }
    if neck and neck["component"] == "DISK":
        return {
            "title": "SMARTPULSE INSIGHT",
            "body": f"Disk usage is {disk}%. Low free space can slow installs and paging.",
            "action": "Run the optimizer to recover temporary files, then free unused data.",
        }
    if score >= 85:
        return {
            "title": "SYSTEM LOOKS GOOD",
            "body": "No significant bottleneck detected during the last monitoring period.",
            "action": None,
        }
    return {
        "title": "SMARTPULSE INSIGHT",
        "body": "The system is operational, with moderate resource use.",
        "action": "Keep monitoring if you open heavier workloads.",
    }


def _update_timeline(metrics):
    if not _timeline:
        _push_event("Monitoring engine online", "info")

    cpu = _num(metrics.get("cpu")) or 0
    ram = _num(metrics.get("ram")) or 0
    disk = _num(metrics.get("disk")) or 0
    gpu = _num(metrics.get("gpu")) if metrics.get("gpu_available") else None
    gpu_temp = _num(metrics.get("gpu_temperature")) if metrics.get("gpu_available") else None

    cpu_high = cpu > 85
    ram_high = ram > 75
    disk_high = disk > 90
    gpu_high = gpu is not None and gpu > 90
    gpu_hot = gpu_temp is not None and gpu_temp > 85

    if ram_high and not _previous["ram_high"]:
        _push_event("RAM pressure detected", "warning")
        processes = metrics.get("processes") or []
        if processes:
            top = processes[0]
            _push_event(f"{top.get('name', 'Background process')} consuming memory", "warning")
        _push_event("Optimization recommended", "warning")
    elif not ram_high and _previous["ram_high"]:
        _push_event("Memory pressure eased", "info")

    if cpu_high and not _previous["cpu_high"]:
        _push_event("CPU load elevated", "warning")
    elif not cpu_high and cpu < 50:
        if not any(event["message"] == "CPU normal" for event in list(_timeline)[-4:]):
            _push_event("CPU normal", "info")

    if disk_high and not _previous["disk_high"]:
        _push_event("Disk capacity warning", "warning")

    if gpu_high and not _previous["gpu_high"]:
        _push_event("GPU load near maximum", "warning")

    if gpu_hot and not _previous["gpu_hot"]:
        _push_event("GPU temperature elevated", "warning")

    _previous.update({
        "cpu_high": cpu_high,
        "ram_high": ram_high,
        "disk_high": disk_high,
        "gpu_high": gpu_high,
        "gpu_hot": gpu_hot,
    })


def alerts_from_metrics(metrics):
    alerts = []
    cpu = _num(metrics.get("cpu"))
    ram = _num(metrics.get("ram"))
    disk = _num(metrics.get("disk"))
    gpu = _num(metrics.get("gpu")) if metrics.get("gpu_available") else None
    gpu_temp = _num(metrics.get("gpu_temperature")) if metrics.get("gpu_available") else None

    if cpu is not None and cpu > 85:
        alerts.append("High CPU usage detected.")
    if ram is not None and ram > 85:
        alerts.append("RAM usage is critically high.")
    elif ram is not None and ram > 75:
        alerts.append("Memory pressure is elevated.")
    if disk is not None and disk > 90:
        alerts.append("Disk utilization is very high.")
    if gpu is not None and gpu > 90:
        alerts.append("GPU load is near maximum.")
    if gpu_temp is not None and gpu_temp > 85:
        alerts.append("GPU temperature is elevated.")
    if not alerts:
        alerts.append("System is healthy.")
    return alerts


def gaming_score(metrics):
    score = 100
    cpu = _num(metrics.get("cpu")) or 0
    ram = _num(metrics.get("ram")) or 0
    gpu = _num(metrics.get("gpu")) if metrics.get("gpu_available") else 0
    score -= cpu * 0.18
    score -= ram * 0.15
    score -= gpu * 0.08
    return max(round(score), 0)


def productivity_score(metrics):
    score = 100
    cpu = _num(metrics.get("cpu")) or 0
    ram = _num(metrics.get("ram")) or 0
    disk = _num(metrics.get("disk")) or 0
    score -= cpu * 0.10
    score -= ram * 0.20
    score -= disk * 0.05
    return max(round(score), 0)


def prediction(metrics):
    cpu = _num(metrics.get("cpu")) or 0
    ram = _num(metrics.get("ram")) or 0
    gpu_temp = _num(metrics.get("gpu_temperature")) if metrics.get("gpu_available") else None
    if cpu > 95:
        return "System may freeze under sustained workload."
    if ram > 95:
        return "Memory exhaustion likely."
    if gpu_temp is not None and gpu_temp > 88:
        return "GPU thermal throttling may occur."
    return "Performance expected to remain stable."


def analyze(metrics=None):
    if metrics is None:
        metrics = get_metrics()

    score = health_score(metrics)
    neck = bottleneck(metrics)
    _update_timeline(metrics)
    recs = recommendations(metrics)

    return {
        "engine": "SMARTPULSE Nexus",
        "health_score": score,
        "severity": severity_from_score(score),
        "bottleneck": neck,
        "diagnosis": diagnosis_text(metrics, neck),
        "recommendations": recs,
        "alerts": alerts_from_metrics(metrics),
        "insight": insight_from_metrics(metrics, neck, score),
        "timeline": list(_timeline),
        "gaming_score": gaming_score(metrics),
        "productivity_score": productivity_score(metrics),
        "prediction": prediction(metrics),
        "sections": diagnosis_sections(metrics),
        "analyzed_at": datetime.now().isoformat(timespec="seconds"),
    }


def diagnosis_sections(metrics):
    cpu = _num(metrics.get("cpu"))
    ram = _num(metrics.get("ram"))
    disk = _num(metrics.get("disk"))
    gpu = _num(metrics.get("gpu")) if metrics.get("gpu_available") else None
    gpu_temp = _num(metrics.get("gpu_temperature")) if metrics.get("gpu_available") else None

    def status(value, warn, crit):
        if value is None:
            return "unavailable"
        if value >= crit:
            return "critical"
        if value >= warn:
            return "warning"
        return "good"

    return [
        {
            "category": "CPU Performance",
            "status": status(cpu, 75, 90),
            "message": f"Average utilization is {cpu}%." if cpu is not None else "CPU telemetry unavailable.",
            "recommendation": "Review high-CPU processes." if cpu is not None and cpu >= 75 else "No CPU action required.",
        },
        {
            "category": "Memory Pressure",
            "status": status(ram, 75, 90),
            "message": f"RAM usage is {ram}% ({metrics.get('ram_used_gb')} / {metrics.get('total_ram_gb')} GB)." if ram is not None else "Memory telemetry unavailable.",
            "recommendation": "Close unused background applications." if ram is not None and ram >= 75 else "Memory headroom is acceptable.",
        },
        {
            "category": "Disk Health",
            "status": status(disk, 85, 95),
            "message": f"Volume usage is {disk}% with {metrics.get('disk_free_gb')} GB free." if disk is not None else "Disk telemetry unavailable.",
            "recommendation": "Free space with the optimizer." if disk is not None and disk >= 85 else "Storage capacity is healthy.",
        },
        {
            "category": "GPU Status",
            "status": "unavailable" if not metrics.get("gpu_available") else status(gpu, 85, 95),
            "message": (
                f"Load {gpu}% · Temperature {gpu_temp if gpu_temp is not None else 'Unavailable'}."
                if metrics.get("gpu_available")
                else "GPU telemetry unavailable."
            ),
            "recommendation": "Reduce GPU load if temperatures stay elevated." if gpu_temp and gpu_temp > 85 else "No GPU action required.",
        },
        {
            "category": "Network Status",
            "status": "good",
            "message": f"Down {metrics.get('download_speed')} MB/s · Up {metrics.get('upload_speed')} MB/s.",
            "recommendation": "No network action required.",
        },
    ]


def analyze_cached(metrics=None, ttl=30):
    now = time.time()
    if _ai_cache["payload"] and now - _ai_cache["at"] < ttl:
        return _ai_cache["payload"]
    payload = analyze(metrics)
    _ai_cache["at"] = now
    _ai_cache["payload"] = payload
    return payload
