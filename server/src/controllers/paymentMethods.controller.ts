import { Request, Response } from 'express';
import db from '../database/db';

interface PaymentMethod {
  id: number;
  name: string;
  is_active: number;
  is_default: number;
  sort_order: number;
  color: string | null;
  created_at: string;
}

function emit(event: string, payload: unknown): void {
  const { getIO } = require('../socket/events');
  getIO().emit(event, payload);
}

export function getPaymentMethods(req: Request, res: Response): void {
  const methods = db.prepare(
    'SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC'
  ).all() as PaymentMethod[];
  res.json(methods);
}

export function addPaymentMethod(req: Request, res: Response): void {
  const { name } = req.body as { name: string };

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const count = (db.prepare('SELECT COUNT(*) as c FROM payment_methods').get() as { c: number }).c;

  try {
    const result = db.prepare(
      'INSERT INTO payment_methods (name, sort_order) VALUES (?, ?)'
    ).run(name.trim(), count);

    const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(result.lastInsertRowid) as PaymentMethod;
    const all    = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC').all();
    emit('payment_methods:updated', all);
    res.status(201).json(method);
  } catch {
    res.status(409).json({ error: 'Payment method name already exists' });
  }
}

export function deletePaymentMethod(req: Request, res: Response): void {
  const { id } = req.params;

  const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as PaymentMethod | undefined;
  if (!method) {
    res.status(404).json({ error: 'Payment method not found' });
    return;
  }

  const activeCount = (db.prepare(
    'SELECT COUNT(*) as c FROM payment_methods WHERE is_active = 1'
  ).get() as { c: number }).c;

  if (activeCount <= 1 && method.is_active) {
    res.status(400).json({ error: 'Cannot delete the only active payment method' });
    return;
  }

  if (method.is_default) {
    // Assign default to the next active method
    const next = db.prepare(
      'SELECT id FROM payment_methods WHERE id != ? AND is_active = 1 LIMIT 1'
    ).get(id) as { id: number } | undefined;
    if (next) db.prepare('UPDATE payment_methods SET is_default = 1 WHERE id = ?').run(next.id);
  }

  db.prepare('DELETE FROM payment_methods WHERE id = ?').run(id);

  const all = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC').all();
  emit('payment_methods:updated', all);
  res.json({ message: 'Payment method deleted' });
}

export function setDefaultPaymentMethod(req: Request, res: Response): void {
  const { id } = req.params;

  const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as PaymentMethod | undefined;
  if (!method) {
    res.status(404).json({ error: 'Payment method not found' });
    return;
  }
  if (!method.is_active) {
    res.status(400).json({ error: 'Cannot set an inactive method as default' });
    return;
  }

  db.prepare('UPDATE payment_methods SET is_default = 0').run();
  db.prepare('UPDATE payment_methods SET is_default = 1 WHERE id = ?').run(id);

  const all = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC').all();
  emit('payment_methods:updated', all);
  res.json({ message: 'Default payment method updated' });
}

export function updatePaymentMethodColor(req: Request, res: Response): void {
  const { id } = req.params;
  const { color } = req.body as { color: string };

  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    res.status(400).json({ error: 'Invalid color format. Use hex e.g. #FF0000' });
    return;
  }

  const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as PaymentMethod | undefined;
  if (!method) {
    res.status(404).json({ error: 'Payment method not found' });
    return;
  }

  db.prepare('UPDATE payment_methods SET color = ? WHERE id = ?').run(color, id);

  const all = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC').all();
  emit('payment_methods:updated', all);
  res.json({ message: 'Color updated' });
}

export function togglePaymentMethod(req: Request, res: Response): void {
  const { id } = req.params;
  const { isActive } = req.body as { isActive: boolean };

  const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as PaymentMethod | undefined;
  if (!method) {
    res.status(404).json({ error: 'Payment method not found' });
    return;
  }

  // Prevent disabling the only active method
  if (!isActive) {
    const activeCount = (db.prepare(
      'SELECT COUNT(*) as c FROM payment_methods WHERE is_active = 1'
    ).get() as { c: number }).c;
    if (activeCount <= 1) {
      res.status(400).json({ error: 'Cannot disable the only active payment method' });
      return;
    }
    // If disabling the default, reassign default
    if (method.is_default) {
      const next = db.prepare(
        'SELECT id FROM payment_methods WHERE id != ? AND is_active = 1 LIMIT 1'
      ).get(id) as { id: number } | undefined;
      if (next) {
        db.prepare('UPDATE payment_methods SET is_default = 0 WHERE id = ?').run(id);
        db.prepare('UPDATE payment_methods SET is_default = 1 WHERE id = ?').run(next.id);
      }
    }
  }

  db.prepare('UPDATE payment_methods SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);

  const all = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC').all();
  emit('payment_methods:updated', all);
  res.json({ message: 'Payment method updated' });
}
