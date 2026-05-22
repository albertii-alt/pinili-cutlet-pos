import { IconMinus, IconPlus, IconX } from '@tabler/icons-react';
import type { CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface OrderItemProps {
  item: CartItem;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function OrderItem({ item, onIncrement, onDecrement, onRemove }: OrderItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.item_name}</p>
        <p className="text-primary text-xs">{formatCurrency(item.item_price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onDecrement(item.menu_item_id)}
          className="w-8 h-8 flex items-center justify-center bg-cardLight border border-border rounded-lg text-textGray active:scale-95"
        >
          <IconMinus size={13} />
        </button>
        <span className="text-white text-sm w-5 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onIncrement(item.menu_item_id)}
          className="w-8 h-8 flex items-center justify-center bg-cardLight border border-border rounded-lg text-textGray active:scale-95"
        >
          <IconPlus size={13} />
        </button>
      </div>

      <span className="text-textGray text-xs w-14 text-right">
        {formatCurrency(item.item_price * item.quantity)}
      </span>

      <button onClick={() => onRemove(item.menu_item_id)} className="text-textMuted active:text-danger">
        <IconX size={16} />
      </button>
    </div>
  );
}
