import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import { connectSocket } from '../../socket/socket';
import { useBrandName } from '../../hooks/useBrandName';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const stallName  = useBrandName();
  const brandParts = stallName.trim().split(/\s+/);
  const brandFirst = brandParts[0] ?? stallName;
  const brandRest  = brandParts.slice(1).join(' ');

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { token, user } = await login(username.trim(), password);

      if (user.role === 'owner') {
        setError('Owner must use the desktop app');
        return;
      }

      setAuth(token, user);
      connectSocket();
      navigate(user.role === 'kitchen' ? '/queue' : '/order');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-[360px] p-6 flex flex-col gap-5">
        {/* Brand */}
        <div className="text-center">
          <h1 className="font-bold tracking-widest text-xl">
            <span className="text-white">{brandFirst.toUpperCase()}</span>
            {brandRest && <>{' '}<span className="text-primary">{brandRest.toUpperCase()}</span></>}
          </h1>
          <p className="text-textGray text-xs mt-1">Staff Login</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="bg-cardLight border border-border rounded-lg px-3 py-3 text-white text-base placeholder:text-textMuted focus:border-primary outline-none min-h-[44px]"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full bg-cardLight border border-border rounded-lg px-3 py-3 pr-12 text-white text-base placeholder:text-textMuted focus:border-primary outline-none min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </div>

        {/* Error */}
        <p className="text-danger text-xs min-h-[16px] -mt-2">{error}</p>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg py-3 text-base font-semibold min-h-[44px] transition-colors active:scale-95"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}
