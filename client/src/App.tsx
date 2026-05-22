import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { connectSocket, disconnectSocket } from './socket/socket';
import { updateBaseURL } from './api/client';
import axios from 'axios';
import LoginPage from './pages/auth/LoginPage';
import OrderPage from './pages/cashier/OrderPage';
import QueuePage from './pages/cashier/QueuePage';
import ConnectPage from './pages/connect/ConnectPage';
import './index.css';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireCashier({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'kitchen') return <Navigate to="/queue" replace />;
  return <>{children}</>;
}

type CheckState = 'checking' | 'no-server' | 'ready';

function AppRoot() {
  const { isAuthenticated, user } = useAuthStore();
  const [state, setState]         = useState<CheckState>('checking');
  const [connectError, setConnectError] = useState('');

  useEffect(() => {
    const ip   = localStorage.getItem('server_ip');
    const port = localStorage.getItem('server_port') ?? '3001';

    if (!ip) { setState('no-server'); return; }

    updateBaseURL(ip, port);

    axios.get(`https://${ip}:${port}/health`, { timeout: 5000 })
      .then(() => {
        if (isAuthenticated) connectSocket();
        setState('ready');
      })
      .catch(() => {
        setConnectError('Cannot reach server. The network may have changed.');
        setState('no-server');
      });

    return () => { disconnectSocket(); };
  }, []);

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'no-server') {
    return <ConnectPage error={connectError} />;
  }

  // Server reachable — redirect based on auth state
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'kitchen' ? '/queue' : '/order'} replace />;
}

const router = createBrowserRouter([
  { path: '/',        element: <AppRoot /> },
  { path: '/connect', element: <ConnectPage /> },
  { path: '/login',   element: <LoginPage /> },
  { path: '/order',   element: <RequireCashier><OrderPage /></RequireCashier> },
  { path: '/queue',   element: <RequireAuth><QueuePage /></RequireAuth> },
  { path: '*',        element: <Navigate to="/" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
