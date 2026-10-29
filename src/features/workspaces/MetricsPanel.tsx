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

const asMetrics = (value: Record<string, unknown>): Metrics => value as Metrics;

const formatBytes = (value = 0) => {
    if (value < 1024) return `${value} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = value;
    let unit = -1;
    do {
        size /= 1024;
        unit += 1;
    } while (size >= 1024 && unit < units.length - 1);
    return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
};

const cpuPercent = (metrics: Metrics) => {
    const current = metrics.cpu_stats;
    const previous = metrics.precpu_stats;
    const totalDelta = (current?.cpu_usage?.total_usage ?? 0) - (previous?.cpu_usage?.total_usage ?? 0);
    const systemDelta = (current?.system_cpu_usage ?? 0) - (previous?.system_cpu_usage ?? 0);
    const cpus = current?.online_cpus ?? 1;
    return systemDelta > 0 ? Math.min(100, (totalDelta / systemDelta) * cpus * 100) : 0;
};

const metricCard = (label: string, value: string, detail: string) => (
    <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-2 text-xl font-semibold text-slate-100">{value}</p>
        <p className="mt-1 text-xs text-slate-600">{detail}</p>
    </div>
);

export function MetricsPanel({ value }: { value: Record<string, unknown> }) {
    const metrics = asMetrics(value);
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
            read: total.read + (item.op?.toLowerCase() === 'read' ? item.value ?? 0 : 0),
            write: total.write + (item.op?.toLowerCase() === 'write' ? item.value ?? 0 : 0),
        }),
        { read: 0, write: 0 }
    );

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                {metricCard('CPU', `${cpuPercent(metrics).toFixed(1)}%`, `${metrics.cpu_stats?.online_cpus ?? 0} CPUs disponibles`)}
                {metricCard('Memoria', `${formatBytes(memory)}`, `${memoryPercent.toFixed(1)}% de ${formatBytes(memoryLimit)}`)}
                {metricCard('Red recibida', formatBytes(network.rx), 'Total RX')}
                {metricCard('Red enviada', formatBytes(network.tx), 'Total TX')}
                {metricCard('Procesos', String(metrics.pids_stats?.current ?? 0), `Límite ${metrics.pids_stats?.limit ?? 'sin límite'}`)}
                {metricCard('Disco', `${formatBytes(io.read)} / ${formatBytes(io.write)}`, 'Lectura / escritura')}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                <span>SO: {metrics.os_type ?? '—'}</span>
                <span>Contenedor: {metrics.name ?? '—'}</span>
                <span>Lectura: {metrics.read ? new Date(metrics.read).toLocaleString('es-MX') : '—'}</span>
            </div>
        </div>
    );
}
