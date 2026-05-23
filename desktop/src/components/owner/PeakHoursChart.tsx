import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PeakHour } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface PeakHoursChartProps {
  data: PeakHour[];
}

function formatHour(h: string): string {
  const n = parseInt(h, 10);
  if (n === 0)  return '12AM';
  if (n < 12)   return `${n}AM`;
  if (n === 12) return '12PM';
  return `${n - 12}PM`;
}

// Fill all 24 hours, missing hours = 0
function buildFullDay(data: PeakHour[]): PeakHour[] {
  const map = new Map(data.map(d => [d.hour, d]));
  return Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, '0');
    return map.get(h) ?? { hour: h, order_count: 0, revenue: 0 };
  });
}

export default function PeakHoursChart({ data }: PeakHoursChartProps) {
  const chartData = buildFullDay(data);
  const max = Math.max(...chartData.map(d => d.order_count));

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col">
      <p className="text-textGray text-xs uppercase tracking-wider mb-4">Busiest Hours</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[140px]">
          <p className="text-textMuted text-sm">No data for this period</p>
        </div>
      ) : (
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={16} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                tickFormatter={formatHour}
                tick={{ fill: '#606060', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value, name) => [
                  name === 'order_count' ? `${value} orders` : formatCurrency(Number(value)),
                  name === 'order_count' ? 'Orders' : 'Revenue',
                ]}
                labelFormatter={(label) => formatHour(String(label))}
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8 }}
                labelStyle={{ color: '#A0A0A0', fontSize: 11 }}
                itemStyle={{ color: '#ffffff', fontSize: 12 }}
              />
              <Bar dataKey="order_count" radius={[3, 3, 0, 0]} minPointSize={2}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.order_count === 0 ? '#2C2C2C' : entry.order_count === max ? '#C0392B' : '#96281B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
