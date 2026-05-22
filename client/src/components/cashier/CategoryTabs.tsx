import type { Category } from '../../types';

interface CategoryTabsProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none px-4">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
          selected === null
            ? 'bg-primary text-white'
            : 'bg-card border border-border text-textGray'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
            selected === cat.id
              ? 'bg-primary text-white'
              : 'bg-card border border-border text-textGray'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
