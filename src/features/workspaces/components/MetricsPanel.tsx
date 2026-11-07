import { formatBytes } from '@/shared/lib/format';
import type { DockerStats } from '../types';

type Metrics = {
  cpuPercent: number;
  memoryUsageBytes: number;
  memoryLimitBytes: number;
  memoryPercent: number;
  networkRxBytes: number;
  networkTxBytes: number;
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

  return (
    <div className="space-y-4">
      <div className="metrics-grid">
        <MetricCard label="CPU" value={`${metrics.cpuPercent.toFixed(1)}%`} detail="Uso de CPU" />
        <MetricCard
          label="Memoria"
          value={formatBytes(metrics.memoryUsageBytes)}
          detail={`${metrics.memoryPercent.toFixed(1)}% de ${formatBytes(metrics.memoryLimitBytes)}`}
        />
        <MetricCard
          label="Red recibida"
          value={formatBytes(metrics.networkRxBytes)}
          detail="Total RX"
        />
        <MetricCard
          label="Red enviada"
          value={formatBytes(metrics.networkTxBytes)}
          detail="Total TX"
        />
      </div>
    </div>
  );
}
