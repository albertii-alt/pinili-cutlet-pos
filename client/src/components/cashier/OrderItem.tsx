import { useState } from 'react';
import { IconMinus, IconPlus, IconX, IconNotes } from '@tabler/icons-react';
import type { CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useOrderStore } from '../../store/useOrderStore';

interface OrderItemProps {
  item: CartItem;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function OrderItem({ item, onIncrement, onDecrement, onRemove }: OrderItemProps) {
  const { updateItemNotes } = useOrderStore();
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="flex flex-col py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
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

        {/* Notes toggle */}
        <button
          onClick={() => setNotesOpen(o => !o)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: item.notes ? 'var(--accent-color, #C0392B)' : '#606060' }}
        >
          <IconNotes size={15} />
        </button>

        <button onClick={() => onRemove(item.menu_item_id)} className="text-textMuted active:text-danger">
          <IconX size={16} />
        </button>
      </div>

      {/* Notes input — collapsed by default */}
      {notesOpen && (
        <input
          autoFocus
          type="text"
          value={item.notes ?? ''}
          onChange={e => updateItemNotes(item.menu_item_id, e.target.value)}
          placeholder="e.g. No mayo, extra rice"
          maxLength={100}
          className="mt-2 w-full bg-cardLight border border-border rounded-lg px-3 py-2 text-textGray text-xs placeholder:text-textMuted focus:border-primary outline-none min-h-[36px]"
        />
      )}
    </div>
  );
}
