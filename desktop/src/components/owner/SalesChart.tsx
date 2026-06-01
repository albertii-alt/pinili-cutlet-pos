import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, defs, linearGradient, stop } from 'recharts';
import { IconChartBar } from '@tabler/icons-react';
import { DailySales } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface SalesChartProps {
  data: DailySales[];
}

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function formatDayFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
}

function getAccentColor(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim() || '#C0392B';
}

export default function SalesChart({ data }: SalesChartProps) {
  const [accentColor, setAccentColor] = useState<string>('#C0392B');

  // Read accent color on mount and whenever it changes
  useEffect(() => {
    setAccentColor(getAccentColor());

    // Re-read when settings:updated fires (accent color may have changed)
    function handleUpdate() {
      // Small delay to let applyAccentColor write the CSS variable first
      setTimeout(() => setAccentColor(getAccentColor()), 50);
    }

    // Listen via MutationObserver on :root style attribute
    const observer = new MutationObserver(handleUpdate);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  const dataMap = new Map(data.map(d => [d.date, d.total]));

  const chartData: DailySales[] = getLast7Days().map(date => ({
    date,
    total: dataMap.get(date) ?? 0,
  }));

  const isEmpty = chartData.every(d => d.total === 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <p className="text-textGray text-xs uppercase tracking-wider mb-4">Sales — Last 7 Days</p>
      <div className="flex-1 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <IconChartBar size={32} color="#606060" />
            <p style={{ fontSize: 13, color: '#606060' }}>No sales data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tick={{ fill: '#A0A0A0', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
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
                labelFormatter={(label) => formatDayFull(String(label))}
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8 }}
                labelStyle={{ color: '#A0A0A0', fontSize: 11 }}
                itemStyle={{ color: '#ffffff', fontSize: 12 }}
                cursor={{ stroke: accentColor, strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke={accentColor}
                strokeWidth={2}
                fill="url(#salesGradient)"
                dot={{ fill: accentColor, strokeWidth: 0, r: 3 }}
                activeDot={{ fill: accentColor, strokeWidth: 2, stroke: '#111111', r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
