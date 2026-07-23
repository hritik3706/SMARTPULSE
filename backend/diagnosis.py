from monitor import get_system_metrics
from jarvis import generate_ai_report


def get_system_health():

    metrics = get_system_metrics()

    ai = generate_ai_report(
        metrics
    )

    return {
        "metrics": metrics,
        "ai": ai
    }