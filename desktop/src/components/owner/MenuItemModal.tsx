import { useState, useRef, useEffect } from 'react';
import { IconX, IconUpload, IconToolsKitchen2 } from '@tabler/icons-react';
import { MenuItem, Category } from '../../types';
import { addMenuItem, updateMenuItem } from '../../api/menu.api';

interface MenuItemModalProps {
  item?: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function MenuItemModal({ item, categories, onClose, onSaved }: MenuItemModalProps) {
  const isEdit = !!item;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName]               = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice]             = useState(item?.price?.toString() ?? '');
  const [categoryId, setCategoryId]   = useState(item?.category_id?.toString() ?? '');
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? 1);
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.image_path ? `${import.meta.env.VITE_API_URL}${item.image_path}` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  async function handleSubmit() {
    if (!name.trim() || !price) {
      setError('Name and price are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('description', description);
      form.append('price', price);
      form.append('is_available', String(isAvailable));
      if (categoryId) form.append('category_id', categoryId);
      if (imageFile)  form.append('image', imageFile);

      if (isEdit && item) {
        await updateMenuItem(item.id, form);
      } else {
        await addMenuItem(form);
      }

      onSaved();
      onClose();
    } catch {
      setError('Failed to save item. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between sticky top-0 bg-card">
          <h2 className="text-white font-semibold">{isEdit ? 'Edit Item' : 'Add Item'}</h2>
          <button onClick={onClose} className="text-textGray hover:text-white transition-colors">
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* Image upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 bg-cardLight border border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-textMuted">
                <IconToolsKitchen2 size={28} />
                <div className="flex items-center gap-1 text-xs">
                  <IconUpload size={12} />
                  Upload photo
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => setImageFile(e.target.files?.[0] ?? null)}
          />

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-textGray text-xs">Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Item name"
              className="bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-textGray text-xs">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="text-textGray text-xs">Price (₱) *</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-textGray text-xs">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
            >
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between">
            <span className="text-textGray text-sm">Availability</span>
            <button
              onClick={() => setIsAvailable(prev => prev === 1 ? 0 : 1)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                isAvailable === 1
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-textMuted/15 text-textMuted border border-textMuted/30'
              }`}
            >
              {isAvailable === 1 ? 'Available' : 'Unavailable'}
            </button>
          </div>

          {/* Error */}
          <p className="text-danger text-xs min-h-[16px]">{error}</p>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end gap-3 sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="bg-card border border-border text-textGray rounded-lg px-4 py-2 text-sm hover:bg-cardLight transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
