import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategorySales } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface CategorySalesChartProps {
  data: CategorySales[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Main Cutlets': '#C0392B',
  'Konbos':       '#E74C3C',
  'Snacks':       '#F39C12',
  'Drinks':       '#27AE60',
};

function getColor(category: string, index: number): string {
  return CATEGORY_COLORS[category] ?? ['#3498DB', '#9B59B6', '#1ABC9C', '#E67E22'][index % 4] ?? '#606060';
}

export default function CategorySalesChart({ data }: CategorySalesChartProps) {
  const total = data.reduce((s, d) => s + d.total_revenue, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <p className="text-textGray text-xs uppercase tracking-wider mb-4">Revenue by Category</p>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-textMuted text-sm">No data for this period</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          {/* Donut chart */}
          <div className="relative" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total_revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={getColor(entry.category, i)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8 }}
                  labelStyle={{ color: '#A0A0A0', fontSize: 11 }}
                  itemStyle={{ color: '#ffffff', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span style={{ fontSize: 11, color: '#606060' }}>Total</span>
              <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 700 }}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            {data.map((entry, i) => {
              const pct = total > 0 ? ((entry.total_revenue / total) * 100).toFixed(1) : '0';
              return (
                <div key={entry.category} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getColor(entry.category, i) }} />
                  <span style={{ flex: 1, fontSize: 12, color: '#A0A0A0' }} className="truncate">{entry.category}</span>
                  <span style={{ fontSize: 12, color: '#606060' }}>{pct}%</span>
                  <span style={{ fontSize: 12, color: '#ffffff', minWidth: 60, textAlign: 'right' }}>
                    {formatCurrency(entry.total_revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
