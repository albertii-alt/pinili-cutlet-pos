import { useState, useEffect } from 'react';
import { IconEye, IconShoppingCart, IconReportMoney, IconCash, IconDeviceMobile } from '@tabler/icons-react';
import { getOrderHistory } from '../../api/order.api';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, toDateParam } from '../../utils/formatDate';
import Badge from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import SalesCard from '../../components/owner/SalesCard';
import OrderDetailsModal from '../../components/owner/OrderDetailsModal';

type Period = 'today' | 'week' | 'month';

const periods: { label: string; value: Period }[] = [
  { label: 'Today',      value: 'today' },
  { label: 'This Week',  value: 'week'  },
  { label: 'This Month', value: 'month' },
];

export default function HistoryPage() {
  const [period, setPeriod]       = useState<Period>('today');
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Order | null>(null);

  useEffect(() => {
    setLoading(true);

    const params: { status: string; date?: string } = { status: 'completed' };

    if (period === 'today') {
      params.date = toDateParam();
    }
    // week and month — no date filter, fetch all completed then filter client-side
    getOrderHistory(params)
      .then(data => {
        if (period === 'week') {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 6);
          setOrders(data.filter(o => new Date(o.created_at) >= cutoff));
        } else if (period === 'month') {
          const now = new Date();
          setOrders(data.filter(o => {
            const d = new Date(o.created_at);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          }));
        } else {
          setOrders(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
  const cashRevenue  = orders.filter(o => o.payment_method === 'cash').reduce((s, o) => s + o.total_amount, 0);
  const gcashRevenue = orders.filter(o => o.payment_method === 'gcash').reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header + period filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">Order History</h1>
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p.value
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-textGray hover:bg-cardLight'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <SalesCard label="Orders"  value={String(orders.length)}          icon={IconShoppingCart} />
        <SalesCard label="Revenue" value={formatCurrency(totalRevenue)}   icon={IconReportMoney} accent />
        <SalesCard label="Cash"    value={formatCurrency(cashRevenue)}    icon={IconCash} />
        <SalesCard label="GCash"   value={formatCurrency(gcashRevenue)}   icon={IconDeviceMobile} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState emoji="📋" message="No orders found" subtitle="Completed orders will appear here" />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden" style={{ backgroundColor: '#111111' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #2C2C2C' }}>
                {['Order #', 'Date & Time', 'Payment', 'Items', 'Total', 'Actions'].map(h => (
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
                  <td className="px-4 py-3" style={{ color: '#C0392B', fontWeight: 600, fontSize: 13 }}>
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#A0A0A0', fontSize: 13 }}>
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={order.payment_method === 'cash' ? 'cash' : 'gcash'} />
                  </td>
                  <td className="px-4 py-3" style={{ color: '#A0A0A0', fontSize: 13 }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#ffffff', fontWeight: 500, fontSize: 13 }}>
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(order)}
                      className="flex items-center gap-1.5 transition-colors"
                      style={{
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #2C2C2C',
                        borderRadius: 6,
                        padding: '5px 10px',
                        color: '#A0A0A0',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#242424';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#1A1A1A';
                        e.currentTarget.style.color = '#A0A0A0';
                      }}
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

      {selected && (
        <OrderDetailsModal order={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
