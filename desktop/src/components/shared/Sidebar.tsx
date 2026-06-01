import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconToolsKitchen2,
  IconHistory,
  IconChartBar,
  IconSettings,
  IconShieldCheck,
  IconReceipt2,
  IconUsers,
  IconInfoCircle,
  IconHelp,
} from '@tabler/icons-react';

const navItems = [
  { to: '/owner/dashboard',      label: 'Dashboard',     icon: IconLayoutDashboard },
  { to: '/owner/menu',           label: 'Menu',           icon: IconToolsKitchen2   },
  { to: '/owner/history',        label: 'History',        icon: IconHistory         },
  { to: '/owner/analytics',      label: 'Analytics',      icon: IconChartBar        },
  { to: '/owner/expenses',       label: 'Expenses',       icon: IconReceipt2        },
  { to: '/owner/shift-reports',  label: 'Shift Reports',  icon: IconUsers           },
  { to: '/owner/settings',       label: 'Settings',       icon: IconSettings        },
  { to: '/owner/audit-logs',     label: 'Audit Logs',     icon: IconShieldCheck     },
  { to: '/owner/help',           label: 'Help',           icon: IconHelp            },
  { to: '/owner/about',          label: 'About',          icon: IconInfoCircle      },
];

export default function Sidebar() {
  return (
    <aside
      className="w-[220px] h-screen flex flex-col shrink-0 overflow-hidden pt-[52px] border-r border-border"
      style={{ backgroundColor: '#111111' }}
    >
      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-3 flex-1 mt-1 hide-scrollbar">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 border-l-[3px] ${
                isActive
                  ? 'border-primary text-white font-medium'
                  : 'border-transparent text-textGray hover:bg-cardLight hover:text-white'
              }`
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: 'rgba(192,57,43,0.08)' } : undefined
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Version label */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-textMuted text-xs">v1.0.0</p>
      </div>
    </aside>
  );
}
