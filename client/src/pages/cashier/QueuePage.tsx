import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconShoppingBag, IconLogout, IconVolume, IconVolumeOff, IconArrowLeft, IconClock, IconAlertCircle, IconClipboardList, IconQrcode, IconCircleCheck } from '@tabler/icons-react';
import { useOrders } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/useAuthStore';
import { completeOrder } from '../../api/order.api';
import { logout } from '../../api/auth.api';
import { disconnectSocket, onOrderCreated } from '../../socket/socket';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import { PaymentBadge } from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import QRCodeModal from '../../components/shared/QRCodeModal';
import LogoutModal from '../../components/shared/LogoutModal';
import { useBrandName } from '../../hooks/useBrandName';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useWindowSize } from '../../hooks/useWindowSize';
// ─── Done animation styles ────────────────────────────────────────────────────

const doneKeyframes = `
@keyframes cardDone {
  0%   { opacity: 1; transform: translateX(0) scale(1); }
  20%  { opacity: 1; transform: translateX(0) scale(1.02); background-color: rgba(39,174,96,0.12); }
  100% { opacity: 0; transform: translateX(60px) scale(0.97); }
}
.card-done {
  animation: cardDone 0.45s ease-in forwards;
  pointer-events: none;
}
`;

// ─── Elapsed badge (desktop only) ────────────────────────────────────────────

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
  const { user, logout: clearAuth } = useAuthStore();
  const { stallName, logoUrl } = useBrandName();
  const { getMethodColor, getMethodLogoUrl } = usePaymentMethods();
  const { playSound, isMuted, toggleMute } = useNotificationSound();
  const { width } = useWindowSize();
  const [showQR, setShowQR] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());

  const isDesktop = width >= 1024;
  const gridCols  = isDesktop ? 3 : width >= 600 ? 2 : 1;

  const brandParts = stallName.trim().split(/\s+/);
  const brandFirst = brandParts[0] ?? stallName;
  const brandRest  = brandParts.slice(1).join(' ');

  useEffect(() => {
    onOrderCreated(() => playSound(user?.role));
  }, [user?.role]);

  async function handleComplete(id: number) {
    // Trigger the exit animation first
    setCompletingIds(prev => new Set(prev).add(id));
    // After animation completes, call the API
    setTimeout(async () => {
      try { await completeOrder(id); } catch { /* socket updates UI */ }
    }, 400);
  }

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    disconnectSocket();
    clearAuth();
    navigate('/login');
  }

  // ── Desktop: matches desktop app QueuePage exactly ───────────────────────────
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0A0A0A' }}>
        <style>{doneKeyframes}</style>
        {/* Desktop topbar */}
        <header
          className="fixed top-0 left-0 right-0 h-[52px] border-b border-border flex items-center justify-between px-4 z-50"
          style={{ backgroundColor: '#111111' }}
        >
          <div className="flex items-center gap-2.5">
            {logoUrl && (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: '#1A1A1A' }}>
                <img src={logoUrl} alt={stallName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <div className="flex flex-col justify-center" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                <span style={{ color: '#ffffff' }}>{brandFirst}</span>
                {brandRest && <span style={{ color: 'var(--accent-color, #C0392B)' }}> {brandRest}</span>}
              </span>
              <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.role ?? ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: 'var(--accent-color, #C0392B)' }}
                >
                  {user.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-textGray text-sm">{user.username}</span>
              </div>
            )}

            {user?.role === 'cashier' && (
              <button
                onClick={() => setShowQR(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border"
                style={{ backgroundColor: '#1A1A1A', color: '#A0A0A0', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
              >
                <IconQrcode size={18} />
              </button>
            )}

            {user?.role === 'kitchen' && (
              <button
                onClick={toggleMute}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border"
                style={{ backgroundColor: '#1A1A1A', color: '#A0A0A0', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
              >
                {isMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
              </button>
            )}

            <button
              onClick={() => setShowLogout(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border"
              style={{ backgroundColor: '#1A1A1A', color: '#A0A0A0', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.1)'; e.currentTarget.style.color = '#C0392B'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
            >
              <IconLogout size={18} />
            </button>
          </div>
        </header>

        {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}
        {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}

        <div style={{ padding: '68px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
          {/* Header row */}
          <div className="flex items-center gap-3">
            {user?.role !== 'kitchen' && (
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
            )}
            <h1 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>Active Orders</h1>
            {orders.length > 0 && (
              <span style={{ backgroundColor: 'var(--accent-color, #C0392B)', color: '#ffffff', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px' }}>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <IconClipboardList size={48} color="#2C2C2C" />
              <span style={{ fontSize: 16, color: '#444444', fontWeight: 600 }}>All caught up!</span>
              <span style={{ fontSize: 13, color: '#333333' }}>No pending orders right now</span>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gap: 12, alignContent: 'start' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  className={`flex flex-col gap-3${completingIds.has(order.id) ? ' card-done' : ''}`}
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2C2C2C',
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => { if (!completingIds.has(order.id)) e.currentTarget.style.borderColor = 'var(--accent-color, #C0392B)'; }}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-color, #C0392B)' }}>
                      {order.order_number}
                    </span>
                    <PaymentBadge method={order.payment_method} color={getMethodColor(order.payment_method)} logoUrl={getMethodLogoUrl(order.payment_method)} />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize: 11, color: '#606060' }}>{formatTime(order.created_at)}</span>
                    <span style={{ color: '#2C2C2C', fontSize: 10 }}>·</span>
                    <ElapsedBadge createdAt={order.created_at} />
                  </div>

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

                  <div className="flex justify-between items-center" style={{ borderTop: '1px solid #2C2C2C', paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{formatCurrency(order.total_amount)}</span>
                  </div>

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

  // ── Tablet + Phone: original layout ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark flex flex-col pb-20">
      <style>{doneKeyframes}</style>
      <header className="sticky top-0 bg-card border-b border-border px-4 h-[52px] flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: '#1A1A1A' }}>
              <img src={logoUrl} alt={stallName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
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
          <button onClick={() => setShowLogout(true)} className="text-textGray p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <IconLogout size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon={<IconCircleCheck size={48} color="#2C2C2C" />} message="No pending orders" subtitle="New orders will appear here automatically" />
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
            {orders.map(order => (
              <div key={order.id} className={`bg-card border border-border rounded-xl p-4 flex flex-col gap-3${completingIds.has(order.id) ? ' card-done' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-xl">{order.order_number}</span>
                  <PaymentBadge method={order.payment_method} color={getMethodColor(order.payment_method)} logoUrl={getMethodLogoUrl(order.payment_method)} />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-textMuted text-xs">{formatTime(order.created_at)}</p>
                  <span className="text-textMuted text-xs">·</span>
                  <ElapsedBadge createdAt={order.created_at} />
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-xs font-bold shrink-0">×{item.quantity}</span>
                        <span className="text-white text-sm flex-1">{item.item_name}</span>
                        <span className="text-textGray text-xs font-semibold shrink-0">
                          {formatCurrency(item.item_price * item.quantity)}
                        </span>
                      </div>
                      {item.notes && (
                        <span className="text-xs" style={{ color: '#606060', fontStyle: 'italic' }}>
                          {item.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-border pt-3">
                  <span className="text-textGray text-sm">Total</span>
                  <span className="text-white font-bold">{formatCurrency(order.total_amount)}</span>
                </div>

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
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </div>
  );
}
