import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useMenu } from '../../hooks/useMenu';
import { useCategories } from '../../hooks/useCategories';
import { deleteMenuItem, toggleAvailability } from '../../api/menu.api';
import { MenuItem } from '../../types';
import MenuTable from '../../components/owner/MenuTable';
import MenuItemModal from '../../components/owner/MenuItemModal';
import CategoryManager from '../../components/owner/CategoryManager';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { useMenuStore } from '../../store/useMenuStore';
import { getMenuItems } from '../../api/menu.api';
import { getCategories } from '../../api/category.api';

export default function MenuPage() {
  const { menuItems } = useMenu();
  const { categories } = useCategories();
  const { setMenuItems, setCategories } = useMenuStore();

  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState<number | null>(null);
  const [editItem, setEditItem]       = useState<MenuItem | null | undefined>(undefined);
  const [deleteItem, setDeleteItem]   = useState<MenuItem | null>(null);

  const filtered = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === null || item.category_id === filterCat;
    return matchSearch && matchCat;
  });

  async function handleToggle(item: MenuItem) {
    await toggleAvailability(item.id);
  }

  async function handleDelete() {
    if (!deleteItem) return;
    await deleteMenuItem(deleteItem.id);
    setDeleteItem(null);
    refresh();
  }

  async function refresh() {
    const [items, cats] = await Promise.all([getMenuItems(), getCategories()]);
    setMenuItems(items);
    setCategories(cats);
  }

  return (
    <div className="flex flex-col gap-4 max-w-[960px]">
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
      <CategoryManager categories={categories} onChanged={refresh} />

      {/* Search + filter */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
        />
        <select
          value={filterCat ?? ''}
          onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : null)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState emoji="🍱" message="No items found" subtitle="Try a different search or category" />
      ) : (
        <MenuTable
          items={filtered}
          categories={categories}
          onEdit={item => setEditItem(item)}
          onDelete={item => setDeleteItem(item)}
          onToggleAvailability={handleToggle}
        />
      )}

      {/* Add/Edit modal — editItem=null means add, editItem=MenuItem means edit */}
      {editItem !== undefined && (
        <MenuItemModal
          item={editItem}
          categories={categories}
          onClose={() => setEditItem(undefined)}
          onSaved={refresh}
        />
      )}

      {/* Delete confirm */}
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
    </div>
  );
}
