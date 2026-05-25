import { useState, useEffect } from 'react';
import { IconEye, IconShoppingCart, IconReportMoney, IconCreditCard, IconFileExport, IconCheck, IconX } from '@tabler/icons-react';
import { getOrderHistory } from '../../api/order.api';
import { Order } from '../../types';
import type { OrderFilter } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, toDateParam } from '../../utils/formatDate';
import Badge, { PaymentBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import SalesCard from '../../components/owner/SalesCard';
import OrderDetailsModal from '../../components/owner/OrderDetailsModal';
import DateRangePicker, { type DateRangeValue } from '../../components/shared/DateRangePicker';
const periods: { label: string; value: OrderFilter }[] = [
  { label: 'Today',      value: 'today'  },
  { label: 'This Week',  value: 'week'   },
  { label: 'This Month', value: 'month'  },
  { label: 'Custom',     value: 'custom' },
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
  const [period, setPeriod]         = useState<OrderFilter>('today');
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Order | null>(null);
  const [exporting, setExporting]   = useState(false);
  const [toast, setToast]           = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    if (p !== 'custom') setAppliedRange(null);
  }

  useEffect(() => {
    // For custom period, only fetch once the user has applied a range
    if (period === 'custom' && !appliedRange) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const params: Parameters<typeof getOrderHistory>[0] = {};

    if (period === 'custom' && appliedRange) {
      params.startDate = appliedRange.startDate;
      params.endDate   = appliedRange.endDate;
    } else if (period === 'today') {
      params.date = toDateParam();
    }

    getOrderHistory(params)
      .then(data => {
        // Keep completed + cancelled, exclude pending
        const filtered = data.filter(o => o.status !== 'pending');
        if (period === 'week') {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 6);
          setOrders(filtered.filter(o => new Date(o.created_at) >= cutoff));
        } else if (period === 'month') {
          const now = new Date();
          setOrders(filtered.filter(o => {
            const d = new Date(o.created_at);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          }));
        } else {
          setOrders(filtered);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, appliedRange]);

  async function handleExport() {
    if (orders.length === 0 || exporting) return;
    setExporting(true);
    try {
      const { save }          = await import('@tauri-apps/plugin-dialog');
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');

      const fileName = `pinili-cutlet-report-${period}-${toDateParam()}.csv`;
      const filePath = await save({
        defaultPath: fileName,
        filters: [{ name: 'CSV', extensions: ['csv'] }],
      });

      if (!filePath) return; // user cancelled

      const csv = generateCSV(orders);
      await writeTextFile(filePath, csv);
      setToast({ message: 'Report exported successfully', type: 'success' });
    } catch {
      setToast({ message: 'Failed to export report', type: 'error' });
    } finally {
      setExporting(false);
    }
  }

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total_amount, 0);

  // Dynamic payment breakdown from completed orders
  const paymentBreakdown = completedOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.payment_method] = (acc[o.payment_method] ?? 0) + o.total_amount;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header + filters + export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-white font-semibold text-lg">Order History</h1>
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
            disabled={exporting || orders.length === 0}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '6px 12px',
              color: exporting || orders.length === 0 ? '#606060' : '#A0A0A0',
              fontSize: 13,
              cursor: exporting || orders.length === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!exporting && orders.length > 0) { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}}
            onMouseLeave={e => { if (!exporting && orders.length > 0) { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}}
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
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${2 + Object.keys(paymentBreakdown).length}, minmax(0, 1fr))` }}>
        <SalesCard label="Orders"  value={String(orders.length)}        icon={IconShoppingCart} />
        <SalesCard label="Revenue" value={formatCurrency(totalRevenue)} icon={IconReportMoney} accent />
        {Object.entries(paymentBreakdown).map(([method, revenue]) => (
          <SalesCard
            key={method}
            label={method.charAt(0).toUpperCase() + method.slice(1)}
            value={formatCurrency(revenue)}
            icon={IconCreditCard}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : period === 'custom' && !appliedRange ? (
        <EmptyState emoji="📅" message="Select a date range" subtitle="Choose a start and end date, then press Apply" />
      ) : orders.length === 0 ? (
        <EmptyState emoji="📋" message="No orders found" subtitle="Completed orders will appear here" />
      ) : (
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
                  <td className="px-4 py-3"><PaymentBadge method={order.payment_method} /></td>
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
      )}

      {selected && <OrderDetailsModal order={selected} onClose={() => setSelected(null)} onCancelled={handleOrderCancelled} />}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
