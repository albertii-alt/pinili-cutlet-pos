import { useState, useRef, useEffect } from 'react';
import { IconX, IconPhoto, IconChevronDown } from '@tabler/icons-react';
import { MenuItem, Category } from '../../types';
import { addMenuItem, updateMenuItem } from '../../api/menu.api';

interface MenuItemModalProps {
  item?: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

const inputStyle = (focused: boolean): React.CSSProperties => ({
  backgroundColor: '#1A1A1A',
  border: `1px solid ${focused ? '#C0392B' : '#2C2C2C'}`,
  boxShadow: focused ? '0 0 0 3px rgba(192,57,43,0.15)' : 'none',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#ffffff',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
});

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#606060',
  letterSpacing: '0.04em',
  marginBottom: 4,
};

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
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [photoHovered, setPhotoHovered] = useState(false);

  // Focus states
  const [nameFocused, setNameFocused]   = useState(false);
  const [descFocused, setDescFocused]   = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);
  const [catOpen, setCatOpen]           = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  const selectedCatLabel = categoryId
    ? categories.find(c => c.id === Number(categoryId))?.name ?? 'No category'
    : 'No category';

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        className="w-[480px] max-h-[90vh] overflow-y-auto flex flex-col hide-scrollbar"
        style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', borderRadius: 16 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ backgroundColor: '#111111', borderBottom: '1px solid #2C2C2C' }}
        >
          <h2 className="text-white font-semibold text-sm">{isEdit ? 'Edit Item' : 'Add Item'}</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#606060' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
          >
            <IconX size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-4">

          {/* Photo upload */}
          <div
            onClick={() => fileRef.current?.click()}
            onMouseEnter={() => setPhotoHovered(true)}
            onMouseLeave={() => setPhotoHovered(false)}
            className="relative overflow-hidden cursor-pointer transition-all"
            style={{
              height: 120,
              backgroundColor: '#1A1A1A',
              border: `1px dashed ${photoHovered ? '#C0392B' : '#2C2C2C'}`,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                {photoHovered && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                  >
                    <IconPhoto size={20} color="#ffffff" />
                    <span style={{ fontSize: 12, color: '#ffffff' }}>Change photo</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <IconPhoto size={24} color="#606060" />
                <span style={{ fontSize: 12, color: '#606060' }}>Upload photo</span>
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
          <div className="flex flex-col">
            <label style={labelStyle}>Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Item name"
              style={inputStyle(nameFocused)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label style={labelStyle}>Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              style={inputStyle(descFocused)}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label style={labelStyle}>Price (₱) *</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 59"
              style={inputStyle(priceFocused)}
              onFocus={() => setPriceFocused(true)}
              onBlur={() => setPriceFocused(false)}
            />
          </div>

          {/* Category — custom dropdown */}
          <div className="flex flex-col">
            <label style={labelStyle}>Category</label>
            <div ref={catRef} className="relative">
              <button
                onClick={() => setCatOpen(o => !o)}
                className="flex items-center gap-2 w-full transition-all"
                style={{
                  ...inputStyle(catOpen),
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: '9px 12px',
                }}
              >
                <span className="flex-1" style={{ color: categoryId ? '#ffffff' : '#606060' }}>
                  {selectedCatLabel}
                </span>
                <IconChevronDown
                  size={14}
                  color="#606060"
                  style={{ transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                />
              </button>
              {catOpen && (
                <div
                  className="absolute top-full left-0 w-full mt-1 border border-border rounded-lg overflow-hidden z-20"
                  style={{ backgroundColor: '#1A1A1A' }}
                >
                  {[{ id: '', name: 'No category' }, ...categories.map(c => ({ id: String(c.id), name: c.name }))].map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCategoryId(c.id); setCatOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-cardLight"
                      style={{ color: categoryId === c.id ? '#C0392B' : '#ffffff' }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Availability toggle */}
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Availability</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAvailable(1)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isAvailable === 1 ? 'rgba(39,174,96,0.15)' : '#1A1A1A',
                  border: `1px solid ${isAvailable === 1 ? 'rgba(39,174,96,0.4)' : '#2C2C2C'}`,
                  color: isAvailable === 1 ? '#27AE60' : '#606060',
                }}
              >
                Available
              </button>
              <button
                onClick={() => setIsAvailable(0)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isAvailable === 0 ? 'rgba(96,96,96,0.15)' : '#1A1A1A',
                  border: `1px solid ${isAvailable === 0 ? '#606060' : '#2C2C2C'}`,
                  color: isAvailable === 0 ? '#A0A0A0' : '#606060',
                }}
              >
                Unavailable
              </button>
            </div>
          </div>

          {/* Error */}
          <div style={{ minHeight: 16 }}>
            {error && <p style={{ fontSize: 12, color: '#C0392B' }}>{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-5 py-4 sticky bottom-0"
          style={{ backgroundColor: '#111111', borderTop: '1px solid #2C2C2C' }}
        >
          <button
            onClick={onClose}
            className="transition-colors"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#A0A0A0',
              fontSize: 13,
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#242424')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#2C2C2C' : '#C0392B',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              color: loading ? '#606060' : '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#96281B'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#C0392B'; }}
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
