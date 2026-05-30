import { Request, Response } from 'express';
import db from '../database/db';
import { logAudit } from '../utils/auditLogger';

export const EXPENSE_CATEGORIES = [
  'Ingredients',
  'Utilities',
  'Staff Meals',
  'Packaging',
  'Transport',
  'Maintenance',
  'Other',
] as const;

interface ExpenseRow {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_by: number | null;
  created_at: string;
}

type AuthedRequest = Request & { user?: { id: number; username: string } };

/** Builds WHERE clause + params from period/date query params. */
function buildDateFilter(query: {
  period?: string;
  start_date?: string;
  end_date?: string;
}): { where: string; params: (string | number)[] } {
  const { period, start_date, end_date } = query;
  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (period === 'today') {
    where += " AND date = date('now','localtime')";
  } else if (period === 'week') {
    where += " AND date >= date('now','localtime','-6 days')";
  } else if (period === 'month') {
    where += " AND date >= date('now','localtime','start of month')";
  } else {
    if (start_date) { where += ' AND date >= ?'; params.push(start_date); }
    if (end_date)   { where += ' AND date <= ?'; params.push(end_date); }
  }

  return { where, params };
}

// ─── GET / ────────────────────────────────────────────────────────────────────

export function getExpenses(req: Request, res: Response): void {
  const { period, start_date, end_date, limit, offset } = req.query as {
    period?: string;
    start_date?: string;
    end_date?: string;
    limit?: string;
    offset?: string;
  };

  const pageSize = Math.min(200, Math.max(1, parseInt(limit  ?? '100', 10)));
  const skip     = Math.max(0,              parseInt(offset ?? '0',   10));

  const { where, params } = buildDateFilter({ period, start_date, end_date });

  const total = (db.prepare(`SELECT COUNT(*) as c FROM expenses ${where}`).get(...params) as { c: number }).c;
  const rows  = db.prepare(`SELECT * FROM expenses ${where} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, skip) as ExpenseRow[];

  res.json({ data: rows, total, limit: pageSize, offset: skip });
}

// ─── GET /summary ─────────────────────────────────────────────────────────────

export function getExpenseSummary(req: Request, res: Response): void {
  const { period, start_date, end_date } = req.query as {
    period?: string;
    start_date?: string;
    end_date?: string;
  };

  const { where, params } = buildDateFilter({ period, start_date, end_date });

  const totalRow = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses ${where}`)
    .get(...params) as { total: number };

  const breakdown = db.prepare(`
    SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM expenses ${where}
    GROUP BY category
    ORDER BY total DESC
  `).all(...params) as { category: string; total: number; count: number }[];

  res.json({ total: totalRow.total, breakdown });
}

// ─── POST / ───────────────────────────────────────────────────────────────────

export function addExpense(req: AuthedRequest, res: Response): void {
  const { description, amount, category, date } = req.body as {
    description?: string;
    amount?: number;
    category?: string;
    date?: string;
  };

  if (!description?.trim()) {
    res.status(400).json({ error: 'Description is required.' });
    return;
  }
  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number.' });
    return;
  }

  const cat      = EXPENSE_CATEGORIES.includes(category as typeof EXPENSE_CATEGORIES[number])
    ? category!
    : 'Other';
  const expDate  = date ?? new Date().toISOString().substring(0, 10);
  const userId   = req.user?.id ?? null;

  const result = db.prepare(`
    INSERT INTO expenses (description, amount, category, date, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(description.trim(), Number(amount), cat, expDate, userId);

  logAudit({
    user_id:     userId,
    username:    req.user?.username ?? 'owner',
    action:      'EXPENSE_ADDED',
    entity_type: 'expense',
    entity_id:   String(result.lastInsertRowid),
    details:     `description: ${description.trim()} | amount: ${Number(amount).toFixed(2)} | category: ${cat} | date: ${expDate}`,
  });

  const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as ExpenseRow;
  res.status(201).json(created);
}

// ─── PUT /:id ─────────────────────────────────────────────────────────────────

export function updateExpense(req: AuthedRequest, res: Response): void {
  const { id } = req.params;
  const { description, amount, category, date } = req.body as {
    description?: string;
    amount?: number;
    category?: string;
    date?: string;
  };

  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as ExpenseRow | undefined;
  if (!existing) { res.status(404).json({ error: 'Expense not found.' }); return; }

  const newDesc   = description?.trim()  ?? existing.description;
  const newAmount = amount !== undefined  ? Number(amount) : existing.amount;
  const newCat    = EXPENSE_CATEGORIES.includes(category as typeof EXPENSE_CATEGORIES[number])
    ? category!
    : (category !== undefined ? 'Other' : existing.category);
  const newDate   = date ?? existing.date;

  if (!newDesc) { res.status(400).json({ error: 'Description cannot be empty.' }); return; }
  if (isNaN(newAmount) || newAmount <= 0) { res.status(400).json({ error: 'Amount must be a positive number.' }); return; }

  db.prepare(`
    UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?
  `).run(newDesc, newAmount, newCat, newDate, id);

  logAudit({
    user_id:     req.user?.id ?? null,
    username:    req.user?.username ?? 'owner',
    action:      'EXPENSE_UPDATED',
    entity_type: 'expense',
    entity_id:   String(id),
    details:     `description: ${newDesc} | amount: ${newAmount.toFixed(2)} | category: ${newCat} | date: ${newDate}`,
  });

  const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as ExpenseRow;
  res.json(updated);
}

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

export function deleteExpense(req: AuthedRequest, res: Response): void {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as ExpenseRow | undefined;
  if (!existing) { res.status(404).json({ error: 'Expense not found.' }); return; }

  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

  logAudit({
    user_id:     req.user?.id ?? null,
    username:    req.user?.username ?? 'owner',
    action:      'EXPENSE_DELETED',
    entity_type: 'expense',
    entity_id:   String(id),
    details:     `description: ${existing.description} | amount: ${existing.amount.toFixed(2)} | category: ${existing.category}`,
  });

  res.json({ ok: true });
}
