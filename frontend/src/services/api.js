function defaultApiUrl() {
  if (typeof window === "undefined") return "http://127.0.0.1:5000";
  const host = window.location.hostname;
  if (host.endsWith("vercel.app")) return "http://127.0.0.1:5000";
  return "";
}

export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl();

const usingLoopback = !API_URL || /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])\b/i.test(API_URL);

function needsLocalNetworkHint() {
  return usingLoopback && typeof window !== "undefined" && window.location.protocol === "https:";
}

async function send(url, init) {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (!init.targetAddressSpace) throw error;
    const fallback = { ...init };
    delete fallback.targetAddressSpace;
    return fetch(url, fallback);
  }
}

async function request(path, { method = "GET", body, timeout = 45000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const headers = { Accept: "application/json" };
    const init = { method, headers, signal: controller.signal };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    if (needsLocalNetworkHint()) init.targetAddressSpace = "local";
    const response = await send(`${API_URL}${path}`, init);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || `Request failed (${response.status})`);
      error.response = { status: response.status, data };
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function getRoot() {
  return request("/api/health");
}

export async function getLive() {
  return request("/api/live");
}

export async function getHealth() {
  return request("/api/health");
}

export async function getAi() {
  return request("/api/ai");
}

export async function getProcesses() {
  return request("/api/processes");
}

export async function killProcess(pid) {
  return request("/api/kill", { method: "POST", body: { pid } });
}

export async function scanOptimizer() {
  return request("/api/optimize/scan");
}

export async function runOptimize(actions) {
  return request("/api/optimize", { method: "POST", body: { confirm: true, actions } });
}

export async function getUpgradeAdvice(budget) {
  return request("/api/advise", { method: "POST", body: { budget } });
}

export async function generateReport() {
  return request("/api/report", { method: "POST", body: {} });
}

export function reportUrl(filename) {
  return `${API_URL}/api/report/file/${encodeURIComponent(filename)}`;
}

export function iconUrl(iconId) {
  return `${API_URL}/api/icon/${encodeURIComponent(iconId)}`;
}

export async function listReports() {
  const data = await request("/api/reports");
  return data.reports || [];
}

export async function deleteReport(filename) {
  return request(`/api/report/file/${encodeURIComponent(filename)}`, { method: "DELETE" });
}
