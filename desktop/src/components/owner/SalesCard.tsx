import { useState } from 'react';
import { type Icon } from '@tabler/icons-react';

interface SalesCardProps {
  label: string;
  value: string;
  accent?: boolean;
  accentColor?: string;
  icon?: Icon;
  isZero?: boolean;
  clickable?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export default function SalesCard({ label, value, accent = false, accentColor, icon: Icon, isZero = false, clickable = false, active = false, onClick }: SalesCardProps) {
  const [hovered, setHovered] = useState(false);
  const color = accentColor ?? '#C0392B';
  const valueColor = isZero ? '#606060' : accent ? color : '#ffffff';

  const borderColor = active
    ? (accent ? color : '#ffffff')
    : (clickable && hovered ? 'rgba(255,255,255,0.2)' : 'var(--color-border, #2C2C2C)');

  const bgColor = active
    ? (accent ? `${color}12` : 'rgba(255,255,255,0.06)')
    : (clickable && hovered ? '#1E1E1E' : 'var(--color-card, #161616)');

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        userSelect: 'none',
      }}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => clickable && setHovered(true)}
      onMouseLeave={() => clickable && setHovered(false)}
    >
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
