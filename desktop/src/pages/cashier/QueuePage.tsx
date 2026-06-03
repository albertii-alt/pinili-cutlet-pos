import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconClock, IconAlertCircle, IconClipboardList } from '@tabler/icons-react';
import { useOrders } from '../../hooks/useOrders';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useBrandName } from '../../hooks/useBrandName';
import { useAuthStore } from '../../store/useAuthStore';
import StallName from '../../components/shared/StallName';
import { completeOrder } from '../../api/order.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import Topbar from '../../components/shared/Topbar';
import { PaymentBadge } from '../../components/shared/Badge';

// ─── Elapsed time ─────────────────────────────────────────────────────────────

function getElapsed(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function ElapsedBadge({ createdAt }: { createdAt: string }) {
  const [mins, setMins] = useState(() => getElapsed(createdAt));

  useEffect(() => {
    const id = setInterval(() => setMins(getElapsed(createdAt)), 30000);
    return () => clearInterval(id);
  }, [createdAt]);

  if (mins >= 10) {
    return (
      <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#C0392B', fontWeight: 600 }}>
        <IconAlertCircle size={12} />
        {mins} mins ago
      </span>
    );
  }
  if (mins >= 5) {
    return (
      <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#F39C12', fontWeight: 600 }}>
        <IconClock size={12} />
        {mins} mins ago
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11, color: '#606060' }}>
      {mins === 0 ? 'just now' : `${mins} min${mins !== 1 ? 's' : ''} ago`}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function QueuePage() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const { getMethodColor, getMethodLogoUrl } = usePaymentMethods();
  const { stallName, logoUrl } = useBrandName();
  const { user } = useAuthStore();

  async function handleComplete(id: number) {
    try { await completeOrder(id); } catch { /* socket will update UI */ }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-dark, #0A0A0A)' }}>
      <Topbar
        left={
          <div className="flex items-center gap-2.5">
            {logoUrl && (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: '#1A1A1A' }}>
                <img src={logoUrl} alt={stallName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <div className="flex flex-col justify-center" style={{ gap: 2 }}>
              <StallName name={stallName} />
              <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.role ?? ''}</span>
            </div>
          </div>
        }
      />

      <div style={{ padding: '68px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/order')}
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: 8,
              color: '#A0A0A0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
          >
            <IconArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>Active Orders</h1>
          {orders.length > 0 && (
            <span
              style={{
                backgroundColor: 'var(--accent-color, #C0392B)',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 99,
                padding: '2px 8px',
              }}
            >
              {orders.length}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          /* Fix 6 — Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <IconClipboardList size={48} color="#2C2C2C" />
            <span style={{ fontSize: 16, color: '#444444', fontWeight: 600 }}>All caught up!</span>
            <span style={{ fontSize: 13, color: '#333333' }}>No pending orders right now</span>
          </div>
        ) : (
          /* Fix 1 — grid fills remaining height */
          <div
            style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, alignContent: 'start' }}
          >
            {orders.map(order => (
              /* Fix 2 — card visual depth + hover border */
              <div
                key={order.id}
                className="flex flex-col gap-3 transition-all"
                style={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2C2C2C',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-color, #C0392B)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
              >
                {/* Order header */}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-color, #C0392B)' }}>
                    {order.order_number}
                  </span>
                  <PaymentBadge method={order.payment_method} color={getMethodColor(order.payment_method)} logoUrl={getMethodLogoUrl(order.payment_method)} />
                </div>

                {/* Fix 4 — timestamp + elapsed */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: 11, color: '#606060' }}>{formatTime(order.created_at)}</span>
                  <span style={{ color: '#2C2C2C', fontSize: 10 }}>·</span>
                  <ElapsedBadge createdAt={order.created_at} />
                </div>

                {/* Fix 3 — items: ×N on left in accent, name in middle, line total on right */}
                <div className="flex flex-col gap-1" style={{ borderTop: '1px solid #2C2C2C', paddingTop: 8 }}>
                  {order.items.map(item => (
                    <div key={item.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-color, #C0392B)', flexShrink: 0 }}>
                          ×{item.quantity}
                        </span>
                        <span style={{ fontSize: 13, color: '#ffffff', flex: 1 }}>{item.item_name}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#A0A0A0', flexShrink: 0 }}>
                          {formatCurrency(item.item_price * item.quantity)}
                        </span>
                      </div>
                      {item.notes && (
                        <span style={{ fontSize: 11, color: '#606060', fontStyle: 'italic', paddingLeft: 20 }}>
                          {item.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center" style={{ borderTop: '1px solid #2C2C2C', paddingTop: 8 }}>
                  <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{formatCurrency(order.total_amount)}</span>
                </div>

                {/* Mark as done */}
                <button
                  onClick={() => handleComplete(order.id)}
                  style={{
                    width: '100%',
                    height: 38,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'var(--accent-color, #C0392B)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
