interface EmptyStateProps {
  emoji?: string;
  message: string;
  subtitle?: string;
}

export default function EmptyState({ emoji = '🍽️', message, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">{emoji}</span>
      <p className="text-white font-medium">{message}</p>
      {subtitle && <p className="text-textMuted text-sm">{subtitle}</p>}
    </div>
  );
}
