import { useState, useEffect } from 'react';
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
  IconHeartbeat,
  IconHeadset,
  IconGitCommit,
} from '@tabler/icons-react';
import { useBrandName } from '../../hooks/useBrandName';

// ─── Nav structure ────────────────────────────────────────────────────────────

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { to: '/owner/dashboard',  label: 'Dashboard',     icon: IconLayoutDashboard },
      { to: '/owner/menu',       label: 'Menu',           icon: IconToolsKitchen2   },
      { to: '/owner/history',    label: 'History',        icon: IconHistory         },
      { to: '/owner/analytics',  label: 'Analytics',      icon: IconChartBar        },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/owner/expenses',      label: 'Expenses',      icon: IconReceipt2 },
      { to: '/owner/shift-reports', label: 'Shift Reports', icon: IconUsers    },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/owner/settings',      label: 'Settings',      icon: IconSettings    },
      { to: '/owner/audit-logs',    label: 'Audit Logs',    icon: IconShieldCheck },
      { to: '/owner/system-status', label: 'System Status', icon: IconHeartbeat   },
    ],
  },
  {
    label: 'Info',
    items: [
      { to: '/owner/support',   label: 'Support',   icon: IconHeadset    },
      { to: '/owner/help',      label: 'Help',      icon: IconHelp       },
      { to: '/owner/changelog', label: 'Changelog', icon: IconGitCommit  },
      { to: '/owner/about',     label: 'About',     icon: IconInfoCircle },
    ],
  },
];

function getAccentColor(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim() || '#C0392B';
}

// ─── Tooltip wrapper (shown only when collapsed) ──────────────────────────────

function NavTooltip({ label, collapsed, children }: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  if (!collapsed) return <>{children}</>;

  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: 10,
            backgroundColor: '#1A1A1A',
            border: '1px solid #2C2C2C',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            color: '#ffffff',
            whiteSpace: 'nowrap',
            zIndex: 100,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const [accentColor, setAccentColor] = useState<string>('#C0392B');
  const { stallName, logoUrl }        = useBrandName();

  // Sync accent color from CSS variable, re-read when it changes
  useEffect(() => {
    setAccentColor(getAccentColor());
    const observer = new MutationObserver(() => {
      setTimeout(() => setAccentColor(getAccentColor()), 50);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  // Split stall name for two-tone rendering (same as Topbar)
  const parts = stallName.trim().split(/\s+/);
  const first = parts[0] ?? stallName;
  const rest  = parts.slice(1).join(' ');

  const width = collapsed ? 56 : 220;

  return (
    <aside
      className="h-screen flex flex-col shrink-0 overflow-hidden border-r border-border"
      style={{
        width,
        minWidth: width,
        backgroundColor: '#111111',
        transition: 'width 0.2s ease, min-width 0.2s ease',
      }}
    >
      {/* ── Brand block ── */}
      <div
        className="flex flex-col items-center"
        style={{
          padding: collapsed ? '12px 0' : '16px 14px',
          gap: collapsed ? 0 : 8,
          transition: 'padding 0.2s ease',
        }}
      >
        {/* Logo */}
        <div
          className="rounded-xl flex items-center justify-center overflow-hidden shrink-0"
          style={{
            width:  collapsed ? 36 : 48,
            height: collapsed ? 36 : 48,
            backgroundColor: logoUrl ? 'transparent' : accentColor,
            transition: 'width 0.2s ease, height 0.2s ease',
            border: logoUrl ? '1px solid #2C2C2C' : 'none',
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={stallName}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span style={{
              fontSize: collapsed ? 15 : 20,
              fontWeight: 800,
              color: '#ffffff',
              transition: 'font-size 0.2s ease',
            }}>
              {first.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Stall name — hidden when collapsed */}
        {!collapsed && (
          <div className="text-center" style={{ lineHeight: 1.3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{first}</span>
            {rest && (
              <span style={{ fontSize: 13, fontWeight: 700, color: accentColor }}> {rest}</span>
            )}
          </div>
        )}
      </div>
      {/* Nav groups + version */}
      <nav className="flex flex-col flex-1 p-2 mt-1 gap-3 overflow-y-auto hide-scrollbar">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="flex flex-col gap-0.5">

            {/* Group label — hidden when collapsed */}
            {!collapsed && (
              <p
                className="px-3 mb-1"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#404040',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {group.label}
              </p>
            )}

            {/* Divider line when collapsed (replaces group label) */}
            {collapsed && (
              <div style={{ height: 1, backgroundColor: '#1E1E1E', margin: '2px 8px 4px' }} />
            )}

            {/* Group items */}
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavTooltip key={to} label={label} collapsed={collapsed}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg text-sm transition-all duration-150 border-l-[3px] ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'text-white font-medium'
                        : 'border-transparent text-textGray hover:bg-cardLight hover:text-white'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          backgroundColor: `${accentColor}14`,
                          borderLeftColor: accentColor,
                          borderLeftWidth: 3,
                          borderLeftStyle: 'solid',
                        }
                      : undefined
                  }
                >
                  <Icon size={18} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
                </NavLink>
              </NavTooltip>
            ))}
          </div>
        ))}

        {/* Version — at the bottom of the nav, hidden when collapsed */}
        {!collapsed && (
          <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #1E1E1E' }}>
            <p style={{ fontSize: 11, color: '#383838', paddingLeft: 12 }}>
              v{__APP_VERSION__}
            </p>
          </div>
        )}
      </nav>

      {/* Bottom border spacer */}
      <div className="border-t border-border" style={{ height: 1 }} />
    </aside>
  );
}
