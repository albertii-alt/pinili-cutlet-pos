import { useState, useEffect, useCallback } from 'react';
import {
  IconCash,
  IconCheck,
  IconX,
  IconLock,
  IconLockOpen,
  IconPencil,
} from '@tabler/icons-react';
import { CashDrawer } from '../../types';
import { getTodayDrawer, setOpeningAmount, closeDrawer } from '../../api/cashDrawer.api';
import { formatCurrency } from '../../utils/formatCurrency';

// ─── Close Drawer Modal ───────────────────────────────────────────────────────

interface CloseDrawerModalProps {
  drawer: CashDrawer;
  onClose: () => void;
  onConfirm: (actual: number, notes: string) => Promise<void>;
}

function CloseDrawerModal({ drawer, onClose, onConfirm }: CloseDrawerModalProps) {
  const [actualInput, setActualInput] = useState('');
  const [notes, setNotes]             = useState('');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const actual      = parseFloat(actualInput);
  const hasActual   = !isNaN(actual) && actualInput.trim() !== '';
  const discrepancy = hasActual ? actual - drawer.expected_amount : null;

  async function handleConfirm() {
    if (!hasActual || actual < 0) {
      setError('Enter a valid cash count (0 or more).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onConfirm(actual, notes);
    } catch {
      setError('Failed to close drawer. Try again.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          width: 420,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #2C2C2C' }}
        >
          <div className="flex items-center gap-2">
            <IconLock size={16} color="#C0392B" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Close Cash Drawer</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#606060', display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {/* Expected amount (read-only) */}
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}
          >
            <span style={{ fontSize: 12, color: '#606060' }}>Expected in drawer</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
              {formatCurrency(drawer.expected_amount)}
            </span>
          </div>

          {/* Actual cash count input */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#A0A0A0' }}>Actual cash count</label>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, color: '#606060' }}>₱</span>
              <input
                autoFocus
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={actualInput}
                onChange={e => { setActualInput(e.target.value); setError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                style={{
                  flex: 1,
                  backgroundColor: '#1A1A1A',
                  border: `1px solid ${error ? '#C0392B' : '#2C2C2C'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
                onBlur={e => (e.currentTarget.style.borderColor = error ? '#C0392B' : '#2C2C2C')}
              />
            </div>
            {error && <span style={{ fontSize: 11, color: '#C0392B' }}>{error}</span>}
          </div>

          {/* Live discrepancy preview */}
          {discrepancy !== null && (
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{
                backgroundColor: discrepancy < 0
                  ? 'rgba(192,57,43,0.08)'
                  : discrepancy > 0
                    ? 'rgba(39,174,96,0.08)'
                    : 'rgba(160,160,160,0.06)',
                border: `1px solid ${
                  discrepancy < 0
                    ? 'rgba(192,57,43,0.25)'
                    : discrepancy > 0
                      ? 'rgba(39,174,96,0.25)'
                      : '#2C2C2C'
                }`,
              }}
            >
              <span style={{ fontSize: 12, color: '#A0A0A0' }}>Discrepancy</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: discrepancy < 0 ? '#C0392B' : discrepancy > 0 ? '#27AE60' : '#606060',
                }}
              >
                {discrepancy >= 0 ? '+' : ''}{formatCurrency(discrepancy)}
              </span>
            </div>
          )}

          {/* Notes (optional) */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#A0A0A0' }}>Notes <span style={{ color: '#606060' }}>(optional)</span></label>
            <textarea
              rows={2}
              placeholder="Any remarks about the count..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2C2C2C',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: 13,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-5 py-4"
          style={{ borderTop: '1px solid #2C2C2C' }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '7px 16px',
              color: '#A0A0A0',
              fontSize: 13,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || !hasActual}
            style={{
              backgroundColor: saving || !hasActual ? 'rgba(192,57,43,0.4)' : '#C0392B',
              border: 'none',
              borderRadius: 8,
              padding: '7px 16px',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: saving || !hasActual ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={e => { if (!saving && hasActual) e.currentTarget.style.backgroundColor = '#96281B'; }}
            onMouseLeave={e => { if (!saving && hasActual) e.currentTarget.style.backgroundColor = '#C0392B'; }}
          >
            {saving
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <IconLock size={13} />
            }
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export default function CashDrawerCard() {
  const [drawer, setDrawer]           = useState<CashDrawer | null>(null);
  const [loading, setLoading]         = useState(true);

  // Opening amount inline edit
  const [editingOpening, setEditingOpening] = useState(false);
  const [openingInput, setOpeningInput]     = useState('');
  const [openingSaving, setOpeningSaving]   = useState(false);
  const [openingError, setOpeningError]     = useState<string | null>(null);

  // Close drawer modal
  const [showCloseModal, setShowCloseModal] = useState(false);

  const fetchDrawer = useCallback(() => {
    setLoading(true);
    getTodayDrawer()
      .then(setDrawer)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDrawer(); }, [fetchDrawer]);

  // ── Opening amount handlers ──────────────────────────────────────────────

  function startEditOpening() {
    setOpeningInput(drawer ? String(drawer.opening_amount) : '0');
    setOpeningError(null);
    setEditingOpening(true);
  }

  function cancelEditOpening() {
    setEditingOpening(false);
    setOpeningError(null);
  }

  async function handleSaveOpening() {
    const val = parseFloat(openingInput);
    if (isNaN(val) || val < 0) {
      setOpeningError('Enter a valid amount (0 or more).');
      return;
    }
    setOpeningSaving(true);
    setOpeningError(null);
    try {
      const updated = await setOpeningAmount(val);
      setDrawer(updated);
      setEditingOpening(false);
    } catch {
      setOpeningError('Failed to save. Try again.');
    } finally {
      setOpeningSaving(false);
    }
  }

  // ── Close drawer handler ─────────────────────────────────────────────────

  async function handleCloseDrawer(actual: number, notes: string) {
    const updated = await closeDrawer(actual, notes);
    setDrawer(updated);
    setShowCloseModal(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const isClosed = !!drawer?.closed_at;

  return (
    <>
      <div
        className="flex flex-col gap-3"
        style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 12, padding: 16 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(39,174,96,0.1)' }}
            >
              <IconCash size={16} color="#27AE60" />
            </div>
            <span style={{ fontSize: 12, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Cash Drawer
            </span>
          </div>

          {/* Status badge */}
          {!loading && drawer && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 4,
                padding: '2px 8px',
                backgroundColor: isClosed ? 'rgba(192,57,43,0.1)' : 'rgba(39,174,96,0.1)',
                color: isClosed ? '#C0392B' : '#27AE60',
                border: `1px solid ${isClosed ? 'rgba(192,57,43,0.25)' : 'rgba(39,174,96,0.25)'}`,
              }}
            >
              {isClosed ? 'Closed' : 'Open'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : drawer ? (
          <>
            {/* Amounts grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Opening */}
              <div
                className="flex flex-col gap-1 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
              >
                <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Opening</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                  {formatCurrency(drawer.opening_amount)}
                </span>
              </div>

              {/* Expected */}
              <div
                className="flex flex-col gap-1 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
              >
                <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expected</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                  {formatCurrency(drawer.expected_amount)}
                </span>
              </div>

              {/* Actual (only when closed) */}
              <div
                className="flex flex-col gap-1 rounded-lg px-3 py-2.5"
                style={{
                  backgroundColor: '#111111',
                  border: `1px solid ${
                    isClosed && drawer.discrepancy !== null
                      ? drawer.discrepancy < 0
                        ? 'rgba(192,57,43,0.3)'
                        : drawer.discrepancy > 0
                          ? 'rgba(39,174,96,0.3)'
                          : '#2C2C2C'
                      : '#2C2C2C'
                  }`,
                }}
              >
                <span style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actual</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: isClosed ? '#ffffff' : '#404040' }}>
                  {isClosed && drawer.actual_amount !== null ? formatCurrency(drawer.actual_amount) : '—'}
                </span>
              </div>
            </div>

            {/* Discrepancy row (only when closed) */}
            {isClosed && drawer.discrepancy !== null && (
              <div
                className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{
                  backgroundColor: drawer.discrepancy < 0
                    ? 'rgba(192,57,43,0.06)'
                    : drawer.discrepancy > 0
                      ? 'rgba(39,174,96,0.06)'
                      : 'rgba(160,160,160,0.04)',
                  border: `1px solid ${
                    drawer.discrepancy < 0
                      ? 'rgba(192,57,43,0.2)'
                      : drawer.discrepancy > 0
                        ? 'rgba(39,174,96,0.2)'
                        : '#2C2C2C'
                  }`,
                }}
              >
                <span style={{ fontSize: 12, color: '#A0A0A0' }}>Discrepancy</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: drawer.discrepancy < 0 ? '#C0392B' : drawer.discrepancy > 0 ? '#27AE60' : '#606060',
                  }}
                >
                  {drawer.discrepancy >= 0 ? '+' : ''}{formatCurrency(drawer.discrepancy)}
                </span>
              </div>
            )}

            {/* Notes (if closed and has notes) */}
            {isClosed && drawer.notes && (
              <p style={{ fontSize: 12, color: '#606060', fontStyle: 'italic' }}>
                "{drawer.notes}"
              </p>
            )}

            {/* Action buttons (only when open) */}
            {!isClosed && (
              <div className="flex items-center gap-2 pt-1">
                {/* Set Opening Cash — inline edit */}
                {editingOpening ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <span style={{ fontSize: 13, color: '#606060' }}>₱</span>
                    <input
                      autoFocus
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={openingInput}
                      onChange={e => { setOpeningInput(e.target.value); setOpeningError(null); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveOpening();
                        if (e.key === 'Escape') cancelEditOpening();
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#242424',
                        border: `1px solid ${openingError ? '#C0392B' : '#2C2C2C'}`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        color: '#ffffff',
                        fontSize: 13,
                        outline: 'none',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#27AE60')}
                      onBlur={e => (e.currentTarget.style.borderColor = openingError ? '#C0392B' : '#2C2C2C')}
                    />
                    <button
                      onClick={handleSaveOpening}
                      disabled={openingSaving}
                      style={{
                        backgroundColor: '#27AE60',
                        border: 'none',
                        borderRadius: 6,
                        padding: '5px 8px',
                        cursor: openingSaving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onMouseEnter={e => { if (!openingSaving) e.currentTarget.style.backgroundColor = '#1E8449'; }}
                      onMouseLeave={e => { if (!openingSaving) e.currentTarget.style.backgroundColor = '#27AE60'; }}
                    >
                      {openingSaving
                        ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        : <IconCheck size={13} color="#ffffff" />
                      }
                    </button>
                    <button
                      onClick={cancelEditOpening}
                      style={{
                        backgroundColor: '#242424',
                        border: '1px solid #2C2C2C',
                        borderRadius: 6,
                        padding: '5px 8px',
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
                    onClick={startEditOpening}
                    className="flex items-center gap-1.5"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #2C2C2C',
                      borderRadius: 8,
                      padding: '6px 12px',
                      color: '#A0A0A0',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A0A0A0'; }}
                  >
                    <IconPencil size={12} />
                    Set Opening Cash
                  </button>
                )}

                {/* Close Drawer button */}
                {!editingOpening && (
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="flex items-center gap-1.5 ml-auto"
                    style={{
                      backgroundColor: 'rgba(192,57,43,0.08)',
                      border: '1px solid rgba(192,57,43,0.3)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      color: '#C0392B',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
                  >
                    <IconLockOpen size={13} />
                    Close Drawer
                  </button>
                )}
              </div>
            )}

            {/* Validation error for opening input */}
            {openingError && (
              <span style={{ fontSize: 11, color: '#C0392B' }}>{openingError}</span>
            )}

            {/* Closed-at timestamp */}
            {isClosed && drawer.closed_at && (
              <p style={{ fontSize: 11, color: '#404040' }}>
                Closed at {drawer.closed_at}
              </p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, color: '#606060' }}>Unable to load drawer data.</p>
        )}
      </div>

      {showCloseModal && drawer && (
        <CloseDrawerModal
          drawer={drawer}
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleCloseDrawer}
        />
      )}
    </>
  );
}
