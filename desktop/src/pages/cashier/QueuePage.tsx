import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { useOrders } from '../../hooks/useOrders';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { completeOrder } from '../../api/order.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import Topbar from '../../components/shared/Topbar';
import Badge, { PaymentBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';

export default function QueuePage() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const { getMethodColor } = usePaymentMethods();

  async function handleComplete(id: number) {
    try { await completeOrder(id); } catch { /* socket will update UI */ }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Topbar />

      <div className="pt-[52px] p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-textGray hover:text-white transition-colors"
          >
            <IconArrowLeft size={18} />
          </button>
          <h1 className="text-white font-semibold">Active Orders</h1>
          {orders.length > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState emoji="✅" message="No pending orders" subtitle="New orders will appear here" />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                {/* Order header */}
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-lg">{order.order_number}</span>
                  <PaymentBadge method={order.payment_method} color={getMethodColor(order.payment_method)} />
                </div>

                <p className="text-textMuted text-xs">{formatTime(order.created_at)}</p>

                {/* Items */}
                <div className="flex flex-col gap-1 border-t border-border pt-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white">{item.item_name}</span>
                      <span className="text-textGray">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-border pt-2">
                  <span className="text-textGray text-xs">Total</span>
                  <span className="text-white font-semibold">{formatCurrency(order.total_amount)}</span>
                </div>

                {/* Mark as done */}
                <button
                  onClick={() => handleComplete(order.id)}
                  className="w-full bg-primary hover:bg-primaryDark text-white rounded-lg py-2 text-sm font-semibold transition-colors"
                >
                  Mark as Done
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
