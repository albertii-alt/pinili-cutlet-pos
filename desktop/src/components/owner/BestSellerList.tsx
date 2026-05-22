import { BestSeller } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface BestSellerListProps {
  items: BestSeller[];
}

export default function BestSellerList({ items }: BestSellerListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-textGray text-xs uppercase tracking-wider mb-3">Best Sellers</p>
        <p className="text-textMuted text-sm text-center py-6">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-textGray text-xs uppercase tracking-wider mb-3">Best Sellers</p>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={item.menu_item_id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <span className={`text-sm font-bold w-5 text-center ${index === 0 ? 'text-yellow-400' : 'text-textMuted'}`}>
              {index + 1}
            </span>
            <span className="flex-1 text-white text-sm truncate">{item.item_name}</span>
            <span className="text-textGray text-xs">{item.total_quantity}x</span>
            <span className="text-primary text-sm font-medium">{formatCurrency(item.total_revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
