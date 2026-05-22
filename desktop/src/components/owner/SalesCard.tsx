interface SalesCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

export default function SalesCard({ label, value, accent = false }: SalesCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-textGray text-xs uppercase tracking-wider">{label}</span>
      <span className={`font-bold text-2xl ${accent ? 'text-primary' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
