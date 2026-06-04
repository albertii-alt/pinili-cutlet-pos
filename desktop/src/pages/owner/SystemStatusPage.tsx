import { useState, useEffect, useCallback } from 'react';
import {
  IconHeartbeat,
  IconClock,
  IconDatabase,
  IconDeviceFloppy,
  IconDevices,
  IconCpu,
  IconRefresh,
  IconCircleCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { getSystemStatus, type SystemStatus } from '../../api/system.api';

const REFRESH_INTERVAL = 10_000; // 10 seconds

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatUptime(u: SystemStatus['uptime']): string {
  const parts: string[] = [];
  if (u.days  > 0) parts.push(`${u.days}d`);
  if (u.hours > 0) parts.push(`${u.hours}h`);
  parts.push(`${u.minutes}m`);
  parts.push(`${u.secs}s`);
  return parts.join(' ');
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, bar, barColor, barPct,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  bar?: boolean;
  barColor?: string;
  barPct?: number;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-5"
      style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(var(--accent-color-rgb, 192,57,43),0.1)' }}
        >
          <span style={{ color: 'var(--accent-color, #C0392B)' }}>{icon}</span>
        </div>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: '#606060' }}>{sub}</span>}
      {bar && barPct !== undefined && (
        <div className="flex flex-col gap-1">
          <div style={{ height: 5, backgroundColor: '#2C2C2C', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${barPct}%`,
                backgroundColor: barColor ?? 'var(--accent-color, #C0392B)',
                borderRadius: 99,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: '#606060' }}>{barPct}% used</span>
        </div>
      )}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1A1A1A' }}>
      <span style={{ fontSize: 12, color: '#606060' }}>{label}</span>
      <span style={{
        fontSize: 12, color: '#ffffff',
        fontFamily: mono ? 'var(--font-mono, monospace)' : undefined,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SystemStatusPage() {
  const [status, setStatus]   = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchStatus = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const data = await getSystemStatus();
      setStatus(data);
      setError(false);
      setLastRefresh(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 10s
  useEffect(() => {
    fetchStatus();
    const id = setInterval(() => fetchStatus(), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchStatus]);

  // Memory bar color based on usage
  function memBarColor(pct: number): string {
    if (pct >= 90) return '#C0392B';
    if (pct >= 70) return '#F39C12';
    return '#27AE60';
  }

  function cpuBarColor(pct: number): string {
    if (pct >= 90) return '#C0392B';
    if (pct >= 60) return '#F39C12';
    return '#27AE60';
  }

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconHeartbeat size={18} color="var(--accent-color, #C0392B)" />
          <h1 className="text-white font-semibold text-lg">System Status</h1>
          {status && !error && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
              style={{ backgroundColor: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)' }}>
              <IconCircleCheck size={12} color="#27AE60" />
              <span style={{ fontSize: 11, color: '#27AE60', fontWeight: 600 }}>Online</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
              style={{ backgroundColor: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)' }}>
              <IconAlertCircle size={12} color="#C0392B" />
              <span style={{ fontSize: 11, color: '#C0392B', fontWeight: 600 }}>Unreachable</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span style={{ fontSize: 11, color: '#606060' }}>
              Updated {lastRefresh.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5"
            style={{
              backgroundColor: '#111111',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '6px 12px',
              color: refreshing ? '#606060' : '#A0A0A0',
              fontSize: 13,
              cursor: refreshing ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#ffffff'; } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#A0A0A0'; } }}
          >
            <IconRefresh size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconAlertCircle size={40} color="#2C2C2C" />
          <p style={{ fontSize: 14, color: '#606060' }}>Could not reach the server</p>
          <p style={{ fontSize: 12, color: '#404040' }}>Make sure the server is running and try again</p>
        </div>
      ) : status ? (
        <>
          {/* ── Stat cards grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>

            {/* Server uptime */}
            <StatCard
              icon={<IconClock size={16} />}
              label="Server Uptime"
              value={formatUptime(status.uptime)}
              sub={`Running since ${new Date(Date.now() - status.uptime.ms).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
            />

            {/* Database size */}
            <StatCard
              icon={<IconDatabase size={16} />}
              label="Database Size"
              value={formatBytes(status.database.sizeBytes)}
              sub="SQLite — pinili_cutlet.db"
            />

            {/* Last backup */}
            <StatCard
              icon={<IconDeviceFloppy size={16} />}
              label="Last Backup"
              value={status.backup.lastBackupAt ? formatDate(status.backup.lastBackupAt) : 'Never'}
              sub={status.backup.lastBackupAt ? 'Backup on record' : 'No backup created yet'}
            />

            {/* Connected devices */}
            <StatCard
              icon={<IconDevices size={16} />}
              label="Connected Devices"
              value={String(status.connections.connectedClients)}
              sub={status.connections.connectedClients === 1 ? '1 active socket connection' : `${status.connections.connectedClients} active socket connections`}
            />

            {/* Memory usage */}
            <StatCard
              icon={<IconCpu size={16} />}
              label="Memory Usage"
              value={formatBytes(status.system.usedMemBytes)}
              sub={`of ${formatBytes(status.system.totalMemBytes)} total`}
              bar
              barColor={memBarColor(status.system.memUsagePct)}
              barPct={status.system.memUsagePct}
            />

            {/* CPU load */}
            <StatCard
              icon={<IconCpu size={16} />}
              label="CPU Load (1 min avg)"
              value={`${status.system.cpuLoad1m}%`}
              sub={`${status.system.cpuCount} logical core${status.system.cpuCount !== 1 ? 's' : ''}`}
              bar
              barColor={cpuBarColor(status.system.cpuLoad1m)}
              barPct={status.system.cpuLoad1m}
            />
          </div>

          {/* ── System info detail ── */}
          <div
            className="flex flex-col rounded-xl p-5"
            style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
          >
            <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              System Details
            </p>
            <InfoRow label="Hostname"          value={status.system.hostname} />
            <InfoRow label="Platform"          value={`${status.system.platform} (${status.system.arch})`} mono />
            <InfoRow label="Node.js Version"   value={status.system.nodeVersion} mono />
            <InfoRow label="Process Memory"    value={formatBytes(status.system.processMemBytes)} />
            <InfoRow label="Free Memory"       value={formatBytes(status.system.freeMemBytes)} />
            <InfoRow label="Auto-refresh"      value="Every 10 seconds" />
          </div>
        </>
      ) : null}
    </div>
  );
}
