import { useState, useEffect } from 'react';
import {
  IconLogout, IconQrcode, IconClock,
} from '@tabler/icons-react';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth.api';
import { disconnectSocket } from '../../socket/socket';
import { useNavigate } from 'react-router-dom';
import QRCodeModal from './QRCodeModal';
import LogoutModal from './LogoutModal';
import NotificationBell from './NotificationBell';

// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
  const secs  = now.toLocaleTimeString('en-PH', { second: '2-digit' }).replace(/[^0-9]/g, '').padStart(2, '0');

  const date = now.toLocaleDateString('en-PH', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
  });

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
        style={{ backgroundColor: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.2)' }}
      >
        <IconClock size={14} style={{ color: 'var(--accent-color, #C0392B)' }} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {hours}
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#404040', fontVariantNumeric: 'tabular-nums' }}>
          {secs}s
        </span>
        <span style={{ fontSize: 11, color: '#505050' }}>·</span>
        <span style={{ fontSize: 11, color: '#505050' }}>{date}</span>
      </div>
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  danger?: boolean;
}

function ActionButton({ onClick, tooltip, children, danger = false }: ActionButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
        style={{
          backgroundColor: hovered
            ? danger ? 'rgba(192,57,43,0.15)' : 'rgba(255,255,255,0.08)'
            : 'transparent',
          color: hovered
            ? danger ? '#C0392B' : '#ffffff'
            : '#606060',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {children}
      </button>
      {hovered && (
        <div
          className="absolute top-full right-0 mt-1.5 px-2 py-1 rounded-md text-xs text-white whitespace-nowrap z-50"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FloatingControls() {
  const { user, logout: clearAuth } = useAuthStore();
  const navigate                    = useNavigate();
  const [showQR, setShowQR]         = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    disconnectSocket();
    clearAuth();
    navigate('/cashier-login');
  }

  const avatarLetter = user?.username?.[0]?.toUpperCase() ?? '?';
  const SERVER_BASE  = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const avatarUrl    = user?.avatar_path ? `${SERVER_BASE}/avatars/${user.avatar_path}` : null;

  return (
    <>
      <div
        className="fixed z-50 flex items-center justify-between"
        style={{
          top: 12,
          left: 'calc(var(--sidebar-width, 220px) + 16px)',
          right: 16,
          backgroundColor: 'rgba(17,17,17,0.85)',
          border: '1px solid #2C2C2C',
          borderLeft: '2px solid var(--accent-color, #C0392B)',
          borderRadius: 12,
          padding: '7px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Left — live clock */}
        <LiveClock />

        {/* Right — user controls */}
        <div className="flex items-center gap-1">
          {/* Avatar + username */}
          {user && (
            <div
              className="flex items-center gap-2 mr-1 pr-3"
              style={{ borderRight: '1px solid #2C2C2C' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold overflow-hidden shrink-0"
                style={{
                  fontSize: 10,
                  backgroundColor: avatarUrl ? 'transparent' : 'var(--accent-color, #C0392B)',
                  outline: '2px solid rgba(192,57,43,0.35)',
                  outlineOffset: '1px',
                }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  : avatarLetter
                }
              </div>
              <span style={{ fontSize: 12, color: '#A0A0A0', whiteSpace: 'nowrap' }}>
                {user.username}
              </span>
            </div>
          )}

          {/* Notification bell — owner only */}
          {user?.role === 'owner' && <NotificationBell />}

          {/* QR button — cashier only */}
          {user?.role === 'cashier' && (
            <ActionButton onClick={() => setShowQR(true)} tooltip="Show QR Code">
              <IconQrcode size={16} />
            </ActionButton>
          )}

          {/* Logout */}
          {user && (
            <ActionButton onClick={() => setShowLogout(true)} tooltip="Logout" danger>
              <IconLogout size={16} />
            </ActionButton>
          )}
        </div>
      </div>

      {showQR     && <QRCodeModal onClose={() => setShowQR(false)} />}
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </>
  );
}
