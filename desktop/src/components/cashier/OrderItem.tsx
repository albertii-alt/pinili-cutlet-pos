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
    <div
      className="flex items-center gap-2 last:border-0"
      style={{ padding: '10px 0', borderBottom: '1px solid #2C2C2C' }}
    >
      {/* Qty controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onDecrement(item.menu_item_id)}
          className="flex items-center justify-center transition-colors"
          style={{ width: 28, height: 28, backgroundColor: '#242424', border: '1px solid #2C2C2C', borderRadius: 6, color: '#A0A0A0', cursor: 'pointer', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#A0A0A0')}
        >
          <IconMinus size={11} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', minWidth: 28, textAlign: 'center' }}>
          {item.quantity}
        </span>
        <button
          onClick={() => onIncrement(item.menu_item_id)}
          className="flex items-center justify-center transition-colors"
          style={{ width: 28, height: 28, backgroundColor: '#242424', border: '1px solid #2C2C2C', borderRadius: 6, color: '#A0A0A0', cursor: 'pointer', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#A0A0A0')}
        >
          <IconPlus size={11} />
        </button>
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="truncate" style={{ fontSize: 13, color: '#ffffff', fontWeight: 500 }}>
          {item.item_name}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-color, #C0392B)', flexShrink: 0 }}>
          {formatCurrency(item.item_price * item.quantity)}
        </span>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.menu_item_id)}
        className="flex items-center justify-center transition-colors shrink-0"
        style={{ width: 20, height: 20, color: '#606060', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = '#C0392B')}
        onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
      >
        <IconX size={12} />
      </button>
    </div>
  );
}
