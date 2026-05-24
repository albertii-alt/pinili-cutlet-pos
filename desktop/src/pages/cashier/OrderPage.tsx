import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconList } from '@tabler/icons-react';
import { useMenu } from '../../hooks/useMenu';
import { useCategories } from '../../hooks/useCategories';
import { useOrderStore } from '../../store/useOrderStore';
import { MenuItem } from '../../types';
import Topbar from '../../components/shared/Topbar';
import CategoryTabs from '../../components/cashier/CategoryTabs';
import MenuGrid from '../../components/cashier/MenuGrid';
import OrderPanel from '../../components/cashier/OrderPanel';

export default function OrderPage() {
  const navigate = useNavigate();
  const { menuItems } = useMenu();
  const { categories } = useCategories();
  const { addItem } = useOrderStore();
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
      item_price: item.promo_price ?? item.price,
      quantity: 1,
      image_path: item.image_path,
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />

        <div className="flex-1 overflow-y-auto pt-[52px] hide-scrollbar">
          <div className="p-4 flex flex-col gap-4">
            {/* Category tabs + queue button */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <CategoryTabs
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
              <button
                onClick={() => navigate('/queue')}
                className="flex items-center gap-2 bg-card border border-border text-textGray hover:text-white rounded-lg px-3 py-1.5 text-sm transition-colors shrink-0"
              >
                <IconList size={15} />
                Queue
              </button>
            </div>

            <MenuGrid items={sorted} onAdd={handleAdd} />
          </div>
        </div>
      </div>

      <OrderPanel />
    </div>
  );
}
