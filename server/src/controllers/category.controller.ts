import { Request, Response } from 'express';
import db from '../database/db';
import { Category } from '../types';

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

    res.status(201).json(category);
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

  const { getIO } = require('../socket/events');
  getIO().emit('category:deleted', Number(id));

  res.json({ message: 'Category deleted' });
}
