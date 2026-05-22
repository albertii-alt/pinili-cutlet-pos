import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import { connectSocket } from '../../socket/socket';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { token, user } = await login(username.trim(), password);

      if (user.role !== 'owner') {
        setError('Only the owner can access this area');
        return;
      }

      setAuth(token, user);
      connectSocket();
      navigate('/owner/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="bg-card border border-border rounded-2xl w-[360px] p-6 flex flex-col gap-5">
        {/* Brand */}
        <div className="text-center">
          <h1 className="font-bold tracking-widest text-lg">
            <span className="text-white">PINILI</span>{' '}
            <span className="text-primary">CUTLET</span>
          </h1>
          <p className="text-textGray text-xs mt-1">Owner Access</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full bg-cardLight border border-border rounded-lg px-3 py-2 pr-10 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-white transition-colors"
            >
              {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
            </button>
          </div>
        </div>

        {/* Error — always occupies space */}
        <p className="text-danger text-xs min-h-[16px] -mt-2">{error}</p>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Back to cashier */}
        <button
          onClick={() => navigate('/')}
          className="text-textMuted text-xs text-center hover:text-white transition-colors"
        >
          ← Back to Cashier
        </button>
      </div>
    </div>
  );
}
