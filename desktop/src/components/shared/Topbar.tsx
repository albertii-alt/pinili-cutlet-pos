import { useState } from 'react';
import { IconLogout, IconQrcode, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth.api';
import { disconnectSocket } from '../../socket/socket';
import { useNavigate } from 'react-router-dom';
import QRCodeModal from './QRCodeModal';
import LogoutModal from './LogoutModal';
import NotificationBell from './NotificationBell';

interface TopbarButtonProps {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  danger?: boolean;
}

interface TopbarProps {
  left?: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function TopbarButton({ onClick, tooltip, children, danger = false }: TopbarButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border transition-all duration-150"
        style={{
          backgroundColor: hovered
            ? danger ? 'rgba(192,57,43,0.1)' : '#242424'
            : '#1A1A1A',
          color: hovered
            ? danger ? '#C0392B' : '#ffffff'
            : '#A0A0A0',
        }}
      >
        {children}
      </button>
      {hovered && (
        <div className="absolute top-full right-0 mt-1.5 px-2 py-1 bg-cardLight border border-border rounded-md text-xs text-white whitespace-nowrap z-50">
          {tooltip}
        </div>
      )}
    </div>
  );
}

export default function Topbar({ left, collapsed, onToggleCollapse }: TopbarProps) {
  const { user, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
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
      <header
        className="h-[52px] flex items-center justify-between px-4 shrink-0"
        style={{ backgroundColor: '#111111' }}
      >
        {/* Left — collapse toggle (owner shell) or custom content (cashier pages) */}
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border transition-all duration-150"
              style={{ backgroundColor: '#1A1A1A', color: '#A0A0A0', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <IconLayoutSidebarLeftExpand size={18} />
                : <IconLayoutSidebarLeftCollapse size={18} />
              }
            </button>
          )}
          {left && <div>{left}</div>}
        </div>

        {/* Right — user info + action buttons */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                style={{ backgroundColor: avatarUrl ? 'transparent' : '#C0392B', flexShrink: 0 }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  : avatarLetter
                }
              </div>
              {/* Username */}
              <span style={{ fontSize: 13, color: '#A0A0A0' }}>{user.username}</span>
            </div>
          )}

          {/* Notification bell — owner only */}
          {user?.role === 'owner' && (
            <NotificationBell />
          )}

          {/* QR button — cashier only */}
          {user?.role === 'cashier' && (
            <TopbarButton onClick={() => setShowQR(true)} tooltip="Show QR Code">
              <IconQrcode size={18} />
            </TopbarButton>
          )}

          {/* Logout button */}
          {user && (
            <TopbarButton onClick={() => setShowLogout(true)} tooltip="Logout" danger>
              <IconLogout size={18} />
            </TopbarButton>
          )}
        </div>
      </header>

      {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </>
  );
}
