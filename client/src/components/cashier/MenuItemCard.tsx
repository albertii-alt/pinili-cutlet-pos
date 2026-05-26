import { IconPlus, IconToolsKitchen2, IconStarFilled } from '@tabler/icons-react';
import type { MenuItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/getServerUrl';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const imageSizeMap = { sm: 120, md: 150, lg: 180 };
const btnHeightMap = { sm: 36, md: 40, lg: 44 };
const fontSizeMap  = { sm: 13, md: 14, lg: 15 };

export default function MenuItemCard({ item, onAdd, showDescription = false, size = 'sm' }: MenuItemCardProps) {
  const unavailable = item.is_available === 0;
  const imageUrl = getImageUrl(item.image_path);

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden flex flex-col relative ${unavailable ? 'opacity-50' : ''}`}>
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
      <div className="bg-cardLight flex items-center justify-center overflow-hidden" style={{ height: imageSizeMap[size] }}>
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <IconToolsKitchen2 size={28} className="text-textMuted" />
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-white font-medium leading-tight" style={{ fontSize: fontSizeMap[size] }}>{item.name}</p>
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
          style={{ minHeight: btnHeightMap[size] }}
          className={`mt-auto flex items-center justify-center gap-1 w-full py-2 rounded-lg text-sm transition-colors ${
            unavailable
              ? 'bg-cardLight text-textMuted cursor-not-allowed'
              : 'bg-primary hover:bg-primaryDark text-white active:scale-95'
          }`}
        >
          <IconPlus size={16} />
          Add
        </button>
      </div>
    </div>
  );
}
