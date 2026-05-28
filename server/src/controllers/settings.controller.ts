import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import db from '../database/db';
import { logAudit } from '../utils/auditLogger';

const SOUNDS_DIR = path.resolve(process.cwd(), '../server/public/sounds');

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

  logAudit({ user_id: req.user?.id, username: req.user?.username ?? 'owner', action: 'SETTING_CHANGED', entity_type: 'setting', entity_id: String(key), details: `Changed "${String(key)}" to "${String(value)}"` });

  res.json({ key, value: String(value) });
}

export function uploadNotificationSound(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Delete old sound file if one exists
  const existing = (db.prepare("SELECT value FROM settings WHERE key = 'notification_sound'").get() as { value: string } | undefined)?.value;
  if (existing) {
    const oldPath = path.join(SOUNDS_DIR, existing);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const filename = req.file.filename;
  db.prepare(`UPDATE settings SET value = ?, updated_at = datetime('now','localtime') WHERE key = 'notification_sound'`).run(filename);

  const { getIO } = require('../socket/events');
  getIO().emit('settings:updated', { key: 'notification_sound', value: filename });

  logAudit({ user_id: req.user?.id, username: req.user?.username ?? 'owner', action: 'SOUND_UPLOADED', details: `Uploaded notification sound: ${filename}` });

  res.json({ filename });
}

export function deleteNotificationSound(req: Request, res: Response): void {
  const existing = (db.prepare("SELECT value FROM settings WHERE key = 'notification_sound'").get() as { value: string } | undefined)?.value;
  if (existing) {
    const oldPath = path.join(SOUNDS_DIR, existing);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  db.prepare(`UPDATE settings SET value = '', updated_at = datetime('now','localtime') WHERE key = 'notification_sound'`).run();

  const { getIO } = require('../socket/events');
  getIO().emit('settings:updated', { key: 'notification_sound', value: '' });

  res.json({ ok: true });
}
