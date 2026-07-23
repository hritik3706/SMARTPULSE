from monitor import get_metrics


# =====================================================
# HEALTH SCORE
# =====================================================

def health_score(metrics):

    score = 100

    if metrics["cpu"] > 90:
        score -= 20
    elif metrics["cpu"] > 75:
        score -= 10

    if metrics["ram"] > 90:
        score -= 20
    elif metrics["ram"] > 75:
        score -= 10

    if metrics["disk"] > 90:
        score -= 15

    if metrics["gpu"] > 95:
        score -= 10

    if metrics["gpu_temperature"] > 85:
        score -= 10

    return max(score, 0)


# =====================================================
# BOTTLENECK
# =====================================================

def bottleneck(metrics):

    values = {

        "CPU": metrics["cpu"],

        "RAM": metrics["ram"],

        "GPU": metrics["gpu"],

        "Disk": metrics["disk"]

    }

    return max(values, key=values.get)


# =====================================================
# GAMING SCORE
# =====================================================

def gaming_score(metrics):

    score = 100

    score -= metrics["cpu"] * 0.18

    score -= metrics["ram"] * 0.15

    score -= metrics["gpu"] * 0.08

    return max(round(score), 0)


# =====================================================
# PRODUCTIVITY SCORE
# =====================================================

def productivity_score(metrics):

    score = 100

    score -= metrics["cpu"] * 0.10

    score -= metrics["ram"] * 0.20

    score -= metrics["disk"] * 0.05

    return max(round(score), 0)


# =====================================================
# AI RECOMMENDATIONS
# =====================================================

def recommendations(metrics):

    tips = []

    if metrics["cpu"] > 85:

        tips.append(

            "CPU usage is very high. Close heavy background applications."

        )

    if metrics["ram"] > 80:

        tips.append(

            "RAM usage is high. Consider upgrading memory."

        )

    if metrics["gpu"] > 90:

        tips.append(

            "GPU is fully loaded. Lower graphics settings or upgrade GPU."

        )

    if metrics["disk"] > 90:

        tips.append(

            "Storage is nearly full. Free disk space."

        )

    if metrics["gpu_temperature"] > 85:

        tips.append(

            "GPU temperature is high. Check cooling."

        )

    if metrics["download_speed"] < 1:

        tips.append(

            "Network speed appears slow."

        )

    if len(tips) == 0:

        tips.append(

            "System is performing normally."

        )

    return tips


# =====================================================
# PERFORMANCE PREDICTION
# =====================================================

def prediction(metrics):

    if metrics["cpu"] > 95:

        return "System may freeze under sustained workload."

    if metrics["ram"] > 95:

        return "Memory exhaustion likely."

    if metrics["gpu_temperature"] > 88:

        return "GPU thermal throttling may occur."

    return "Performance expected to remain stable."


# =====================================================
# FPS ESTIMATION
# =====================================================

def estimated_fps(metrics):

    fps = 160

    fps -= metrics["cpu"] * 0.7

    fps -= metrics["gpu"] * 0.4

    fps -= metrics["ram"] * 0.2

    return max(int(fps), 25)


# =====================================================
# MAIN AI ENGINE
# =====================================================

def analyze():

    metrics = get_metrics()

    return {

        "health_score":

            health_score(metrics),

        "gaming_score":

            gaming_score(metrics),

        "productivity_score":

            productivity_score(metrics),

        "estimated_fps":

            estimated_fps(metrics),

        "bottleneck":

            bottleneck(metrics),

        "prediction":

            prediction(metrics),

        "recommendations":

            recommendations(metrics)

    }