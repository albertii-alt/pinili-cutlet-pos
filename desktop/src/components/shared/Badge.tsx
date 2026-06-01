interface BadgeProps {
  variant: 'available' | 'unavailable' | 'cash' | 'gcash' | 'payment' | 'category' | 'pending' | 'completed' | 'cancelled';
  label?: string;
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  available:   'bg-success/15 text-success border border-success/30',
  unavailable: 'bg-textMuted/15 text-textMuted border border-textMuted/30',
  cash:        'bg-success/15 text-success border border-success/30',
  gcash:       'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  payment:     'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  category:    'bg-cardLight text-textGray border border-border',
  pending:     'bg-warning/15 text-warning border border-warning/30',
  completed:   'bg-success/15 text-success border border-success/30',
  cancelled:   'bg-danger/15 text-danger border border-danger/30',
};

const defaultLabels: Record<BadgeProps['variant'], string> = {
  available:   'Available',
  unavailable: 'Unavailable',
  cash:        'Cash',
  gcash:       'GCash',
  payment:     'Payment',
  category:    'Category',
  pending:     'Pending',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

function paymentVariant(method: string): { variant: BadgeProps['variant']; label: string } {
  const lower = method.toLowerCase();
  if (lower === 'cash')  return { variant: 'cash',    label: method };
  if (lower === 'gcash') return { variant: 'gcash',   label: method };
  return                        { variant: 'payment', label: method };
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

export function PaymentBadge({ method, color, logoUrl }: { method: string; color?: string; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
        style={{
          backgroundColor: color ? `${color}22` : 'rgba(160,160,160,0.1)',
          border: `1px solid ${color ? `${color}44` : 'rgba(160,160,160,0.2)'}`,
          color: color ?? '#A0A0A0',
        }}
      >
        <img
          src={logoUrl}
          alt={method}
          style={{ width: 16, height: 16, objectFit: 'contain', borderRadius: 2, flexShrink: 0 }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        {method}
      </span>
    );
  }
  if (color) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
        style={{ backgroundColor: color, color: getTextColor(color) }}
      >
        {method}
      </span>
    );
  }
  const { variant, label } = paymentVariant(method);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}

export function CategoryBadge({ label }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{
        backgroundColor: 'var(--accent-color, #C0392B)',
        color: '#000000',
      }}
    >
      {label ?? 'Category'}
    </span>
  );
}

export default function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variantStyles[variant]}`}>
      {label ?? defaultLabels[variant]}
    </span>
  );
}
