import { IconMinus, IconPlus, IconX } from '@tabler/icons-react';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface OrderItemProps {
  item: CartItem;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function OrderItem({ item, onIncrement, onDecrement, onRemove }: OrderItemProps) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{item.item_name}</p>
        <p className="text-primary text-xs">{formatCurrency(item.item_price)}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onDecrement(item.menu_item_id)}
          className="w-6 h-6 flex items-center justify-center bg-cardLight border border-border rounded text-textGray hover:text-white transition-colors"
        >
          <IconMinus size={11} />
        </button>
        <span className="text-white text-sm w-5 text-center">{item.quantity}</span>
        <button
          onClick={() => onIncrement(item.menu_item_id)}
          className="w-6 h-6 flex items-center justify-center bg-cardLight border border-border rounded text-textGray hover:text-white transition-colors"
        >
          <IconPlus size={11} />
        </button>
      </div>

      {/* Subtotal */}
      <span className="text-textGray text-xs w-14 text-right">
        {formatCurrency(item.item_price * item.quantity)}
      </span>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.menu_item_id)}
        className="text-textMuted hover:text-danger transition-colors"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}
