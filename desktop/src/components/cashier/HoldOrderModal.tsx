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
      className="fixed inset-0 flex items-center justify-center z-[60]"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', animation: 'fadeIn 0.15s ease' }}
    >
      <div
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          width: '100%',
          maxWidth: 380,
          margin: '0 16px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-4">
          <IconPlayerPause size={16} color="#F39C12" />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Hold Order</span>
        </div>

        <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />

        {/* Body */}
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
            style={{
              backgroundColor: '#111111',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '9px 12px',
              color: '#ffffff',
              fontSize: 13,
              outline: 'none',
              width: '100%',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#F39C12')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: '1px solid #2C2C2C', backgroundColor: '#111111',
              color: '#A0A0A0', fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(label)}
            style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: 'none', backgroundColor: '#F39C12',
              color: '#000000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e08e0b')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F39C12')}
          >
            Hold Order
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
