import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconToolsKitchen2,
  IconHistory,
  IconChartBar,
  IconSettings,
  IconShieldCheck,
} from '@tabler/icons-react';
import { getSettings } from '../../api/settings.api';
import socket from '../../socket/socket';

const navItems = [
  { to: '/owner/dashboard',  label: 'Dashboard',  icon: IconLayoutDashboard },
  { to: '/owner/menu',       label: 'Menu',        icon: IconToolsKitchen2   },
  { to: '/owner/history',    label: 'History',     icon: IconHistory         },
  { to: '/owner/analytics',  label: 'Analytics',   icon: IconChartBar        },
  { to: '/owner/settings',   label: 'Settings',    icon: IconSettings        },
  { to: '/owner/audit-logs', label: 'Audit Logs',  icon: IconShieldCheck     },
];

export default function Sidebar() {
  const [stallName, setStallName] = useState('Pinili Cutlet');

  useEffect(() => {
    getSettings()
      .then(s => { if (s.stall_name) setStallName(s.stall_name); })
      .catch(() => {/* keep default */});

    function handleSettingsUpdated({ key, value }: { key: string; value: string }) {
      if (key === 'stall_name') setStallName(value);
    }
    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, []);

  // Split into two words for brand display; fallback gracefully
  const parts = stallName.trim().split(/\s+/);
  const first = parts[0] ?? stallName;
  const rest  = parts.slice(1).join(' ');
  return (
    <aside
      className="w-[220px] h-screen flex flex-col shrink-0 overflow-hidden pt-[52px] border-r border-border"
      style={{ backgroundColor: '#111111' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="font-bold tracking-widest text-sm">
          <span className="text-white">{first.toUpperCase()}</span>
          {rest && <>{' '}<span className="text-primary">{rest.toUpperCase()}</span></>}
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
