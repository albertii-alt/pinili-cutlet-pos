import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff, IconAlertCircle } from '@tabler/icons-react';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/useAuthStore';
import { connectSocket } from '../../socket/socket';
import { getSettings } from '../../api/settings.api';
import { useAccentColor } from '../../hooks/useAccentColor';

export default function CashierLoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  useAccentColor();

  const [stallName, setStallName]       = useState('Pinili Cutlet');
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [userFocused, setUserFocused]   = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  useEffect(() => {
    getSettings().then(s => { if (s.stall_name) setStallName(s.stall_name); }).catch(() => {});
  }, []);

  const brandParts = stallName.trim().split(/\s+/);
  const brandFirst = brandParts[0] ?? stallName;
  const brandRest  = brandParts.slice(1).join(' ');

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    backgroundColor: '#1A1A1A',
    border: `1px solid ${focused ? 'var(--accent-color, #C0392B)' : '#2C2C2C'}`,
    boxShadow: focused ? '0 0 0 3px rgba(192,57,43,0.15)' : 'none',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#ffffff',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  });

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
        setError('Owner must use the Owner Login');
        return;
      }

      setAuth(token, user);
      connectSocket();
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0A0A0A 70%)' }}
    >
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          padding: '40px 36px',
          width: 360,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Branding */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.15em', lineHeight: 1 }}>
            <span className="text-white">{brandFirst.toUpperCase()}</span>
            {brandRest && <>{' '}<span style={{ color: 'var(--accent-color, #C0392B)' }}>{brandRest.toUpperCase()}</span></>}
          </h1>
          <p style={{ fontSize: 11, color: '#606060', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Staff Login
          </p>
          <div style={{ width: 40, height: 2, backgroundColor: 'var(--accent-color, #C0392B)', borderRadius: 2, marginTop: 4 }} />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#606060', letterSpacing: '0.05em' }}>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              style={inputStyle(userFocused)}
              onFocus={() => setUserFocused(true)}
              onBlur={() => setUserFocused(false)}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#606060', letterSpacing: '0.05em' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{ ...inputStyle(passFocused), paddingRight: 40 }}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#606060' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          {/* Error row */}
          <div style={{ minHeight: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            {error && (
              <>
                <IconAlertCircle size={14} color="#C0392B" />
                <span style={{ fontSize: 12, color: '#C0392B' }}>{error}</span>
              </>
            )}
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#2C2C2C' : 'var(--accent-color, #C0392B)',
              color: loading ? '#606060' : '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: 14,
              fontWeight: 700,
              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-color-dark, #96281B)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-color, #C0392B)'; }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16, height: 16,
                  border: '2px solid #606060',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </div>

        {/* Owner login link */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center justify-center gap-1.5 w-full mt-6 transition-colors"
          style={{ color: '#606060', fontSize: 13 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
        >
          Owner? Login here →
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
