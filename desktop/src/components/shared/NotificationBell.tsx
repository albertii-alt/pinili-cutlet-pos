import { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconBell, IconBellOff, IconX, IconCheck,
  IconAlertTriangle, IconTrophy, IconShieldExclamation,
  IconCash, IconDatabaseExport, IconShoppingCartOff,
} from '@tabler/icons-react';
import {
  getNotifications, getUnreadCount,
  markAsRead, markAllAsRead, deleteNotification,
} from '../../api/notification.api';
import { Notification } from '../../types';
import socket from '../../socket/socket';

// ─── Type icon + color ────────────────────────────────────────────────────────

function typeStyle(type: string): { icon: React.ReactNode; color: string } {
  switch (type) {
    case 'order_cancelled':
      return { icon: <IconShoppingCartOff size={15} />, color: '#C0392B' };
    case 'target_warning':
      return { icon: <IconAlertTriangle size={15} />, color: '#F39C12' };
    case 'target_achieved':
      return { icon: <IconTrophy size={15} />, color: '#27AE60' };
    case 'security':
      return { icon: <IconShieldExclamation size={15} />, color: '#C0392B' };
    case 'drawer_warning':
      return { icon: <IconCash size={15} />, color: '#F39C12' };
    case 'backup':
      return { icon: <IconDatabaseExport size={15} />, color: '#27AE60' };
    default:
      return { icon: <IconBell size={15} />, color: '#A0A0A0' };
  }
}

// ─── Relative time ────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const panelRef                          = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    getNotifications()
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter(n => n.is_read === 0).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initial load + socket listener
  useEffect(() => {
    // Fetch unread count on mount (lightweight)
    getUnreadCount().then(setUnreadCount).catch(() => {});

    function handleNew(notif: Notification) {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(c => c + 1);
    }
    socket.on('notification:new', handleNew);
    return () => { socket.off('notification:new', handleNew); };
  }, []);

  // Fetch full list when panel opens
  useEffect(() => {
    if (open) fetchAll();
  }, [open, fetchAll]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleMarkRead(id: number) {
    await markAsRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllAsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  }

  async function handleDelete(id: number, isUnread: boolean) {
    await deleteNotification(id).catch(() => {});
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (isUnread) setUnreadCount(c => Math.max(0, c - 1));
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: open ? '#242424' : '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: 8,
          color: open ? '#ffffff' : '#A0A0A0',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; } }}
      >
        <IconBell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            backgroundColor: '#C0392B', color: '#ffffff',
            fontSize: 9, fontWeight: 700,
            borderRadius: 99, minWidth: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', lineHeight: 1,
            border: '1.5px solid #111111',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 320, maxHeight: 480,
            backgroundColor: '#111111',
            border: '1px solid #2C2C2C',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #2C2C2C', flexShrink: 0 }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1"
                style={{ backgroundColor: 'transparent', border: 'none', color: '#606060', fontSize: 11, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#606060'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <IconCheck size={11} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex flex-col overflow-y-auto hide-scrollbar" style={{ flex: 1 }}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <IconBellOff size={32} color="#2C2C2C" />
                <span style={{ fontSize: 12, color: '#606060' }}>No notifications</span>
              </div>
            ) : (
              notifications.map(n => {
                const { icon, color } = typeStyle(n.type);
                const isUnread = n.is_read === 0;
                return (
                  <div
                    key={n.id}
                    onClick={() => { if (isUnread) handleMarkRead(n.id); }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 14px',
                      backgroundColor: isUnread ? '#1A1A1A' : '#111111',
                      borderLeft: isUnread ? `3px solid ${color}` : '3px solid transparent',
                      borderBottom: '1px solid #1E1E1E',
                      cursor: isUnread ? 'pointer' : 'default',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1E1E1E'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = isUnread ? '#1A1A1A' : '#111111'; }}
                  >
                    {/* Type icon */}
                    <div
                      className="flex items-center justify-center shrink-0 rounded-lg"
                      style={{ width: 28, height: 28, backgroundColor: `${color}18`, color, marginTop: 1 }}
                    >
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{n.title}</span>
                      <span style={{ fontSize: 11, color: '#A0A0A0', lineHeight: 1.4 }}>{n.message}</span>
                      <span style={{ fontSize: 10, color: '#606060', marginTop: 2 }}>{relativeTime(n.created_at)}</span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(n.id, isUnread); }}
                      style={{ background: 'none', border: 'none', color: '#404040', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0, marginTop: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C0392B')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#404040')}
                    >
                      <IconX size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
