import { IconLogout, IconX } from '@tabler/icons-react';

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          width: 380,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #2C2C2C' }}
        >
          <div className="flex items-center gap-2">
            <IconLogout size={16} color="#C0392B" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Confirm Logout</span>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#606060', display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p style={{ fontSize: 13, color: '#A0A0A0', lineHeight: 1.6 }}>
            Are you sure you want to log out? Any unsaved changes will be lost.
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-5 py-4"
          style={{ borderTop: '1px solid #2C2C2C' }}
        >
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '7px 16px',
              color: '#A0A0A0',
              fontSize: 13,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: 'rgba(192,57,43,0.08)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 8,
              padding: '7px 16px',
              color: '#C0392B',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
          >
            <IconLogout size={13} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
