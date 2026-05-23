import { IconEdit, IconTrash, IconToolsKitchen2 } from '@tabler/icons-react';
import { MenuItem, Category } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import Badge from '../shared/Badge';

interface MenuTableProps {
  items: MenuItem[];
  categories: Category[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
}

export default function MenuTable({ items, categories, onEdit, onDelete, onToggleAvailability }: MenuTableProps) {
  const getCategoryName = (id: number | null) =>
    categories.find(c => c.id === id)?.name ?? '—';

  return (
    <div className="border border-border rounded-xl overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #2C2C2C' }}>
            {['Item', 'Category', 'Price', 'Status', 'Actions'].map(h => (
              <th
                key={h}
                className="text-left px-4 py-3 font-medium"
                style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const imageUrl = item.image_path
              ? `${import.meta.env.VITE_API_URL}${item.image_path}`
              : null;

            return (
              <tr
                key={item.id}
                className="border-b border-border last:border-0 transition-colors"
                style={{ backgroundColor: '#1A1A1A' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#242424')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
              >
                {/* Item */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cardLight border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {imageUrl
                        ? <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        : <IconToolsKitchen2 size={16} className="text-textMuted" />
                      }
                    </div>
                    <div>
                      <p className="text-white text-sm">{item.name}</p>
                      {item.description && (
                        <p className="text-textMuted text-xs truncate max-w-[200px]">{item.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td className="px-4 py-3">
                  <Badge variant="category" label={getCategoryName(item.category_id)} />
                </td>
                {/* Price */}
                <td className="px-4 py-3 text-primary text-sm font-medium">
                  {formatCurrency(item.price)}
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <button onClick={() => onToggleAvailability(item)}>
                    <Badge variant={item.is_available === 1 ? 'available' : 'unavailable'} />
                  </button>
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="flex items-center justify-center transition-colors"
                      style={{
                        width: 32, height: 32,
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #2C2C2C',
                        borderRadius: 6,
                        color: '#A0A0A0',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#242424';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#1A1A1A';
                        e.currentTarget.style.color = '#A0A0A0';
                      }}
                    >
                      <IconEdit size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="flex items-center justify-center transition-colors"
                      style={{
                        width: 32, height: 32,
                        backgroundColor: 'rgba(192,57,43,0.08)',
                        border: '1px solid rgba(192,57,43,0.3)',
                        borderRadius: 6,
                        color: '#C0392B',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
