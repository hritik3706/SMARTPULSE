from datetime import datetime
from pathlib import Path

from flask import send_from_directory
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


REPORT_DIR = Path(__file__).resolve().parent / "reports"
REPORT_DIR.mkdir(exist_ok=True)

RUST = colors.HexColor("#FF6B35")
INK = colors.HexColor("#101216")
MUTED = colors.HexColor("#5C6169")
SURFACE = colors.HexColor("#F4F5F6")


def _text(value, suffix=""):
    if value is None or value == "":
        return "Unavailable"
    return f"{value}{suffix}"


def generate_report(metrics, ai):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"SMARTPULSE_Report_{timestamp}.pdf"
    path = REPORT_DIR / filename

    doc = SimpleDocTemplate(
        str(path),
        title="SMARTPULSE System Report",
        author="SMARTPULSE",
    )

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "PulseTitle",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        textColor=INK,
        fontSize=20,
        spaceAfter=6,
    )
    subtitle = ParagraphStyle(
        "PulseSub",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        textColor=MUTED,
        fontSize=10,
        spaceAfter=16,
    )
    heading = ParagraphStyle(
        "PulseHeading",
        parent=styles["Heading2"],
        textColor=INK,
        fontSize=13,
        spaceBefore=10,
        spaceAfter=8,
    )
    normal = ParagraphStyle(
        "PulseBody",
        parent=styles["BodyText"],
        alignment=TA_LEFT,
        textColor=INK,
        fontSize=10,
        leading=14,
    )

    story = []
    generated = datetime.now().strftime("%d %B %Y %H:%M:%S")
    system = metrics.get("system") or {}

    story.append(Paragraph("SMARTPULSE NEXUS SYSTEM REPORT", title))
    story.append(Paragraph("SMARTPULSE Nexus · Diagnostic Engine", subtitle))
    story.append(Paragraph(f"Generated {generated}", subtitle))

    story.append(Paragraph("System information", heading))
    hardware = Table([
        ["Hostname", _text(metrics.get("hostname") or system.get("hostname"))],
        ["Operating system", _text(metrics.get("os") or system.get("os"))],
        ["CPU", _text(metrics.get("cpu_name"))],
        ["GPU", _text(metrics.get("gpu_name") if metrics.get("gpu_available") else None)],
        ["RAM", _text(metrics.get("total_ram_gb"), " GB")],
        ["Disk", _text(metrics.get("disk_total_gb"), " GB")],
        ["Uptime", _text(metrics.get("uptime"))],
    ], colWidths=[140, 340])
    hardware.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D7D9DC")),
        ("BACKGROUND", (0, 0), (0, -1), SURFACE),
        ("TEXTCOLOR", (0, 0), (-1, -1), INK),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(hardware)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Performance metrics", heading))
    metric_table = Table([
        ["Metric", "Value"],
        ["CPU usage", _text(metrics.get("cpu"), "%")],
        ["RAM usage", _text(metrics.get("ram"), "%")],
        ["GPU usage", _text(metrics.get("gpu"), "%") if metrics.get("gpu_available") else "Unavailable"],
        ["GPU temperature", _text(metrics.get("gpu_temperature"), "°C") if metrics.get("gpu_available") else "Unavailable"],
        ["Disk usage", _text(metrics.get("disk"), "%")],
        ["Disk read", _text(metrics.get("disk_read_speed"), " MB/s")],
        ["Disk write", _text(metrics.get("disk_write_speed"), " MB/s")],
        ["Download", _text(metrics.get("download_speed"), " MB/s")],
        ["Upload", _text(metrics.get("upload_speed"), " MB/s")],
    ], colWidths=[180, 300])
    metric_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D7D9DC")),
        ("BACKGROUND", (0, 0), (-1, 0), RUST),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(metric_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Health score", heading))
    health_table = Table([
        ["Health score", _text(ai.get("health_score"))],
        ["Severity", _text((ai.get("severity") or "").upper())],
        ["Engine", _text(ai.get("engine") or "SMARTPULSE Diagnostic Engine")],
    ], colWidths=[180, 300])
    health_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D7D9DC")),
        ("BACKGROUND", (0, 0), (0, -1), SURFACE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(health_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Diagnostic analysis", heading))
    diagnosis = ai.get("diagnosis") or "No diagnosis available."
    story.append(Paragraph(diagnosis, normal))
    story.append(Spacer(1, 8))

    bottleneck = ai.get("bottleneck")
    if bottleneck:
        story.append(Paragraph(
            f"Primary bottleneck: {bottleneck.get('component')} ({bottleneck.get('severity')})",
            normal,
        ))
        story.append(Spacer(1, 8))

    story.append(Paragraph("Recommendations", heading))
    recs = ai.get("recommendations") or ai.get("alerts") or []
    if isinstance(recs, list):
        for item in recs:
            story.append(Paragraph(f"• {item}", normal))
    story.append(Spacer(1, 16))
    story.append(Paragraph(f"Generated timestamp: {generated}", normal))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Generated by SMARTPULSE Nexus · Diagnostic Engine v3", normal))

    doc.build(story)
    return str(path), filename


def send_report(filename):
    safe_name = Path(filename).name
    if not safe_name.endswith(".pdf"):
        return None
    target = REPORT_DIR / safe_name
    if not target.exists():
        return None
    return send_from_directory(REPORT_DIR, safe_name, as_attachment=False)


def list_reports(max_age_days=30):
    cutoff = datetime.now().timestamp() - (max_age_days * 86400)
    items = []
    for path in REPORT_DIR.glob("*.pdf"):
        try:
            stat = path.stat()
        except OSError:
            continue
        if stat.st_mtime < cutoff:
            try:
                path.unlink()
            except OSError:
                pass
            continue
        items.append({
            "filename": path.name,
            "url": f"/api/report/file/{path.name}",
            "size": stat.st_size,
            "created": datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
        })
    items.sort(key=lambda item: item["created"], reverse=True)
    return items


def delete_report(filename):
    safe_name = Path(filename).name
    if not safe_name.endswith(".pdf"):
        return False
    target = REPORT_DIR / safe_name
    if not target.exists():
        return False
    target.unlink()
    return True
