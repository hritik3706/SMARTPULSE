from monitor import get_metrics


def score_upgrade(metrics):

    score = 0

    if metrics["ram"] > 80:
        score += 3

    if metrics["cpu"] > 80:
        score += 3

    if metrics["gpu"] > 80:
        score += 2

    if metrics["disk"] > 85:
        score += 2

    return score


def recommend_ram(budget):

    if budget < 3000:
        return "Upgrade to 16GB DDR4"

    if budget < 7000:
        return "Upgrade to 32GB DDR4"

    return "Upgrade to 32GB DDR5"


def recommend_storage(budget):

    if budget < 2500:
        return "500GB NVMe SSD"

    if budget < 6000:
        return "1TB NVMe Gen4 SSD"

    return "2TB NVMe Gen4 SSD"


def recommend_gpu(budget):

    if budget < 25000:
        return "RTX 4060"

    if budget < 45000:
        return "RTX 5060"

    if budget < 70000:
        return "RTX 5070"

    return "RTX 5080"


def recommend_cpu(budget):

    if budget < 18000:
        return "Ryzen 5 7600"

    if budget < 30000:
        return "Ryzen 7 7700"

    return "Ryzen 7 9800X3D"


def estimated_gain(score):

    if score <= 2:
        return "5-10%"

    if score <= 5:
        return "15-25%"

    if score <= 8:
        return "30-50%"

    return "60%+"


def get_upgrade_advice(budget):

    metrics = get_metrics()

    score = score_upgrade(metrics)

    advice = {

        "budget": budget,

        "priority": [],

        "estimated_gain": estimated_gain(score),

        "recommendations": {}

    }

    if metrics["ram"] > 80:

        advice["priority"].append("RAM")

        advice["recommendations"]["RAM"] = recommend_ram(budget)

    if metrics["disk"] > 85:

        advice["priority"].append("Storage")

        advice["recommendations"]["Storage"] = recommend_storage(budget)

    if metrics["gpu"] > 80:

        advice["priority"].append("GPU")

        advice["recommendations"]["GPU"] = recommend_gpu(budget)

    if metrics["cpu"] > 80:

        advice["priority"].append("CPU")

        advice["recommendations"]["CPU"] = recommend_cpu(budget)

    if len(advice["priority"]) == 0:

        advice["priority"].append("No Upgrade Needed")

        advice["recommendations"] = {

            "Status": "Your PC is performing well."

        }

    return advice