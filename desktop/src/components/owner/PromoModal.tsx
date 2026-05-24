import { useState } from 'react';
import { IconX, IconTag } from '@tabler/icons-react';
import { MenuItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface PromoModalProps {
  item: MenuItem;
  onSave: (promoPrice: number | null, promoLabel: string | null) => Promise<void>;
  onClose: () => void;
}

export default function PromoModal({ item, onSave, onClose }: PromoModalProps) {
  const hasPromo = item.promo_price != null;

  const [promoPrice, setPromoPrice] = useState(hasPromo ? String(item.promo_price) : '');
  const [promoLabel, setPromoLabel] = useState(item.promo_label ?? '');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const parsedPrice = parseFloat(promoPrice);
  const previewValid = !isNaN(parsedPrice) && parsedPrice > 0 && parsedPrice < item.price;

  async function handleApply() {
    if (!promoPrice.trim()) { setError('Enter a promo price.'); return; }
    if (isNaN(parsedPrice) || parsedPrice <= 0) { setError('Promo price must be a positive number.'); return; }
    if (parsedPrice >= item.price) { setError(`Promo price must be less than ${formatCurrency(item.price)}.`); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(parsedPrice, promoLabel.trim() || null);
      onClose();
    } catch {
      setError('Failed to save promo. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await onSave(null, null);
      onClose();
    } catch {
      setError('Failed to remove promo. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        className="flex flex-col w-[460px]"
        style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 16 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-2">
            <IconTag size={16} color="#F39C12" />
            <span className="text-white font-semibold text-sm">Set Promo Price</span>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#606060', lineHeight: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Item info */}
          <div style={{ backgroundColor: '#242424', border: '1px solid #2C2C2C', borderRadius: 8, padding: '10px 14px' }}>
            <p className="text-white text-sm font-medium">{item.name}</p>
            <p style={{ fontSize: 12, color: '#A0A0A0', marginTop: 2 }}>
              Original price: <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatCurrency(item.price)}</span>
            </p>
          </div>

          {/* Promo price input */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#A0A0A0' }}>Promo Price (₱)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={promoPrice}
              onChange={e => { setPromoPrice(e.target.value); setError(''); }}
              placeholder={`Less than ${formatCurrency(item.price)}`}
              style={{
                backgroundColor: '#242424',
                border: `1px solid ${error ? '#C0392B' : '#2C2C2C'}`,
                borderRadius: 8,
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = error ? '#C0392B' : '#F39C12')}
              onBlur={e => (e.currentTarget.style.borderColor = error ? '#C0392B' : '#2C2C2C')}
            />
          </div>

          {/* Promo label input */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#A0A0A0' }}>Label <span style={{ color: '#606060' }}>(optional — e.g. "Sale!", "20% off")</span></label>
            <input
              type="text"
              value={promoLabel}
              onChange={e => setPromoLabel(e.target.value)}
              placeholder='e.g. Sale!, 20% off'
              maxLength={20}
              style={{
                backgroundColor: '#242424',
                border: '1px solid #2C2C2C',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#F39C12')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
            />
          </div>

          {/* Preview */}
          {previewValid && (
            <div style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Preview
              </p>
              <div className="flex items-center gap-3">
                {promoLabel.trim() && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#000000',
                    backgroundColor: 'rgba(243,156,18,0.9)',
                    borderRadius: 4, padding: '2px 6px',
                  }}>
                    {promoLabel.trim()}
                  </span>
                )}
                <div className="flex flex-col">
                  <span style={{ fontSize: 11, color: '#606060', textDecoration: 'line-through' }}>
                    {formatCurrency(item.price)}
                  </span>
                  <span style={{ fontSize: 15, color: '#C0392B', fontWeight: 700 }}>
                    {formatCurrency(parsedPrice)}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#27AE60', marginLeft: 'auto' }}>
                  Save {formatCurrency(item.price - parsedPrice)}
                </span>
              </div>
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: '#C0392B' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderTop: '1px solid #2C2C2C' }}
        >
          {/* Remove promo — only shown if promo exists */}
          <div>
            {hasPromo && (
              <button
                onClick={handleRemove}
                disabled={saving}
                style={{
                  backgroundColor: 'rgba(192,57,43,0.08)',
                  border: '1px solid rgba(192,57,43,0.3)',
                  borderRadius: 8,
                  padding: '7px 14px',
                  color: '#C0392B',
                  fontSize: 13,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)'; }}
              >
                Remove Promo
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#242424',
                border: '1px solid #2C2C2C',
                borderRadius: 8,
                padding: '7px 14px',
                color: '#A0A0A0',
                fontSize: 13,
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2C2C2C')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#242424')}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={saving || !promoPrice.trim()}
              style={{
                backgroundColor: saving || !promoPrice.trim() ? '#2C2C2C' : '#F39C12',
                border: 'none',
                borderRadius: 8,
                padding: '7px 16px',
                color: saving || !promoPrice.trim() ? '#606060' : '#000000',
                fontSize: 13,
                fontWeight: 600,
                cursor: saving || !promoPrice.trim() ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!saving && promoPrice.trim()) e.currentTarget.style.backgroundColor = '#e08e0b'; }}
              onMouseLeave={e => { if (!saving && promoPrice.trim()) e.currentTarget.style.backgroundColor = '#F39C12'; }}
            >
              {saving ? 'Saving…' : 'Apply Promo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
