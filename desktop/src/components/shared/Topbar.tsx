import { useState } from 'react';
import { IconLogout, IconQrcode } from '@tabler/icons-react';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth.api';
import { disconnectSocket } from '../../socket/socket';
import { useNavigate } from 'react-router-dom';
import QRCodeModal from './QRCodeModal';
import LogoutModal from './LogoutModal';

interface TopbarButtonProps {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  danger?: boolean;
}

interface TopbarProps {
  left?: React.ReactNode;
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

export default function Topbar({ left }: TopbarProps) {
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

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-[52px] border-b border-border flex items-center justify-between px-4 z-50"
        style={{ backgroundColor: '#111111' }}
      >
        {/* Left */}
        <div>{left}</div>

        {/* Right — user info + action buttons */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: '#C0392B' }}
              >
                {avatarLetter}
              </div>
              {/* Username */}
              <span className="text-textGray text-sm">{user.username}</span>
            </div>
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
