import { useState } from 'react';
import { IconPlayerPause } from '@tabler/icons-react';

interface HoldOrderModalProps {
  onConfirm: (label: string) => void;
  onCancel: () => void;
}

export default function HoldOrderModal({ onConfirm, onCancel }: HoldOrderModalProps) {
  const [label, setLabel] = useState('');

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', animation: 'fadeIn 0.15s ease' }}
    >
      <div
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          width: '100%',
          maxWidth: 380,
          overflow: 'hidden',
        }}
      >
        <div className="flex items-center gap-2 px-5 pt-5 pb-4">
          <IconPlayerPause size={16} color="#F39C12" />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Hold Order</span>
        </div>

        <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />

        <div className="flex flex-col gap-3 px-5 py-4">
          <p style={{ fontSize: 12, color: '#606060' }}>
            The current cart will be saved. You can resume it anytime.
          </p>
          <input
            autoFocus
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onConfirm(label); if (e.key === 'Escape') onCancel(); }}
            placeholder="e.g. Waiting for payment (optional)"
            maxLength={40}
            className="bg-card border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-textMuted focus:border-warning outline-none min-h-[44px] w-full"
          />
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-border bg-card text-textGray text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(label)}
            className="flex-1 py-3 rounded-lg text-sm font-bold"
            style={{ backgroundColor: '#F39C12', color: '#000000', border: 'none' }}
          >
            Hold Order
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
