import { Request, Response } from 'express';
import db from '../database/db';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales } from '../types';

function buildWhereClause(period?: string, date?: string): { where: string; param?: string } {
  if (period === 'week')  return { where: `DATE(created_at) >= DATE('now', '-6 days', 'localtime')` };
  if (period === 'month') return { where: `strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')` };
  if (date)               return { where: `DATE(created_at) = ?`, param: date };
  return { where: `DATE(created_at) = DATE('now', 'localtime')` };
}

export function getSummary(req: Request, res: Response): void {
  const { date, period } = req.query as { date?: string; period?: string };
  const { where, param } = buildWhereClause(period, date);

  const query = `
    SELECT
      COALESCE(SUM(total_amount), 0) AS total_sales,
      COUNT(*) AS total_orders,
      COALESCE(SUM(CASE WHEN payment_method = 'cash'  THEN total_amount END), 0) AS cash_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'gcash' THEN total_amount END), 0) AS gcash_sales
    FROM orders
    WHERE status = 'completed' AND ${where}
  `;

  const summary = (param ? db.prepare(query).get(param) : db.prepare(query).get()) as AnalyticsSummary;
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
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all() as DailySales[];

  res.json(sales);
}

export function getBestSellers(req: Request, res: Response): void {
  const { limit } = req.query as { limit?: string };

  const sellers = db.prepare(`
    SELECT
      oi.menu_item_id,
      oi.item_name,
      SUM(oi.quantity)              AS total_quantity,
      SUM(oi.quantity * oi.item_price) AS total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'completed'
    GROUP BY oi.menu_item_id, oi.item_name
    ORDER BY total_quantity DESC
    LIMIT ?
  `).all(limit ? parseInt(limit, 10) : 10) as BestSeller[];

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
  const { date, period } = req.query as { date?: string; period?: string };
  const { where, param } = buildWhereClause(period, date);
  const qualifiedWhere = where.replace(/created_at/g, 'o.created_at');

  const query = `
    SELECT strftime('%H', o.created_at) as hour,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM orders o
    WHERE o.status = 'completed' AND ${qualifiedWhere}
    GROUP BY strftime('%H', o.created_at)
    ORDER BY hour ASC
  `;

  const rows = (param ? db.prepare(query).all(param) : db.prepare(query).all()) as PeakHour[];
  res.json(rows);
}

export function getCategorySales(req: Request, res: Response): void {
  const { date, period } = req.query as { date?: string; period?: string };
  const { where, param } = buildWhereClause(period, date);

  // Qualify created_at with table alias to avoid ambiguity
  const qualifiedWhere = where.replace(/created_at/g, 'o.created_at');

  const rows = (param
    ? db.prepare(`
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
      `).all(param)
    : db.prepare(`
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
      `).all()) as CategorySales[];

  res.json(rows);
}

export function getAverageOrderValue(req: Request, res: Response): void {
  const { date, period } = req.query as { date?: string; period?: string };
  const { where, param } = buildWhereClause(period, date);

  const row = (param
    ? db.prepare(`
        SELECT ROUND(AVG(total_amount), 2) as avg_order_value, COUNT(*) as total_orders
        FROM orders WHERE status = 'completed' AND ${where}
      `).get(param)
    : db.prepare(`
        SELECT ROUND(AVG(total_amount), 2) as avg_order_value, COUNT(*) as total_orders
        FROM orders WHERE status = 'completed' AND ${where}
      `).get()) as { avg_order_value: number; total_orders: number };

  res.json(row);
}
