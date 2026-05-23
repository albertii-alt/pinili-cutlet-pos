import { type Icon } from '@tabler/icons-react';

interface SalesCardProps {
  label: string;
  value: string;
  accent?: boolean;
  icon?: Icon;
}

export default function SalesCard({ label, value, accent = false, icon: Icon }: SalesCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-textGray text-xs uppercase tracking-wider">{label}</span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: accent ? 'rgba(192,57,43,0.1)' : 'rgba(255,255,255,0.05)' }}
          >
            <Icon size={20} color={accent ? '#C0392B' : '#606060'} />
          </div>
        )}
      </div>
      <span className={`font-bold text-2xl ${accent ? 'text-primary' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
