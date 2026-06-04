import { useState } from 'react';
import { IconTarget, IconPencil, IconCheck, IconX } from '@tabler/icons-react';
import { setDailyTarget } from '../../api/analytics.api';
import { formatCurrency } from '../../utils/formatCurrency';

interface DailySalesTargetProps {
  totalSales: number;
  dailyTarget: number;
  onTargetUpdated: (newTarget: number) => void;
}

function getBarColor(pct: number): string {
  if (pct >= 100) return '#C0392B'; // red — at or over target
  if (pct >= 80)  return '#F39C12'; // amber — close
  return getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#27AE60';
}

export default function DailySalesTarget({ totalSales, dailyTarget, onTargetUpdated }: DailySalesTargetProps) {
  const [editing, setEditing]   = useState(false);
  const [input, setInput]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const hasTarget = dailyTarget > 0;
  const pct       = hasTarget ? Math.min((totalSales / dailyTarget) * 100, 100) : 0;
  const pctRaw    = hasTarget ? (totalSales / dailyTarget) * 100 : 0;
  const barColor  = getBarColor(pctRaw);

  function startEdit() {
    setInput(dailyTarget > 0 ? String(dailyTarget) : '');
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    const val = parseFloat(input);
    if (isNaN(val) || val < 0) {
      setError('Enter a valid amount (0 or more).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await setDailyTarget(val);
      onTargetUpdated(updated);
      setEditing(false);
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') cancelEdit();
  }

  return (
    <div
      className="flex flex-col gap-3"
      style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 12, padding: 16 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(var(--accent-color-rgb, 192,57,43),0.1)' }}
          >
            <IconTarget size={16} color="var(--accent-color, #C0392B)" />
          </div>
          <span style={{ fontSize: 12, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Daily Sales Target
          </span>
        </div>

        {/* Edit / inline input */}
        {editing ? (
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 13, color: '#606060' }}>₱</span>
            <input
              autoFocus
              type="number"
              min="0"
              value={input}
              onChange={e => { setInput(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
              style={{
                backgroundColor: '#242424',
                border: `1px solid ${error ? '#C0392B' : '#2C2C2C'}`,
                borderRadius: 6,
                padding: '3px 8px',
                color: '#ffffff',
                fontSize: 13,
                width: 100,
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = error ? '#C0392B' : '#C0392B')}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: 'var(--accent-color, #C0392B)',
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = 'var(--accent-color-dark, #96281B)'; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = 'var(--accent-color, #C0392B)'; }}
            >
              {saving
                ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                : <IconCheck size={13} color="#ffffff" />
              }
            </button>
            <button
              onClick={cancelEdit}
              style={{
                backgroundColor: '#242424',
                border: '1px solid #2C2C2C',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2C2C2C')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#242424')}
            >
              <IconX size={13} color="#606060" />
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="flex items-center gap-1"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #2C2C2C',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#606060',
              fontSize: 12,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#A0A0A0'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#606060'; }}
          >
            <IconPencil size={12} />
            {hasTarget ? 'Edit' : 'Set Target'}
          </button>
        )}
      </div>

      {/* Validation error */}
      {error && (
        <span style={{ fontSize: 11, color: '#C0392B' }}>{error}</span>
      )}

      {/* No target set — empty state */}
      {!hasTarget && !editing ? (
        <p style={{ fontSize: 13, color: '#606060' }}>
          No daily target set. Click "Set Target" to add one.
        </p>
      ) : hasTarget ? (
        <>
          {/* Sales vs target label */}
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>
                {formatCurrency(totalSales)}
              </span>
              <span style={{ fontSize: 13, color: '#606060' }}>
                of {formatCurrency(dailyTarget)}
              </span>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: barColor,
              }}
            >
              {pctRaw >= 100 ? `${pctRaw.toFixed(0)}%` : `${pctRaw.toFixed(1)}%`}
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 6,
              backgroundColor: '#2C2C2C',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: barColor,
                borderRadius: 99,
                transition: 'width 0.4s ease, background-color 0.3s ease',
              }}
            />
          </div>

          {/* Status label */}
          <p style={{ fontSize: 11, color: '#606060' }}>
            {pctRaw >= 100
              ? `Target reached — ${formatCurrency(totalSales - dailyTarget)} over`
              : `${formatCurrency(dailyTarget - totalSales)} remaining to reach today's target`
            }
          </p>
        </>
      ) : null}
    </div>
  );
}
