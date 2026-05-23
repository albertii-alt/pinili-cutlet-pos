import { useState, useRef, useEffect } from 'react';
import {
  IconPlus, IconTag, IconDotsVertical,
  IconFilter, IconEdit, IconEye, IconEyeOff, IconTrash,
} from '@tabler/icons-react';
import { Category } from '../../types';
import { addCategory, deleteCategory, renameCategory } from '../../api/category.api';
import ConfirmDialog from '../shared/ConfirmDialog';

interface CategoryManagerProps {
  categories: Category[];
  itemCounts: Record<number, number>;   // categoryId → count
  onChanged: () => void;
  onBulkToggle?: (category: Category, isAvailable: boolean) => void;
  onViewItems?: (categoryId: number) => void;
}

export default function CategoryManager({
  categories,
  itemCounts,
  onChanged,
  onBulkToggle,
  onViewItems,
}: CategoryManagerProps) {
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
          <CategoryPill
            key={cat.id}
            category={cat}
            itemCount={itemCounts[cat.id] ?? 0}
            onDelete={() => setToDelete(cat)}
            onRenamed={onChanged}
            onBulkToggle={onBulkToggle ? (isAvailable) => onBulkToggle(cat, isAvailable) : undefined}
            onViewItems={onViewItems ? () => onViewItems(cat.id) : undefined}
          />
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

// ─── CategoryPill ────────────────────────────────────────────────────────────

interface PillProps {
  category: Category;
  itemCount: number;
  onDelete: () => void;
  onRenamed: () => void;
  onBulkToggle?: (isAvailable: boolean) => void;
  onViewItems?: () => void;
}

function CategoryPill({ category, itemCount, onDelete, onRenamed, onBulkToggle, onViewItems }: PillProps) {
  const [hovered, setHovered]       = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [renaming, setRenaming]     = useState(false);
  const [renameVal, setRenameVal]   = useState('');
  const [renameErr, setRenameErr]   = useState('');
  const [saving, setSaving]         = useState(false);
  const containerRef                = useRef<HTMLDivElement>(null);
  const renameInputRef              = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus rename input when it appears
  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  function startRename() {
    setRenameVal(category.name);
    setRenameErr('');
    setRenaming(true);
    setMenuOpen(false);
  }

  function cancelRename() {
    setRenaming(false);
    setRenameErr('');
  }

  async function commitRename() {
    const trimmed = renameVal.trim();
    if (!trimmed) { setRenameErr('Name cannot be empty'); return; }
    if (trimmed === category.name) { cancelRename(); return; }
    setSaving(true);
    setRenameErr('');
    try {
      await renameCategory(category.id, trimmed);
      setRenaming(false);
      onRenamed();
    } catch {
      setRenameErr('Name already exists');
    } finally {
      setSaving(false);
    }
  }

  function handleRenameKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  commitRename();
    if (e.key === 'Escape') cancelRename();
  }

  // Determine if dropdown should open upward (simple heuristic: check Y position)
  function getDropdownStyle(): React.CSSProperties {
    const rect = containerRef.current?.getBoundingClientRect();
    const spaceBelow = rect ? window.innerHeight - rect.bottom : 999;
    const openUp = spaceBelow < 200;
    return {
      position: 'absolute',
      [openUp ? 'bottom' : 'top']: '100%',
      left: 0,
      [openUp ? 'marginBottom' : 'marginTop']: 4,
      zIndex: 30,
      backgroundColor: '#1A1A1A',
      border: '1px solid #2C2C2C',
      borderRadius: 8,
      minWidth: 200,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      overflow: 'hidden',
    };
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pill body */}
      <div
        className="flex items-center"
        style={{
          backgroundColor: hovered || menuOpen ? 'rgba(192,57,43,0.2)' : 'rgba(192,57,43,0.1)',
          border: '1px solid rgba(192,57,43,0.3)',
          borderRadius: 20,
          transition: 'background-color 0.15s',
        }}
      >
        {/* Rename inline input — replaces label when active */}
        {renaming ? (
          <div className="flex items-center gap-1 pl-3 pr-2 py-1">
            <input
              ref={renameInputRef}
              value={renameVal}
              onChange={e => { setRenameVal(e.target.value); setRenameErr(''); }}
              onKeyDown={handleRenameKey}
              style={{
                backgroundColor: '#1A1A1A',
                border: `1px solid ${renameErr ? '#C0392B' : '#C0392B'}`,
                borderRadius: 4,
                padding: '2px 6px',
                color: '#ffffff',
                fontSize: 13,
                outline: 'none',
                width: Math.max(80, renameVal.length * 8),
              }}
            />
            {/* Save */}
            <button
              onClick={commitRename}
              disabled={saving}
              style={{ color: saving ? '#606060' : '#27AE60', lineHeight: 0, padding: '2px 3px' }}
            >
              {saving
                ? <div className="w-3 h-3 border border-textMuted border-t-transparent rounded-full animate-spin" />
                : <IconEdit size={13} color="#27AE60" />
              }
            </button>
            {/* Cancel */}
            <button
              onClick={cancelRename}
              style={{ color: '#606060', lineHeight: 0, padding: '2px 3px' }}
            >
              <IconTag size={12} color="#606060" />
            </button>
          </div>
        ) : (
          <>
            {/* Category name */}
            <span style={{ fontSize: 13, color: '#ffffff', padding: '6px 6px 6px 12px' }}>
              {category.name}
            </span>
            {/* Item count badge */}
            <span style={{ fontSize: 11, color: '#C0392B', paddingRight: 6 }}>
              · {itemCount}
            </span>
          </>
        )}

        {/* Kebab button — hidden while renaming */}
        {!renaming && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center justify-center transition-colors"
            style={{
              color: '#C0392B',
              padding: '6px 10px 6px 2px',
              lineHeight: 0,
            }}
            title="Category options"
          >
            <IconDotsVertical size={14} />
          </button>
        )}
      </div>

      {/* Rename error */}
      {renameErr && (
        <p style={{ fontSize: 11, color: '#C0392B', marginTop: 2, paddingLeft: 4 }}>{renameErr}</p>
      )}

      {/* Kebab dropdown */}
      {menuOpen && (
        <div style={getDropdownStyle()}>
          {/* View items */}
          {onViewItems && (
            <DropdownItem
              icon={<IconFilter size={13} />}
              label="View items"
              onClick={() => { onViewItems(); setMenuOpen(false); }}
            />
          )}

          {/* Rename */}
          <DropdownItem
            icon={<IconEdit size={13} />}
            label="Rename"
            onClick={startRename}
          />

          {/* Mark all available */}
          {onBulkToggle && (
            <DropdownItem
              icon={<IconEye size={13} />}
              label="Mark all available"
              color="#27AE60"
              hoverBg="rgba(39,174,96,0.08)"
              onClick={() => { onBulkToggle(true); setMenuOpen(false); }}
            />
          )}

          {/* Mark all unavailable */}
          {onBulkToggle && (
            <DropdownItem
              icon={<IconEyeOff size={13} />}
              label="Mark all unavailable"
              color="#F39C12"
              hoverBg="rgba(243,156,18,0.08)"
              onClick={() => { onBulkToggle(false); setMenuOpen(false); }}
            />
          )}

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#2C2C2C', margin: '2px 0' }} />

          {/* Delete */}
          <DropdownItem
            icon={<IconTrash size={13} />}
            label="Delete category"
            color="#C0392B"
            hoverBg="rgba(192,57,43,0.08)"
            onClick={() => { onDelete(); setMenuOpen(false); }}
          />
        </div>
      )}
    </div>
  );
}

// ─── DropdownItem ─────────────────────────────────────────────────────────────

function DropdownItem({
  icon,
  label,
  color = '#A0A0A0',
  hoverBg = '#242424',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  hoverBg?: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-2 px-3 py-2"
      style={{
        color,
        fontSize: 12,
        backgroundColor: hovered ? hoverBg : 'transparent',
        transition: 'background-color 0.1s',
        textAlign: 'left',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
