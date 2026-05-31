import { Request, Response } from 'express';
import db from '../database/db';

interface ShiftReportRow {
  created_by: number | null;
  username: string | null;
  role: string | null;
  total_orders: number;
  cancelled_orders: number;
  total_sales: number;
  avg_order_value: number | null;
  first_order_at: string | null;
  last_order_at: string | null;
}

/** Resolves start/end date strings from period or explicit dates. */
function resolveDateRange(query: {
  period?: string;
  start_date?: string;
  end_date?: string;
}): { startDate: string; endDate: string } {
  const { period, start_date, end_date } = query;

  // Helper: YYYY-MM-DD for a Date object
  function fmt(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const today = fmt(new Date());

  if (period === 'today') return { startDate: today, endDate: today };

  if (period === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { startDate: fmt(d), endDate: today };
  }

  if (period === 'month') {
    const d = new Date();
    return { startDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`, endDate: today };
  }

  // custom / fallback
  return {
    startDate: start_date ?? today,
    endDate:   end_date   ?? today,
  };
}

// ─── GET / ────────────────────────────────────────────────────────────────────

export function getShiftReport(req: Request, res: Response): void {
  const { period, start_date, end_date } = req.query as {
    period?: string;
    start_date?: string;
    end_date?: string;
  };

  const { startDate, endDate } = resolveDateRange({ period, start_date, end_date });

  const rows = db.prepare(`
    SELECT
      o.created_by,
      u.username,
      u.role,
      u.avatar_path,
      COUNT(CASE WHEN o.status = 'completed' THEN 1 END)                          AS total_orders,
      COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END)                          AS cancelled_orders,
      COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount END), 0)  AS total_sales,
      ROUND(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount END), 2)     AS avg_order_value,
      MIN(o.created_at)                                                            AS first_order_at,
      MAX(o.created_at)                                                            AS last_order_at
    FROM orders o
    LEFT JOIN users u ON o.created_by = u.id
    WHERE DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?
    GROUP BY o.created_by
    ORDER BY total_sales DESC
  `).all(startDate, endDate) as ShiftReportRow[];

  // Totals across all staff
  const totalOrders = rows.reduce((s, r) => s + r.total_orders, 0);
  const totalSales  = rows.reduce((s, r) => s + r.total_sales,  0);

  res.json({
    data: rows,
    summary: { total_orders: totalOrders, total_sales: totalSales },
    period: { start_date: startDate, end_date: endDate },
  });
}
