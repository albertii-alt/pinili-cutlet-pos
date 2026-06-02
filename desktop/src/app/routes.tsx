import { useState } from 'react';
import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
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
import ChangelogPage from '../pages/owner/ChangelogPage';
import Sidebar from '../components/shared/Sidebar';
import FloatingControls from '../components/shared/FloatingControls';

const STORAGE_KEY = 'sidebar_collapsed';

function getSavedCollapsed(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
  catch { return false; }
}

function OwnerShell() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'owner') return <Navigate to="/login" replace />;

  const [collapsed, setCollapsed] = useState<boolean>(getSavedCollapsed);

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-dark"
      style={{ '--sidebar-width': collapsed ? '56px' : '220px' } as React.CSSProperties}
    >
      {/* Sidebar + collapse toggle on its right edge */}
      <div className="relative flex-shrink-0">
        <Sidebar collapsed={collapsed} />

        {/* Collapse toggle — sits on the sidebar/content border, top-aligned */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute flex items-center justify-center transition-all duration-150"
          style={{
            top: 0,
            right: -12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: '#1A1A1A',
            border: '1px solid #2C2C2C',
            color: '#606060',
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#2C2C2C';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#1A1A1A';
            e.currentTarget.style.color = '#606060';
          }}
        >
          {collapsed
            ? <IconLayoutSidebarLeftExpand size={13} />
            : <IconLayoutSidebarLeftCollapse size={13} />
          }
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-6 pt-20 hide-scrollbar min-w-0 relative">
        <Outlet />
      </main>

      {/* Top fade — masks content scrolling under the floating bar */}
      <div
        className="pointer-events-none fixed z-40"
        style={{
          top: 0,
          left: 'var(--sidebar-width, 220px)',
          right: 0,
          height: 100,
          background: 'linear-gradient(to bottom, #0A0A0A 0%, rgba(10,10,10,0.85) 40%, transparent 100%)',
        }}
      />

      {/* Floating user controls */}
      <FloatingControls />
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
      { path: 'changelog',     element: <ChangelogPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
