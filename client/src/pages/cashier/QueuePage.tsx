import { useNavigate } from 'react-router-dom';
import { IconShoppingBag, IconLogout, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { useOrders } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/useAuthStore';
import { completeOrder } from '../../api/order.api';
import { logout } from '../../api/auth.api';
import { disconnectSocket, onOrderCreated } from '../../socket/socket';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import { PaymentBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import { useBrandName } from '../../hooks/useBrandName';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useEffect } from 'react';

export default function QueuePage() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const { user, logout: clearAuth } = useAuthStore();
  const stallName = useBrandName();
  const { getMethodColor } = usePaymentMethods();
  const { playSound, isMuted, toggleMute } = useNotificationSound();

  useEffect(() => {
    onOrderCreated(() => playSound(user?.role));
  }, [user?.role]);
  const brandParts = stallName.trim().split(/\s+/);
  const brandFirst = brandParts[0] ?? stallName;
  const brandRest  = brandParts.slice(1).join(' ');

  async function handleComplete(id: number) {
    try { await completeOrder(id); } catch { /* socket updates UI */ }
  }

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    disconnectSocket();
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col pb-20">
      {/* Topbar */}
      <header className="sticky top-0 bg-card border-b border-border px-4 h-[52px] flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-widest text-sm">
            <span className="text-white">{brandFirst.toUpperCase()}</span>
            {brandRest && <>{' '}<span className="text-primary">{brandRest.toUpperCase()}</span></>}
          </span>
          {orders.length > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-textGray capitalize bg-cardLight border border-border px-2 py-1 rounded-md">
              {user.role}
            </span>
          )}
          {user?.role === 'kitchen' && (
            <button onClick={toggleMute} className="text-textGray p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
              {isMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
            </button>
          )}
          <button onClick={handleLogout} className="text-textGray p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <IconLogout size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState emoji="✅" message="No pending orders" subtitle="New orders will appear here automatically" />
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-xl">{order.order_number}</span>
                  <PaymentBadge method={order.payment_method} color={getMethodColor(order.payment_method)} />
                </div>

                <p className="text-textMuted text-xs">{formatTime(order.created_at)}</p>

                {/* Items */}
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-white text-sm">{item.item_name}</span>
                      <span className="text-textGray text-sm font-medium">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-border pt-3">
                  <span className="text-textGray text-sm">Total</span>
                  <span className="text-white font-bold">{formatCurrency(order.total_amount)}</span>
                </div>

                {/* Mark as done */}
                <button
                  onClick={() => handleComplete(order.id)}
                  className="w-full bg-primary hover:bg-primaryDark text-white rounded-lg py-3 text-sm font-semibold min-h-[44px] active:scale-95 transition-all"
                >
                  Mark as Done
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav — only show for cashier role */}
      {user?.role === 'cashier' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-30">
          <button
            onClick={() => navigate('/order')}
            className="flex-1 flex flex-col items-center justify-center py-3 text-textGray gap-1 min-h-[56px]"
          >
            <IconShoppingBag size={18} />
            <span className="text-xs">Order</span>
          </button>
          <button className="flex-1 flex flex-col items-center justify-center py-3 text-primary gap-1 min-h-[56px]">
            <span className="text-xs font-medium">Queue</span>
          </button>
        </nav>
      )}
    </div>
  );
}
