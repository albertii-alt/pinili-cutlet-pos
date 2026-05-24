import { useState, useEffect } from 'react';
import {
  IconEye, IconEyeOff, IconShieldLock, IconCheck,
  IconUsers, IconUserPlus, IconEdit, IconTrash, IconLock, IconLockOpen,
  IconSettings2, IconPencil,
} from '@tabler/icons-react';
import { changePassword } from '../../api/auth.api';
import { getSettings, updateSetting } from '../../api/settings.api';
import { useStaff } from '../../hooks/useStaff';
import { StaffUser } from '../../types';
import StaffModal from '../../components/owner/StaffModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle = (focused: boolean): React.CSSProperties => ({
  backgroundColor: '#1A1A1A',
  border: `1px solid ${focused ? '#C0392B' : '#2C2C2C'}`,
  boxShadow: focused ? '0 0 0 3px rgba(192,57,43,0.15)' : 'none',
  borderRadius: 8,
  padding: '9px 40px 9px 12px',
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

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(p: string) {
  if (!p) return { label: '', color: '#2C2C2C', width: '0%' };
  const score = [p.length >= 8, /[A-Z]/.test(p), /[a-z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
  if (score <= 2) return { label: 'Weak',   color: '#C0392B', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: '#F39C12', width: '66%' };
  return           { label: 'Strong',  color: '#27AE60', width: '100%' };
}

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordField({ label, value, onChange, placeholder, focused, onFocus, onBlur }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; focused: boolean; onFocus: () => void; onBlur: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col">
      <label style={labelStyle}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle(focused)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: '#606060' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
        >
          {show ? <IconEyeOff size={15} /> : <IconEye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Role avatar ──────────────────────────────────────────────────────────────

function RoleAvatar({ username, role }: { username: string; role: string }) {
  const color = role === 'cashier' ? '#3498DB' : '#27AE60';
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
      style={{ backgroundColor: color }}
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Change password state
  const [current, setCurrent]   = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confirm, setConfirm]   = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [f1, setF1] = useState(false);
  const [f2, setF2] = useState(false);
  const [f3, setF3] = useState(false);
  const strength = getStrength(newPass);

  // Staff state
  const { staff, loading: staffLoading, addStaff, editStaff, removeStaff, toggleStatus } = useStaff();
  const [staffModal, setStaffModal] = useState<StaffUser | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  // System settings state
  const [stallName, setStallName]           = useState('Pinili Cutlet');
  const [stallNameInput, setStallNameInput] = useState('');
  const [editingStall, setEditingStall]     = useState(false);
  const [stallSaving, setStallSaving]       = useState(false);
  const [stallError, setStallError]         = useState('');
  const [defaultPayment, setDefaultPayment] = useState<'cash' | 'gcash'>('cash');
  const [paymentError, setPaymentError]     = useState('');
  const [settingsToast, setSettingsToast]   = useState('');

  useEffect(() => {
    getSettings().then(s => {
      if (s.stall_name)    setStallName(s.stall_name);
      if (s.default_payment === 'gcash') setDefaultPayment('gcash');
    }).catch(() => {});
  }, []);

  async function handleSaveStallName() {
    const trimmed = stallNameInput.trim();
    if (!trimmed) return;
    setStallSaving(true);
    setStallError('');
    try {
      await updateSetting('stall_name', trimmed);
      setStallName(trimmed);
      setEditingStall(false);
      setSettingsToast('Stall name updated');
      setTimeout(() => setSettingsToast(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setStallError(msg ?? 'Failed to save. Check your connection and try again.');
    } finally {
      setStallSaving(false);
    }
  }

  async function handleDefaultPaymentToggle(method: 'cash' | 'gcash') {
    if (method === defaultPayment) return;
    const prev = defaultPayment;
    setDefaultPayment(method);
    setPaymentError('');
    try {
      await updateSetting('default_payment', method);
      setSettingsToast(`Default payment set to ${method === 'gcash' ? 'GCash' : 'Cash'}`);
      setTimeout(() => setSettingsToast(''), 3000);
    } catch (err: unknown) {
      setDefaultPayment(prev); // revert on error
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setPaymentError(msg ?? 'Failed to save. Check your connection and try again.');
    }
  }

  async function handleChangePassword() {
    setPwError('');
    if (!current || !newPass || !confirm) { setPwError('All fields are required'); return; }
    if (newPass.length < 8)               { setPwError('New password must be at least 8 characters'); return; }
    if (newPass !== confirm)              { setPwError('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await changePassword(current, newPass);
      setCurrent(''); setNewPass(''); setConfirm('');
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setPwError(msg ?? 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleSaveStaff(data: { username: string; password: string; role: string }) {
    if (staffModal === null) {
      await addStaff(data.username, data.password, data.role);
    } else if (staffModal) {
      await editStaff(staffModal.id, { username: data.username, password: data.password || undefined, role: data.role });
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[640px]">
      <h1 className="text-white font-semibold text-lg">Settings</h1>

      {/* ── Account Security ── */}
      <div className="flex flex-col gap-5 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <IconShieldLock size={16} color="#C0392B" />
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Account Security</span>
        </div>

        <PasswordField label="Current Password"      value={current}  onChange={setCurrent}  placeholder="Enter current password"  focused={f1} onFocus={() => setF1(true)} onBlur={() => setF1(false)} />

        <div className="flex flex-col gap-1.5">
          <PasswordField label="New Password"         value={newPass}  onChange={setNewPass}  placeholder="Minimum 8 characters"    focused={f2} onFocus={() => setF2(true)} onBlur={() => setF2(false)} />
          {newPass.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: '#2C2C2C' }}>
                <div className="h-1 rounded-full transition-all duration-300" style={{ width: strength.width, backgroundColor: strength.color }} />
              </div>
              <span style={{ fontSize: 11, color: strength.color, minWidth: 40 }}>{strength.label}</span>
            </div>
          )}
        </div>

        <PasswordField label="Confirm New Password"  value={confirm}  onChange={setConfirm}  placeholder="Re-enter new password"   focused={f3} onFocus={() => setF3(true)} onBlur={() => setF3(false)} />

        <div style={{ minHeight: 16 }}>
          {pwError && <p style={{ fontSize: 12, color: '#C0392B' }}>{pwError}</p>}
        </div>

        <button
          onClick={handleChangePassword}
          disabled={pwLoading}
          style={{ backgroundColor: pwLoading ? '#2C2C2C' : '#C0392B', border: 'none', borderRadius: 8, padding: '10px 20px', color: pwLoading ? '#606060' : '#ffffff', fontSize: 13, fontWeight: 600, cursor: pwLoading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}
          onMouseEnter={e => { if (!pwLoading) e.currentTarget.style.backgroundColor = '#96281B'; }}
          onMouseLeave={e => { if (!pwLoading) e.currentTarget.style.backgroundColor = '#C0392B'; }}
        >
          {pwLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* ── Staff Management ── */}
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}>
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-2">
            <IconUsers size={16} color="#C0392B" />
            <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Staff Management</span>
          </div>
          <button
            onClick={() => setStaffModal(null)}
            className="flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: '#C0392B', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#ffffff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#96281B')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
          >
            <IconUserPlus size={14} />
            Add Staff
          </button>
        </div>

        {staffLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : staff.length === 0 ? (
          <p style={{ fontSize: 13, color: '#606060', textAlign: 'center', padding: '16px 0' }}>No staff accounts yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {staff.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}
              >
                <RoleAvatar username={s.username} role={s.role} />

                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, color: s.is_active ? '#ffffff' : '#606060', fontWeight: 500 }}>{s.username}</p>
                  <p style={{ fontSize: 11, color: '#606060', textTransform: 'capitalize' }}>{s.role}</p>
                </div>

                {/* Role badge */}
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: s.role === 'cashier' ? 'rgba(52,152,219,0.15)' : 'rgba(39,174,96,0.15)',
                    color: s.role === 'cashier' ? '#3498DB' : '#27AE60',
                    border: `1px solid ${s.role === 'cashier' ? 'rgba(52,152,219,0.3)' : 'rgba(39,174,96,0.3)'}`,
                  }}
                >
                  {s.role === 'cashier' ? 'Cashier' : 'Kitchen'}
                </span>

                {/* Status badge */}
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: s.is_active ? 'rgba(39,174,96,0.1)' : 'rgba(96,96,96,0.1)',
                    color: s.is_active ? '#27AE60' : '#606060',
                    border: `1px solid ${s.is_active ? 'rgba(39,174,96,0.3)' : '#2C2C2C'}`,
                  }}
                >
                  {s.is_active ? 'Active' : 'Disabled'}
                </span>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Edit */}
                  <button
                    onClick={() => setStaffModal(s)}
                    className="flex items-center justify-center transition-colors"
                    style={{ width: 30, height: 30, backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, color: '#A0A0A0', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
                  >
                    <IconEdit size={13} />
                  </button>

                  {/* Toggle status */}
                  <button
                    onClick={() => toggleStatus(s.id, s.is_active ? 0 : 1)}
                    className="flex items-center justify-center transition-colors"
                    style={{
                      width: 30, height: 30, borderRadius: 6, cursor: 'pointer',
                      backgroundColor: s.is_active ? 'rgba(243,156,18,0.1)' : 'rgba(39,174,96,0.1)',
                      border: `1px solid ${s.is_active ? 'rgba(243,156,18,0.3)' : 'rgba(39,174,96,0.3)'}`,
                      color: s.is_active ? '#F39C12' : '#27AE60',
                    }}
                  >
                    {s.is_active ? <IconLock size={13} /> : <IconLockOpen size={13} />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="flex items-center justify-center transition-colors"
                    style={{ width: 30, height: 30, backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, color: '#C0392B', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── System Settings ── */}
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <IconSettings2 size={16} color="#C0392B" />
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>System Settings</span>
        </div>

        {/* Stall Name */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: '#606060', letterSpacing: '0.04em' }}>Stall Name</label>
          {editingStall ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={stallNameInput}
                  onChange={e => { setStallNameInput(e.target.value); setStallError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveStallName(); if (e.key === 'Escape') { setEditingStall(false); setStallError(''); } }}
                  style={{
                    flex: 1, backgroundColor: '#1A1A1A',
                    border: `1px solid ${stallError ? '#C0392B' : '#C0392B'}`,
                    borderRadius: 8, padding: '8px 12px',
                    color: '#ffffff', fontSize: 13, outline: 'none',
                  }}
                />
                <button
                  onClick={handleSaveStallName}
                  disabled={stallSaving || !stallNameInput.trim()}
                  style={{
                    backgroundColor: stallSaving || !stallNameInput.trim() ? '#2C2C2C' : '#C0392B',
                    border: 'none', borderRadius: 8, padding: '8px 14px',
                    color: stallSaving || !stallNameInput.trim() ? '#606060' : '#ffffff',
                    fontSize: 13, fontWeight: 600, cursor: stallSaving || !stallNameInput.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {stallSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingStall(false); setStallError(''); }}
                  style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8, padding: '8px 12px', color: '#A0A0A0', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
              {stallError && <p style={{ fontSize: 12, color: '#C0392B' }}>{stallError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 500 }}>{stallName}</span>
              <button
                onClick={() => { setStallNameInput(stallName); setEditingStall(true); }}
                className="flex items-center gap-1"
                style={{ backgroundColor: 'transparent', border: '1px solid #2C2C2C', borderRadius: 6, padding: '4px 10px', color: '#606060', fontSize: 12, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#606060'; }}
              >
                <IconPencil size={12} />
                Edit
              </button>
            </div>
          )}
          <p style={{ fontSize: 11, color: '#606060' }}>Displayed in the sidebar and cashier topbar.</p>
        </div>

        {/* Default Payment Method */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: '#606060', letterSpacing: '0.04em' }}>Default Payment Method</label>
          <div className="flex gap-2" style={{ maxWidth: 240 }}>
            {(['cash', 'gcash'] as const).map(method => (
              <button
                key={method}
                onClick={() => handleDefaultPaymentToggle(method)}
                style={{
                  flex: 1, padding: '8px',
                  backgroundColor: defaultPayment === method ? '#C0392B' : '#1A1A1A',
                  border: `1px solid ${defaultPayment === method ? '#C0392B' : '#2C2C2C'}`,
                  borderRadius: 8,
                  color: defaultPayment === method ? '#ffffff' : '#A0A0A0',
                  fontSize: 13, fontWeight: defaultPayment === method ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {method === 'gcash' ? 'GCash' : 'Cash'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#606060' }}>Pre-selected payment method in the cashier order panel.</p>
          {paymentError && <p style={{ fontSize: 12, color: '#C0392B' }}>{paymentError}</p>}
        </div>
      </div>

      {/* Staff modal */}
      {staffModal !== undefined && (
        <StaffModal
          staff={staffModal}
          onClose={() => setStaffModal(undefined)}
          onSave={handleSaveStaff}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Staff"
          message={`Delete "${deleteTarget.username}"? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={async () => { await removeStaff(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Success toast */}
      {pwSuccess && (
        <div
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl z-50"
          style={{ backgroundColor: '#111111', border: '1px solid rgba(39,174,96,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(39,174,96,0.2)' }}>
            <IconCheck size={12} color="#27AE60" />
          </div>
          <span style={{ fontSize: 13, color: '#27AE60' }}>Password updated successfully</span>
        </div>
      )}

      {settingsToast && (
        <div
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl z-50"
          style={{ backgroundColor: '#111111', border: '1px solid rgba(39,174,96,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(39,174,96,0.2)' }}>
            <IconCheck size={12} color="#27AE60" />
          </div>
          <span style={{ fontSize: 13, color: '#27AE60' }}>{settingsToast}</span>
        </div>
      )}
    </div>
  );
}
