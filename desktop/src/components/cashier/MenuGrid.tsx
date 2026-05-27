import { IconToolsKitchen2 } from '@tabler/icons-react';
import { MenuItem } from '../../types';
import MenuItemCard from './MenuItemCard';
import EmptyState from '../shared/EmptyState';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';

interface MenuGridProps {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
}

export default function MenuGrid({ items, onAdd }: MenuGridProps) {
  const { showDescription } = useDisplaySettings();

  if (items.length === 0) {
    return <EmptyState icon={<IconToolsKitchen2 size={48} color="#2C2C2C" />} message="No items found" subtitle="Try a different category" />;
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(item => (
        <MenuItemCard key={item.id} item={item} onAdd={onAdd} showDescription={showDescription} />
      ))}
    </div>
  );
}
