import { useState, useEffect, useCallback } from 'react';
import {
  IconUsers,
  IconCalendar,
  IconShoppingCart,
  IconReportMoney,
  IconClock,
  IconTrendingUp,
} from '@tabler/icons-react';
import { getShiftReport, type ShiftReportPeriod } from '../../api/shiftReport.api';
import { ShiftReportEntry, ShiftReportSummary } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS: { label: string; value: ShiftReportPeriod }[] = [
  { label: 'Today',      value: 'today'  },
  { label: 'This Week',  value: 'week'   },
  { label: 'This Month', value: 'month'  },
  { label: 'Custom',     value: 'custom' },
];

// Role badge colors
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  cashier: { bg: 'rgba(52,152,219,0.12)',  color: '#3498DB' },
  kitchen: { bg: 'rgba(243,156,18,0.12)',  color: '#F39C12' },
  owner:   { bg: 'rgba(192,57,43,0.12)',   color: '#C0392B' },
};

// Avatar background colors (cycle through for variety)
const AVATAR_COLORS = ['#C0392B', '#3498DB', '#27AE60', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22'];

function avatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function roleStyle(role: string | null) {
  return ROLE_COLORS[role ?? ''] ?? { bg: 'rgba(160,160,160,0.1)', color: '#A0A0A0' };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatShortDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Staff Card ───────────────────────────────────────────────────────────────

interface StaffCardProps {
  entry: ShiftReportEntry;
  index: number;
  totalSales: number;
}

function StaffCard({ entry, index, totalSales }: StaffCardProps) {
  const displayName = entry.username ?? `User #${entry.created_by ?? '?'}`;
  const initial     = displayName.charAt(0).toUpperCase();
  const pct         = totalSales > 0 ? (entry.total_sales / totalSales) * 100 : 0;
  const rs          = roleStyle(entry.role);
  const ac          = avatarColor(index);

  // Determine if first and last order are on the same date
  const sameDay = entry.first_order_at && entry.last_order_at &&
    formatShortDate(entry.first_order_at) === formatShortDate(entry.last_order_at);

  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5"
      style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
    >
      {/* Top row: avatar + name + role */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: ac, fontSize: 16, fontWeight: 700, color: '#ffffff' }}
        >
          {initial}
        </div>

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }} className="truncate">
            {displayName}
          </span>
          {entry.role && (
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 4,
              padding: '1px 6px',
              backgroundColor: rs.bg,
              color: rs.color,
              alignSelf: 'flex-start',
              textTransform: 'capitalize',
            }}>
              {entry.role}
            </span>
          )}
        </div>

        {/* Sales share % */}
        <span style={{ fontSize: 13, fontWeight: 700, color: ac, whiteSpace: 'nowrap' }}>
          {pct.toFixed(1)}%
        </span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Total Sales */}
        <div className="flex flex-col gap-1 rounded-lg px-3 py-2.5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-1.5">
            <IconReportMoney size={11} color="#C0392B" />
            <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Sales</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#C0392B' }}>
            {formatCurrency(entry.total_sales)}
          </span>
        </div>

        {/* Total Orders */}
        <div className="flex flex-col gap-1 rounded-lg px-3 py-2.5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-1.5">
            <IconShoppingCart size={11} color="#3498DB" />
            <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Orders</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
            {entry.total_orders}
            {entry.cancelled_orders > 0 && (
              <span style={{ fontSize: 11, fontWeight: 400, color: '#C0392B', marginLeft: 4 }}>
                ({entry.cancelled_orders} cancelled)
              </span>
            )}
          </span>
        </div>

        {/* Avg Order Value */}
        <div className="flex flex-col gap-1 rounded-lg px-3 py-2.5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-1.5">
            <IconTrendingUp size={11} color="#27AE60" />
            <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Order</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
            {entry.avg_order_value !== null ? formatCurrency(entry.avg_order_value) : '—'}
          </span>
        </div>

        {/* Shift time */}
        <div className="flex flex-col gap-1 rounded-lg px-3 py-2.5" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-1.5">
            <IconClock size={11} color="#A0A0A0" />
            <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shift Time</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#A0A0A0', lineHeight: 1.4 }}>
            {entry.first_order_at ? (
              <>
                {!sameDay && <span style={{ fontSize: 10, color: '#606060' }}>{formatShortDate(entry.first_order_at)} </span>}
                {formatTime(entry.first_order_at)}
                <span style={{ color: '#404040' }}> → </span>
                {!sameDay && <span style={{ fontSize: 10, color: '#606060' }}>{formatShortDate(entry.last_order_at)} </span>}
                {formatTime(entry.last_order_at)}
              </>
            ) : '—'}
          </span>
        </div>
      </div>

      {/* Performance bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Share of total sales
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: ac }}>{pct.toFixed(1)}%</span>
        </div>
        <div style={{ height: 5, backgroundColor: '#2C2C2C', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: ac,
            borderRadius: 99,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShiftReportPage() {
  const [period, setPeriod]           = useState<ShiftReportPeriod>('today');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [appliedStart, setAppliedStart] = useState('');
  const [appliedEnd, setAppliedEnd]     = useState('');

  const [entries, setEntries]         = useState<ShiftReportEntry[]>([]);
  const [summary, setSummary]         = useState<ShiftReportSummary | null>(null);
  const [loading, setLoading]         = useState(true);

  const awaitingRange = period === 'custom' && (!appliedStart || !appliedEnd);

  const fetchReport = useCallback(() => {
    if (awaitingRange) return;
    setLoading(true);
    const params = period === 'custom'
      ? { start_date: appliedStart, end_date: appliedEnd }
      : { period };
    getShiftReport(params)
      .then(res => { setEntries(res.data); setSummary(res.summary); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period, appliedStart, appliedEnd, awaitingRange]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  function handlePeriodChange(p: ShiftReportPeriod) {
    setPeriod(p);
    if (p !== 'custom') { setAppliedStart(''); setAppliedEnd(''); }
  }

  function handleApplyCustom() {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  }

  const totalSales = summary?.total_sales ?? 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <IconUsers size={18} color="#C0392B" />
          <h1 className="text-white font-semibold text-lg">Shift Reports</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => handlePeriodChange(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p.value ? 'bg-primary text-white' : 'bg-card border border-border text-textGray hover:bg-cardLight'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <div className="flex items-center gap-2 flex-wrap p-4 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}>
          <IconCalendar size={13} color="#606060" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: startDate ? '#ffffff' : '#606060', fontSize: 12, outline: 'none', colorScheme: 'dark' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          />
          <span style={{ fontSize: 12, color: '#606060' }}>to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: endDate ? '#ffffff' : '#606060', fontSize: 12, outline: 'none', colorScheme: 'dark' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          />
          <button onClick={handleApplyCustom} disabled={!startDate || !endDate}
            style={{ backgroundColor: (!startDate || !endDate) ? 'rgba(192,57,43,0.3)' : '#C0392B', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#ffffff', fontSize: 12, fontWeight: 600, cursor: (!startDate || !endDate) ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if (startDate && endDate) e.currentTarget.style.backgroundColor = '#96281B'; }}
            onMouseLeave={e => { if (startDate && endDate) e.currentTarget.style.backgroundColor = '#C0392B'; }}
          >
            Apply
          </button>
        </div>
      )}

      {awaitingRange ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconCalendar size={40} color="#2C2C2C" />
          <p style={{ fontSize: 14, color: '#606060' }}>Select a date range and press Apply</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconUsers size={40} color="#2C2C2C" />
          <p style={{ fontSize: 14, color: '#606060' }}>No orders found for this period</p>
        </div>
      ) : (
        <>
          {/* Staff cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {entries.map((entry, i) => (
              <StaffCard
                key={entry.created_by ?? `unknown-${i}`}
                entry={entry}
                index={i}
                totalSales={totalSales}
              />
            ))}
          </div>

          {/* Summary row */}
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
          >
            <div className="flex items-center gap-2">
              <IconUsers size={15} color="#606060" />
              <span style={{ fontSize: 13, color: '#A0A0A0' }}>
                {entries.length} staff member{entries.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <IconShoppingCart size={14} color="#606060" />
                <span style={{ fontSize: 13, color: '#A0A0A0' }}>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{summary?.total_orders ?? 0}</span> total orders
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconReportMoney size={14} color="#C0392B" />
                <span style={{ fontSize: 13, color: '#A0A0A0' }}>
                  <span style={{ color: '#C0392B', fontWeight: 700 }}>{formatCurrency(totalSales)}</span> total sales
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
