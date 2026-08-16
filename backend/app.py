import logging
import os
from urllib.parse import urlparse

from flask import Flask, Response, jsonify, request
from flask_cors import CORS

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from werkzeug.exceptions import HTTPException

from advisor import get_upgrade_advice
from ai_engine import analyze, analyze_cached
from monitor import get_metrics, get_latest_metrics, kill_process, top_processes, process_count
from optimizer import optimize_system, scan_system
from reporter import generate_report, send_report, list_reports, delete_report
from icons import get_icon_png
from jsonutil import SafeJSONProvider

app = Flask(__name__)
app.json = SafeJSONProvider(app)
app.config["JSON_SORT_KEYS"] = False

LOCAL_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}

cors_origins = os.environ.get("CORS_ORIGINS")
if cors_origins:
    extra_origins = [item.strip() for item in cors_origins.split(",") if item.strip()]
else:
    extra_origins = list(LOCAL_ORIGINS)

CORS(
    app,
    origins=extra_origins + [r"https://.+\.vercel\.app"],
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)


def origin_allowed(origin):
    if not origin:
        return False
    if origin in LOCAL_ORIGINS or origin in extra_origins:
        return True
    parsed = urlparse(origin)
    host = (parsed.hostname or "").lower()
    return parsed.scheme == "https" and host.endswith(".vercel.app")


def apply_cors(response, origin=None):
    origin = origin or request.headers.get("Origin", "")
    if not origin_allowed(origin):
        return response
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    requested = request.headers.get("Access-Control-Request-Headers", "Content-Type")
    response.headers["Access-Control-Allow-Headers"] = requested
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    response.headers["Access-Control-Allow-Local-Network"] = "true"
    response.headers["Access-Control-Max-Age"] = "600"
    response.headers["Vary"] = "Origin"
    return response


DEVTOOLS_PROBES = {"/json", "/json/version", "/json/list", "/json/protocol"}


class _IgnoreDevtoolsProbe(logging.Filter):
    def filter(self, record):
        message = record.getMessage()
        return not any(path in message for path in ("/json/version", "/json/list", '"GET /json '))


@app.before_request
def ignore_devtools_probes():
    if request.path in DEVTOOLS_PROBES:
        return ("", 204)


@app.before_request
def handle_cors_preflight():
    if request.method != "OPTIONS":
        return None
    origin = request.headers.get("Origin", "")
    if not origin_allowed(origin):
        return None
    return apply_cors(app.make_response(("", 204)), origin)


@app.after_request
def add_cors_headers(response):
    return apply_cors(response)

EMPTY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
    b"\x00\x00\x05\x00\x01\r\n\x2d\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


def json_error(message, status=500, error="error"):
    return jsonify({"success": False, "error": error, "message": message}), status


@app.errorhandler(404)
def not_found(_error):
    return json_error("Endpoint not found.", 404, "not_found")


@app.errorhandler(405)
def method_not_allowed(_error):
    return json_error("Method not allowed.", 405, "method_not_allowed")


@app.errorhandler(Exception)
def unhandled_error(error):
    if isinstance(error, HTTPException):
        return json_error(
            error.description or error.name,
            error.code or 500,
            (error.name or "error").lower().replace(" ", "_"),
        )
    return json_error(str(error) or "Server error.", 500, "server_error")


@app.route("/")
def home():
    return jsonify({
        "status": "ok",
        "message": "SMARTPULSE ONLINE",
        "version": "3.0",
        "engine": "SMARTPULSE Nexus",
        "api": "/api/health",
        "local_network": True,
    })


@app.route("/api/health")
def health():
    try:
        metrics = get_metrics(include_processes=True)
        ai = analyze_cached(metrics)
        return jsonify({
            "metrics": metrics,
            "ai": ai,
            "cpu": metrics.get("cpu"),
            "memory": metrics.get("ram"),
            "gpu": metrics.get("gpu"),
            "disk": metrics.get("disk"),
            "health_score": ai.get("health_score"),
        })
    except Exception as exc:
        return json_error(str(exc), 500)


