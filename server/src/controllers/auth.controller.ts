import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../database/db';
import { User, AuthPayload } from '../types';
import { logAudit } from '../utils/auditLogger';

function parseUserAgent(ua: string = '') {
  const isMobile  = /mobile/i.test(ua);
  const isTablet  = /tablet|ipad/i.test(ua);
  const os        = /android/i.test(ua)        ? 'Android'
    : /ipad|iphone|ios/i.test(ua) ? 'iOS'
    : /windows/i.test(ua)         ? 'Windows'
    : /mac/i.test(ua)             ? 'macOS'
    : /linux/i.test(ua)           ? 'Linux' : 'Unknown';
  const browser   = /chrome/i.test(ua) && !/edg/i.test(ua) ? 'Chrome'
    : /safari/i.test(ua) && !/chrome/i.test(ua) ? 'Safari'
    : /firefox/i.test(ua) ? 'Firefox'
    : /edg/i.test(ua)     ? 'Edge' : 'Unknown';
  const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
  return { os, browser, deviceType };
}

export function login(req: Request, res: Response): void {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

  const ip     = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
  const device  = (req.headers['x-client-type'] as string) ?? 'unknown';
  const ua      = req.headers['user-agent'] as string ?? '';
  const { os, browser, deviceType } = parseUserAgent(ua);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    logAudit({ username: username || 'unknown', action: 'LOGIN_FAILED', details: `Failed login attempt | role: unknown | os: ${os} | browser: ${browser} | device_type: ${deviceType} | ip: ${ip} | device: ${device}` });
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  if ((user as User & { is_active: number }).is_active === 0) {
    res.status(403).json({ error: 'Your account has been disabled. Contact the owner.' });
    return;
  }

  const payload: AuthPayload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });

  logAudit({ user_id: user.id, username: user.username, action: 'LOGIN', details: `Logged in | role: ${user.role} | os: ${os} | browser: ${browser} | device_type: ${deviceType} | ip: ${ip} | device: ${device}` });

  res.json({ token, user: payload });
}

export function logout(req: Request, res: Response): void {
  if (req.user) {
    const ip     = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
    const device = (req.headers['x-client-type'] as string) ?? 'unknown';
    const ua     = req.headers['user-agent'] as string ?? '';
    const { os, browser, deviceType } = parseUserAgent(ua);
    logAudit({ user_id: req.user.id, username: req.user.username, action: 'LOGOUT', details: `Logged out | role: ${req.user.role} | os: ${os} | browser: ${browser} | device_type: ${deviceType} | ip: ${ip} | device: ${device}` });
  }
  res.json({ message: 'Logged out successfully' });
}

export function changePassword(req: Request, res: Response): void {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new password are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as User | undefined;
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user!.id);

  logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'PASSWORD_CHANGED', details: 'Owner changed their password' });

  res.json({ message: 'Password updated successfully' });
}

export function changeUsername(req: Request, res: Response): void {
  const { currentPassword, newUsername } = req.body as { currentPassword: string; newUsername: string };

  if (!currentPassword || !newUsername) {
    res.status(400).json({ error: 'Current password and new username are required' });
    return;
  }

  const trimmed = newUsername.trim();

  if (trimmed.length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters' });
    return;
  }
  if (/\s/.test(trimmed)) {
    res.status(400).json({ error: 'Username must not contain spaces' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as User | undefined;
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  try {
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(trimmed, req.user!.id);
  } catch {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  const payload: AuthPayload = { id: user.id, username: trimmed, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });

  logAudit({ user_id: user.id, username: trimmed, action: 'USERNAME_CHANGED', details: `Username changed from "${user.username}" to "${trimmed}"` });

  res.json({ token, user: payload });
}

export function getAllStaff(req: Request, res: Response): void {
  const staff = db.prepare(
    "SELECT id, username, role, is_active, created_at FROM users WHERE role != 'owner' ORDER BY created_at ASC"
  ).all();
  res.json(staff);
}

export function createStaff(req: Request, res: Response): void {
  const { username, password, role } = req.body as { username: string; password: string; role: string };

  if (!username?.trim() || !password || !role) {
    res.status(400).json({ error: 'Username, password, and role are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  if (!['cashier', 'kitchen'].includes(role)) {
    res.status(400).json({ error: 'Role must be cashier or kitchen' });
    return;
  }

  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)'
    ).run(username.trim(), hashed, role);
    const created = db.prepare('SELECT id, username, role, is_active, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'STAFF_CREATED', entity_type: 'user', entity_id: String(result.lastInsertRowid), details: `Created ${role} account: ${username.trim()}` });
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: 'Username already exists' });
  }
}

export function updateStaff(req: Request, res: Response): void {
  const { id } = req.params;
  const { username, password, role } = req.body as { username?: string; password?: string; role?: string };

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  if (!existing) { res.status(404).json({ error: 'Staff not found' }); return; }
  if (existing.role === 'owner') { res.status(403).json({ error: 'Cannot modify owner account' }); return; }

  if (username?.trim()) {
    try {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username.trim(), id);
    } catch {
      res.status(409).json({ error: 'Username already exists' }); return;
    }
  }
  if (password) {
    if (password.length < 6) { res.status(400).json({ error: 'Password must be at least 6 characters' }); return; }
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), id);
  }
  if (role && ['cashier', 'kitchen'].includes(role)) {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  }

  const updated = db.prepare('SELECT id, username, role, is_active, created_at FROM users WHERE id = ?').get(id);
  logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'STAFF_UPDATED', entity_type: 'user', entity_id: String(id), details: `Updated staff account: ${existing.username}` });
  res.json(updated);
}

export function deleteStaff(req: Request, res: Response): void {
  const { id } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) { res.status(404).json({ error: 'Staff not found' }); return; }
  if (user.role === 'owner') { res.status(403).json({ error: 'Cannot delete owner account' }); return; }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'STAFF_DELETED', entity_type: 'user', entity_id: String(id), details: `Deleted ${user.role} account: ${user.username}` });
  res.json({ message: 'Staff deleted' });
}

export function toggleStaffStatus(req: Request, res: Response): void {
  const { id } = req.params;
  const { is_active } = req.body as { is_active: number };
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) { res.status(404).json({ error: 'Staff not found' }); return; }
  if (user.role === 'owner') { res.status(403).json({ error: 'Cannot disable owner account' }); return; }
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active, id);
  logAudit({ user_id: req.user!.id, username: req.user!.username, action: is_active ? 'STAFF_ENABLED' : 'STAFF_DISABLED', entity_type: 'user', entity_id: String(id), details: `${is_active ? 'Enabled' : 'Disabled'} ${user.role} account: ${user.username}` });
  res.json({ id: Number(id), is_active });
}
