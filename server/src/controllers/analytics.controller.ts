import { Request, Response } from 'express';
import db from '../database/db';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales } from '../types';

function buildWhereClause(
  period?: string, date?: string, startDate?: string, endDate?: string
): { where: string; params: string[] } {
  if (startDate && endDate) return { where: `DATE(created_at) >= ? AND DATE(created_at) <= ?`, params: [startDate, endDate] };
  if (period === 'week')    return { where: `DATE(created_at) >= DATE('now', '-6 days', 'localtime')`, params: [] };
  if (period === 'month')   return { where: `strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')`, params: [] };
  if (date)                 return { where: `DATE(created_at) = ?`, params: [date] };
  return                           { where: `DATE(created_at) = DATE('now', 'localtime')`, params: [] };
}

export function getSummary(req: Request, res: Response): void {
  const { date, period, startDate, endDate } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate);

  const summary = db.prepare(`
    SELECT
      COALESCE(SUM(total_amount), 0) AS total_sales,
      COUNT(*) AS total_orders,
      COALESCE(SUM(CASE WHEN payment_method = 'cash'  THEN total_amount END), 0) AS cash_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'gcash' THEN total_amount END), 0) AS gcash_sales
    FROM orders
    WHERE status = 'completed' AND ${where}
  `).get(...params) as AnalyticsSummary;

  res.json(summary);
}

export function getDailySales(req: Request, res: Response): void {
  const sales = db.prepare(`
    SELECT
      DATE(created_at) AS date,
      COALESCE(SUM(total_amount), 0) AS total
    FROM orders
    WHERE status = 'completed'
      AND DATE(created_at) >= DATE('now', '-6 days', 'localtime')
      AND DATE(created_at) <= DATE('now', 'localtime')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all() as DailySales[];

  res.json(sales);
}

export function getBestSellers(req: Request, res: Response): void {
  const { limit, date, period, startDate, endDate } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate);

  const sellers = db.prepare(`
    SELECT
      oi.menu_item_id,
      oi.item_name,
      SUM(oi.quantity) AS total_quantity,
      SUM(oi.quantity * oi.item_price) AS total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'completed' AND ${where.replace(/created_at/g, 'o.created_at')}
    GROUP BY oi.menu_item_id, oi.item_name
    ORDER BY total_quantity DESC
    LIMIT ?
  `).all(...params, limit ? parseInt(limit, 10) : 10) as BestSeller[];

  res.json(sellers);
}

export function getRevenueByPayment(req: Request, res: Response): void {
  const revenue = db.prepare(`
    SELECT
      payment_method,
      COALESCE(SUM(total_amount), 0) AS total,
      COUNT(*) AS count
    FROM orders
    WHERE status = 'completed'
    GROUP BY payment_method
  `).all() as RevenueByPayment[];

  res.json(revenue);
}

export function getPeakHours(req: Request, res: Response): void {
  const { date, period, startDate, endDate } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate);
  const qualifiedWhere = where.replace(/created_at/g, 'o.created_at');

  const rows = db.prepare(`
    SELECT strftime('%H', o.created_at) as hour,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM orders o
    WHERE o.status = 'completed' AND ${qualifiedWhere}
    GROUP BY strftime('%H', o.created_at)
    ORDER BY hour ASC
  `).all(...params) as PeakHour[];

  res.json(rows);
}

export function getCategorySales(req: Request, res: Response): void {
  const { date, period, startDate, endDate } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate);
  const qualifiedWhere = where.replace(/created_at/g, 'o.created_at');

  const rows = db.prepare(`
    SELECT c.name as category,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.quantity * oi.item_price) as total_revenue
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN categories c ON mi.category_id = c.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed' AND ${qualifiedWhere}
    GROUP BY c.name
    ORDER BY total_revenue DESC
  `).all(...params) as CategorySales[];

  res.json(rows);
}

export function getAverageOrderValue(req: Request, res: Response): void {
  const { date, period, startDate, endDate } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate);

  const row = db.prepare(`
    SELECT ROUND(AVG(total_amount), 2) as avg_order_value, COUNT(*) as total_orders
    FROM orders WHERE status = 'completed' AND ${where}
  `).get(...params) as { avg_order_value: number; total_orders: number };

  res.json(row);
}

export function getDailyTarget(req: Request, res: Response): void {
  const row = db.prepare(`SELECT value FROM settings WHERE key = 'daily_target'`).get() as { value: string } | undefined;
  res.json({ daily_target: row ? parseFloat(row.value) : 0 });
}

export function setDailyTarget(req: Request, res: Response): void {
  const { target } = req.body as { target: number };

  if (target === undefined || target === null || isNaN(Number(target)) || Number(target) < 0) {
    res.status(400).json({ error: 'target must be a non-negative number' });
    return;
  }

  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('daily_target', ?, datetime('now','localtime'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(String(target));

  res.json({ daily_target: Number(target) });
}

export function getEndOfDaySummary(req: Request, res: Response): void {
  const today = `DATE('now', 'localtime')`;

  const summary = db.prepare(`
    SELECT
      DATE('now', 'localtime') as date,
      COUNT(*) as total_orders,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_orders,
      COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_orders,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN status = 'completed' AND payment_method = 'cash' THEN 1 ELSE 0 END), 0) as cash_orders,
      COALESCE(SUM(CASE WHEN status = 'completed' AND payment_method = 'cash' THEN total_amount END), 0) as cash_revenue,
      COALESCE(SUM(CASE WHEN status = 'completed' AND payment_method = 'gcash' THEN 1 ELSE 0 END), 0) as gcash_orders,
      COALESCE(SUM(CASE WHEN status = 'completed' AND payment_method = 'gcash' THEN total_amount END), 0) as gcash_revenue,
      ROUND(AVG(CASE WHEN status = 'completed' THEN total_amount END), 2) as average_order_value
    FROM orders
    WHERE DATE(created_at) = ${today}
  `).get() as {
    date: string; total_orders: number; completed_orders: number; cancelled_orders: number;
    total_revenue: number; cash_orders: number; cash_revenue: number;
    gcash_orders: number; gcash_revenue: number; average_order_value: number;
  };

  const topItems = db.prepare(`
    SELECT oi.menu_item_id, oi.item_name,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.quantity * oi.item_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed' AND DATE(o.created_at) = ${today}
    GROUP BY oi.menu_item_id, oi.item_name
    ORDER BY total_quantity DESC
    LIMIT 5
  `).all() as BestSeller[];

  res.json({ ...summary, top_items: topItems });
}
