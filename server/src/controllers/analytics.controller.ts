import { Request, Response } from 'express';
import db from '../database/db';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment } from '../types';

export function getSummary(req: Request, res: Response): void {
  const { date } = req.query as { date?: string };
  const target = date ?? "date('now','localtime')";
  const param = date ? date : undefined;

  const query = `
    SELECT
      COALESCE(SUM(total_amount), 0)                                        AS total_sales,
      COUNT(*)                                                               AS total_orders,
      COALESCE(SUM(CASE WHEN payment_method = 'cash'  THEN total_amount END), 0) AS cash_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'gcash' THEN total_amount END), 0) AS gcash_sales
    FROM orders
    WHERE status = 'completed'
      AND DATE(created_at) = ${date ? '?' : target}
  `;

  const summary = (param
    ? db.prepare(query).get(param)
    : db.prepare(query).get()) as AnalyticsSummary;

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
