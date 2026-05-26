import { IconPlus, IconToolsKitchen2, IconStarFilled } from '@tabler/icons-react';
import { MenuItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  showDescription?: boolean;
}

export default function MenuItemCard({ item, onAdd, showDescription = false }: MenuItemCardProps) {
  const unavailable = item.is_available === 0;
  const imageUrl = item.image_path
    ? `${import.meta.env.VITE_API_URL}${item.image_path}`
    : null;

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden flex flex-col relative ${unavailable ? 'opacity-50' : ''}`}>
      {/* Featured star badge */}
      {item.is_featured === 1 && (
        <div
          className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full"
          style={{ width: 20, height: 20, backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <IconStarFilled size={10} color="#F4C430" />
        </div>
      )}
      {/* Promo label badge */}
      {item.promo_price != null && item.promo_label && (
        <div
          className="absolute top-2 left-2 z-10"
          style={{
            backgroundColor: 'rgba(243,156,18,0.9)',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 10,
            fontWeight: 700,
            color: '#000000',
          }}
        >
          {item.promo_label}
        </div>
      )}
      {/* Image */}
      <div className="aspect-square bg-cardLight flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <IconToolsKitchen2 size={32} className="text-textMuted" />
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-white text-sm font-medium leading-tight">{item.name}</p>
        {showDescription && item.description && (
          <p style={{ fontSize: 11, color: '#A0A0A0', lineHeight: 1.4 }}>{item.description}</p>
        )}
        {item.promo_price != null ? (
          <div className="flex flex-col gap-0.5">
            <span style={{ fontSize: 11, color: '#606060', textDecoration: 'line-through' }}>
              {formatCurrency(item.price)}
            </span>
            <span style={{ fontSize: 13, color: '#C0392B', fontWeight: 700 }}>
              {formatCurrency(item.promo_price)}
            </span>
          </div>
        ) : (
          <p className="text-primary text-sm font-semibold">{formatCurrency(item.price)}</p>
        )}

        <button
          onClick={() => !unavailable && onAdd(item)}
          disabled={unavailable}
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: '100%',
            height: 44,
            borderRadius: 8,
            border: 'none',
            backgroundColor: unavailable ? '#1A1A1A' : 'var(--accent-color, #C0392B)',
            color: unavailable ? '#606060' : '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            cursor: unavailable ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (!unavailable) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { if (!unavailable) e.currentTarget.style.opacity = '1'; }}
        >
          <IconPlus size={14} />
          Add
        </button>
      </div>
    </div>
  );
}
