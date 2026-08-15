from monitor import get_metrics as get_system_metrics
from ai_engine import analyze


def get_system_health():
    metrics = get_system_metrics()
    ai = analyze(metrics)
    return {
        "metrics": metrics,
        "ai": ai,
    }
