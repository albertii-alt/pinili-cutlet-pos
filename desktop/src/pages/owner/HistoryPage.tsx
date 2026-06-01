import { useState, useEffect } from 'react';
import { IconEye, IconShoppingCart, IconReportMoney, IconCreditCard, IconFileExport, IconCheck, IconX, IconChevronLeft, IconChevronRight, IconCalendar, IconClipboardList, IconSearchOff, IconHistory } from '@tabler/icons-react';
import { getOrderHistory } from '../../api/order.api';
import { getSummary } from '../../api/analytics.api';
import { Order } from '../../types';
import type { OrderFilter } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, toDateParam } from '../../utils/formatDate';
import { PaymentBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import SalesCard from '../../components/owner/SalesCard';
import OrderDetailsModal from '../../components/owner/OrderDetailsModal';
import DateRangePicker, { type DateRangeValue } from '../../components/shared/DateRangePicker';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
const periods: { label: string; value: OrderFilter }[] = [
  { label: 'All',        value: 'all'        },
  { label: 'Today',      value: 'today'      },
  { label: 'This Week',  value: 'week'       },
  { label: 'This Month', value: 'month'      },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom',     value: 'custom'     },
];

function generateCSV(orders: Order[]): string {
  const header = ['Order #', 'Date & Time', 'Payment Method', 'Cash Tendered', 'Change', 'Items', 'Total'];
  const rows = orders.map(o => {
    const items = o.items.map(i => `${i.item_name} x${i.quantity}`).join(' | ');
    return [
      o.order_number,
      formatDateTime(o.created_at),
      o.payment_method.toUpperCase(),
      o.cash_tendered != null ? o.cash_tendered.toFixed(2) : '',
      o.change_amount  != null ? o.change_amount.toFixed(2)  : '',
      items,
      o.total_amount.toFixed(2),
    ];
  });

  const totalItems   = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
  const summary = ['TOTAL', '', '', '', '', String(totalItems), totalRevenue.toFixed(2)];

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [header, ...rows, summary].map(r => r.map(escape).join(',')).join('\n');
}

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl z-50"
      style={{
        backgroundColor: '#111111',
        border: `1px solid ${type === 'success' ? 'rgba(39,174,96,0.4)' : 'rgba(192,57,43,0.4)'}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: type === 'success' ? 'rgba(39,174,96,0.2)' : 'rgba(192,57,43,0.2)' }}
      >
        {type === 'success'
          ? <IconCheck size={12} color="#27AE60" />
          : <IconX size={12} color="#C0392B" />
        }
      </div>
      <span style={{ fontSize: 13, color: type === 'success' ? '#27AE60' : '#C0392B' }}>{message}</span>
    </div>
  );
}

export default function HistoryPage() {
  const [period, setPeriod]             = useState<OrderFilter>('today');
  const [orders, setOrders]             = useState<Order[]>([]);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE                       = 25;
  const [loading, setLoading]           = useState(true);
  const [summary, setSummary]           = useState<{ total_orders: number; total_sales: number; payment_breakdown: { payment_method: string; revenue: number }[] } | null>(null);
  const [selected, setSelected]         = useState<Order | null>(null);
  const [exporting, setExporting]       = useState(false);
  const [toast, setToast]               = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { getMethodColor, getMethodLogoUrl } = usePaymentMethods();

  function handleOrderCancelled(id: number) {
    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status: 'cancelled' as const } : o
    ));
    setSelected(prev => prev?.id === id ? { ...prev, status: 'cancelled' as const } : prev);
    setToast({ message: 'Order cancelled successfully', type: 'success' });
  }

  // Custom date range state
  const [dateRange, setDateRange]         = useState<DateRangeValue>({ startDate: '', endDate: '' });
  const [appliedRange, setAppliedRange]   = useState<DateRangeValue | null>(null);

  // Reset applied range when switching away from custom
  function handlePeriodChange(p: OrderFilter) {
    setPeriod(p);
    setPage(1);
    setActiveFilter(null);
    if (p !== 'custom') setAppliedRange(null);
  }

  // Fetch full-period summary for stat cards (independent of page/activeFilter)
  useEffect(() => {
    if (period === 'custom' && !appliedRange) { setSummary(null); return; }
    const dr = period === 'custom' && appliedRange ? { startDate: appliedRange.startDate, endDate: appliedRange.endDate } : undefined;
    getSummary(period === 'today' ? 'today' : period === 'week' ? 'week' : period === 'month' ? 'month' : period === 'last_month' ? 'last_month' : period === 'all' ? 'all' : 'custom', dr)
      .then(setSummary).catch(console.error);
  }, [period, appliedRange]);

  useEffect(() => {
    if (period === 'custom' && !appliedRange) {
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    setLoading(true);

    const params: Parameters<typeof getOrderHistory>[0] = { page, limit: PAGE_SIZE };

    if (period === 'custom' && appliedRange) {
      params.startDate = appliedRange.startDate;
      params.endDate   = appliedRange.endDate;
    } else if (period === 'today') {
      params.date = toDateParam();
    } else {
      params.period = period;
    }

    if (activeFilter) params.payment_method = activeFilter;

    getOrderHistory(params)
      .then(res => {
        setOrders(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, appliedRange, page, activeFilter]);

  async function handleExport() {
    if (total === 0 || exporting) return;
    setExporting(true);
    try {
      const { save }          = await import('@tauri-apps/plugin-dialog');
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');

      // Fetch all orders for export (no pagination limit)
      const params: Parameters<typeof getOrderHistory>[0] = { page: 1, limit: 10000 };
      if (period === 'custom' && appliedRange) {
        params.startDate = appliedRange.startDate;
        params.endDate   = appliedRange.endDate;
      } else if (period === 'today') {
        params.date = toDateParam();
      } else {
        params.period = period;
      }
      if (activeFilter) params.payment_method = activeFilter;

      const all = await getOrderHistory(params);

      const fileName = `pinili-cutlet-report-${period}-${toDateParam()}.csv`;
      const filePath = await save({
        defaultPath: fileName,
        filters: [{ name: 'CSV', extensions: ['csv'] }],
      });

      if (!filePath) return;

      const csv = generateCSV(all.data);
      await writeTextFile(filePath, csv);
      setToast({ message: 'Report exported successfully', type: 'success' });
    } catch {
      setToast({ message: 'Failed to export report', type: 'error' });
    } finally {
      setExporting(false);
    }
  }

  const totalRevenue      = summary?.total_sales ?? 0;
  const paymentBreakdown  = summary?.payment_breakdown ?? [];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header + filters + export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <IconHistory size={18} color="#C0392B" />
          <h1 className="text-white font-semibold text-lg">Order History</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p.value
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-textGray hover:bg-cardLight'
              }`}
            >
              {p.label}
            </button>
          ))}

          <div className="w-px h-5 bg-border mx-1" />

          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '6px 12px',
              color: exporting || total === 0 ? '#606060' : '#A0A0A0',
              fontSize: 13,
              cursor: exporting || total === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!exporting && total > 0) { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}}
            onMouseLeave={e => { if (!exporting && total > 0) { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}}
          >
            {exporting ? (
              <div className="w-3.5 h-3.5 border-2 border-textMuted border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconFileExport size={14} />
            )}
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Custom date range picker — shown only when Custom is selected */}
      {period === 'custom' && (
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          onApply={range => setAppliedRange(range)}
        />
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', width: '100%' }}>
        <SalesCard
          label="Orders"
          value={String(summary?.total_orders ?? 0)}
          icon={IconShoppingCart}
          clickable
          active={activeFilter === null}
          onClick={() => { setActiveFilter(null); setPage(1); }}
        />
        <SalesCard
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={IconReportMoney}
          accent
          clickable
          active={activeFilter === null}
          onClick={() => { setActiveFilter(null); setPage(1); }}
        />
        {paymentBreakdown.map(b => (
          <SalesCard
            key={b.payment_method}
            label={b.payment_method.charAt(0).toUpperCase() + b.payment_method.slice(1)}
            value={formatCurrency(b.revenue)}
            icon={IconCreditCard}
            logoUrl={getMethodLogoUrl(b.payment_method)}
            accent
            accentColor={getMethodColor(b.payment_method)}
            clickable
            active={activeFilter === b.payment_method}
            onClick={() => { setActiveFilter(activeFilter === b.payment_method ? null : b.payment_method); setPage(1); }}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : period === 'custom' && !appliedRange ? (
        <EmptyState icon={<IconCalendar size={48} color="#2C2C2C" />} message="Select a date range" subtitle="Choose a start and end date, then press Apply" />
      ) : total === 0 ? (
        <EmptyState icon={<IconClipboardList size={48} color="#2C2C2C" />} message="No orders found" subtitle="Completed orders will appear here" />
      ) : orders.length === 0 ? (
        <EmptyState icon={<IconSearchOff size={48} color="#2C2C2C" />} message="No orders found" subtitle={`No orders paid with ${activeFilter}`} />
      ) : (
        <>
          <div className="border border-border rounded-xl overflow-hidden" style={{ backgroundColor: '#111111' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #2C2C2C' }}>
                  {['Order #', 'Date & Time', 'Payment', 'Status', 'Items', 'Total', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-medium"
                      style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 transition-colors"
                    style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0A0A0A' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#111111' : '#0A0A0A')}
                  >
                    <td className="px-4 py-3" style={{ color: '#C0392B', fontWeight: 600, fontSize: 13 }}>{order.order_number}</td>
                    <td className="px-4 py-3" style={{ color: '#A0A0A0', fontSize: 13 }}>{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3"><PaymentBadge method={order.payment_method} color={getMethodColor(order.payment_method)} logoUrl={getMethodLogoUrl(order.payment_method)} /></td>
                    <td className="px-4 py-3">
                      {order.status === 'cancelled'
                        ? <span style={{ fontSize: 11, fontWeight: 600, color: '#C0392B', backgroundColor: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 4, padding: '2px 7px' }}>Cancelled</span>
                        : <span style={{ fontSize: 11, fontWeight: 600, color: '#27AE60', backgroundColor: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 4, padding: '2px 7px' }}>Completed</span>
                      }
                    </td>
                    <td className="px-4 py-3" style={{ color: '#A0A0A0', fontSize: 13 }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3" style={{ color: order.status === 'cancelled' ? '#606060' : '#ffffff', fontWeight: 500, fontSize: 13, textDecoration: order.status === 'cancelled' ? 'line-through' : 'none' }}>{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(order)}
                        className="flex items-center gap-1.5 transition-colors"
                        style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '5px 10px', color: '#A0A0A0', fontSize: 12, cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
                      >
                        <IconEye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: '#606060' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} orders
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 6,
                    backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C',
                    color: page === 1 ? '#404040' : '#A0A0A0',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (page > 1) e.currentTarget.style.backgroundColor = '#242424'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                >
                  <IconChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} style={{ fontSize: 12, color: '#404040', padding: '0 4px' }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        style={{
                          width: 30, height: 30, borderRadius: 6, fontSize: 12, fontWeight: 500,
                          backgroundColor: page === p ? 'var(--color-primary, #C0392B)' : '#1A1A1A',
                          border: `1px solid ${page === p ? 'transparent' : '#2C2C2C'}`,
                          color: page === p ? '#ffffff' : '#A0A0A0',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => { if (page !== p) e.currentTarget.style.backgroundColor = '#242424'; }}
                        onMouseLeave={e => { if (page !== p) e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                      >
                        {p}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 6,
                    backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C',
                    color: page === totalPages ? '#404040' : '#A0A0A0',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.backgroundColor = '#242424'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                >
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && <OrderDetailsModal order={selected} onClose={() => setSelected(null)} onCancelled={handleOrderCancelled} />}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
