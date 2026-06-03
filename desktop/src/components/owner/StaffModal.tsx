import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconEye, IconEyeOff } from '@tabler/icons-react';
import { StaffUser } from '../../types';

interface StaffModalProps {
  staff?: StaffUser | null;
  onClose: () => void;
  onSave: (data: { username: string; password: string; role: string }) => Promise<void>;
}

const inputStyle = (focused: boolean): React.CSSProperties => ({
  backgroundColor: '#1A1A1A',
  border: `1px solid ${focused ? '#C0392B' : '#2C2C2C'}`,
  boxShadow: focused ? '0 0 0 3px rgba(192,57,43,0.15)' : 'none',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#ffffff',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
});

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#606060',
  letterSpacing: '0.04em',
  marginBottom: 4,
};

export default function StaffModal({ staff, onClose, onSave }: StaffModalProps) {
  const isEdit = !!staff;

  const [username, setUsername]   = useState(staff?.username ?? '');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [role, setRole]           = useState<'cashier' | 'kitchen'>(staff?.role ?? 'cashier');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);

  const [f1, setF1] = useState(false);
  const [f2, setF2] = useState(false);
  const [f3, setF3] = useState(false);

  async function handleSave() {
    setError('');
    if (!username.trim()) { setError('Username is required'); return; }
    if (!isEdit && !password) { setError('Password is required'); return; }
    if (password && password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password && password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await onSave({ username: username.trim(), password, role });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        className="modal-enter w-[420px] flex flex-col hide-scrollbar"
        style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', borderRadius: 16 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #2C2C2C' }}
        >
          <h2 className="text-white font-semibold text-sm">{isEdit ? 'Edit Staff' : 'Add Staff'}</h2>
          <button style={{ color: '#606060' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
            onClick={onClose}
          >
            <IconX size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Username */}
          <div className="flex flex-col">
            <label style={labelStyle}>Username *</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              style={inputStyle(f1)}
              onFocus={() => setF1(true)}
              onBlur={() => setF1(false)}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label style={labelStyle}>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ ...inputStyle(f2), paddingRight: 40 }}
                onFocus={() => setF2(true)}
                onBlur={() => setF2(false)}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#606060' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
              >
                {showPass ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          {password && (
            <div className="flex flex-col">
              <label style={labelStyle}>Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConf ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  style={{ ...inputStyle(f3), paddingRight: 40 }}
                  onFocus={() => setF3(true)}
                  onBlur={() => setF3(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowConf(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#606060' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
                >
                  {showConf ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Role toggle */}
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Role *</label>
            <div className="flex gap-2">
              <button
                onClick={() => setRole('cashier')}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: role === 'cashier' ? 'rgba(52,152,219,0.15)' : '#1A1A1A',
                  border: `1px solid ${role === 'cashier' ? 'rgba(52,152,219,0.4)' : '#2C2C2C'}`,
                  color: role === 'cashier' ? '#3498DB' : '#606060',
                }}
              >
                Cashier
              </button>
              <button
                onClick={() => setRole('kitchen')}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: role === 'kitchen' ? 'rgba(39,174,96,0.15)' : '#1A1A1A',
                  border: `1px solid ${role === 'kitchen' ? 'rgba(39,174,96,0.4)' : '#2C2C2C'}`,
                  color: role === 'kitchen' ? '#27AE60' : '#606060',
                }}
              >
                Kitchen
              </button>
            </div>
          </div>

          {/* Error */}
          <div style={{ minHeight: 16 }}>
            {error && <p style={{ fontSize: 12, color: '#C0392B' }}>{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid #2C2C2C' }}
        >
          <button
            onClick={onClose}
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8, padding: '8px 16px', color: '#A0A0A0', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#242424')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#2C2C2C' : '#C0392B',
              border: 'none', borderRadius: 8, padding: '8px 16px',
              color: loading ? '#606060' : '#ffffff',
              fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#96281B'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#C0392B'; }}
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  , document.body);
}
