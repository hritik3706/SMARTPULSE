# SMARTPULSE Nexus

Windows PC health monitor with a live dashboard: CPU, memory, GPU, disk, processes, diagnostics, optimizer, advisor, and PDF reports.

The **frontend** can be hosted on Vercel. The **Flask backend must run on this PC** — it reads real hardware telemetry and cannot be replaced by a cloud API.

## Features

- **Dashboard** — live CPU, RAM, GPU, and storage cards plus four activity charts
- **SMARTPULSE score** — Safe / Pressure / Critical with a short reason
- **Performance** — hardware specs and longer telemetry windows
- **Processes** — searchable live list with icons and end-process
- **Diagnostics** — health analysis from current telemetry
- **Optimizer** — scan-first cleanup of temp, cache, thumbnails, DNS, Recycle Bin
- **Advisor** — upgrade suggestions from real bottlenecks and a budget
- **Reports** — PDF health documents from the same live snapshot
- **Settings** — display name, refresh interval, light/dark theme

## Run locally

Backend:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

- UI: http://127.0.0.1:5173
- Engine: http://127.0.0.1:5000

## Links

- GitHub: https://github.com/hritik3706/SMARTPULSE
- Live UI: https://smartpulse-lovat.vercel.app

The hosted page talks to `http://127.0.0.1:5000` from your browser. Keep `python app.py` running on this PC. If Chrome asks to allow local network access, choose Allow.
