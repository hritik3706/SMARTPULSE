def generate_ai_report(metrics):

    alerts = []

    score = 100

    cpu = metrics["cpu"]
    ram = metrics["ram"]
    gpu = metrics["gpu"]
    disk = metrics["disk"]

    if cpu > 90:

        alerts.append(
            "Critical CPU usage detected."
        )

        score -= 20

    elif cpu > 75:

        alerts.append(
            "CPU load is elevated."
        )

        score -= 10

    if ram > 90:

        alerts.append(
            "RAM saturation detected."
        )

        score -= 20

    elif ram > 75:

        alerts.append(
            "Memory pressure increasing."
        )

        score -= 10

    if disk > 90:

        alerts.append(
            "Disk almost full."
        )

        score -= 20

    elif disk > 75:

        alerts.append(
            "Disk usage getting high."
        )

        score -= 10

    if gpu > 95:

        alerts.append(
            "GPU under extreme load."
        )

        score -= 10

    if not alerts:

        alerts.append(
            "System operating normally."
        )

    score = max(
        score,
        0
    )

    severity = "healthy"

    if score < 85:
        severity = "warning"

    if score < 60:
        severity = "critical"

    return {

        "health_score":
        score,

        "severity":
        severity,

        "alerts":
        alerts
    }