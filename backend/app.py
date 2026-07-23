from flask import Flask, jsonify, request
from flask_cors import CORS

from monitor import (
    get_metrics,
    kill_process,
    ai_summary
)

from optimizer import optimize_system
from advisor import get_upgrade_advice
from reporter import generate_report

app = Flask(__name__)

CORS(app)


# ======================================
# ROOT
# ======================================

@app.route("/")

def home():

    return jsonify({

        "status": "SMARTPULSE ONLINE",

        "version": "2.0",

        "api": "/api/health"

    })


# ======================================
# HEALTH API
# ======================================

@app.route("/api/health")

def health():

    metrics = get_metrics()

    ai = ai_summary(metrics)

    return jsonify({

        "metrics": metrics,

        "ai": ai

    })


# ======================================
# KILL PROCESS
# ======================================

@app.route("/api/kill", methods=["POST"])

def kill():

    data = request.json

    pid = data.get("pid")

    result = kill_process(pid)

    return jsonify(result)# ======================================
# OPTIMIZER
# ======================================

@app.route("/api/optimize", methods=["POST"])
def optimize():

    try:

        result = optimize_system()

        return jsonify({

            "success": True,

            "message": "Optimisation completed successfully.",
            "details": result



        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ======================================
# UPGRADE ADVISOR
# ======================================

@app.route("/api/advise", methods=["POST"])
def advise():

    data = request.json or {}

    budget = data.get("budget", 5000)

    recommendation = get_upgrade_advice(budget)

    return jsonify(recommendation)


# ======================================
# REPORT GENERATOR
# ======================================

@app.route("/api/report", methods=["POST"])
def report():

    try:

        metrics = get_metrics()

        ai = ai_summary(metrics)

        report_path = generate_report(

            metrics=metrics,

            ai=ai

        )

        return jsonify({

            "success": True,

            "message": "SMARTPULSE report generated successfully.",

            "file": report_path

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ======================================
# LIVE METRICS ONLY
# ======================================

@app.route("/api/live")
def live():

    return jsonify(get_metrics())


# ======================================
# AI SUMMARY ONLY
# ======================================

@app.route("/api/ai")
def ai():

    metrics = get_metrics()

    return jsonify(ai_summary(metrics))


# ======================================
# START SERVER
# ======================================

if __name__ == "__main__":

    print("=" * 60)
    print("🚀 SMARTPULSE V2 BACKEND")
    print("=" * 60)
    print("Running on http://127.0.0.1:5000")
    print("=" * 60)

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )