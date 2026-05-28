import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import db from '../database/db';
import { logAudit } from '../utils/auditLogger';

const DATA_DIR    = path.join(__dirname, '../../data');
const DB_PATH     = path.join(DATA_DIR, 'pinili_cutlet.db');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 7;

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

function formatDate(d: Date): string {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
}

// Prune oldest files, keep only MAX_BACKUPS
function pruneOldBackups() {
  ensureBackupsDir();
  const files = fs.readdirSync(BACKUPS_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs }))
    .sort((a, b) => a.mtime - b.mtime); // oldest first

  while (files.length > MAX_BACKUPS) {
    const oldest = files.shift()!;
    fs.unlinkSync(path.join(BACKUPS_DIR, oldest.name));
  }
}

// ─── createBackup ─────────────────────────────────────────────────────────────

export function createBackup(req: Request, res: Response): void {
  try {
    ensureBackupsDir();
    db.exec('VACUUM');
    const filename = `pinili-cutlet-backup-${formatDate(new Date())}.db`;
    (db as any).backup(path.join(BACKUPS_DIR, filename));
    // Serve as file download
    logAudit({ user_id: req.user?.id, username: req.user?.username ?? 'owner', action: 'BACKUP_CREATED', details: `Manual backup created: ${filename}` });
    res.download(DB_PATH, filename, err => {
      if (err && !res.headersSent) res.status(500).json({ error: 'Download failed' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Backup failed' });
  }
}

// ─── restoreBackup ────────────────────────────────────────────────────────────

export function restoreBackup(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  try {
    // Close WAL checkpoint before replacing
    db.pragma('wal_checkpoint(TRUNCATE)');
    fs.copyFileSync(req.file.path, DB_PATH);
    fs.unlinkSync(req.file.path);
    logAudit({ user_id: req.user?.id, username: req.user?.username ?? 'owner', action: 'BACKUP_RESTORED', details: `Database restored from uploaded file` });
    res.json({ ok: true, message: 'Database restored. Please restart the server.' });
  } catch {
    res.status(500).json({ error: 'Restore failed' });
  }
}

// ─── listBackups ──────────────────────────────────────────────────────────────

export function listBackups(req: Request, res: Response): void {
  ensureBackupsDir();
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
      .map(f => {
        const stat = fs.statSync(path.join(BACKUPS_DIR, f));
        return { filename: f, size: stat.size, created_at: stat.mtime.toISOString() };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(files);
  } catch {
    res.status(500).json({ error: 'Failed to list backups' });
  }
}

// ─── deleteBackup ─────────────────────────────────────────────────────────────

export function deleteBackup(req: Request, res: Response): void {
  const filename = String(req.params.filename);
  if (!/^backup-\d{4}-\d{2}-\d{2}\.db$/.test(filename)) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }
  const filePath = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  fs.unlinkSync(filePath);
  res.json({ ok: true });
}

// ─── configAutoBackup ─────────────────────────────────────────────────────────

export function configAutoBackup(req: Request, res: Response): void {
  const { enabled, time } = req.body as { enabled: boolean; time: string };

  // Validate time format HH:MM
  if (time !== undefined && !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: 'time must be HH:MM format' });
    return;
  }

  if (enabled !== undefined) {
    db.prepare(`UPDATE settings SET value = ?, updated_at = datetime('now','localtime') WHERE key = 'auto_backup_enabled'`)
      .run(enabled ? 'true' : 'false');
  }
  if (time !== undefined) {
    db.prepare(`UPDATE settings SET value = ?, updated_at = datetime('now','localtime') WHERE key = 'auto_backup_time'`)
      .run(time);
  }

  // Reschedule cron with new settings
  scheduleAutoBackup();

  res.json({ ok: true });
}

// ─── downloadBackupFile ───────────────────────────────────────────────────────

export function downloadBackupFile(req: Request, res: Response): void {
  const filename = String(req.params.filename);
  if (!/^backup-\d{4}-\d{2}-\d{2}\.db$/.test(filename)) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }
  const filePath = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  res.download(filePath, filename, (err: Error | null) => {
    if (err && !res.headersSent) res.status(500).json({ error: 'Download failed' });
  });
}

// ─── Auto backup cron ─────────────────────────────────────────────────────────

import type { ScheduledTask } from 'node-cron';

let cronJob: ScheduledTask | null = null;

export function scheduleAutoBackup() {
  // Stop existing job
  if (cronJob) { cronJob.stop(); cronJob = null; }

  const enabledRow = db.prepare(`SELECT value FROM settings WHERE key = 'auto_backup_enabled'`).get() as { value: string } | undefined;
  const timeRow    = db.prepare(`SELECT value FROM settings WHERE key = 'auto_backup_time'`).get()    as { value: string } | undefined;

  if (enabledRow?.value !== 'true') return;

  const time = timeRow?.value ?? '23:00';
  const [hh, mm] = time.split(':');
  const cronExpr = `${mm} ${hh} * * *`;

  if (!cron.validate(cronExpr)) {
    console.warn(`[Backup] Invalid cron expression: ${cronExpr}`);
    return;
  }

  cronJob = cron.schedule(cronExpr, () => {
    ensureBackupsDir();
    const filename = `backup-${formatDate(new Date())}.db`;
    const dest     = path.join(BACKUPS_DIR, filename);
    try {
      db.exec('VACUUM');
      (db as any).backup(dest);
      db.prepare(`UPDATE settings SET value = ?, updated_at = datetime('now','localtime') WHERE key = 'last_backup_at'`)
        .run(new Date().toISOString());
      pruneOldBackups();
      console.log(`[Backup] Auto backup saved: ${filename}`);
    } catch (err) {
      console.error('[Backup] Auto backup failed:', err);
    }
  });

  console.log(`[Backup] Auto backup scheduled at ${time} (cron: ${cronExpr})`);
}
