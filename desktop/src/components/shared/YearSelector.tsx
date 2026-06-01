import { IconCalendar, IconChevronDown } from '@tabler/icons-react';

interface YearSelectorProps {
  years: string[];
  selectedYear: string;
  onChange: (year: string) => void;
}

export default function YearSelector({ years, selectedYear, onChange }: YearSelectorProps) {
  // Ensure current year is always in the list even if no data yet
  const currentYear = String(new Date().getFullYear());
  const allYears = years.includes(currentYear) ? years : [currentYear, ...years];

  return (
    <div className="flex items-center gap-1.5">
      <IconCalendar size={13} color="#606060" />
      <div className="relative flex items-center">
        <select
          value={selectedYear}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '0 18px 0 0',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            colorScheme: 'dark',
          }}
        >
          {allYears.map(y => (
            <option key={y} value={y} style={{ backgroundColor: '#1A1A1A' }}>{y}</option>
          ))}
        </select>
        <IconChevronDown
          size={11}
          color="#606060"
          style={{ position: 'absolute', right: 0, pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

// ─── Year Badge ───────────────────────────────────────────────────────────────

interface YearBadgeProps {
  year: string;
}

export function YearBadge({ year }: YearBadgeProps) {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{
        backgroundColor: 'rgba(192,57,43,0.1)',
        border: '1px solid rgba(192,57,43,0.3)',
        borderRadius: 8,
        padding: '4px 10px',
      }}
    >
      <IconCalendar size={12} color="#C0392B" />
      <span style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{year}</span>
    </div>
  );
}
