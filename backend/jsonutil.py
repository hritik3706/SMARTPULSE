"""JSON encoding that never emits NaN or Infinity for the Flask API."""
import math

from flask.json.provider import DefaultJSONProvider


def sanitize_json(value):
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value
    if isinstance(value, dict):
        return {str(key): sanitize_json(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [sanitize_json(item) for item in value]
    if isinstance(value, bytes):
        return value.decode("utf-8", "ignore")
    return value


class SafeJSONProvider(DefaultJSONProvider):
    ensure_ascii = False

    def dumps(self, obj, **kwargs):
        kwargs["allow_nan"] = False
        return super().dumps(sanitize_json(obj), **kwargs)
