import { sliceHistory } from "../utils/format";

export function useChartData(history, seconds, interval) {
  const cpu = sliceHistory(history?.cpu, seconds, interval);
  const ram = sliceHistory(history?.ram, seconds, interval);
  const gpu = sliceHistory(history?.gpu, seconds, interval);
  const disk = sliceHistory(history?.disk, seconds, interval);
  return cpu.map((point, index) => ({
    time: point.time,
    cpu: point.value,
    ram: ram[index]?.value,
    gpu: gpu[index]?.value,
    disk: disk[index]?.value,
  }));
}
