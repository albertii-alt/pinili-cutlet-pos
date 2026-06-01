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
import SettingsPage from '../pages/owner/SettingsPage';
import AuditLogsPage from '../pages/owner/AuditLogsPage';
import ExpensesPage from '../pages/owner/ExpensesPage';
import ShiftReportPage from '../pages/owner/ShiftReportPage';
import AboutPage from '../pages/owner/AboutPage';
import HelpPage from '../pages/owner/HelpPage';
import SystemStatusPage from '../pages/owner/SystemStatusPage';
import SupportPage from '../pages/owner/SupportPage';
import Topbar from '../components/shared/Topbar';
import Sidebar from '../components/shared/Sidebar';

function OwnerShell() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'owner') return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar showBrand />
        <main className="flex-1 overflow-y-auto pt-[76px] p-6 hide-scrollbar">
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
      { path: 'settings',   element: <SettingsPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'expenses',       element: <ExpensesPage /> },
      { path: 'shift-reports',  element: <ShiftReportPage /> },
      { path: 'about',          element: <AboutPage /> },
      { path: 'help',           element: <HelpPage /> },
      { path: 'system-status', element: <SystemStatusPage /> },
      { path: 'support',       element: <SupportPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
