import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailySales } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface SalesChartProps {
  data: DailySales[];
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export default function SalesChart({ data }: SalesChartProps) {
  const dataMap = new Map(data.map(d => [d.date, d.total]));

  const chartData: DailySales[] = getLast7Days().map(date => ({
    date,
    total: dataMap.get(date) ?? 0,
  }));

  const max = Math.max(...chartData.map(d => d.total));

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <p className="text-textGray text-xs uppercase tracking-wider mb-4">Sales — Last 7 Days</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={28}>
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
            <Bar dataKey="total" radius={[4, 4, 0, 0]} minPointSize={4}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.total === 0 ? '#2C2C2C' : entry.total === max ? '#C0392B' : '#96281B'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
