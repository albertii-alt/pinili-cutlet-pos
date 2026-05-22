import { IconLogout } from '@tabler/icons-react';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../api/auth.api';
import { disconnectSocket } from '../../socket/socket';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    disconnectSocket();
    clearAuth();
    navigate('/cashier-login');
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-[52px] bg-card border-b border-border flex items-center justify-between px-4 z-50">
      <span className="font-bold tracking-widest text-sm">
        <span className="text-white">PINILI</span>{' '}
        <span className="text-primary">CUTLET</span>
      </span>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-xs text-textGray capitalize bg-cardLight border border-border px-2 py-1 rounded-md">
            {user.role}
          </span>
        )}
        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-textGray hover:text-white transition-colors"
          >
            <IconLogout size={15} />
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
