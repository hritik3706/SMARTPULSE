const PROTECTED_NAMES = new Set([
  "system",
  "registry",
  "smss.exe",
  "csrss.exe",
  "wininit.exe",
  "winlogon.exe",
  "services.exe",
  "lsass.exe",
  "svchost.exe",
  "dwm.exe",
  "explorer.exe",
  "fontdrvhost.exe",
  "conhost.exe",
  "memory compression",
  "secure system",
  "idle",
  "system idle process",
  "lsm.exe",
  "spoolsv.exe",
]);

const PROTECTED_PIDS = new Set([0, 4]);

export function isProtectedProcess(process) {
  if (!process) return true;
  if (PROTECTED_PIDS.has(Number(process.pid))) return true;
  const name = String(process.name || "").trim().toLowerCase();
  return PROTECTED_NAMES.has(name);
}
