import { useState, useEffect, useCallback } from 'react';
import { IconShieldCheck, IconSearch, IconChevronLeft, IconChevronRight, IconRefresh, IconDeviceDesktop, IconDeviceMobile } from '@tabler/icons-react';
import { getAuditLogs } from '../../api/audit.api';
import { AuditLog } from '../../types';
import { formatDateTime } from '../../utils/formatDate';

// ─── Action badge ─────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  LOGIN:                  { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Login' },
  LOGOUT:                 { bg: 'rgba(39,174,96,0.08)',   color: '#27AE60', label: 'Logout' },
  LOGIN_FAILED:           { bg: 'rgba(192,57,43,0.12)',   color: '#C0392B', label: 'Login Failed' },
  PASSWORD_CHANGED:       { bg: 'rgba(52,152,219,0.12)',  color: '#3498DB', label: 'Password Changed' },
  USERNAME_CHANGED:       { bg: 'rgba(52,152,219,0.12)',  color: '#3498DB', label: 'Username Changed' },
  STAFF_CREATED:          { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Staff Created' },
  STAFF_UPDATED:          { bg: 'rgba(52,152,219,0.12)',  color: '#3498DB', label: 'Staff Updated' },
  STAFF_DELETED:          { bg: 'rgba(192,57,43,0.12)',   color: '#C0392B', label: 'Staff Deleted' },
  STAFF_ENABLED:          { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Staff Enabled' },
  STAFF_DISABLED:         { bg: 'rgba(243,156,18,0.12)',  color: '#F39C12', label: 'Staff Disabled' },
  MENU_ITEM_CREATED:      { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Item Added' },
  MENU_ITEM_UPDATED:      { bg: 'rgba(52,152,219,0.12)',  color: '#3498DB', label: 'Item Updated' },
  MENU_ITEM_DELETED:      { bg: 'rgba(192,57,43,0.12)',   color: '#C0392B', label: 'Item Deleted' },
  MENU_ITEM_AVAILABILITY: { bg: 'rgba(243,156,18,0.12)',  color: '#F39C12', label: 'Availability' },
  MENU_ITEM_PROMO:        { bg: 'rgba(243,156,18,0.12)',  color: '#F39C12', label: 'Promo Price' },
  ORDER_CANCELLED:        { bg: 'rgba(192,57,43,0.12)',   color: '#C0392B', label: 'Order Cancelled' },
  ORDER_CREATED:          { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Order Created' },
  ORDER_COMPLETED:        { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Order Completed' },
  CATEGORY_CREATED:       { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Category Created' },
  CATEGORY_DELETED:       { bg: 'rgba(192,57,43,0.12)',   color: '#C0392B', label: 'Category Deleted' },
  SETTING_CHANGED:        { bg: 'rgba(243,156,18,0.12)',  color: '#F39C12', label: 'Setting Changed' },
  SOUND_UPLOADED:         { bg: 'rgba(243,156,18,0.12)',  color: '#F39C12', label: 'Sound Uploaded' },
  BACKUP_CREATED:         { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Backup Created' },
  BACKUP_RESTORED:        { bg: 'rgba(192,57,43,0.12)',   color: '#C0392B', label: 'Backup Restored' },
};

function ActionBadge({ action }: { action: string }) {
  const style = ACTION_COLORS[action] ?? { bg: 'rgba(160,160,160,0.1)', color: '#A0A0A0', label: action };
  return (
    <span style={{ backgroundColor: style.bg, color: style.color, fontSize: 11, fontWeight: 600, borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>
      {style.label}
    </span>
  );
}

// ─── Unique action options for filter dropdown ────────────────────────────────

const ACTION_OPTIONS = Object.entries(ACTION_COLORS).map(([value, { label }]) => ({ value, label }));

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function AuditLogsPage() {
  const [logs, setLogs]           = useState<AuditLog[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  // Filters
  const [search, setSearch]       = useState('');
  const [action, setAction]       = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [applied, setApplied]     = useState({ search: '', action: '', startDate: '', endDate: '' });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchLogs = useCallback((p: number, filters: typeof applied) => {
    setLoading(true);
    getAuditLogs({
      offset: (p - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      username: filters.search || undefined,
      action: filters.action || undefined,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
    })
      .then(res => { setLogs(res.data); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLogs(page, applied); }, [page, applied, fetchLogs]);

  function handleApply() {
    setPage(1);
    setApplied({ search, action, startDate, endDate });
  }

  function handleReset() {
    setSearch(''); setAction(''); setStartDate(''); setEndDate('');
    setPage(1);
    setApplied({ search: '', action: '', startDate: '', endDate: '' });
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconShieldCheck size={18} color="#C0392B" />
          <h1 className="text-white font-semibold text-lg">Audit Logs</h1>
        </div>
        <button
          onClick={() => fetchLogs(page, applied)}
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8, padding: '6px 12px', color: '#A0A0A0', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
        >
          <IconRefresh size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-4 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}>
        {/* Search by username */}
        <div className="flex items-center gap-2 flex-1" style={{ minWidth: 160 }}>
          <IconSearch size={13} color="#606060" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            placeholder="Search username..."
            style={{ flex: 1, backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: '#ffffff', fontSize: 12, outline: 'none' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          />
        </div>

        {/* Action filter */}
        <select
          value={action}
          onChange={e => setAction(e.target.value)}
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: action ? '#ffffff' : '#606060', fontSize: 12, outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All actions</option>
          {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Date range */}
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: startDate ? '#ffffff' : '#606060', fontSize: 12, outline: 'none', colorScheme: 'dark' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
        />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: endDate ? '#ffffff' : '#606060', fontSize: 12, outline: 'none', colorScheme: 'dark' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
        />

        <button onClick={handleApply} style={{ backgroundColor: '#C0392B', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#ffffff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#96281B')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
        >Apply</button>
        <button onClick={handleReset} style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 14px', color: '#A0A0A0', fontSize: 12, cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
        >Reset</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden" style={{ backgroundColor: '#111111' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #2C2C2C' }}>
                {['Timestamp', 'User', 'Action', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#606060', fontSize: 13 }}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className="border-b border-border last:border-0 transition-colors"
                    style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0A0A0A' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#111111' : '#0A0A0A')}
                  >
                    <td className="px-4 py-2.5" style={{ fontSize: 12, color: '#606060', whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-2.5" style={{ fontSize: 13, color: '#ffffff', fontWeight: 500 }}>
                      {log.username}
                    </td>
                    <td className="px-4 py-2.5">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-2.5" style={{ fontSize: 12, color: '#A0A0A0', maxWidth: 360 }}>
                      {(() => {
                        const d = log.details ?? '';
                        const ipMatch     = d.match(/ip:\s*([^|]+)/);
                        const deviceMatch = d.match(/device:\s*(\S+)/);
                        const ip     = ipMatch?.[1]?.trim();
                        const device = deviceMatch?.[1]?.trim();
                        const plain  = d.replace(/\|?\s*ip:[^|]+/g, '').replace(/\|?\s*device:\S+/g, '').trim().replace(/\|\s*$/, '').trim();
                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            {plain && <span className="truncate">{plain}</span>}
                            {device === 'desktop' && <IconDeviceDesktop size={13} color="#3498DB" title="Desktop" />}
                            {device === 'web'     && <IconDeviceMobile  size={13} color="#27AE60" title="Web/Phone" />}
                            {ip && <span style={{ color: '#606060', fontSize: 11, whiteSpace: 'nowrap' }}>{ip}</span>}
                            {!plain && !device && !ip && '—'}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 12, color: '#606060' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', color: page === 1 ? '#404040' : '#A0A0A0', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (page > 1) e.currentTarget.style.backgroundColor = '#242424'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
            >
              <IconChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 12, color: '#A0A0A0', padding: '0 8px' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', color: page === totalPages ? '#404040' : '#A0A0A0', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.backgroundColor = '#242424'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
            >
              <IconChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
