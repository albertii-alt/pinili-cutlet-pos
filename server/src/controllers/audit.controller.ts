import { Request, Response } from 'express';
import db from '../database/db';

export function getAuditLogs(req: Request, res: Response): void {
  const { start_date, end_date, username, action, limit, offset } = req.query as {
    start_date?: string;
    end_date?: string;
    username?: string;
    action?: string;
    limit?: string;
    offset?: string;
  };

  const pageSize = Math.min(100, Math.max(1, parseInt(limit  ?? '50', 10)));
  const skip     = Math.max(0,              parseInt(offset ?? '0',  10));

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (start_date) { where += ' AND DATE(created_at) >= ?'; params.push(start_date); }
  if (end_date)   { where += ' AND DATE(created_at) <= ?'; params.push(end_date); }
  if (username)   { where += ' AND LOWER(username) LIKE ?'; params.push(`%${username.toLowerCase()}%`); }
  if (action)     { where += ' AND action = ?'; params.push(action); }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM audit_logs ${where}`).get(...params) as { c: number }).c;
  const logs  = db.prepare(`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, skip);

  res.json({ data: logs, total, limit: pageSize, offset: skip });
}

export function deleteAuditLog(req: Request, res: Response): void {
  const { id } = req.params;
  const existing = db.prepare('SELECT id FROM audit_logs WHERE id = ?').get(id);
  if (!existing) { res.status(404).json({ error: 'Log not found' }); return; }
  db.prepare('DELETE FROM audit_logs WHERE id = ?').run(id);
  res.json({ ok: true });
}

export function deleteAllAuditLogs(req: Request, res: Response): void {
  db.prepare('DELETE FROM audit_logs').run();
  res.json({ ok: true });
}

export function deleteManyAuditLogs(req: Request, res: Response): void {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids must be a non-empty array' });
    return;
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM audit_logs WHERE id IN (${placeholders})`).run(...ids);
  res.json({ ok: true, deleted: ids.length });
}
