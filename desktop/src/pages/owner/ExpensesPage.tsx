import { useState, useEffect, useCallback } from 'react';
import {
  IconReceipt2,
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import {
  getExpenses,
  getExpenseSummary,
  addExpense,
  updateExpense,
  deleteExpense,
  type ExpensePeriod,
} from '../../api/expense.api';
import { Expense, ExpenseSummary, EXPENSE_CATEGORIES } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS: { label: string; value: ExpensePeriod }[] = [
  { label: 'All',        value: 'all'        },
  { label: 'Today',      value: 'today'      },
  { label: 'This Week',  value: 'week'       },
  { label: 'This Month', value: 'month'      },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom',     value: 'custom'     },
];

const PAGE_SIZE = 50;

// Distinct color per category
const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Ingredients:  { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60' },
  Utilities:    { bg: 'rgba(52,152,219,0.12)',   color: '#3498DB' },
  'Staff Meals':{ bg: 'rgba(243,156,18,0.12)',   color: '#F39C12' },
  Packaging:    { bg: 'rgba(155,89,182,0.12)',   color: '#9B59B6' },
  Transport:    { bg: 'rgba(26,188,156,0.12)',   color: '#1ABC9C' },
  Maintenance:  { bg: 'rgba(230,126,34,0.12)',   color: '#E67E22' },
  Other:        { bg: 'rgba(160,160,160,0.10)',  color: '#A0A0A0' },
};

function categoryStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Other'];
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const s = categoryStyle(category);
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 600,
      borderRadius: 4,
      padding: '2px 7px',
      whiteSpace: 'nowrap',
    }}>
      {category}
    </span>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface ExpenseModalProps {
  initial?: Expense;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function ExpenseModal({ initial, onClose, onSaved }: ExpenseModalProps) {
  const isEdit = !!initial;
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount]           = useState(initial ? String(initial.amount) : '');
  const [category, setCategory]       = useState(initial?.category ?? 'Other');
  const [date, setDate]               = useState(initial?.date ?? todayISO());
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!description.trim())                          e.description = 'Description is required.';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Enter a valid positive amount.';
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      let saved: Expense;
      if (isEdit && initial) {
        saved = await updateExpense(initial.id, {
          description: description.trim(),
          amount: Number(amount),
          category,
          date,
        });
      } else {
        saved = await addExpense({
          description: description.trim(),
          amount: Number(amount),
          category,
          date,
        });
      }
      onSaved(saved);
    } catch {
      setErrors({ general: 'Failed to save. Please try again.' });
      setSaving(false);
    }
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    backgroundColor: '#1A1A1A',
    border: `1px solid ${hasError ? '#C0392B' : '#2C2C2C'}`,
    borderRadius: 8,
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  });

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', borderRadius: 16, width: 440, overflow: 'hidden' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <div className="flex items-center gap-2">
            <IconReceipt2 size={16} color="#C0392B" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>
              {isEdit ? 'Edit Expense' : 'Add Expense'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#606060', display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {errors.general && (
            <p style={{ fontSize: 12, color: '#C0392B' }}>{errors.general}</p>
          )}

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#A0A0A0' }}>Description <span style={{ color: '#C0392B' }}>*</span></label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Cooking oil, Electric bill..."
              value={description}
              onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={inputStyle(!!errors.description)}
              onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
              onBlur={e => (e.currentTarget.style.borderColor = errors.description ? '#C0392B' : '#2C2C2C')}
            />
            {errors.description && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.description}</span>}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: '#A0A0A0' }}>Amount <span style={{ color: '#C0392B' }}>*</span></label>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, color: '#606060' }}>₱</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: '' })); }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={{ ...inputStyle(!!errors.amount), flex: 1, width: 'auto' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
                onBlur={e => (e.currentTarget.style.borderColor = errors.amount ? '#C0392B' : '#2C2C2C')}
              />
            </div>
            {errors.amount && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.amount}</span>}
          </div>

          {/* Category + Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 12, color: '#A0A0A0' }}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ ...inputStyle(), cursor: 'pointer' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
                onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 12, color: '#A0A0A0' }}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ ...inputStyle(), colorScheme: 'dark' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
                onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid #2C2C2C' }}>
          <button onClick={onClose}
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8, padding: '7px 16px', color: '#A0A0A0', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ backgroundColor: saving ? 'rgba(192,57,43,0.4)' : '#C0392B', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#96281B'; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = '#C0392B'; }}
          >
            {saving
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <IconCheck size={13} />
            }
            {isEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const [period, setPeriod]           = useState<ExpensePeriod>('today');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [appliedStart, setAppliedStart] = useState('');
  const [appliedEnd, setAppliedEnd]     = useState('');

  const [expenses, setExpenses]       = useState<Expense[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [summary, setSummary]         = useState<ExpenseSummary | null>(null);
  const [loading, setLoading]         = useState(true);

  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Build filter params from current state
  function filterParams(p: number) {
    if (period === 'custom') {
      return { start_date: appliedStart || undefined, end_date: appliedEnd || undefined, limit: PAGE_SIZE, offset: (p - 1) * PAGE_SIZE };
    }
    return { period, limit: PAGE_SIZE, offset: (p - 1) * PAGE_SIZE };
  }

  function summaryParams() {
    if (period === 'custom') return { start_date: appliedStart || undefined, end_date: appliedEnd || undefined };
    return { period };
  }

  const fetchAll = useCallback((p: number) => {
    setLoading(true);
    Promise.all([
      getExpenses(filterParams(p)),
      getExpenseSummary(summaryParams()),
    ])
      .then(([list, sum]) => {
        setExpenses(list.data);
        setTotal(list.total);
        setSummary(sum);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, appliedStart, appliedEnd]);

  useEffect(() => {
    setPage(1);
    fetchAll(1);
  }, [fetchAll]);

  function handleApplyCustom() {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  }

  function handlePeriodChange(p: ExpensePeriod) {
    setPeriod(p);
    if (p !== 'custom') { setAppliedStart(''); setAppliedEnd(''); }
  }

  function handleSaved(_expense: Expense) {
    setShowModal(false);
    setEditTarget(null);
    fetchAll(page);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteExpense(deleteTarget.id);
    setDeleteTarget(null);
    fetchAll(page);
  }

  const awaitingRange = period === 'custom' && (!appliedStart || !appliedEnd);

  // Category breakdown bar chart
  const maxCatTotal = summary ? Math.max(...summary.breakdown.map(b => b.total), 1) : 1;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <IconReceipt2 size={18} color="#C0392B" />
          <h1 className="text-white font-semibold text-lg">Expenses</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period filters */}
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => handlePeriodChange(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p.value ? 'bg-primary text-white' : 'bg-card border border-border text-textGray hover:bg-cardLight'
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          {/* Add Expense */}
          <button onClick={() => { setEditTarget(null); setShowModal(true); }}
            style={{ backgroundColor: '#C0392B', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#96281B')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
          >
            <IconPlus size={14} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Custom date range row */}
      {period === 'custom' && (
        <div className="flex items-center gap-2 flex-wrap p-4 rounded-xl" style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}>
          <IconCalendar size={13} color="#606060" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: startDate ? '#ffffff' : '#606060', fontSize: 12, outline: 'none', colorScheme: 'dark' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          />
          <span style={{ fontSize: 12, color: '#606060' }}>to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 6, padding: '6px 10px', color: endDate ? '#ffffff' : '#606060', fontSize: 12, outline: 'none', colorScheme: 'dark' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          />
          <button onClick={handleApplyCustom} disabled={!startDate || !endDate}
            style={{ backgroundColor: (!startDate || !endDate) ? 'rgba(192,57,43,0.3)' : '#C0392B', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#ffffff', fontSize: 12, fontWeight: 600, cursor: (!startDate || !endDate) ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if (startDate && endDate) e.currentTarget.style.backgroundColor = '#96281B'; }}
            onMouseLeave={e => { if (startDate && endDate) e.currentTarget.style.backgroundColor = '#C0392B'; }}
          >
            Apply
          </button>
        </div>
      )}

      {awaitingRange ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconCalendar size={40} color="#2C2C2C" />
          <p style={{ fontSize: 14, color: '#606060' }}>Select a date range and press Apply</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            {/* Total Expenses */}
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#161616', border: '1px solid #2C2C2C' }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Expenses</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(192,57,43,0.1)' }}>
                  <IconReceipt2 size={18} color="#C0392B" />
                </div>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: summary && summary.total > 0 ? '#C0392B' : '#606060' }}>
                {formatCurrency(summary?.total ?? 0)}
              </span>
              <span style={{ fontSize: 11, color: '#606060' }}>{total} {total === 1 ? 'entry' : 'entries'}</span>
            </div>

            {/* Category count */}
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#161616', border: '1px solid #2C2C2C' }}>
              <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>By Category</span>
              {summary && summary.breakdown.length > 0 ? (
                <div className="flex flex-col gap-2 mt-1">
                  {summary.breakdown.map(b => {
                    const pct = maxCatTotal > 0 ? (b.total / maxCatTotal) * 100 : 0;
                    const s = categoryStyle(b.category);
                    return (
                      <div key={b.category} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 12, color: '#A0A0A0' }}>{b.category}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{formatCurrency(b.total)}</span>
                        </div>
                        <div style={{ height: 4, backgroundColor: '#2C2C2C', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: s.color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span style={{ fontSize: 13, color: '#606060' }}>No expenses yet</span>
              )}
            </div>
          </div>

          {/* Expense table */}
          <div className="border border-border rounded-xl overflow-hidden" style={{ backgroundColor: '#111111' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #2C2C2C' }}>
                  {['Date', 'Description', 'Category', 'Amount', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3"
                      style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, width: h === '' ? 80 : undefined }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#606060', fontSize: 13 }}>
                      No expenses found for this period
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp, i) => (
                    <tr key={exp.id}
                      className="border-b border-border last:border-0 transition-colors"
                      style={{ backgroundColor: i % 2 === 0 ? '#111111' : '#0A0A0A' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#111111' : '#0A0A0A')}
                    >
                      <td className="px-4 py-2.5" style={{ fontSize: 12, color: '#606060', whiteSpace: 'nowrap' }}>
                        {exp.date}
                      </td>
                      <td className="px-4 py-2.5" style={{ fontSize: 13, color: '#ffffff', maxWidth: 260 }}>
                        <span className="truncate block">{exp.description}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <CategoryBadge category={exp.category} />
                      </td>
                      <td className="px-4 py-2.5" style={{ fontSize: 13, fontWeight: 600, color: '#C0392B', whiteSpace: 'nowrap' }}>
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditTarget(exp); setShowModal(true); }} title="Edit"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, backgroundColor: 'transparent', border: '1px solid transparent', color: '#404040', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(52,152,219,0.1)'; e.currentTarget.style.borderColor = 'rgba(52,152,219,0.3)'; e.currentTarget.style.color = '#3498DB'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#404040'; }}
                          >
                            <IconPencil size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(exp)} title="Delete"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, backgroundColor: 'transparent', border: '1px solid transparent', color: '#404040', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(192,57,43,0.3)'; e.currentTarget.style.color = '#C0392B'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#404040'; }}
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: '#606060' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} entries
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', color: page === 1 ? '#404040' : '#A0A0A0', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (page > 1) e.currentTarget.style.backgroundColor = '#242424'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                >
                  <IconChevronLeft size={14} />
                </button>
                <span style={{ fontSize: 12, color: '#A0A0A0', padding: '0 8px' }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', color: page === totalPages ? '#404040' : '#A0A0A0', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.backgroundColor = '#242424'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                >
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <ExpenseModal
          initial={editTarget ?? undefined}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Expense"
          message={`Delete "${deleteTarget.description}" (${formatCurrency(deleteTarget.amount)})? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
