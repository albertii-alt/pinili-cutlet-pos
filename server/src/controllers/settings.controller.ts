import { Request, Response } from 'express';
import db from '../database/db';

export function getSettings(req: Request, res: Response): void {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(settings);
}

export function updateSetting(req: Request, res: Response): void {
  const { key } = req.params;
  const { value } = req.body as { value: string };

  if (value === undefined || value === null) {
    res.status(400).json({ error: 'value is required' });
    return;
  }

  const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
  if (!existing) {
    res.status(404).json({ error: `Setting "${key}" not found` });
    return;
  }

  db.prepare(`
    UPDATE settings SET value = ?, updated_at = datetime('now','localtime') WHERE key = ?
  `).run(String(value), key);

  const { getIO } = require('../socket/events');
  getIO().emit('settings:updated', { key, value: String(value) });

  res.json({ key, value: String(value) });
}
