import { Database } from 'better-sqlite3';
import bcrypt from 'bcryptjs';

export function runSeed(db: Database): void {
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0) return; // Already seeded

  // Categories
  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const categories = ['Main Cutlets', 'Konbos', 'Snacks', 'Drinks'];
  categories.forEach(name => insertCategory.run(name));

  const getCategoryId = db.prepare('SELECT id FROM categories WHERE name = ?');
  const catId = (name: string): number => (getCategoryId.get(name) as { id: number }).id;

  // Menu items
  const insertItem = db.prepare(`
    INSERT INTO menu_items (name, description, price, category_id)
    VALUES (?, ?, ?, ?)
  `);

  const menuItems = [
    // Main Cutlets
    ['Tonkatsu',      'Breaded pork cutlet served with shredded cabbage and rice',                                              59,  catId('Main Cutlets')],
    ['Chicken Katsu', 'Breaded chicken cutlet served with shredded cabbage and rice',                                           49,  catId('Main Cutlets')],
    ['Extra Rice',    'Steamed white rice',                                                                                     12,  catId('Main Cutlets')],
    // Konbos
    ['Konbo 1',       'Tonkatsu + Rice + Cabbage + Samalamig + Side dish: Fries or Kikiam',                                    99,  catId('Konbos')],
    ['Konbo 2',       'Chicken Katsu + Rice + Cabbage + Samalamig + Side dish: Fries or Kikiam',                               89,  catId('Konbos')],
    ['Konbo 3',       'Mixed breaded pork and chicken cutlet + two rice + Samalamig + Side dish: Fries or Kikiam',             143, catId('Konbos')],
    // Snacks
    ['Pinili Bites',  'Fries + Kikiam + Hotdog + Kropek + Squidball + Fish ball',                                              49,  catId('Snacks')],
    ['French Fries',  'Crispy golden fries',                                                                                   25,  catId('Snacks')],
    ['Kropek',        'Crispy prawn crackers',                                                                                  20,  catId('Snacks')],
    ['Kikiam',        'Fried fish and vegetable roll',                                                                         15,  catId('Snacks')],
    // Drinks
    ['Bottled Water', 'Cold bottled water',                                                                                    15,  catId('Drinks')],
    ['Samalamig',     'Cold refreshment drink',                                                                                15,  catId('Drinks')],
    ['Coca-Cola Solo','Coca-Cola in a cup',                                                                                    18,  catId('Drinks')],
  ];

  menuItems.forEach(([name, description, price, category_id]) => {
    insertItem.run(name, description, price, category_id);
  });

  // Users with bcrypt-hashed passwords
  const insertUser = db.prepare(`
    INSERT INTO users (username, password, role) VALUES (?, ?, ?)
  `);

  const users = [
    { username: 'admin',   password: 'admin123',   role: 'owner'   },
    { username: 'cashier', password: 'cashier123', role: 'cashier' },
    { username: 'kitchen', password: 'kitchen123', role: 'kitchen' },
  ];

  users.forEach(({ username, password, role }) => {
    const hashed = bcrypt.hashSync(password, 10);
    insertUser.run(username, hashed, role);
  });
}
