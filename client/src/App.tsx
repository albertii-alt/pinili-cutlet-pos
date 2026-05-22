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

function DefaultRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'kitchen' ? '/queue' : '/order'} replace />;
}

const router = createBrowserRouter([
  { path: '/connect', element: <ConnectPage /> },
  { path: '/login',   element: <LoginPage /> },
  { path: '/order',   element: <RequireCashier><OrderPage /></RequireCashier> },
  { path: '/queue',   element: <RequireAuth><QueuePage /></RequireAuth> },
  { path: '/',        element: <DefaultRedirect /> },
  { path: '*',        element: <DefaultRedirect /> },
]);

type AppState = 'checking' | 'ready' | 'no-server';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const [appState, setAppState] = useState<AppState>('checking');
  const [connectError, setConnectError] = useState('');

  useEffect(() => {
    const ip   = localStorage.getItem('server_ip');
    const port = localStorage.getItem('server_port') ?? '3000';

    if (!ip) {
      setAppState('no-server');
      return;
    }

    // Update Axios base URL from saved IP
    updateBaseURL(ip, port);

    // Silently test connection
    axios.get(`http://${ip}:${port}/health`, { timeout: 5000 })
      .then(() => setAppState('ready'))
      .catch(() => {
        setConnectError('Cannot reach server. The network may have changed.');
        setAppState('no-server');
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated && appState === 'ready') connectSocket();
    return () => { disconnectSocket(); };
  }, [isAuthenticated, appState]);

  if (appState === 'checking') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (appState === 'no-server') {
    return <ConnectPage error={connectError} />;
  }

  return <RouterProvider router={router} />;
}
