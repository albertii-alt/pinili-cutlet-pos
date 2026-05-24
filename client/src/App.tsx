import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { connectSocket, disconnectSocket } from './socket/socket';
import LoginPage from './pages/auth/LoginPage';
import OrderPage from './pages/cashier/OrderPage';
import QueuePage from './pages/cashier/QueuePage';
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
  { path: '/login',  element: <LoginPage /> },
  { path: '/order',  element: <RequireCashier><OrderPage /></RequireCashier> },
  { path: '/queue',  element: <RequireAuth><QueuePage /></RequireAuth> },
  { path: '/',       element: <DefaultRedirect /> },
  { path: '*',       element: <DefaultRedirect /> },
], { basename: '/app' });

export default function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) connectSocket();
    return () => { disconnectSocket(); };
  }, [isAuthenticated]);

  return <RouterProvider router={router} />;
}
