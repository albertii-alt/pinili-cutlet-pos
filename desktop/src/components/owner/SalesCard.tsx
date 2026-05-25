import { type Icon } from '@tabler/icons-react';

interface SalesCardProps {
  label: string;
  value: string;
  accent?: boolean;
  accentColor?: string;
  icon?: Icon;
  isZero?: boolean;
}

export default function SalesCard({ label, value, accent = false, accentColor, icon: Icon, isZero = false }: SalesCardProps) {
  const color = accentColor ?? '#C0392B';
  const valueColor = isZero ? '#606060' : accent ? color : '#ffffff';

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-textGray text-xs uppercase tracking-wider">{label}</span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: accent && !isZero ? `${color}1A` : 'rgba(255,255,255,0.05)' }}
          >
            <Icon size={20} color={accent && !isZero ? color : '#606060'} />
          </div>
        )}
      </div>
      <span className="font-bold text-2xl" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}
