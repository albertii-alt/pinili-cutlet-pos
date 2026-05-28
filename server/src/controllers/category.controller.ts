import { Request, Response } from 'express';
import db from '../database/db';
import { Category } from '../types';
import { logAudit } from '../utils/auditLogger';

export function getAll(req: Request, res: Response): void {
  const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all() as Category[];
  res.json(categories);
}

export function create(req: Request, res: Response): void {
  const { name } = req.body as { name: string };

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  try {
    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name.trim());
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as Category;

    // Emit socket event — imported lazily to avoid circular dependency
    const { getIO } = require('../socket/events');
    getIO().emit('category:added', category);

    logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'CATEGORY_CREATED', entity_type: 'category', entity_id: String(category.id), details: `Created category: ${category.name}` });

    res.status(201).json(category);
  } catch {
    res.status(409).json({ error: 'Category name already exists' });
  }
}

export function rename(req: Request, res: Response): void {
  const { id } = req.params;
  const { name } = req.body as { name: string };

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  try {
    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name.trim(), id);
    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category;

    const { getIO } = require('../socket/events');
    getIO().emit('category:renamed', updated);

    res.json(updated);
  } catch {
    res.status(409).json({ error: 'Category name already exists' });
  }
}

export function remove(req: Request, res: Response): void {
  const { id } = req.params;

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  // Business rule #3: set category_id to NULL on affected menu items (handled by ON DELETE SET NULL FK)
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);

  logAudit({ user_id: req.user!.id, username: req.user!.username, action: 'CATEGORY_DELETED', entity_type: 'category', entity_id: String(id), details: `Deleted category: ${category.name}` });

  const { getIO } = require('../socket/events');
  getIO().emit('category:deleted', Number(id));

  res.json({ message: 'Category deleted' });
}
