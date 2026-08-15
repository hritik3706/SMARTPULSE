from monitor import get_metrics


def _level(score):
    if score >= 75:
        return "HIGH"
    if score >= 45:
        return "MEDIUM"
    return "LOW"


def _ram_priority(metrics):
    usage = metrics.get("ram") or 0
    total = metrics.get("total_ram_gb") or 0
    score = min(100, int(usage))
    if total and total <= 8:
        score = max(score, 80)
    return score


def _cpu_priority(metrics):
    usage = metrics.get("cpu") or 0
    return min(100, int(usage))


def _gpu_priority(metrics):
    if not metrics.get("gpu_available"):
        return 0
    usage = metrics.get("gpu") or 0
    return min(100, int(usage))


def _storage_priority(metrics):
    usage = metrics.get("disk") or 0
    free = metrics.get("disk_free_gb")
    score = min(100, int(usage))
    if free is not None and free < 20:
        score = max(score, 80)
    return score


def recommend_ram(budget, total_gb, usage):
    if total_gb and total_gb <= 8:
        target = "16 GB"
    elif total_gb and total_gb <= 16:
        target = "32 GB"
    else:
        target = f"{int(total_gb) + 16} GB" if total_gb else "32 GB"

    if budget < 3000:
        return f"Add matched RAM toward {target} if modules are available."
    if budget < 7000:
        return f"Upgrade to {target}."
    return f"Upgrade to {target}, preferring current-generation DDR if the motherboard supports it."


def recommend_storage(budget, total_gb):
    if budget < 2500:
        return "Add a 500 GB NVMe SSD for applications and working files."
    if budget < 6000:
        return "Add or replace with a 1 TB NVMe Gen4 SSD."
    return "Add a 2 TB NVMe Gen4 SSD if large files or games are stored locally."


def recommend_gpu(budget):
    if budget < 25000:
        return "Consider an RTX 4060-class GPU if current graphics telemetry stays saturated."
    if budget < 45000:
        return "Consider an RTX 5060-class GPU for a balanced upgrade."
    if budget < 70000:
        return "Consider an RTX 5070-class GPU."
    return "Consider an RTX 5080-class GPU if the rest of the system can feed it."


def recommend_cpu(budget):
    if budget < 18000:
        return "Consider a current Ryzen 5 / Core i5 class CPU if the chipset allows it."
    if budget < 30000:
        return "Consider a Ryzen 7 / Core i7 class CPU."
    return "Consider a high-cache gaming CPU such as a Ryzen 7 X3D if the platform supports it."


def estimated_gain(priorities):
    high = sum(1 for item in priorities if item["level"] == "HIGH")
    medium = sum(1 for item in priorities if item["level"] == "MEDIUM")
    if high >= 2:
        return "30-50%"
    if high == 1:
        return "15-25%"
    if medium:
        return "5-15%"
    return "0-5%"


def get_upgrade_advice(budget):
    try:
        budget = float(budget)
    except (TypeError, ValueError):
        budget = 5000

    metrics = get_metrics(include_processes=False)

    ram_score = _ram_priority(metrics)
    cpu_score = _cpu_priority(metrics)
    gpu_score = _gpu_priority(metrics)
    disk_score = _storage_priority(metrics)

    system = {
        "cpu": metrics.get("cpu_name") or "Unavailable",
        "gpu": metrics.get("gpu_name") if metrics.get("gpu_available") else "GPU telemetry unavailable",
        "ram_gb": metrics.get("total_ram_gb"),
        "storage_gb": metrics.get("disk_total_gb"),
        "os": metrics.get("os"),
    }

    priorities = []
    recommendations = {}
    legacy_priority = []

    ram_item = {
        "component": "RAM",
        "level": _level(ram_score),
        "score": ram_score,
        "reason": (
            f"Current usage is {metrics.get('ram')}% of {metrics.get('total_ram_gb')} GB."
            if metrics.get("ram") is not None
            else "Memory telemetry unavailable."
        ),
        "recommendation": None,
    }
    if ram_score >= 45 and metrics.get("ram") is not None:
        ram_item["recommendation"] = recommend_ram(budget, metrics.get("total_ram_gb"), metrics.get("ram"))
        recommendations["RAM"] = ram_item["recommendation"]
        if ram_score >= 75:
            legacy_priority.append("RAM")
    priorities.append(ram_item)

    gpu_item = {
        "component": "GPU",
        "level": "LOW" if not metrics.get("gpu_available") else _level(gpu_score),
        "score": gpu_score,
        "reason": (
            "GPU telemetry unavailable."
            if not metrics.get("gpu_available")
            else f"Current GPU load is {metrics.get('gpu')}%."
        ),
        "recommendation": None,
    }
    if metrics.get("gpu_available") and gpu_score >= 45:
        gpu_item["recommendation"] = recommend_gpu(budget)
        recommendations["GPU"] = gpu_item["recommendation"]
        if gpu_score >= 75:
            legacy_priority.append("GPU")
    priorities.append(gpu_item)

    cpu_item = {
        "component": "CPU",
        "level": _level(cpu_score),
        "score": cpu_score,
        "reason": (
            f"Current CPU usage is {metrics.get('cpu')}%."
            if metrics.get("cpu") is not None
            else "CPU telemetry unavailable."
        ),
        "recommendation": None,
    }
    if cpu_score >= 45 and metrics.get("cpu") is not None:
        cpu_item["recommendation"] = recommend_cpu(budget)
        recommendations["CPU"] = cpu_item["recommendation"]
        if cpu_score >= 75:
            legacy_priority.append("CPU")
    priorities.append(cpu_item)

    storage_item = {
        "component": "Storage",
        "level": _level(disk_score),
        "score": disk_score,
        "reason": (
            f"Volume usage is {metrics.get('disk')}% with {metrics.get('disk_free_gb')} GB free."
            if metrics.get("disk") is not None
            else "Storage telemetry unavailable."
        ),
        "recommendation": None,
    }
    if disk_score >= 45 and metrics.get("disk") is not None:
        storage_item["recommendation"] = recommend_storage(budget, metrics.get("disk_total_gb"))
        recommendations["Storage"] = storage_item["recommendation"]
        if disk_score >= 75:
            legacy_priority.append("Storage")
    priorities.append(storage_item)

    if not legacy_priority:
        legacy_priority = ["No Upgrade Needed"]
        if not recommendations:
            recommendations = {"Status": "Your PC is performing within healthy limits for the current budget."}

    return {
        "budget": budget,
        "system": system,
        "priorities": priorities,
        "priority": legacy_priority,
        "recommendations": recommendations,
        "estimated_gain": estimated_gain(priorities),
        "metrics": {
            "cpu": metrics.get("cpu"),
            "ram": metrics.get("ram"),
            "gpu": metrics.get("gpu"),
            "disk": metrics.get("disk"),
        },
    }
