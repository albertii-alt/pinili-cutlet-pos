import { Request, Response } from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import db from '../database/db';
import { getIO } from '../socket/events';

const DB_PATH     = path.join(__dirname, '../../data/pinili_cutlet.db');
const BACKUPS_DIR = path.join(__dirname, '../../data/backups');

// Server start time — captured once when the module is first loaded
const SERVER_START = Date.now();

export function getSystemStatus(_req: Request, res: Response): void {
  // ── Uptime ────────────────────────────────────────────────────────────────
  const uptimeMs      = Date.now() - SERVER_START;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  const uptimeDays    = Math.floor(uptimeSeconds / 86400);
  const uptimeHours   = Math.floor((uptimeSeconds % 86400) / 3600);
  const uptimeMins    = Math.floor((uptimeSeconds % 3600) / 60);
  const uptimeSecs    = uptimeSeconds % 60;

  // ── Database size ─────────────────────────────────────────────────────────
  let dbSizeBytes = 0;
  try {
    dbSizeBytes = fs.statSync(DB_PATH).size;
  } catch { /* file may not exist yet */ }

  // ── Last backup time ──────────────────────────────────────────────────────
  const lastBackupRow = db.prepare(
    `SELECT value FROM settings WHERE key = 'last_backup_at'`
  ).get() as { value: string } | undefined;
  const lastBackupAt = lastBackupRow?.value || null;

  // Also check the most recent backup file as a fallback
  let lastBackupFile: string | null = null;
  try {
    if (fs.existsSync(BACKUPS_DIR)) {
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.endsWith('.db'))
        .map(f => ({ name: f, mtime: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      if (files.length > 0) {
        lastBackupFile = new Date(files[0].mtime).toISOString();
      }
    }
  } catch { /* ignore */ }

  // ── Connected devices ─────────────────────────────────────────────────────
  let connectedClients = 0;
  try {
    connectedClients = getIO().engine.clientsCount;
  } catch { /* socket may not be ready */ }

  // ── System resources ──────────────────────────────────────────────────────
  const totalMemBytes = os.totalmem();
  const freeMemBytes  = os.freemem();
  const usedMemBytes  = totalMemBytes - freeMemBytes;
  const memUsagePct   = Math.round((usedMemBytes / totalMemBytes) * 100);

  // CPU load average (1-min, 5-min, 15-min) — normalized per core
  const cpuCount  = os.cpus().length;
  const loadAvg   = os.loadavg(); // [1m, 5m, 15m]
  const cpuLoad1m = Math.min(100, Math.round((loadAvg[0] / cpuCount) * 100));

  // Node.js process memory
  const processMemBytes = process.memoryUsage().rss;

  res.json({
    uptime: {
      ms:      uptimeMs,
      seconds: uptimeSeconds,
      days:    uptimeDays,
      hours:   uptimeHours,
      minutes: uptimeMins,
      secs:    uptimeSecs,
    },
    database: {
      sizeBytes: dbSizeBytes,
      path:      DB_PATH,
    },
    backup: {
      lastBackupAt:   lastBackupAt || lastBackupFile,
      lastBackupFile,
    },
    connections: {
      connectedClients,
    },
    system: {
      platform:        os.platform(),
      arch:            os.arch(),
      nodeVersion:     process.version,
      totalMemBytes,
      freeMemBytes,
      usedMemBytes,
      memUsagePct,
      cpuLoad1m,
      cpuCount,
      processMemBytes,
      hostname:        os.hostname(),
    },
  });
}
