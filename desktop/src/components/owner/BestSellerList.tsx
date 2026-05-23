import { BestSeller } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface BestSellerListProps {
  items: BestSeller[];
}

export default function BestSellerList({ items }: BestSellerListProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <p className="text-textGray text-xs uppercase tracking-wider mb-3">Best Sellers</p>
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-textMuted text-sm">No data yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-0">
          {items.map((item, index) => (
            <div
              key={item.menu_item_id}
              className="flex items-center gap-3 py-2 border-b border-border last:border-0 rounded-lg px-1"
              style={index === 0 ? { backgroundColor: 'rgba(244, 196, 48, 0.06)' } : undefined}
            >
              <span className={`text-sm font-bold w-5 text-center ${index === 0 ? 'text-[#F4C430]' : 'text-textMuted'}`}>
                {index + 1}
              </span>
              <span className={`flex-1 text-sm truncate ${index === 0 ? 'text-[#F4C430]' : 'text-white'}`}>
                {item.item_name}
              </span>
              <span className="text-textGray text-xs">{item.total_quantity}x</span>
              <span className="text-primary text-sm font-medium">{formatCurrency(item.total_revenue)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
