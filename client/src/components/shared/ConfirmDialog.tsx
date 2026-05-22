interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-[360px]">
        <div className="border-b border-border p-4">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-textGray text-sm">{message}</p>
        </div>
        <div className="border-t border-border p-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="bg-card border border-border text-textGray rounded-lg px-4 py-2 text-sm hover:bg-cardLight transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              destructive
                ? 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20'
                : 'bg-primary hover:bg-primaryDark text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