@app.route("/api/live")
def live():
    try:
        return jsonify(get_metrics(include_processes=False))
    except Exception as exc:
        return json_error(str(exc), 500)


@app.route("/api/ai")
def ai():
    try:
        metrics = get_latest_metrics() or get_metrics(include_processes=False)
        return jsonify(analyze_cached(metrics))
    except Exception as exc:
        return json_error(str(exc), 500)


@app.route("/api/processes")
def processes():
    try:
        return jsonify({
            "count": process_count(),
            "processes": top_processes(limit=120),
        })
    except Exception as exc:
        return json_error(str(exc), 500)


@app.route("/api/icon/<icon_id>")
def process_icon(icon_id):
    data = get_icon_png(icon_id)
    if not data:
        return Response(EMPTY_PNG, mimetype="image/png", headers={"Cache-Control": "public, max-age=60"})
    return Response(data, mimetype="image/png", headers={"Cache-Control": "public, max-age=86400"})


@app.route("/api/kill", methods=["POST"])
def kill():
    data = request.get_json(silent=True) or {}
    pid = data.get("pid")
    if pid is None:
        return jsonify({"success": False, "message": "PID is required."}), 400
    result = kill_process(pid)
    status = 200 if result.get("success") else 400
    return jsonify(result), status


@app.route("/api/optimize/scan", methods=["GET", "POST"])
def optimize_scan():
    try:
        return jsonify(scan_system())
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


@app.route("/api/optimize", methods=["POST"])
def optimize():
    data = request.get_json(silent=True) or {}
    if data.get("scan_only"):
        try:
            return jsonify(scan_system())
        except Exception as exc:
            return jsonify({"success": False, "message": str(exc)}), 500
    try:
        actions = data.get("actions")
        if actions is not None and len(actions) == 0:
            return jsonify({
                "success": True,
                "message": "No actions selected.",
                "recovered_bytes": 0,
                "space_freed": 0,
                "cleaned_items": 0,
                "details": {"details": [], "recovered_bytes": 0, "status": "No actions selected"},
            })
        result = optimize_system(actions)
        return jsonify({
            "success": True,
            "message": "Optimization completed successfully.",
            "recovered_bytes": result.get("recovered_bytes", 0),
            "space_freed": result.get("recovered_bytes", 0),
            "cleaned_items": len(result.get("details") or []),
            "details": result,
        })
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


@app.route("/api/advise", methods=["POST"])
def advise():
    data = request.get_json(silent=True) or {}
    budget = data.get("budget", 5000)
    recommendation = get_upgrade_advice(budget)
    return jsonify(recommendation)


@app.route("/api/report", methods=["POST"])
def report():
    try:
        metrics = get_metrics(include_processes=True)
        ai = analyze(metrics)
        report_path, filename = generate_report(metrics=metrics, ai=ai)
        return jsonify({
            "success": True,
            "message": "SMARTPULSE report generated successfully.",
            "file": report_path,
            "filename": filename,
            "report_id": filename,
            "pdf_url": f"/api/report/file/{filename}",
            "health_score": ai.get("health_score"),
            "url": f"/api/report/file/{filename}",
        })
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


@app.route("/api/reports")
def reports():
    return jsonify({"reports": list_reports()})


@app.route("/api/report/file/<path:filename>", methods=["GET", "DELETE"])
def report_file(filename):
    if request.method == "DELETE":
        ok = delete_report(filename)
        if not ok:
            return jsonify({"success": False, "message": "Report not found."}), 404
        return jsonify({"success": True, "message": "Report deleted."})
    response = send_report(filename)
    if response is None:
        return jsonify({"success": False, "message": "Report not found."}), 404
    return response


if __name__ == "__main__":
    logging.getLogger("werkzeug").addFilter(_IgnoreDevtoolsProbe())
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    print("=" * 60)
    print("SMARTPULSE Nexus")
    print("=" * 60)
    print("Monitoring engine online")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=debug, threaded=True)
