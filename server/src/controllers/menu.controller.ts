import { Request, Response } from 'express';
import db from '../database/db';
import { MenuItem } from '../types';
import path from 'path';
import fs from 'fs';

export function getAll(req: Request, res: Response): void {
  const items = db.prepare('SELECT * FROM menu_items ORDER BY category_id ASC, id ASC').all() as MenuItem[];
  res.json(items);
}

export function getById(req: Request, res: Response): void {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem | undefined;
  if (!item) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  res.json(item);
}

export function create(req: Request, res: Response): void {
  const { name, description, price, category_id } = req.body as {
    name: string;
    description?: string;
    price: number;
    category_id?: number;
  };

  if (!name || !name.trim() || price === undefined) {
    res.status(400).json({ error: 'Name and price are required' });
    return;
  }

  const image_path = req.file ? `/images/${req.file.filename}` : null;

  const result = db.prepare(`
    INSERT INTO menu_items (name, description, price, category_id, image_path)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), description ?? null, price, category_id ?? null, image_path);

  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid) as MenuItem;

  const { getIO } = require('../socket/events');
  getIO().emit('menu:updated', item);

  res.status(201).json(item);
}

export function update(req: Request, res: Response): void {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  const { name, description, price, category_id, is_available } = req.body as Partial<MenuItem>;

  // If a new image was uploaded, delete the old one
  if (req.file && existing.image_path) {
    const oldPath = path.join(__dirname, '../../public', existing.image_path);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const image_path = req.file ? `/images/${req.file.filename}` : existing.image_path;

  db.prepare(`
    UPDATE menu_items
    SET name = ?, description = ?, price = ?, category_id = ?, image_path = ?, is_available = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    description ?? existing.description,
    price ?? existing.price,
    category_id ?? existing.category_id,
    image_path,
    is_available ?? existing.is_available,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem;

  const { getIO } = require('../socket/events');
  getIO().emit('menu:updated', updated);

  res.json(updated);
}

export function remove(req: Request, res: Response): void {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  // Delete associated image file if present
  if (existing.image_path) {
    const imgPath = path.join(__dirname, '../../public', existing.image_path);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ message: 'Menu item deleted' });
}

export function toggleAvailability(req: Request, res: Response): void {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  const newValue = existing.is_available === 1 ? 0 : 1;
  db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(newValue, req.params.id);

  const { getIO } = require('../socket/events');
  getIO().emit('item:availability', { id: existing.id, is_available: newValue });

  res.json({ id: existing.id, is_available: newValue });
}

export function toggleFeatured(req: Request, res: Response): void {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  db.prepare(`
    UPDATE menu_items SET is_featured = CASE WHEN is_featured = 1 THEN 0 ELSE 1 END WHERE id = ?
  `).run(req.params.id);

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem;

  const { getIO } = require('../socket/events');
  getIO().emit('menu:updated', updated);

  res.json({ id: updated.id, is_featured: updated.is_featured });
}

export function setPromoPrice(req: Request, res: Response): void {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  const { promoPrice, promoLabel } = req.body as { promoPrice: number | null; promoLabel?: string | null };

  // null promoPrice = clear the promo
  if (promoPrice !== null && promoPrice !== undefined) {
    if (typeof promoPrice !== 'number' || isNaN(promoPrice) || promoPrice <= 0) {
      res.status(400).json({ error: 'promoPrice must be a positive number' });
      return;
    }
    if (promoPrice >= existing.price) {
      res.status(400).json({ error: 'Promo price must be less than the original price' });
      return;
    }
  }

  db.prepare(`
    UPDATE menu_items SET promo_price = ?, promo_label = ? WHERE id = ?
  `).run(
    promoPrice ?? null,
    promoPrice !== null && promoPrice !== undefined ? (promoLabel ?? null) : null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem;

  const { getIO } = require('../socket/events');
  getIO().emit('menu:updated', updated);

  res.json(updated);
}

export function bulkToggleAvailability(req: Request, res: Response): void {
  const { categoryId, isAvailable } = req.body as { categoryId: number; isAvailable: boolean };

  if (categoryId === undefined || isAvailable === undefined) {
    res.status(400).json({ error: 'categoryId and isAvailable are required' });
    return;
  }

  db.prepare('UPDATE menu_items SET is_available = ? WHERE category_id = ?')
    .run(isAvailable ? 1 : 0, categoryId);

  const { getIO } = require('../socket/events');
  getIO().emit('menu:bulk-availability', { categoryId, is_available: isAvailable ? 1 : 0 });

  res.json({ message: 'Bulk availability updated', categoryId, is_available: isAvailable ? 1 : 0 });
}

export function uploadImage(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
    return;
  }
  res.json({ image_path: `/images/${req.file.filename}` });
}
