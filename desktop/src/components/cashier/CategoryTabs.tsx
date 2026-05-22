import { Category } from '../../types';

interface CategoryTabsProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-1.5 rounded-lg text-sm transition-colors ${
          selected === null
            ? 'bg-primary text-white'
            : 'bg-card border border-border text-textGray hover:bg-cardLight'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 px-4 py-1.5 rounded-lg text-sm transition-colors ${
            selected === cat.id
              ? 'bg-primary text-white'
              : 'bg-card border border-border text-textGray hover:bg-cardLight'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
