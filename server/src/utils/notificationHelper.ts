import db from '../database/db';

interface NotificationRow {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export function createNotification(type: string, title: string, message: string): void {
  try {
    const result = db.prepare(
      'INSERT INTO notifications (type, title, message) VALUES (?, ?, ?)'
    ).run(type, title, message);

    const notif = db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid) as NotificationRow;

    const { getIO } = require('../socket/events');
    getIO().emit('notification:new', notif);
  } catch {
    // Fail silently — never block main operations
  }
}
