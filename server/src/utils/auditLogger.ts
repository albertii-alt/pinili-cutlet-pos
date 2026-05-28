import db from '../database/db';

interface AuditParams {
  user_id?: number | null;
  username: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  details?: string | null;
}

export function logAudit(params: AuditParams): void {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      params.user_id ?? null,
      params.username,
      params.action,
      params.entity_type ?? null,
      params.entity_id ?? null,
      params.details ?? null,
    );
  } catch {
    // Fail silently — never block main operations
  }
}
