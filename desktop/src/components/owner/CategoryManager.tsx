import { useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Category } from '../../types';
import { addCategory, deleteCategory } from '../../api/category.api';
import ConfirmDialog from '../shared/ConfirmDialog';

interface CategoryManagerProps {
  categories: Category[];
  onChanged: () => void;
}

export default function CategoryManager({ categories, onChanged }: CategoryManagerProps) {
  const [newName, setNewName]           = useState('');
  const [adding, setAdding]             = useState(false);
  const [toDelete, setToDelete]         = useState<Category | null>(null);
  const [error, setError]               = useState('');

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    try {
      await addCategory(newName.trim());
      setNewName('');
      onChanged();
    } catch {
      setError('Category already exists');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete.id);
      onChanged();
    } catch {
      setError('Failed to delete category');
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <p className="text-textGray text-xs uppercase tracking-wider">Categories</p>

      {/* Existing categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-1 bg-cardLight border border-border rounded-lg px-3 py-1">
            <span className="text-white text-sm">{cat.name}</span>
            <button
              onClick={() => setToDelete(cat)}
              className="text-textMuted hover:text-danger transition-colors ml-1"
            >
              <IconTrash size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="New category name"
          className="flex-1 bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="flex items-center gap-1 bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <IconPlus size={14} />
          Add
        </button>
      </div>

      {error && <p className="text-danger text-xs">{error}</p>}

      {toDelete && (
        <ConfirmDialog
          title="Delete Category"
          message={`Delete "${toDelete.name}"? Items in this category will become uncategorized.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
