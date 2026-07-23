import sqlite3
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(
    BASE_DIR,
    "..",
    "database",
    "telemetry.sqlite3"
)


def initialize_database():

    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS telemetry (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            timestamp TEXT,

            cpu REAL,

            ram REAL,

            gpu REAL,

            disk REAL
        )
    """)

    conn.commit()
    conn.close()


def insert_snapshot(metrics):

    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO telemetry (

            timestamp,
            cpu,
            ram,
            gpu,
            disk

        )

        VALUES (?, ?, ?, ?, ?)
    """, (

        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        metrics["cpu"],
        metrics["ram"],
        metrics["gpu"],
        metrics["disk"]

    ))

    conn.commit()
    conn.close()


def get_history(limit=100):

    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        SELECT
        timestamp,
        cpu,
        ram,
        gpu,
        disk

        FROM telemetry

        ORDER BY id DESC

        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()

    conn.close()

    rows.reverse()

    history = []

    for row in rows:

        history.append({

            "timestamp": row[0],

            "cpu": row[1],

            "ram": row[2],

            "gpu": row[3],

            "disk": row[4]
        })

    return history