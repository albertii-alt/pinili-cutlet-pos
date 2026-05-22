import { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { getOrderHistory } from '../../api/order.api';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, toDateParam } from '../../utils/formatDate';
import Badge from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';

const periods = [
  { label: 'Today',     date: toDateParam() },
  { label: 'Yesterday', date: toDateParam(new Date(Date.now() - 86400000)) },
  { label: 'All',       date: undefined },
];

export default function HistoryPage() {
  const [period, setPeriod]       = useState(0);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getOrderHistory({ date: periods[period].date, status: 'completed' })
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const totalRevenue  = orders.reduce((s, o) => s + o.total_amount, 0);
  const cashRevenue   = orders.filter(o => o.payment_method === 'cash').reduce((s, o) => s + o.total_amount, 0);
  const gcashRevenue  = orders.filter(o => o.payment_method === 'gcash').reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="flex flex-col gap-4 max-w-[960px]">
      {/* Header + period filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">Order History</h1>
        <div className="flex gap-2">
          {periods.map((p, i) => (
            <button
              key={i}
              onClick={() => setPeriod(i)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === i
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-textGray hover:bg-cardLight'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Orders',      value: String(orders.length) },
          { label: 'Revenue',     value: formatCurrency(totalRevenue) },
          { label: 'Cash',        value: formatCurrency(cashRevenue) },
          { label: 'GCash',       value: formatCurrency(gcashRevenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-textGray text-xs uppercase tracking-wider">{label}</p>
            <p className="text-white font-bold text-lg mt-1">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState emoji="📋" message="No orders found" subtitle="Completed orders will appear here" />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Date', 'Payment', 'Total', 'Items', ''].map(h => (
                  <th key={h} className="text-left text-xs text-textGray uppercase tracking-wider px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <>
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-cardLight transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3 text-primary font-semibold text-sm">{order.order_number}</td>
                    <td className="px-4 py-3 text-textGray text-sm">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={order.payment_method === 'cash' ? 'cash' : 'gcash'} />
                    </td>
                    <td className="px-4 py-3 text-white font-medium text-sm">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3 text-textGray text-sm">{order.items.length} item(s)</td>
                    <td className="px-4 py-3 text-textMuted">
                      {expanded === order.id ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr key={`${order.id}-items`} className="bg-cardLight border-b border-border">
                      <td colSpan={6} className="px-8 py-3">
                        <div className="flex flex-col gap-1">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-white">{item.item_name} ×{item.quantity}</span>
                              <span className="text-textGray">{formatCurrency(item.item_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
