import { Request, Response } from 'express';
import db from '../database/db';
import { logAudit } from '../utils/auditLogger';

interface DrawerRow {
  id: number;
  date: string;
  opening_amount: number;
  expected_amount: number;
  actual_amount: number | null;
  discrepancy: number | null;
  notes: string | null;
  closed_at: string | null;
  created_at: string;
}

/** Returns today's date string in YYYY-MM-DD (local time). */
function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Computes today's total cash sales (completed orders paid with 'cash'). */
function getTodayCashSales(date: string): number {
  const row = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) AS total
    FROM orders
    WHERE DATE(created_at) = ?
      AND status = 'completed'
      AND LOWER(payment_method) = 'cash'
  `).get(date) as { total: number };
  return row.total;
}

// ─── GET /today ───────────────────────────────────────────────────────────────

export function getTodayDrawer(req: Request, res: Response): void {
  const date = todayStr();

  // Ensure a record exists for today
  db.prepare(`
    INSERT OR IGNORE INTO cash_drawer (date, opening_amount, expected_amount)
    VALUES (?, 0, 0)
  `).run(date);

  const drawer = db.prepare('SELECT * FROM cash_drawer WHERE date = ?').get(date) as DrawerRow;

  // Always recompute expected = opening + today's cash sales
  const cashSales = getTodayCashSales(date);
  const expected  = drawer.opening_amount + cashSales;

  db.prepare('UPDATE cash_drawer SET expected_amount = ? WHERE date = ?').run(expected, date);

  res.json({ ...drawer, expected_amount: expected, cash_sales: cashSales });
}

// ─── PUT /opening ─────────────────────────────────────────────────────────────

export function setOpeningAmount(req: Request, res: Response): void {
  const { amount } = req.body as { amount?: number };

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) < 0) {
    res.status(400).json({ error: 'Invalid amount. Must be a non-negative number.' });
    return;
  }

  const date = todayStr();

  // Ensure record exists
  db.prepare(`
    INSERT OR IGNORE INTO cash_drawer (date, opening_amount, expected_amount)
    VALUES (?, 0, 0)
  `).run(date);

  const drawer = db.prepare('SELECT * FROM cash_drawer WHERE date = ?').get(date) as DrawerRow;

  if (drawer.closed_at) {
    res.status(400).json({ error: 'Drawer is already closed for today.' });
    return;
  }

  const cashSales = getTodayCashSales(date);
  const expected  = Number(amount) + cashSales;

  db.prepare(`
    UPDATE cash_drawer
    SET opening_amount = ?, expected_amount = ?
    WHERE date = ?
  `).run(Number(amount), expected, date);

  const user = (req as Request & { user?: { id: number; username: string } }).user;
  logAudit({
    user_id:     user?.id ?? null,
    username:    user?.username ?? 'owner',
    action:      'DRAWER_OPENING_SET',
    entity_type: 'cash_drawer',
    entity_id:   date,
    details:     `opening_amount: ${Number(amount).toFixed(2)}`,
  });

  const updated = db.prepare('SELECT * FROM cash_drawer WHERE date = ?').get(date) as DrawerRow;
  res.json({ ...updated, cash_sales: cashSales });
}

// ─── PUT /close ───────────────────────────────────────────────────────────────

export function closeDrawer(req: Request, res: Response): void {
  const { actual_amount, notes } = req.body as { actual_amount?: number; notes?: string };

  if (actual_amount === undefined || isNaN(Number(actual_amount)) || Number(actual_amount) < 0) {
    res.status(400).json({ error: 'Invalid actual_amount. Must be a non-negative number.' });
    return;
  }

  const date = todayStr();

  const drawer = db.prepare('SELECT * FROM cash_drawer WHERE date = ?').get(date) as DrawerRow | undefined;
  if (!drawer) {
    res.status(404).json({ error: 'No drawer record found for today.' });
    return;
  }

  if (drawer.closed_at) {
    res.status(400).json({ error: 'Drawer is already closed for today.' });
    return;
  }

  const cashSales   = getTodayCashSales(date);
  const expected    = drawer.opening_amount + cashSales;
  const actual      = Number(actual_amount);
  const discrepancy = actual - expected;
  const closedAt    = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    UPDATE cash_drawer
    SET expected_amount = ?,
        actual_amount   = ?,
        discrepancy     = ?,
        notes           = ?,
        closed_at       = ?
    WHERE date = ?
  `).run(expected, actual, discrepancy, notes ?? null, closedAt, date);

  const user = (req as Request & { user?: { id: number; username: string } }).user;
  logAudit({
    user_id:     user?.id ?? null,
    username:    user?.username ?? 'owner',
    action:      'DRAWER_CLOSED',
    entity_type: 'cash_drawer',
    entity_id:   date,
    details:     `expected: ${expected.toFixed(2)} | actual: ${actual.toFixed(2)} | discrepancy: ${discrepancy.toFixed(2)}${notes ? ` | notes: ${notes}` : ''}`,
  });

  const updated = db.prepare('SELECT * FROM cash_drawer WHERE date = ?').get(date) as DrawerRow;
  res.json({ ...updated, cash_sales: cashSales });
}

// ─── GET /history ─────────────────────────────────────────────────────────────

export function getDrawerHistory(req: Request, res: Response): void {
  const { start_date, end_date, limit, offset } = req.query as {
    start_date?: string;
    end_date?: string;
    limit?: string;
    offset?: string;
  };

  const pageSize = Math.min(100, Math.max(1, parseInt(limit  ?? '30', 10)));
  const skip     = Math.max(0,              parseInt(offset ?? '0',  10));

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (start_date) { where += ' AND date >= ?'; params.push(start_date); }
  if (end_date)   { where += ' AND date <= ?'; params.push(end_date); }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM cash_drawer ${where}`).get(...params) as { c: number }).c;
  const rows  = db.prepare(`SELECT * FROM cash_drawer ${where} ORDER BY date DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, skip);

  res.json({ data: rows, total, limit: pageSize, offset: skip });
}
