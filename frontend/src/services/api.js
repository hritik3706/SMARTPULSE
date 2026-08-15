import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const client = axios.create({
  baseURL: API_URL,
  timeout: 45000,
});

export async function getRoot() {
  const { data } = await client.get("/");
  return data;
}

export async function getLive() {
  const { data } = await client.get("/api/live");
  return data;
}

export async function getHealth() {
  const { data } = await client.get("/api/health");
  return data;
}

export async function getAi() {
  const { data } = await client.get("/api/ai");
  return data;
}

export async function getProcesses() {
  const { data } = await client.get("/api/processes");
  return data;
}

export async function killProcess(pid) {
  const { data } = await client.post("/api/kill", { pid });
  return data;
}

export async function scanOptimizer() {
  const { data } = await client.get("/api/optimize/scan");
  return data;
}

export async function runOptimize(actions) {
  const { data } = await client.post("/api/optimize", { confirm: true, actions });
  return data;
}

export async function getUpgradeAdvice(budget) {
  const { data } = await client.post("/api/advise", { budget });
  return data;
}

export async function generateReport() {
  const { data } = await client.post("/api/report");
  return data;
}

export function reportUrl(filename) {
  return `${API_URL}/api/report/file/${encodeURIComponent(filename)}`;
}

export function iconUrl(iconId) {
  return `${API_URL}/api/icon/${encodeURIComponent(iconId)}`;
}

export async function listReports() {
  const { data } = await client.get("/api/reports");
  return data.reports || [];
}

export async function deleteReport(filename) {
  const { data } = await client.delete(`/api/report/file/${encodeURIComponent(filename)}`);
  return data;
}
