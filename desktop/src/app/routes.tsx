import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import LoginPage from '../pages/auth/LoginPage';
import CashierLoginPage from '../pages/auth/CashierLoginPage';
import OrderPage from '../pages/cashier/OrderPage';
import QueuePage from '../pages/cashier/QueuePage';
import DashboardPage from '../pages/owner/DashboardPage';
import MenuPage from '../pages/owner/MenuPage';
import HistoryPage from '../pages/owner/HistoryPage';
import AnalyticsPage from '../pages/owner/AnalyticsPage';
import Topbar from '../components/shared/Topbar';
import Sidebar from '../components/shared/Sidebar';

function OwnerShell() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'owner') return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto pt-[52px] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function CashierShell() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || (user?.role !== 'cashier' && user?.role !== 'kitchen')) {
    return <Navigate to="/cashier-login" replace />;
  }
  return <Outlet />;
}

export const routes: RouteObject[] = [
  { path: '/cashier-login', element: <CashierLoginPage /> },
  { path: '/login',         element: <LoginPage /> },
  {
    path: '/',
    element: <CashierShell />,
    children: [
      { index: true,    element: <OrderPage /> },
      { path: 'queue',  element: <QueuePage /> },
    ],
  },
  {
    path: '/owner',
    element: <OwnerShell />,
    children: [
      { index: true,       element: <Navigate to="/owner/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'menu',      element: <MenuPage /> },
      { path: 'history',   element: <HistoryPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
