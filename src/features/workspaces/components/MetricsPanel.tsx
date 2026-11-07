import { formatBytes, formatDateTime } from '@/shared/lib/format';
import type { DockerStats } from '../types';

type NumericMap = Record<string, number>;

type CpuStats = {
  cpu_usage?: { total_usage?: number };
  system_cpu_usage?: number;
  online_cpus?: number;
};

type Metrics = {
  read?: string;
  name?: string;
  os_type?: string;
  cpu_stats?: CpuStats;
  precpu_stats?: CpuStats;
  memory_stats?: { usage?: number; limit?: number };
  networks?: Record<string, NumericMap>;
  pids_stats?: { current?: number; limit?: number };
  blkio_stats?: {
    io_service_bytes_recursive?: Array<{ op?: string; value?: number }> | null;
  };
};

const cpuPercent = (metrics: Metrics) => {
  const current = metrics.cpu_stats;
  const previous = metrics.precpu_stats;
  const totalDelta =
    (current?.cpu_usage?.total_usage ?? 0) - (previous?.cpu_usage?.total_usage ?? 0);
  const systemDelta = (current?.system_cpu_usage ?? 0) - (previous?.system_cpu_usage ?? 0);
  const cpus = current?.online_cpus ?? 1;
  return systemDelta > 0 ? Math.min(100, (totalDelta / systemDelta) * cpus * 100) : 0;
};

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="metrics-card">
      <p className="metrics-label">{label}</p>
      <p className="metrics-value">{value}</p>
      <p className="metrics-detail">{detail}</p>
    </div>
  );
}

export function MetricsPanel({ stats }: { stats: DockerStats }) {
  const metrics = stats as Metrics;
  const memory = metrics.memory_stats?.usage ?? 0;
  const memoryLimit = metrics.memory_stats?.limit ?? 0;
  const memoryPercent = memoryLimit > 0 ? (memory / memoryLimit) * 100 : 0;
  const network = Object.values(metrics.networks ?? {}).reduce(
    (total, item) => ({
      rx: total.rx + (item.rx_bytes ?? 0),
      tx: total.tx + (item.tx_bytes ?? 0),
    }),
    { rx: 0, tx: 0 }
  );
  const io = (metrics.blkio_stats?.io_service_bytes_recursive ?? []).reduce(
    (total, item) => ({
      read: total.read + (item.op?.toLowerCase() === 'read' ? (item.value ?? 0) : 0),
      write: total.write + (item.op?.toLowerCase() === 'write' ? (item.value ?? 0) : 0),
    }),
    { read: 0, write: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="metrics-grid">
        <MetricCard
          label="CPU"
          value={`${cpuPercent(metrics).toFixed(1)}%`}
          detail={`${metrics.cpu_stats?.online_cpus ?? 0} CPUs disponibles`}
        />
        <MetricCard
          label="Memoria"
          value={formatBytes(memory)}
          detail={`${memoryPercent.toFixed(1)}% de ${formatBytes(memoryLimit)}`}
        />
        <MetricCard label="Red recibida" value={formatBytes(network.rx)} detail="Total RX" />
        <MetricCard label="Red enviada" value={formatBytes(network.tx)} detail="Total TX" />
        <MetricCard
          label="Procesos"
          value={String(metrics.pids_stats?.current ?? 0)}
          detail={`Límite ${metrics.pids_stats?.limit ?? 'sin límite'}`}
        />
        <MetricCard
          label="Disco"
          value={`${formatBytes(io.read)} / ${formatBytes(io.write)}`}
          detail="Lectura / escritura"
        />
      </div>
      <div className="metrics-summary">
        <span>SO: {metrics.os_type ?? '—'}</span>
        <span>Contenedor: {metrics.name ?? '—'}</span>
        <span>Lectura: {metrics.read ? formatDateTime(metrics.read) : '—'}</span>
      </div>
    </div>
  );
}
