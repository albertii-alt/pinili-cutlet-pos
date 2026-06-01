import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { IconChartRadar } from '@tabler/icons-react';
import { MonthlySales } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface MonthlySalesRadarChartProps {
  data: MonthlySales[];
}

function getAccentColor(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim() || '#C0392B';
}

interface TooltipPayloadEntry {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: '#1A1A1A',
        border: '1px solid #2C2C2C',
        borderRadius: 8,
        padding: '8px 12px',
      }}
    >
      <p style={{ color: '#A0A0A0', fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#ffffff', fontSize: 12, fontWeight: 600 }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function MonthlySalesRadarChart({ data }: MonthlySalesRadarChartProps) {
  const [accentColor, setAccentColor] = useState<string>('#C0392B');

  useEffect(() => {
    setAccentColor(getAccentColor());

    const observer = new MutationObserver(() => {
      setTimeout(() => setAccentColor(getAccentColor()), 50);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  const isEmpty = data.every(d => d.total === 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <p className="text-textGray text-xs uppercase tracking-wider mb-4">Monthly Sales Distribution</p>
      <div className="flex-1 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <IconChartRadar size={32} color="#606060" />
            <p style={{ fontSize: 13, color: '#606060' }}>No sales data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#2C2C2C" />
              <PolarAngleAxis
                dataKey="month"
                tick={{ fill: '#A0A0A0', fontSize: 11 }}
              />
              <PolarRadiusAxis
                tick={{ fill: '#606060', fontSize: 9 }}
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Sales"
                dataKey="total"
                stroke={accentColor}
                fill={accentColor}
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ fill: accentColor, r: 3, strokeWidth: 0 }}
                activeDot={{ fill: accentColor, r: 5, stroke: '#111111', strokeWidth: 2 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
