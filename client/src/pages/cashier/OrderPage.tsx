import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconList, IconLogout } from '@tabler/icons-react';
import { useMenu } from '../../hooks/useMenu';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth.api';
import { disconnectSocket } from '../../socket/socket';
import type { MenuItem } from '../../types';
import CategoryTabs from '../../components/cashier/CategoryTabs';
import MenuGrid from '../../components/cashier/MenuGrid';
import OrderPanel from '../../components/cashier/OrderPanel';

export default function OrderPage() {
  const navigate = useNavigate();
  const { menuItems, categories, loading } = useMenu();
  const { addItem } = useOrderStore();
  const { user, logout: clearAuth } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const filtered = selectedCategory === null
    ? menuItems
    : menuItems.filter(i => i.category_id === selectedCategory);

  // Featured items appear first within the current view
  const sorted = [...filtered].sort((a, b) => (b.is_featured ?? 0) - (a.is_featured ?? 0));

  function handleAdd(item: MenuItem) {
    addItem({
      menu_item_id: item.id,
      item_name: item.name,
      item_price: item.price,
      quantity: 1,
      image_path: item.image_path,
    });
  }

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    disconnectSocket();
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col pb-24">
      {/* Topbar */}
      <header className="sticky top-0 bg-card border-b border-border px-4 h-[52px] flex items-center justify-between z-30">
        <span className="font-bold tracking-widest text-sm">
          <span className="text-white">PINILI</span>{' '}
          <span className="text-primary">CUTLET</span>
        </span>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-textGray capitalize bg-cardLight border border-border px-2 py-1 rounded-md">
              {user.role}
            </span>
          )}
          <button onClick={handleLogout} className="text-textGray p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <IconLogout size={18} />
          </button>
        </div>
      </header>

      {/* Category tabs */}
      <div className="py-3">
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Menu grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MenuGrid items={sorted} onAdd={handleAdd} />
      )}

      {/* Bottom nav */}
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

      <OrderPanel />
    </div>
  );
}
