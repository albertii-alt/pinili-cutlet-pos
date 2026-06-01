import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLayoutList, IconLogout, IconQrcode } from '@tabler/icons-react';
import { useMenu } from '../../hooks/useMenu';
import { useCategories } from '../../hooks/useCategories';
import { useOrderStore } from '../../store/useOrderStore';
import { useOrders } from '../../hooks/useOrders';
import { useBrandName } from '../../hooks/useBrandName';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth.api';
import { disconnectSocket } from '../../socket/socket';
import { MenuItem } from '../../types';
import StallName from '../../components/shared/StallName';
import QRCodeModal from '../../components/shared/QRCodeModal';
import LogoutModal from '../../components/shared/LogoutModal';
import CategoryTabs from '../../components/cashier/CategoryTabs';
import MenuGrid from '../../components/cashier/MenuGrid';
import OrderPanel from '../../components/cashier/OrderPanel';

const MIN_PANEL  = 280;
const MAX_PANEL  = 500;
const MIN_MENU   = 400;
const STORAGE_KEY = 'orderPanelWidth';

function getSavedWidth(): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? parseInt(saved, 10) : NaN;
  if (!isNaN(parsed) && parsed >= MIN_PANEL && parsed <= MAX_PANEL) return parsed;
  return 320;
}

export default function OrderPage() {
  const navigate = useNavigate();
  const { menuItems } = useMenu();
  const { categories } = useCategories();
  const { addItem } = useOrderStore();
  const { orders } = useOrders();
  const { stallName, logoUrl } = useBrandName();
  const { user, logout: clearAuth } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState<number>(getSavedWidth);
  const [showQR, setShowQR] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    disconnectSocket();
    clearAuth();
    navigate('/cashier-login');
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging     = useRef(false);

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

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect       = containerRef.current.getBoundingClientRect();
    const totalWidth = rect.width;
    const newPanel   = totalWidth - (e.clientX - rect.left);
    const clamped    = Math.min(MAX_PANEL, Math.max(MIN_PANEL, newPanel));
    // Also enforce min menu width
    const menuWidth  = totalWidth - 4 - clamped;
    if (menuWidth < MIN_MENU) return;
    setPanelWidth(clamped);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    // Save to localStorage on release
    setPanelWidth(prev => {
      localStorage.setItem(STORAGE_KEY, String(prev));
      return prev;
    });
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className="flex h-screen overflow-hidden bg-dark" ref={containerRef}>
      {/* Menu area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Custom topbar */}
        <header
          className="fixed top-0 left-0 right-0 h-[52px] border-b border-border flex items-center justify-between px-4 z-50"
          style={{ backgroundColor: '#111111' }}
        >
          {/* Left — logo + stall name + subtitle */}
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

          {/* Right — queue button + avatar + logout */}
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

        <div className="flex-1 overflow-y-auto pt-[52px] hide-scrollbar">
          <div className="p-4 flex flex-col gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <CategoryTabs
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
            </div>

            <MenuGrid items={sorted} onAdd={handleAdd} />
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

      {/* Order panel — width controlled by drag */}
      <OrderPanel width={panelWidth} />
    </div>
  );
}
