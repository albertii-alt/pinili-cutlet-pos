import { MenuItem } from '../../types';
import MenuItemCard from './MenuItemCard';
import EmptyState from '../shared/EmptyState';

interface MenuGridProps {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
}

export default function MenuGrid({ items, onAdd }: MenuGridProps) {
  if (items.length === 0) {
    return <EmptyState emoji="🍱" message="No items found" subtitle="Try a different category" />;
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(item => (
        <MenuItemCard key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
}
