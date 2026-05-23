import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconToolsKitchen2,
  IconHistory,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react';

const navItems = [
  { to: '/owner/dashboard',  label: 'Dashboard',  icon: IconLayoutDashboard },
  { to: '/owner/menu',       label: 'Menu',        icon: IconToolsKitchen2   },
  { to: '/owner/history',    label: 'History',     icon: IconHistory         },
  { to: '/owner/analytics',  label: 'Analytics',   icon: IconChartBar        },
  { to: '/owner/settings',   label: 'Settings',    icon: IconSettings        },
];

export default function Sidebar() {
  return (
    <aside
      className="w-[220px] h-screen flex flex-col shrink-0 overflow-hidden pt-[52px] border-r border-border"
      style={{ backgroundColor: '#111111' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="font-bold tracking-widest text-sm">
          <span className="text-white">PINILI</span>{' '}
          <span className="text-primary">CUTLET</span>
        </div>
        <p className="text-textMuted text-xs mt-0.5">POS System</p>
      </div>

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
