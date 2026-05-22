import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailySales } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface SalesChartProps {
  data: DailySales[];
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-center h-[220px]">
        <p className="text-textMuted text-sm">No sales data yet</p>
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.total));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-textGray text-xs uppercase tracking-wider mb-4">Sales — Last 7 Days</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={{ fill: '#A0A0A0', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `₱${v}`}
            tick={{ fill: '#A0A0A0', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), 'Sales']}
            labelFormatter={(label) => formatDay(String(label))}
            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8 }}
            labelStyle={{ color: '#A0A0A0', fontSize: 11 }}
            itemStyle={{ color: '#ffffff', fontSize: 12 }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.total === max ? '#C0392B' : '#2C2C2C'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
