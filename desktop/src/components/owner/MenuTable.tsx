import { IconEdit, IconTrash, IconToolsKitchen2, IconStar, IconStarFilled, IconTag } from '@tabler/icons-react';
import { MenuItem, Category } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import Badge, { CategoryBadge } from '../shared/Badge';

interface MenuTableProps {
  items: MenuItem[];
  categories: Category[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onToggleFeatured: (item: MenuItem) => void;
  onSetPromo: (item: MenuItem) => void;
}

export default function MenuTable({ items, categories, onEdit, onDelete, onToggleAvailability, onToggleFeatured, onSetPromo }: MenuTableProps) {
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
                      <p className="text-sm font-medium" style={{ color: 'var(--accent-color, #C0392B)' }}>{item.name}</p>
                      {item.description && (
                        <p className="text-xs truncate max-w-[200px]" style={{ color: '#ffffff' }}>{item.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td className="px-4 py-3">
                  <CategoryBadge label={getCategoryName(item.category_id)} />
                </td>
                {/* Price */}
                <td className="px-4 py-3">
                  {item.promo_price != null ? (
                    <div className="flex flex-col gap-0.5">
                      <span style={{ fontSize: 11, color: '#606060', textDecoration: 'line-through' }}>
                        {formatCurrency(item.price)}
                      </span>
                      <span style={{ fontSize: 13, color: '#C0392B', fontWeight: 600 }}>
                        {formatCurrency(item.promo_price)}
                      </span>
                      {item.promo_label && (
                        <span style={{
                          fontSize: 10, color: '#F39C12', fontWeight: 600,
                          backgroundColor: 'rgba(243,156,18,0.12)',
                          border: '1px solid rgba(243,156,18,0.3)',
                          borderRadius: 4, padding: '1px 5px', alignSelf: 'flex-start',
                        }}>
                          {item.promo_label}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-primary text-sm font-medium">{formatCurrency(item.price)}</span>
                  )}
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
                    {/* Promo price button */}
                    <button
                      onClick={() => onSetPromo(item)}
                      className="flex items-center justify-center transition-colors"
                      title={item.promo_price != null ? 'Edit promo price' : 'Set promo price'}
                      style={{
                        width: 32, height: 32,
                        backgroundColor: item.promo_price != null ? 'rgba(243,156,18,0.1)' : '#1A1A1A',
                        border: `1px solid ${item.promo_price != null ? 'rgba(243,156,18,0.4)' : '#2C2C2C'}`,
                        borderRadius: 6,
                        color: item.promo_price != null ? '#F39C12' : '#606060',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = item.promo_price != null ? 'rgba(243,156,18,0.2)' : '#242424';
                        e.currentTarget.style.color = '#F39C12';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = item.promo_price != null ? 'rgba(243,156,18,0.1)' : '#1A1A1A';
                        e.currentTarget.style.color = item.promo_price != null ? '#F39C12' : '#606060';
                      }}
                    >
                      <IconTag size={15} />
                    </button>
                    {/* Featured toggle */}
                    <button
                      onClick={() => onToggleFeatured(item)}
                      className="flex items-center justify-center transition-colors"
                      title={item.is_featured === 1 ? 'Remove from featured' : 'Mark as featured'}
                      style={{
                        width: 32, height: 32,
                        backgroundColor: item.is_featured === 1 ? 'rgba(244,196,48,0.1)' : '#1A1A1A',
                        border: `1px solid ${item.is_featured === 1 ? 'rgba(244,196,48,0.4)' : '#2C2C2C'}`,
                        borderRadius: 6,
                        color: item.is_featured === 1 ? '#F4C430' : '#606060',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = item.is_featured === 1 ? 'rgba(244,196,48,0.2)' : '#242424';
                        e.currentTarget.style.color = '#F4C430';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = item.is_featured === 1 ? 'rgba(244,196,48,0.1)' : '#1A1A1A';
                        e.currentTarget.style.color = item.is_featured === 1 ? '#F4C430' : '#606060';
                      }}
                    >
                      {item.is_featured === 1
                        ? <IconStarFilled size={15} />
                        : <IconStar size={15} />
                      }
                    </button>
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
