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
