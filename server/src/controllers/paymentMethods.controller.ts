import { Request, Response } from 'express';
import db from '../database/db';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface PaymentMethod {
  id: number;
  name: string;
  is_active: number;
  is_default: number;
  sort_order: number;
  color: string | null;
  logo_path: string | null;
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
    ).run(name.trim().toLowerCase(), count);

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

const LOGO_DIR = path.resolve(process.cwd(), '../server/public/payment-logos');

function ensureLogoDir(): void {
  if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });
}

export async function uploadPaymentLogo(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as PaymentMethod | undefined;
  if (!method) { res.status(404).json({ error: 'Payment method not found' }); return; }

  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  ensureLogoDir();

  // Delete old logo if exists
  if (method.logo_path) {
    const oldFile = path.join(LOGO_DIR, method.logo_path);
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  }

  const filename = `payment-${id}-${Date.now()}.png`;
  const dest     = path.join(LOGO_DIR, filename);

  try {
    await sharp(req.file.buffer)
      .resize(120, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 90 })
      .toFile(dest);
  } catch {
    res.status(500).json({ error: 'Failed to process image' });
    return;
  }

  db.prepare('UPDATE payment_methods SET logo_path = ? WHERE id = ?').run(filename, id);

  const all = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC').all();
  emit('payment_methods:updated', all);

  res.json({ logo_path: filename });
}

export function deletePaymentLogo(req: Request, res: Response): void {
  const { id } = req.params;

  const method = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id) as PaymentMethod | undefined;
  if (!method) { res.status(404).json({ error: 'Payment method not found' }); return; }

  if (method.logo_path) {
    const file = path.join(LOGO_DIR, method.logo_path);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  db.prepare('UPDATE payment_methods SET logo_path = NULL WHERE id = ?').run(id);

  const all = db.prepare('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC').all();
  emit('payment_methods:updated', all);

  res.json({ ok: true });
}
