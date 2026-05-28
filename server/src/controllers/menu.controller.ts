import { Request, Response } from 'express';
import db from '../database/db';
import { MenuItem } from '../types';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const IMAGES_DIR = path.join(__dirname, '../../public/images');

async function saveCompressedImage(buffer: Buffer): Promise<string> {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
  const outputPath = path.join(IMAGES_DIR, filename);
  await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
  return filename;
}

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

export async function create(req: Request, res: Response): Promise<void> {
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

  let image_path: string | null = null;
  if (req.file) {
    const filename = await saveCompressedImage(req.file.buffer);
    image_path = `/images/${filename}`;
  }

  const result = db.prepare(`
    INSERT INTO menu_items (name, description, price, category_id, image_path)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), description ?? null, price, category_id ?? null, image_path);

  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid) as MenuItem;

  const { getIO } = require('../socket/events');
  getIO().emit('menu:updated', item);

  res.status(201).json(item);
}

export async function update(req: Request, res: Response): Promise<void> {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItem | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  const { name, description, price, category_id, is_available } = req.body as Partial<MenuItem>;

  let image_path = existing.image_path;
  if (req.file) {
    // Delete old image file
    if (existing.image_path) {
      const oldPath = path.join(__dirname, '../../public', existing.image_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const filename = await saveCompressedImage(req.file.buffer);
    image_path = `/images/${filename}`;
  }

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

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
    return;
  }
  const filename = await saveCompressedImage(req.file.buffer);
  res.json({ image_path: `/images/${filename}` });
}
