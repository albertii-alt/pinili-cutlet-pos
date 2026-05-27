import { useState, useEffect } from 'react';
import {
  IconEye, IconEyeOff, IconShieldLock, IconCheck,
  IconUsers, IconUserPlus, IconEdit, IconTrash, IconLock, IconLockOpen,
  IconPencil, IconPlus, IconStar, IconStarFilled, IconUser,
  IconPalette, IconReceipt, IconBuildingStore, IconCreditCard, IconBell, IconUpload, IconPlayerPlay,
} from '@tabler/icons-react';
import { changePassword, changeUsername } from '../../api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import { applyAccentColor } from '../../utils/applyAccentColor';
import {
  getSettings, updateSetting,
  getPaymentMethods, addPaymentMethod, deletePaymentMethod,
  setDefaultPaymentMethod, togglePaymentMethod, updatePaymentMethodColor,
  type PaymentMethod,
} from '../../api/settings.api';
import { useStaff } from '../../hooks/useStaff';
import { StaffUser } from '../../types';
import StaffModal from '../../components/owner/StaffModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import socket from '../../socket/socket';

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

type Section = 'account' | 'staff' | 'system' | 'appearance' | 'orders' | 'payment' | 'notifications';

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'account',       label: 'Account Security',    icon: <IconShieldLock size={15} /> },
  { id: 'staff',         label: 'Staff Management',    icon: <IconUsers size={15} /> },
  { id: 'system',        label: 'System Settings',     icon: <IconBuildingStore size={15} /> },
  { id: 'appearance',    label: 'Display & Appearance', icon: <IconPalette size={15} /> },
  { id: 'orders',        label: 'Order Settings',      icon: <IconReceipt size={15} /> },
  { id: 'payment',       label: 'Payment Methods',     icon: <IconCreditCard size={15} /> },
  { id: 'notifications', label: 'Notifications',       icon: <IconBell size={15} /> },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('account');
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

  // Change username state
  const { user, updateUsername } = useAuthStore();
  const [unEditing, setUnEditing]       = useState(false);
  const [newUsername, setNewUsername]   = useState('');
  const [unPassword, setUnPassword]     = useState('');
  const [unLoading, setUnLoading]       = useState(false);
  const [unError, setUnError]           = useState('');
  const [unSuccess, setUnSuccess]       = useState(false);
  const [unF1, setUnF1] = useState(false);
  const [unF2, setUnF2] = useState(false);

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
  const [settingsToast, setSettingsToast]   = useState('');

  // Payment methods state
  const [paymentMethods, setPaymentMethods]   = useState<PaymentMethod[]>([]);
  const [newMethodName, setNewMethodName]     = useState('');
  const [addingMethod, setAddingMethod]       = useState(false);
  const [addMethodError, setAddMethodError]   = useState('');
  const [deleteMethodTarget, setDeleteMethodTarget] = useState<PaymentMethod | null>(null);

  // Display & Appearance state
  const ACCENT_PRESETS = [
    { color: '#C0392B', label: 'Red'    },
    { color: '#2980B9', label: 'Blue'   },
    { color: '#27AE60', label: 'Green'  },
    { color: '#8E44AD', label: 'Purple' },
    { color: '#E67E22', label: 'Orange' },
    { color: '#2C3E50', label: 'Slate'  },
  ];
  const [accentColor, setAccentColor]           = useState('#C0392B');
  const [showItemDesc, setShowItemDesc]         = useState(false);

  // Order Settings state
  const [orderPrefix, setOrderPrefix]           = useState('PC');
  const [orderPrefixInput, setOrderPrefixInput] = useState('');
  const [editingPrefix, setEditingPrefix]       = useState(false);
  const [prefixSaving, setPrefixSaving]         = useState(false);
  const [prefixError, setPrefixError]           = useState('');
  const [orderConfirm, setOrderConfirm]         = useState(false);

  // Notifications state
  const [notifEnabled, setNotifEnabled]       = useState(true);
  const [notifSound, setNotifSound]           = useState('');
  const [notifUploading, setNotifUploading]   = useState(false);
  const [notifUploadErr, setNotifUploadErr]   = useState('');
  const [notifUploadPct, setNotifUploadPct]   = useState(0);

  useEffect(() => {
    getSettings().then(s => {
      if (s.stall_name) setStallName(s.stall_name);
      if (s.accent_color) setAccentColor(s.accent_color);
      setShowItemDesc(s.show_item_description === 'true');
      if (s.order_prefix) setOrderPrefix(s.order_prefix.trim().toUpperCase());
      setOrderConfirm(s.order_confirmation === 'true');
      setNotifEnabled(s.notification_enabled !== 'false');
      if (s.notification_sound) setNotifSound(s.notification_sound);
    }).catch(() => {});

    getPaymentMethods().then(setPaymentMethods).catch(() => {});

    function handlePaymentMethodsUpdated(methods: PaymentMethod[]) {
      setPaymentMethods(methods);
    }
    socket.on('payment_methods:updated', handlePaymentMethodsUpdated);
    return () => { socket.off('payment_methods:updated', handlePaymentMethodsUpdated); };
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

  async function handleAddPaymentMethod() {
    const trimmed = newMethodName.trim();
    if (!trimmed) return;
    setAddingMethod(true);
    setAddMethodError('');
    try {
      await addPaymentMethod(trimmed);
      setNewMethodName('');
      setSettingsToast(`"${trimmed}" added`);
      setTimeout(() => setSettingsToast(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setAddMethodError(msg ?? 'Failed to add payment method.');
    } finally {
      setAddingMethod(false);
    }
  }

  async function handleSetDefault(id: number) {
    try {
      await setDefaultPaymentMethod(id);
    } catch { /* socket will update state */ }
  }

  async function handleToggleMethod(id: number, isActive: boolean) {
    try {
      await togglePaymentMethod(id, isActive);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSettingsToast(msg ?? 'Failed to update');
      setTimeout(() => setSettingsToast(''), 3000);
    }
  }

  async function handleDeleteMethod() {
    if (!deleteMethodTarget) return;
    try {
      await deletePaymentMethod(deleteMethodTarget.id);
      setDeleteMethodTarget(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSettingsToast(msg ?? 'Failed to delete');
      setTimeout(() => setSettingsToast(''), 3000);
      setDeleteMethodTarget(null);
    }
  }

  async function handleColorChange(id: number, color: string) {
    try {
      await updatePaymentMethodColor(id, color);
      setSettingsToast('Color updated');
      setTimeout(() => setSettingsToast(''), 3000);
    } catch {
      setSettingsToast('Failed to update color');
      setTimeout(() => setSettingsToast(''), 3000);
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

  async function handleChangeUsername() {
    setUnError('');
    const trimmed = newUsername.trim();
    if (!trimmed || !unPassword) { setUnError('All fields are required'); return; }
    if (trimmed.length < 3)      { setUnError('Username must be at least 3 characters'); return; }
    if (/\s/.test(trimmed))      { setUnError('Username must not contain spaces'); return; }
    setUnLoading(true);
    try {
      const { token, user: updated } = await changeUsername(unPassword, trimmed);
      updateUsername(token, updated.username);
      setUnEditing(false);
      setNewUsername('');
      setUnPassword('');
      setUnSuccess(true);
      setTimeout(() => setUnSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setUnError(msg ?? 'Failed to update username');
    } finally {
      setUnLoading(false);
    }
  }

  async function handleSaveStaff(data: { username: string; password: string; role: string }) {
    if (staffModal === null) {
      await addStaff(data.username, data.password, data.role);
    } else if (staffModal) {
      await editStaff(staffModal.id, { username: data.username, password: data.password || undefined, role: data.role });
    }
  }

  async function handleAccentColorChange(color: string) {
    setAccentColor(color);
    applyAccentColor(color);
    try {
      await updateSetting('accent_color', color);
      socket.emit('settings:updated');
      setSettingsToast('Accent color updated');
      setTimeout(() => setSettingsToast(''), 3000);
    } catch {
      setSettingsToast('Failed to save accent color');
      setTimeout(() => setSettingsToast(''), 3000);
    }
  }

  async function handleToggleShowDesc(value: boolean) {
    setShowItemDesc(value);
    try {
      await updateSetting('show_item_description', value ? 'true' : 'false');
      socket.emit('settings:updated');
    } catch {
      setShowItemDesc(!value); // revert on error
    }
  }

  async function handleSaveOrderPrefix() {
    const trimmed = orderPrefixInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!/^[A-Z]{1,4}$/.test(trimmed)) {
      setPrefixError('Prefix must be 1–4 letters only');
      return;
    }
    setPrefixSaving(true);
    setPrefixError('');
    try {
      await updateSetting('order_prefix', trimmed);
      setOrderPrefix(trimmed);
      setEditingPrefix(false);
      socket.emit('settings:updated');
      setSettingsToast('Order prefix updated');
      setTimeout(() => setSettingsToast(''), 3000);
    } catch {
      setPrefixError('Failed to save. Try again.');
    } finally {
      setPrefixSaving(false);
    }
  }

  async function handleToggleOrderConfirm(value: boolean) {
    setOrderConfirm(value);
    try {
      await updateSetting('order_confirmation', value ? 'true' : 'false');
      socket.emit('settings:updated');
    } catch {
      setOrderConfirm(!value); // revert on error
    }
  }

  async function handleToggleNotifEnabled(value: boolean) {
    setNotifEnabled(value);
    try {
      await updateSetting('notification_enabled', value ? 'true' : 'false');
      socket.emit('settings:updated');
    } catch {
      setNotifEnabled(!value);
    }
  }

  async function handleSoundUpload(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setNotifUploadErr('File must be under 2MB');
      return;
    }
    setNotifUploading(true);
    setNotifUploadErr('');
    setNotifUploadPct(0);
    try {
      const formData = new FormData();
      formData.append('sound', file);
      const token = localStorage.getItem('token');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:3000/api/settings/notification-sound');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = e => { if (e.lengthComputable) setNotifUploadPct(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const { filename } = JSON.parse(xhr.responseText);
            setNotifSound(filename);
            setSettingsToast('Sound uploaded');
            setTimeout(() => setSettingsToast(''), 3000);
            resolve();
          } else {
            reject(new Error(JSON.parse(xhr.responseText)?.error ?? 'Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
    } catch (err: unknown) {
      setNotifUploadErr((err as Error).message ?? 'Upload failed');
    } finally {
      setNotifUploading(false);
      setNotifUploadPct(0);
    }
  }

  async function handleDeleteSound() {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/settings/notification-sound', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifSound('');
      setSettingsToast('Reset to default beep');
      setTimeout(() => setSettingsToast(''), 3000);
    } catch {
      setSettingsToast('Failed to reset sound');
      setTimeout(() => setSettingsToast(''), 3000);
    }
  }

  function handlePreviewSound() {
    if (notifSound) {
      const audio = new Audio(`http://localhost:3000/sounds/${notifSound}`);
      audio.play().catch(() => {});
    } else {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', minHeight: 0 }}>
      {/* Page title */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid #2C2C2C' }}>
        <h1 className="text-white font-semibold text-lg">Settings</h1>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 min-h-0" style={{ overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <nav
          className="flex flex-col py-2"
          style={{ width: 220, flexShrink: 0, backgroundColor: '#111111', borderRight: '1px solid #2C2C2C', overflowY: 'auto' }}
        >
          {NAV_ITEMS.map(item => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-2.5 text-left w-full transition-colors"
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  backgroundColor: active ? 'rgba(192,57,43,0.08)' : 'transparent',
                  color: active ? '#ffffff' : '#606060',
                  borderLeft: active ? '3px solid #C0392B' : '3px solid transparent',
                  border: 'none',

                  cursor: 'pointer',
                  outline: 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ── Content area ── */}
        <div className="flex-1 p-6" style={{ overflowY: 'auto' }}>

      {/* ── Account Security ── */}
      {activeSection === 'account' && (
      <div className="flex flex-col gap-5 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', maxWidth: 600 }}>
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

        {/* ── Username ── */}
        <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-2">
            <IconUser size={14} color="#606060" />
            <span style={{ fontSize: 12, color: '#606060', letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase' }}>Username</span>
          </div>

          {!unEditing ? (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 500 }}>{user?.username ?? '—'}</span>
              <button
                onClick={() => { setNewUsername(user?.username ?? ''); setUnError(''); setUnEditing(true); }}
                className="flex items-center gap-1"
                style={{ backgroundColor: 'transparent', border: '1px solid #2C2C2C', borderRadius: 6, padding: '4px 10px', color: '#606060', fontSize: 12, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#606060'; }}
              >
                <IconEdit size={12} />
                Edit
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* New username input */}
              <div className="flex flex-col">
                <label style={labelStyle}>New Username</label>
                <input
                  autoFocus
                  value={newUsername}
                  onChange={e => { setNewUsername(e.target.value); setUnError(''); }}
                  placeholder="At least 3 characters, no spaces"
                  style={inputStyle(unF1)}
                  onFocus={() => setUnF1(true)}
                  onBlur={() => setUnF1(false)}
                />
              </div>

              {/* Password confirmation */}
              <PasswordField
                label="Current Password"
                value={unPassword}
                onChange={v => { setUnPassword(v); setUnError(''); }}
                placeholder="Enter current password to confirm"
                focused={unF2}
                onFocus={() => setUnF2(true)}
                onBlur={() => setUnF2(false)}
              />

              {unError && <p style={{ fontSize: 12, color: '#C0392B' }}>{unError}</p>}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleChangeUsername}
                  disabled={unLoading}
                  style={{ backgroundColor: unLoading ? '#2C2C2C' : '#C0392B', border: 'none', borderRadius: 8, padding: '9px 18px', color: unLoading ? '#606060' : '#ffffff', fontSize: 13, fontWeight: 600, cursor: unLoading ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (!unLoading) e.currentTarget.style.backgroundColor = '#96281B'; }}
                  onMouseLeave={e => { if (!unLoading) e.currentTarget.style.backgroundColor = '#C0392B'; }}
                >
                  {unLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setUnEditing(false); setNewUsername(''); setUnPassword(''); setUnError(''); }}
                  style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8, padding: '9px 14px', color: '#A0A0A0', fontSize: 13, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#A0A0A0'; }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      )}

      {/* ── Staff Management ── */}
      {activeSection === 'staff' && (
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', maxWidth: 600 }}>
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

      )}

      {/* ── System Settings ── */}
      {activeSection === 'system' && (
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', maxWidth: 600 }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <IconBuildingStore size={16} color="#C0392B" />
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

      </div>
      )}

      {/* ── Payment Methods ── */}
      {activeSection === 'payment' && (
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', maxWidth: 600 }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <IconCreditCard size={16} color="#C0392B" />
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Payment Methods</span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Method list */}
          <div className="flex flex-col gap-2">
            {paymentMethods.map(m => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  backgroundColor: '#1A1A1A',
                  border: `1px solid ${m.is_default ? 'rgba(192,57,43,0.4)' : '#2C2C2C'}`,
                  opacity: m.is_active ? 1 : 0.5,
                }}
              >
                <button
                  onClick={() => handleSetDefault(m.id)}
                  title={m.is_default ? 'Default method' : 'Set as default'}
                  style={{ lineHeight: 0, color: m.is_default ? '#F4C430' : '#606060', cursor: m.is_default ? 'default' : 'pointer' }}
                  onMouseEnter={e => { if (!m.is_default) e.currentTarget.style.color = '#F4C430'; }}
                  onMouseLeave={e => { if (!m.is_default) e.currentTarget.style.color = '#606060'; }}
                >
                  {m.is_default ? <IconStarFilled size={15} /> : <IconStar size={15} />}
                </button>
                <input
                  type="color"
                  title="Change color"
                  value={m.color ?? '#606060'}
                  onChange={e => handleColorChange(m.id, e.target.value)}
                  style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.15)', padding: 0 }}
                />
                <span style={{ flex: 1, fontSize: 13, color: m.is_active ? '#ffffff' : '#606060', fontWeight: m.is_default ? 600 : 400 }}>
                  {m.name}
                </span>
                {m.is_default && (
                  <span style={{ fontSize: 10, color: '#C0392B', backgroundColor: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
                    Default
                  </span>
                )}
                <button
                  onClick={() => handleToggleMethod(m.id, !m.is_active)}
                  style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: m.is_active ? 'rgba(243,156,18,0.1)' : 'rgba(39,174,96,0.1)', border: `1px solid ${m.is_active ? 'rgba(243,156,18,0.3)' : 'rgba(39,174,96,0.3)'}`, color: m.is_active ? '#F39C12' : '#27AE60' }}
                  title={m.is_active ? 'Disable' : 'Enable'}
                >
                  {m.is_active ? <IconLock size={12} /> : <IconLockOpen size={12} />}
                </button>
                <button
                  onClick={() => setDeleteMethodTarget(m)}
                  style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: '#C0392B' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
                >
                  <IconTrash size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add new method */}
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                value={newMethodName}
                onChange={e => { setNewMethodName(e.target.value); setAddMethodError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAddPaymentMethod()}
                placeholder="New payment method name"
                style={{ flex: 1, backgroundColor: '#1A1A1A', border: `1px solid ${addMethodError ? '#C0392B' : '#2C2C2C'}`, borderRadius: 8, padding: '7px 12px', color: '#ffffff', fontSize: 13, outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
                onBlur={e => (e.currentTarget.style.borderColor = addMethodError ? '#C0392B' : '#2C2C2C')}
              />
              <button
                onClick={handleAddPaymentMethod}
                disabled={addingMethod || !newMethodName.trim()}
                className="flex items-center gap-1"
                style={{ backgroundColor: addingMethod || !newMethodName.trim() ? '#2C2C2C' : '#C0392B', border: 'none', borderRadius: 8, padding: '7px 14px', color: addingMethod || !newMethodName.trim() ? '#606060' : '#ffffff', fontSize: 13, fontWeight: 600, cursor: addingMethod || !newMethodName.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { if (!addingMethod && newMethodName.trim()) e.currentTarget.style.backgroundColor = '#96281B'; }}
                onMouseLeave={e => { if (!addingMethod && newMethodName.trim()) e.currentTarget.style.backgroundColor = '#C0392B'; }}
              >
                <IconPlus size={13} />
                Add
              </button>
            </div>
            {addMethodError && <p style={{ fontSize: 12, color: '#C0392B' }}>{addMethodError}</p>}
          </div>
          <p style={{ fontSize: 11, color: '#606060' }}>Click the <IconStar size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> star to set the default. Default method is pre-selected in the cashier panel.</p>
        </div>
      </div>
      )}



      {/* ── Display & Appearance ── */}
      {activeSection === 'appearance' && (
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', maxWidth: 600 }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <IconPalette size={16} color="#C0392B" />
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Display &amp; Appearance</span>
        </div>

        {/* Accent Color */}
        <div className="flex flex-col gap-3">
          <label style={{ fontSize: 12, color: '#606060', letterSpacing: '0.04em' }}>Accent Color</label>
          <div className="flex items-center gap-3">
            {ACCENT_PRESETS.map(({ color, label }) => {
              const selected = accentColor === color;
              return (
                <button
                  key={color}
                  title={label}
                  onClick={() => handleAccentColorChange(color)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: selected ? '3px solid #ffffff' : '3px solid transparent',
                    boxShadow: selected ? `0 0 0 2px ${color}` : 'none',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                />
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: '#606060' }}>Applied to buttons, highlights, and interactive elements.</p>
        </div>

        {/* Show Item Descriptions */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #2C2C2C' }}>
          <div className="flex flex-col gap-0.5">
            <span style={{ fontSize: 13, color: '#ffffff' }}>Show item descriptions on menu cards</span>
            <span style={{ fontSize: 11, color: '#606060' }}>Displays the item description below the name in the cashier menu grid.</span>
          </div>
          {/* Toggle switch */}
          <button
            role="switch"
            aria-checked={showItemDesc}
            onClick={() => handleToggleShowDesc(!showItemDesc)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: showItemDesc ? '#C0392B' : '#2C2C2C',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
              transition: 'background-color 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: showItemDesc ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>
      </div>

      )}

      {/* ── Order Settings ── */}
      {activeSection === 'orders' && (
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', maxWidth: 600 }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <IconReceipt size={16} color="#C0392B" />
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Order Settings</span>
        </div>

        {/* Order Number Prefix */}
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, color: '#606060', letterSpacing: '0.04em' }}>Order Number Prefix</label>
          {editingPrefix ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={orderPrefixInput}
                  onChange={e => {
                    const v = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4);
                    setOrderPrefixInput(v);
                    setPrefixError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveOrderPrefix();
                    if (e.key === 'Escape') { setEditingPrefix(false); setPrefixError(''); }
                  }}
                  maxLength={4}
                  placeholder="1–4 letters"
                  style={{
                    flex: 1, backgroundColor: '#1A1A1A',
                    border: `1px solid ${prefixError ? '#C0392B' : '#C0392B'}`,
                    borderRadius: 8, padding: '8px 12px',
                    color: '#ffffff', fontSize: 13, outline: 'none',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  onClick={handleSaveOrderPrefix}
                  disabled={prefixSaving || !orderPrefixInput.trim()}
                  style={{
                    backgroundColor: prefixSaving || !orderPrefixInput.trim() ? '#2C2C2C' : '#C0392B',
                    border: 'none', borderRadius: 8, padding: '8px 14px',
                    color: prefixSaving || !orderPrefixInput.trim() ? '#606060' : '#ffffff',
                    fontSize: 13, fontWeight: 600,
                    cursor: prefixSaving || !orderPrefixInput.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {prefixSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingPrefix(false); setPrefixError(''); }}
                  style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8, padding: '8px 12px', color: '#A0A0A0', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
              {prefixError && <p style={{ fontSize: 12, color: '#C0392B' }}>{prefixError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 500 }}>{orderPrefix}</span>
              <button
                onClick={() => { setOrderPrefixInput(orderPrefix); setEditingPrefix(true); }}
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
          <p style={{ fontSize: 11, color: '#606060' }}>
            Orders will appear as <span style={{ color: '#A0A0A0', fontWeight: 500 }}>{orderPrefix}-001, {orderPrefix}-002…</span>
          </p>
        </div>

        {/* Order Confirmation Dialog */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #2C2C2C' }}>
          <div className="flex flex-col gap-0.5">
            <span style={{ fontSize: 13, color: '#ffffff' }}>Show confirmation before placing order</span>
            <span style={{ fontSize: 11, color: '#606060' }}>Cashier must confirm before submitting each order.</span>
          </div>
          <button
            role="switch"
            aria-checked={orderConfirm}
            onClick={() => handleToggleOrderConfirm(!orderConfirm)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: orderConfirm ? '#C0392B' : '#2C2C2C',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
              transition: 'background-color 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: orderConfirm ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>
      </div>

      )}



      {/* ── Notifications ── */}
      {activeSection === 'notifications' && (
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', maxWidth: 600 }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <IconBell size={16} color="#C0392B" />
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Notifications</span>
        </div>

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span style={{ fontSize: 13, color: '#ffffff' }}>Play sound when new order arrives</span>
            <span style={{ fontSize: 11, color: '#606060' }}>Plays on the kitchen display when a new order is received.</span>
          </div>
          <button
            role="switch"
            aria-checked={notifEnabled}
            onClick={() => handleToggleNotifEnabled(!notifEnabled)}
            style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: notifEnabled ? '#C0392B' : '#2C2C2C', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s' }}
          >
            <span style={{ position: 'absolute', top: 3, left: notifEnabled ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#ffffff', transition: 'left 0.2s' }} />
          </button>
        </div>

        {/* Sound file */}
        <div className="flex flex-col gap-3 pt-3" style={{ borderTop: '1px solid #2C2C2C' }}>
          <label style={{ fontSize: 12, color: '#606060', letterSpacing: '0.04em' }}>Notification Sound</label>

          {/* Current sound */}
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: '#ffffff' }}>{notifSound || 'Default beep'}</span>
              {notifSound && <p style={{ fontSize: 11, color: '#606060', marginTop: 2 }}>Custom sound file</p>}
            </div>
            <button
              onClick={handlePreviewSound}
              className="flex items-center gap-1"
              style={{ backgroundColor: '#242424', border: '1px solid #2C2C2C', borderRadius: 6, padding: '5px 10px', color: '#A0A0A0', fontSize: 12, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = '#2C2C2C'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#A0A0A0'; e.currentTarget.style.backgroundColor = '#242424'; }}
            >
              <IconPlayerPlay size={12} />
              Preview
            </button>
            {notifSound && (
              <button
                onClick={handleDeleteSound}
                className="flex items-center gap-1"
                style={{ backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 6, padding: '5px 10px', color: '#C0392B', fontSize: 12, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
              >
                Reset to Default
              </button>
            )}
          </div>

          {/* Upload button */}
          <div className="flex flex-col gap-1.5">
            <label
              className="flex items-center gap-2 self-start"
              style={{
                backgroundColor: notifUploading ? '#2C2C2C' : '#C0392B',
                border: 'none', borderRadius: 8, padding: '8px 14px',
                color: notifUploading ? '#606060' : '#ffffff',
                fontSize: 13, fontWeight: 600,
                cursor: notifUploading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!notifUploading) (e.currentTarget as HTMLElement).style.backgroundColor = '#96281B'; }}
              onMouseLeave={e => { if (!notifUploading) (e.currentTarget as HTMLElement).style.backgroundColor = '#C0392B'; }}
            >
              <IconUpload size={13} />
              {notifUploading ? `Uploading… ${notifUploadPct}%` : 'Upload Sound'}
              <input
                type="file"
                accept=".mp3,.wav,.ogg"
                className="hidden"
                disabled={notifUploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleSoundUpload(f); e.target.value = ''; }}
              />
            </label>
            {notifUploadErr && <p style={{ fontSize: 12, color: '#C0392B' }}>{notifUploadErr}</p>}
            <p style={{ fontSize: 11, color: '#606060' }}>MP3, WAV, or OGG — max 2MB</p>
          </div>
        </div>
      </div>
      )}

        </div>{/* end content area */}
      </div>{/* end two-column */}

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

      {deleteMethodTarget && (
        <ConfirmDialog
          title="Delete Payment Method"
          message={`Delete "${deleteMethodTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDeleteMethod}
          onCancel={() => setDeleteMethodTarget(null)}
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

      {unSuccess && (
        <div
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl z-50"
          style={{ backgroundColor: '#111111', border: '1px solid rgba(39,174,96,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(39,174,96,0.2)' }}>
            <IconCheck size={12} color="#27AE60" />
          </div>
          <span style={{ fontSize: 13, color: '#27AE60' }}>Username updated successfully</span>
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
