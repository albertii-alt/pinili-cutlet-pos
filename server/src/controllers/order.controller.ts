import { Request, Response } from 'express';
import db from '../database/db';
import { Order, OrderItem, CreateOrderPayload } from '../types';
import { logAudit } from '../utils/auditLogger';

function getNextOrderNumber(): string {
  const prefixRow = db.prepare(`SELECT value FROM settings WHERE key = 'order_prefix'`).get() as { value: string } | undefined;
  const prefix = prefixRow?.value?.trim().toUpperCase() || 'PC';

  const last = db.prepare(`
    SELECT order_number FROM orders
    WHERE DATE(created_at) = DATE('now', 'localtime')
    ORDER BY id DESC LIMIT 1
  `).get() as { order_number: string } | undefined;

  if (!last) return `${prefix}-001`;

  const parts = last.order_number.split('-');
  const num = parseInt(parts[parts.length - 1], 10);
  let next = isNaN(num) ? 1 : num + 1;

  // Guard against duplicates — increment until unique per day
  let candidate = `${prefix}-${String(next).padStart(3, '0')}`;
  while (db.prepare(`
    SELECT 1 FROM orders
    WHERE order_number = ? AND DATE(created_at) = DATE('now', 'localtime')
  `).get(candidate)) {
    next++;
    candidate = `${prefix}-${String(next).padStart(3, '0')}`;
  }

  return candidate;
}

export function getNextNumber(req: Request, res: Response): void {
  res.json({ order_number: getNextOrderNumber() });
}

export function getActive(req: Request, res: Response): void {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at ASC
  `).all() as Order[];

  const result = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as OrderItem[],
  }));

  res.json(result);
}

export function getHistory(req: Request, res: Response): void {
  const { status, date, payment_method, startDate, endDate, period, page, limit } = req.query as {
    status?: string;
    date?: string;
    payment_method?: string;
    startDate?: string;
    endDate?: string;
    period?: string;
    page?: string;
    limit?: string;
  };

  const pageNum  = Math.max(1, parseInt(page  ?? '1',  10));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit ?? '25', 10)));
  const offset   = (pageNum - 1) * pageSize;

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (status) { where += ' AND status = ?'; params.push(status); }
  else        { where += " AND status != 'pending'"; }

  if (startDate && endDate) {
    where += ' AND DATE(created_at) >= ? AND DATE(created_at) <= ?';
    params.push(startDate, endDate);
  } else if (period === 'week') {
    where += " AND DATE(created_at) >= DATE('now', '-6 days', 'localtime')";
  } else if (period === 'month') {
    where += " AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')";
  } else if (date) {
    where += ' AND DATE(created_at) = ?';
    params.push(date);
  } else {
    where += " AND DATE(created_at) = DATE('now', 'localtime')";
  }

  if (payment_method) { where += ' AND LOWER(payment_method) = LOWER(?)'; params.push(payment_method); }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM orders ${where}`).get(...params) as { c: number }).c;

  const orders = db.prepare(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset) as Order[];

  const data = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as OrderItem[],
  }));

  res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / pageSize) });
}

export function create(req: Request, res: Response): void {
  const { payment_method, cash_tendered, items } = req.body as CreateOrderPayload;

  const isCash = payment_method.toLowerCase() === 'cash';

  if (!payment_method || !items || items.length === 0) {
    res.status(400).json({ error: 'payment_method and items are required' });
    return;
  }

  if (isCash && (cash_tendered === undefined || cash_tendered === null)) {
    res.status(400).json({ error: 'cash_tendered is required for cash payments' });
    return;
  }

  const total_amount = items.reduce((sum, item) => sum + item.item_price * item.quantity, 0);
  const change_amount = isCash ? (cash_tendered as number) - total_amount : null;

  if (isCash && (change_amount as number) < 0) {
    res.status(400).json({ error: 'Insufficient cash tendered' });
    return;
  }

  const order_number = getNextOrderNumber();

  const insertOrder = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO orders (order_number, total_amount, payment_method, cash_tendered, change_amount, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      order_number,
      total_amount,
      payment_method.toLowerCase(),
      isCash ? cash_tendered : null,
      change_amount,
      req.user!.id
    );

    const orderId = result.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      insertItem.run(orderId, item.menu_item_id, item.item_name, item.item_price, item.quantity, item.notes ?? null);
    });

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order;
  });

  const order = insertOrder();
  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as OrderItem[];
  const fullOrder = { ...order, items: orderItems };

  const { getIO } = require('../socket/events');
  getIO().emit('order:created', fullOrder);

  logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'ORDER_CREATED', entity_type: 'order', entity_id: String(order.id), details: `Created order ${order.order_number} — ${items.length} item(s), ${payment_method}, total ₱${total_amount.toFixed(2)}` });

  res.status(201).json(fullOrder);
}

export function complete(req: Request, res: Response): void {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Order | undefined;

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (order.status !== 'pending') {
    res.status(400).json({ error: 'Only pending orders can be completed' });
    return;
  }

  db.prepare("UPDATE orders SET status = 'completed' WHERE id = ?").run(req.params.id);

  logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'ORDER_COMPLETED', entity_type: 'order', entity_id: String(order.id), details: `Completed order ${order.order_number}` });

  const { getIO } = require('../socket/events');
  getIO().emit('order:completed', Number(req.params.id));

  res.json({ message: 'Order completed', id: Number(req.params.id) });
}

export function cancel(req: Request, res: Response): void {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Order | undefined;

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (order.status !== 'pending') {
    res.status(400).json({ error: 'Only pending orders can be cancelled' });
    return;
  }

  db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(req.params.id);

  const { getIO } = require('../socket/events');
  getIO().emit('order:cancelled', Number(req.params.id));

  res.json({ message: 'Order cancelled', id: Number(req.params.id) });
}

export function cancelCompleted(req: Request, res: Response): void {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Order | undefined;

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (order.status !== 'completed') {
    res.status(400).json({ error: 'Only completed orders can be cancelled this way' });
    return;
  }

  const { reason } = req.body as { reason?: string };
  if (!reason || reason.trim().length < 5) {
    res.status(400).json({ error: 'A reason of at least 5 characters is required' });
    return;
  }

  db.prepare("UPDATE orders SET status = 'cancelled', cancel_reason = ? WHERE id = ?")
    .run(reason.trim(), req.params.id);

  logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'ORDER_CANCELLED', entity_type: 'order', entity_id: String(order.id), details: `Cancelled completed order ${order.order_number}. Reason: ${reason.trim()}` });

  const { getIO } = require('../socket/events');
  getIO().emit('order:cancelled', Number(req.params.id));

  res.json({ message: 'Order cancelled', id: Number(req.params.id) });
}
