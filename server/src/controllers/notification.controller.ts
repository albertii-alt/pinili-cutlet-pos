import { Request, Response } from 'express';
import db from '../database/db';

interface NotificationRow {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export function getNotifications(req: Request, res: Response): void {
  const rows = db.prepare(`
    SELECT * FROM notifications
    ORDER BY is_read ASC, created_at DESC
  `).all() as NotificationRow[];
  res.json(rows);
}

export function getUnreadCount(req: Request, res: Response): void {
  const row = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE is_read = 0').get() as { c: number };
  res.json({ count: row.c });
}

export function markAsRead(req: Request, res: Response): void {
  const { id } = req.params;
  const existing = db.prepare('SELECT id FROM notifications WHERE id = ?').get(id);
  if (!existing) { res.status(404).json({ error: 'Notification not found' }); return; }
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  res.json({ ok: true });
}

export function markAllAsRead(req: Request, res: Response): void {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
  res.json({ ok: true });
}

export function deleteNotification(req: Request, res: Response): void {
  const { id } = req.params;
  const existing = db.prepare('SELECT id FROM notifications WHERE id = ?').get(id);
  if (!existing) { res.status(404).json({ error: 'Notification not found' }); return; }
  db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  res.json({ ok: true });
}
