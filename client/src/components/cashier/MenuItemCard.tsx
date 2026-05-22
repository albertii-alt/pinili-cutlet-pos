import { IconPlus, IconToolsKitchen2 } from '@tabler/icons-react';
import type { MenuItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const unavailable = item.is_available === 0;
  const imageUrl = item.image_path
    ? `${import.meta.env.VITE_API_URL}${item.image_path}`
    : null;

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden flex flex-col ${unavailable ? 'opacity-50' : ''}`}>
      <div className="aspect-square bg-cardLight flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <IconToolsKitchen2 size={28} className="text-textMuted" />
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-white text-sm font-medium leading-tight">{item.name}</p>
        <p className="text-primary text-sm font-semibold">{formatCurrency(item.price)}</p>
        <button
          onClick={() => !unavailable && onAdd(item)}
          disabled={unavailable}
          className={`mt-auto flex items-center justify-center gap-1 w-full py-2 rounded-lg text-sm min-h-[44px] transition-colors ${
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
