import { useState, useRef, useEffect } from 'react';
import { IconPlus, IconChevronDown, IconCheck, IconToolsKitchen2 } from '@tabler/icons-react';
import { useMenu } from '../../hooks/useMenu';
import { useCategories } from '../../hooks/useCategories';
import { deleteMenuItem, toggleAvailability, bulkToggleAvailability, toggleFeatured as toggleFeaturedApi } from '../../api/menu.api';
import { MenuItem, Category } from '../../types';
import MenuTable from '../../components/owner/MenuTable';
import MenuItemModal from '../../components/owner/MenuItemModal';
import PromoModal from '../../components/owner/PromoModal';
import CategoryManager from '../../components/owner/CategoryManager';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { useMenuStore } from '../../store/useMenuStore';
import { getMenuItems } from '../../api/menu.api';
import { getCategories } from '../../api/category.api';

export default function MenuPage() {
  const { menuItems, setPromoPrice } = useMenu();
  const { categories } = useCategories();
  const { setMenuItems, setCategories } = useMenuStore();

  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editItem, setEditItem]     = useState<MenuItem | null | undefined>(undefined);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const dropdownRef                 = useRef<HTMLDivElement>(null);

  // Bulk toggle state
  const [bulkPending, setBulkPending] = useState<{ category: Category; isAvailable: boolean } | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const [promoItem, setPromoItem]     = useState<MenuItem | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === null || item.category_id === filterCat;
    return matchSearch && matchCat;
  });

  // Item count per category — derived from menuItems, no extra API call
  const itemCounts = menuItems.reduce<Record<number, number>>((acc, item) => {
    if (item.category_id !== null) {
      acc[item.category_id] = (acc[item.category_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  const selectedCatLabel = filterCat === null
    ? 'All Categories'
    : categories.find(c => c.id === filterCat)?.name ?? 'All Categories';

  async function handleToggle(item: MenuItem) {
    await toggleAvailability(item.id);
  }

  async function handleToggleFeatured(item: MenuItem) {
    await toggleFeaturedApi(item.id);
  }

  async function handleDelete() {
    if (!deleteItem) return;
    await deleteMenuItem(deleteItem.id);
    setDeleteItem(null);
    refresh();
  }

  async function handleBulkToggle() {
    if (!bulkPending) return;
    await bulkToggleAvailability(bulkPending.category.id, bulkPending.isAvailable);
    setBulkPending(null);
    setToast(`All "${bulkPending.category.name}" items marked ${bulkPending.isAvailable ? 'available' : 'unavailable'}`);
    refresh();
  }

  async function refresh() {
    const [items, cats] = await Promise.all([getMenuItems(), getCategories()]);
    setMenuItems(items);
    setCategories(cats);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">Menu</h1>
        <button
          onClick={() => setEditItem(null)}
          className="flex items-center gap-2 bg-primary hover:bg-primaryDark text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <IconPlus size={15} />
          Add Item
        </button>
      </div>

      {/* Category manager */}
      <CategoryManager
        categories={categories}
        itemCounts={itemCounts}
        onChanged={refresh}
        onBulkToggle={(category, isAvailable) => setBulkPending({ category, isAvailable })}
        onViewItems={(categoryId) => { setFilterCat(categoryId); }}
      />

      {/* Search + custom category dropdown */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="flex-1 bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
          style={{ backgroundColor: '#1A1A1A' }}
        />

        {/* Custom dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-white text-sm transition-colors hover:border-primary"
            style={{ backgroundColor: '#1A1A1A', minWidth: 160 }}
          >
            <span className="flex-1 text-left">{selectedCatLabel}</span>
            <IconChevronDown
              size={14}
              className="text-textGray transition-transform"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 w-full border border-border rounded-lg overflow-hidden z-20"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              {[{ id: null, name: 'All Categories' }, ...categories].map(c => (
                <button
                  key={c.id ?? 'all'}
                  onClick={() => { setFilterCat(c.id); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-cardLight"
                  style={{ color: filterCat === c.id ? '#C0392B' : '#ffffff' }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<IconToolsKitchen2 size={48} color="#2C2C2C" />} message="No items found" subtitle="Try a different search or category" />
      ) : (
        <MenuTable
          items={filtered}
          categories={categories}
          onEdit={item => setEditItem(item)}
          onDelete={item => setDeleteItem(item)}
          onToggleAvailability={handleToggle}
          onToggleFeatured={handleToggleFeatured}
          onSetPromo={item => setPromoItem(item)}
        />
      )}

      {editItem !== undefined && (
        <MenuItemModal
          item={editItem}
          categories={categories}
          onClose={() => setEditItem(undefined)}
          onSaved={refresh}
        />
      )}

      {deleteItem && (
        <ConfirmDialog
          title="Delete Item"
          message={`Delete "${deleteItem.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      {bulkPending && (
        <ConfirmDialog
          title={bulkPending.isAvailable ? 'Mark All Available' : 'Mark All Unavailable'}
          message={`Mark all "${bulkPending.category.name}" items as ${bulkPending.isAvailable ? 'available' : 'unavailable'}?`}
          confirmLabel={bulkPending.isAvailable ? 'Mark Available' : 'Mark Unavailable'}
          destructive={!bulkPending.isAvailable}
          onConfirm={handleBulkToggle}
          onCancel={() => setBulkPending(null)}
        />
      )}

      {/* Success toast */}
      {toast && (
        <BulkToast message={toast} onDone={() => setToast(null)} />
      )}

      {promoItem && (
        <PromoModal
          item={promoItem}
          onSave={async (promoPrice, promoLabel) => {
            await setPromoPrice(promoItem.id, promoPrice, promoLabel);
          }}
          onClose={() => setPromoItem(null)}
        />
      )}
    </div>
  );
}

function BulkToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl z-50"
      style={{
        backgroundColor: '#111111',
        border: '1px solid rgba(39,174,96,0.4)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(39,174,96,0.2)' }}
      >
        <IconCheck size={12} color="#27AE60" />
      </div>
      <span style={{ fontSize: 13, color: '#27AE60' }}>{message}</span>
    </div>
  );
}
