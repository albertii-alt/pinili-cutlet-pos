import { IconToolsKitchen2 } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  subtitle?: string;
}

export default function EmptyState({ icon = <IconToolsKitchen2 size={48} color="#2C2C2C" />, message, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {icon}
      <p className="text-white font-medium">{message}</p>
      {subtitle && <p className="text-textMuted text-sm">{subtitle}</p>}
    </div>
  );
}
