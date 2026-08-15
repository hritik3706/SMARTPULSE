# SMARTPULSE Nexus

Windows PC health monitor: live CPU, memory, GPU, disk, processes, diagnostics, optimizer, and reports.

The **frontend** can be hosted on Vercel. The **Flask backend must run on this PC** — it reads real hardware telemetry and cannot be replaced by a cloud API.

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

## Vercel

The hosted UI talks to `http://127.0.0.1:5000` from your browser. Keep the backend running on this machine when you use the Vercel site.
