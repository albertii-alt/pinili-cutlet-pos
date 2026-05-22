interface BadgeProps {
  variant: 'available' | 'unavailable' | 'cash' | 'gcash' | 'category' | 'pending' | 'completed' | 'cancelled';
  label?: string;
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  available:   'bg-success/15 text-success border border-success/30',
  unavailable: 'bg-textMuted/15 text-textMuted border border-textMuted/30',
  cash:        'bg-success/15 text-success border border-success/30',
  gcash:       'bg-blue-500/15 text-blue-400 border border-blue-500/30',
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
  category:    'Category',
  pending:     'Pending',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

export default function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variantStyles[variant]}`}>
      {label ?? defaultLabels[variant]}
    </span>
  );
}
