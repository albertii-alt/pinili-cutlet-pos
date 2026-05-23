import { useState } from 'react';
import { IconPlus, IconX, IconTag } from '@tabler/icons-react';
import { Category } from '../../types';
import { addCategory, deleteCategory } from '../../api/category.api';
import ConfirmDialog from '../shared/ConfirmDialog';

interface CategoryManagerProps {
  categories: Category[];
  onChanged: () => void;
}

export default function CategoryManager({ categories, onChanged }: CategoryManagerProps) {
  const [newName, setNewName]   = useState('');
  const [adding, setAdding]     = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(false);

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
    <div
      className="flex flex-col gap-3"
      style={{
        backgroundColor: '#111111',
        border: '1px solid #2C2C2C',
        borderRadius: 12,
        padding: 16,
        marginBottom: 4,
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <IconTag size={13} color="#606060" />
        <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
          Categories
        </span>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <CategoryPill key={cat.id} name={cat.name} onDelete={() => setToDelete(cat)} />
        ))}
        {categories.length === 0 && (
          <span style={{ fontSize: 13, color: '#606060' }}>No categories yet</span>
        )}
      </div>

      {/* Add row */}
      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="New category name"
          style={{
            maxWidth: 280,
            backgroundColor: '#1A1A1A',
            border: `1px solid ${focused ? '#C0392B' : '#2C2C2C'}`,
            boxShadow: focused ? '0 0 0 3px rgba(192,57,43,0.1)' : 'none',
            borderRadius: 8,
            padding: '7px 12px',
            color: '#ffffff',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            width: '100%',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="flex items-center gap-1.5 transition-colors"
          style={{
            backgroundColor: adding || !newName.trim() ? '#2C2C2C' : '#C0392B',
            color: adding || !newName.trim() ? '#606060' : '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            cursor: adding || !newName.trim() ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!adding && newName.trim()) e.currentTarget.style.backgroundColor = '#96281B'; }}
          onMouseLeave={e => { if (!adding && newName.trim()) e.currentTarget.style.backgroundColor = '#C0392B'; }}
        >
          <IconPlus size={13} />
          Add
        </button>
      </div>

      {error && <p style={{ fontSize: 12, color: '#C0392B' }}>{error}</p>}

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

function CategoryPill({ name, onDelete }: { name: string; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-1.5 transition-all"
      style={{
        backgroundColor: '#242424',
        border: `1px solid ${hovered ? '#C0392B' : '#2C2C2C'}`,
        borderRadius: 20,
        padding: '6px 12px',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 13, color: '#ffffff' }}>{name}</span>
      <button
        onClick={onDelete}
        className="flex items-center justify-center transition-colors"
        style={{ color: hovered ? '#C0392B' : '#606060', lineHeight: 0 }}
      >
        <IconX size={12} />
      </button>
    </div>
  );
}
