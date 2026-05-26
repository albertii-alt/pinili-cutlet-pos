import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconList, IconLogout, IconLayoutList, IconQrcode } from '@tabler/icons-react';
import { useMenu } from '../../hooks/useMenu';
import { useOrderStore } from '../../store/useOrderStore';
import { useOrders } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth.api';
import { disconnectSocket } from '../../socket/socket';
import type { MenuItem } from '../../types';
import CategoryTabs from '../../components/cashier/CategoryTabs';
import MenuGrid from '../../components/cashier/MenuGrid';
import OrderPanel from '../../components/cashier/OrderPanel';
import QRCodeModal from '../../components/shared/QRCodeModal';
import { useBrandName } from '../../hooks/useBrandName';
import { useWindowSize } from '../../hooks/useWindowSize';

const MIN_PANEL   = 280;
const MAX_PANEL   = 500;
const MIN_MENU    = 400;
const STORAGE_KEY = 'orderPanelWidth';

function getSavedWidth(): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? parseInt(saved, 10) : NaN;
  if (!isNaN(parsed) && parsed >= MIN_PANEL && parsed <= MAX_PANEL) return parsed;
  return 320;
}

export default function OrderPage() {
  const navigate = useNavigate();
  const { menuItems, categories, loading } = useMenu();
  const { addItem } = useOrderStore();
  const { orders } = useOrders();
  const { user, logout: clearAuth } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState<number>(getSavedWidth);
  const [showQR, setShowQR] = useState(false);
  const stallName = useBrandName();
  const { width } = useWindowSize();

  const brandParts = stallName.trim().split(/\s+/);
  const brandFirst = brandParts[0] ?? stallName;
  const brandRest  = brandParts.slice(1).join(' ');

  const isDesktop = width >= 1024;
  const isTablet  = width >= 600 && width < 1024;

  const columns  = isTablet ? 3 : 2;
  const cardSize = isTablet ? 'md' : 'sm';

  const filtered = selectedCategory === null
    ? menuItems
    : menuItems.filter(i => i.category_id === selectedCategory);

  const sorted = [...filtered].sort((a, b) => (b.is_featured ?? 0) - (a.is_featured ?? 0));

  function handleAdd(item: MenuItem) {
    addItem({
      menu_item_id: item.id,
      item_name:    item.name,
      item_price:   item.promo_price ?? item.price,
      quantity:     1,
      image_path:   item.image_path,
    });
  }

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    disconnectSocket();
    clearAuth();
    navigate('/login');
  }

  // ── Resizable divider logic ──────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging     = useRef(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect      = containerRef.current.getBoundingClientRect();
    const newPanel  = rect.width - (e.clientX - rect.left);
    const clamped   = Math.min(MAX_PANEL, Math.max(MIN_PANEL, newPanel));
    if (rect.width - 4 - clamped < MIN_MENU) return;
    setPanelWidth(clamped);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    setPanelWidth(prev => { localStorage.setItem(STORAGE_KEY, String(prev)); return prev; });
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  function onDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Desktop: full desktop app UI ─────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="flex h-screen overflow-hidden bg-dark" ref={containerRef}>
        {/* Menu area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Desktop topbar */}
          <header
            className="fixed top-0 left-0 right-0 h-[52px] border-b border-border flex items-center justify-between px-4 z-50"
            style={{ backgroundColor: '#111111' }}
          >
            <div className="flex flex-col justify-center" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                <span style={{ color: '#ffffff' }}>{brandFirst}</span>
                {brandRest && <span style={{ color: 'var(--accent-color, #C0392B)' }}> {brandRest}</span>}
              </span>
              <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.role ?? ''}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/queue')}
                className="flex items-center gap-2 shrink-0"
                style={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2C2C2C',
                  borderRadius: 8,
                  padding: '6px 12px',
                  color: '#A0A0A0',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
              >
                <IconLayoutList size={15} />
                Queue
                {orders.length > 0 && (
                  <span style={{ backgroundColor: 'var(--accent-color, #C0392B)', color: '#ffffff', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 6px', lineHeight: '16px' }}>
                    {orders.length}
                  </span>
                )}
              </button>

              {user && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: 'var(--accent-color, #C0392B)', flexShrink: 0 }}
                >
                  {user.username?.[0]?.toUpperCase() ?? '?'}
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

              <button
                onClick={handleLogout}
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

          <div className="flex-1 overflow-y-auto pt-[52px] hide-scrollbar">
            <div className="p-4 flex flex-col gap-4">
              <CategoryTabs categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
              <MenuGrid items={sorted} onAdd={handleAdd} columns={4} cardSize="lg" />
            </div>
          </div>
        </div>

        {/* Resizable divider */}
        <div
          onMouseDown={onDividerMouseDown}
          style={{
            width: 4,
            flexShrink: 0,
            backgroundColor: '#2C2C2C',
            cursor: 'col-resize',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-color, #C0392B)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2C2C2C')}
        />

        <OrderPanel variant="desktop" width={panelWidth} />
      </div>
    );
  }

  // ── Tablet + Phone: phone-style layout ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark flex flex-col pb-24">
      <header className="sticky top-0 bg-card border-b border-border px-4 h-[52px] flex items-center justify-between z-30">
        <span className="font-bold tracking-widest text-sm">
          <span className="text-white">{brandFirst.toUpperCase()}</span>
          {brandRest && <>{' '}<span className="text-primary">{brandRest.toUpperCase()}</span></>}
        </span>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-textGray capitalize bg-cardLight border border-border px-2 py-1 rounded-md">
              {user.role}
            </span>
          )}
          {user?.role === 'cashier' && (
            <button onClick={() => setShowQR(true)} className="text-textGray p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <IconQrcode size={18} />
            </button>
          )}
          <button onClick={handleLogout} className="text-textGray p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <IconLogout size={18} />
          </button>
        </div>
      </header>

      {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}

      <div className="py-3">
        <CategoryTabs categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MenuGrid items={sorted} onAdd={handleAdd} columns={columns} cardSize={cardSize as 'sm' | 'md'} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-30">
        <button className="flex-1 flex flex-col items-center justify-center py-3 text-primary gap-1 min-h-[56px]">
          <span className="text-xs font-medium">Order</span>
        </button>
        <button
          onClick={() => navigate('/queue')}
          className="flex-1 flex flex-col items-center justify-center py-3 text-textGray gap-1 min-h-[56px]"
        >
          <IconList size={18} />
          <span className="text-xs">Queue</span>
        </button>
      </nav>

      <OrderPanel variant="phone" />
    </div>
  );
}
