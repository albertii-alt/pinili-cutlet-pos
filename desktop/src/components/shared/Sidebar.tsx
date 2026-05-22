import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconToolsKitchen2,
  IconHistory,
  IconChartBar,
} from '@tabler/icons-react';

const navItems = [
  { to: '/owner/dashboard',  label: 'Dashboard',  icon: IconLayoutDashboard },
  { to: '/owner/menu',       label: 'Menu',        icon: IconToolsKitchen2   },
  { to: '/owner/history',    label: 'History',     icon: IconHistory         },
  { to: '/owner/analytics',  label: 'Analytics',   icon: IconChartBar        },
];

export default function Sidebar() {
  return (
    <aside className="w-[200px] min-h-screen bg-card border-r border-border pt-[52px] flex flex-col">
      <nav className="flex flex-col gap-1 p-3 mt-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-textGray hover:bg-cardLight hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
