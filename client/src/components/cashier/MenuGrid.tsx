import { IconToolsKitchen2 } from '@tabler/icons-react';
import type { MenuItem } from '../../types';
import MenuItemCard from './MenuItemCard';
import EmptyState from '../shared/EmptyState';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';

interface MenuGridProps {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
  columns?: number;
  cardSize?: 'sm' | 'md' | 'lg';
}

export default function MenuGrid({ items, onAdd, columns = 2, cardSize = 'sm' }: MenuGridProps) {
  const { showDescription } = useDisplaySettings();

  if (items.length === 0) {
    return <EmptyState icon={<IconToolsKitchen2 size={48} color="#2C2C2C" />} message="No items found" subtitle="Try a different category" />;
  }

  return (
    <div className="grid gap-3 px-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map(item => (
        <MenuItemCard key={item.id} item={item} onAdd={onAdd} showDescription={showDescription} size={cardSize} />
      ))}
    </div>
  );
}
