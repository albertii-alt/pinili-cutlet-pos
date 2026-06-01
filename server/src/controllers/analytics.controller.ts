import { Request, Response } from 'express';
import db from '../database/db';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales } from '../types';
import { createNotification } from '../utils/notificationHelper';

export interface MonthlySales {
  month: string;  // e.g. "Jan", "Feb", ...
  total: number;
}

function buildWhereClause(
  period?: string, date?: string, startDate?: string, endDate?: string, year?: string
): { where: string; params: string[] } {
  if (startDate && endDate) return { where: `DATE(created_at) >= ? AND DATE(created_at) <= ?`, params: [startDate, endDate] };
  if (period === 'all') {
    if (year) return { where: `strftime('%Y', created_at) = ?`, params: [year] };
    return { where: `1=1`, params: [] };
  }
  if (period === 'week')       return { where: `DATE(created_at) >= DATE('now', '-6 days', 'localtime')`, params: [] };
  if (period === 'month')      return { where: `DATE(created_at) >= DATE('now', 'localtime', 'start of month') AND DATE(created_at) <= DATE('now', 'localtime')`, params: [] };
  if (period === 'last_month') return { where: `strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime', '-1 month')`, params: [] };
  if (date)                    return { where: `DATE(created_at) = ?`, params: [date] };
  return                              { where: `DATE(created_at) = DATE('now', 'localtime')`, params: [] };
}

export function getAvailableYears(_req: Request, res: Response): void {
  const rows = db.prepare(`
    SELECT DISTINCT strftime('%Y', created_at) AS year
    FROM orders
    WHERE status = 'completed'
    ORDER BY year DESC
  `).all() as { year: string }[];
  res.json(rows.map(r => r.year));
}

export function getSummary(req: Request, res: Response): void {
  const { date, period, startDate, endDate, year } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate, year);

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(total_amount), 0) AS total_sales,
      COUNT(*) AS total_orders
    FROM orders
    WHERE status = 'completed' AND ${where}
  `).get(...params) as { total_sales: number; total_orders: number };

  const breakdown = db.prepare(`
    SELECT
      payment_method,
      COUNT(*) AS order_count,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM orders
    WHERE status = 'completed' AND ${where}
    GROUP BY payment_method
  `).all(...params) as { payment_method: string; order_count: number; revenue: number }[];

  res.json({ ...totals, payment_breakdown: breakdown });

  // Daily target notifications — only for today's data
  if (!period && !date && !startDate && !endDate) {
    const targetRow = db.prepare("SELECT value FROM settings WHERE key = 'daily_target'").get() as { value: string } | undefined;
    const target = targetRow ? parseFloat(targetRow.value) : 0;
    if (target > 0) {
      const sales = totals.total_sales;
      const pct   = (sales / target) * 100;
      // Check if we just crossed 100%
      if (pct >= 100) {
        const alreadyNotified = db.prepare(
          "SELECT id FROM notifications WHERE type = 'target_achieved' AND DATE(created_at) = DATE('now','localtime')"
        ).get();
        if (!alreadyNotified) {
          createNotification('target_achieved', 'Daily Target Achieved! 🎯', 'Congratulations! Daily sales target reached!');
        }
      } else if (pct >= 80) {
        const alreadyNotified = db.prepare(
          "SELECT id FROM notifications WHERE type = 'target_warning' AND DATE(created_at) = DATE('now','localtime')"
        ).get();
        if (!alreadyNotified) {
          createNotification('target_warning', '80% Target Reached', 'You are close to your daily sales target!');
        }
      }
    }
  }
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
  const { limit, date, period, startDate, endDate, year } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate, year);

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
  const { date, period, startDate, endDate, year } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate, year);
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
  const { date, period, startDate, endDate, year } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate, year);
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
  const { date, period, startDate, endDate, year } = req.query as Record<string, string | undefined>;
  const { where, params } = buildWhereClause(period, date, startDate, endDate, year);

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

export function getMonthlySales(req: Request, res: Response): void {
  const { period, startDate, endDate, year } = req.query as Record<string, string | undefined>;

  // Determine the year(s) to scope the monthly breakdown
  let yearFilter: string;
  let params: string[] = [];

  if (startDate && endDate) {
    // Custom range: show months within the range's year span
    yearFilter = `DATE(created_at) >= ? AND DATE(created_at) <= ?`;
    params = [startDate, endDate];
  } else if (period === 'all' && year) {
    yearFilter = `strftime('%Y', created_at) = ?`;
    params = [year];
  } else if (period === 'last_month') {
    yearFilter = `strftime('%Y', created_at) = strftime('%Y', 'now', 'localtime', '-1 month')`;
  } else if (period === 'all') {
    yearFilter = `1=1`;
  } else {
    // today, week, month, or default — show current year
    yearFilter = `strftime('%Y', created_at) = strftime('%Y', 'now', 'localtime')`;
  }

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const rows = db.prepare(`
    SELECT
      CAST(strftime('%m', created_at) AS INTEGER) AS month_num,
      COALESCE(SUM(total_amount), 0) AS total
    FROM orders
    WHERE status = 'completed' AND ${yearFilter}
    GROUP BY strftime('%m', created_at)
    ORDER BY month_num ASC
  `).all(...params) as { month_num: number; total: number }[];

  // Build a full 12-month array, filling zeros for months with no data
  const dataMap = new Map(rows.map(r => [r.month_num, r.total]));
  const result: MonthlySales[] = MONTH_NAMES.map((name, i) => ({
    month: name,
    total: dataMap.get(i + 1) ?? 0,
  }));

  res.json(result);
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
      ROUND(AVG(CASE WHEN status = 'completed' THEN total_amount END), 2) as average_order_value
    FROM orders
    WHERE DATE(created_at) = ${today}
  `).get() as {
    date: string; total_orders: number; completed_orders: number; cancelled_orders: number;
    total_revenue: number; average_order_value: number;
  };

  const payment_breakdown = db.prepare(`
    SELECT
      payment_method,
      COUNT(*) AS order_count,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM orders
    WHERE status = 'completed' AND DATE(created_at) = ${today}
    GROUP BY payment_method
  `).all() as { payment_method: string; order_count: number; revenue: number }[];

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

  res.json({ ...summary, payment_breakdown, top_items: topItems });
}
