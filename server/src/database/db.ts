import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { runSchema } from './schema';
import { runSeed } from './seed';

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pinili_cutlet.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migration: remove UNIQUE constraint from orders.order_number
function migrateOrdersTable(): void {
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'").get() as { sql: string } | undefined;

  // Only migrate if the UNIQUE constraint exists
  if (!tableInfo || !tableInfo.sql.includes('UNIQUE')) return;

  console.log('[DB] Migrating orders table — removing UNIQUE constraint from order_number...');

  db.pragma('foreign_keys = OFF');

  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders_new (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number   TEXT    NOT NULL,
        total_amount   REAL    NOT NULL,
        payment_method TEXT    NOT NULL,
        cash_tendered  REAL,
        change_amount  REAL,
        status         TEXT    DEFAULT 'pending',
        created_by     INTEGER REFERENCES users(id),
        created_at     TEXT    DEFAULT (datetime('now','localtime'))
      );

      INSERT INTO orders_new SELECT * FROM orders;

      DROP TABLE orders;

      ALTER TABLE orders_new RENAME TO orders;
    `);
  })();

  db.pragma('foreign_keys = ON');

  console.log('[DB] Migration complete.');
}

// Migration: add is_active column to users if missing
function migrateUsersTable(): void {
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!cols.some(c => c.name === 'is_active')) {
    console.log('[DB] Adding is_active column to users...');
    db.prepare('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1').run();
    console.log('[DB] Migration complete.');
  }
  // Always ensure no NULL values — fix existing rows
  db.prepare('UPDATE users SET is_active = 1 WHERE is_active IS NULL').run();
}

// Migration: add cancel_reason column to orders if missing
function migrateOrdersColumns(): void {
  const cols = db.prepare("PRAGMA table_info(orders)").all() as { name: string }[];
  if (!cols.some(c => c.name === 'cancel_reason')) {
    console.log('[DB] Adding cancel_reason column to orders...');
    db.prepare('ALTER TABLE orders ADD COLUMN cancel_reason TEXT DEFAULT NULL').run();
    console.log('[DB] Migration complete.');
  }
  if (!cols.some(c => c.name === 'created_by')) {
    console.log('[DB] Adding created_by column to orders...');
    db.prepare('ALTER TABLE orders ADD COLUMN created_by INTEGER DEFAULT NULL').run();
    console.log('[DB] Migration complete.');
  }
}

// Migration: ensure default settings rows exist (INSERT OR IGNORE — safe to run always)
function migrateDefaultSettings(): void {
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('daily_target',    '0')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('stall_name',      'Pinili Cutlet')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_payment', 'cash')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('accent_color',    '#C0392B')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('show_item_description', 'false')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('order_prefix',    'PC')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('order_confirmation', 'false')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('notification_enabled', 'true')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('notification_sound',   '')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_backup_enabled',  'false')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_backup_time',     '23:00')`).run();
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('last_backup_at',       '')`).run();
}

// Migration: seed default payment methods if table is empty
function migratePaymentMethods(): void {
  const count = (db.prepare('SELECT COUNT(*) as c FROM payment_methods').get() as { c: number }).c;
  if (count === 0) {
    db.prepare(`INSERT OR IGNORE INTO payment_methods (name, is_default, sort_order, color) VALUES ('Cash',  1, 0, '#27AE60')`).run();
    db.prepare(`INSERT OR IGNORE INTO payment_methods (name, is_default, sort_order, color) VALUES ('GCash', 0, 1, '#2980B9')`).run();
  }
}

// Migration: add color column to payment_methods if missing
function migratePaymentMethodsColor(): void {
  const cols = db.prepare("PRAGMA table_info(payment_methods)").all() as { name: string }[];
  if (!cols.some(c => c.name === 'color')) {
    console.log('[DB] Adding color column to payment_methods...');
    db.prepare('ALTER TABLE payment_methods ADD COLUMN color TEXT DEFAULT NULL').run();
    // Set default colors for existing Cash/GCash rows
    db.prepare("UPDATE payment_methods SET color = '#27AE60' WHERE LOWER(name) = 'cash' AND color IS NULL").run();
    db.prepare("UPDATE payment_methods SET color = '#2980B9' WHERE LOWER(name) = 'gcash' AND color IS NULL").run();
    console.log('[DB] Migration complete.');
  }
  if (!cols.some(c => c.name === 'logo_path')) {
    console.log('[DB] Adding logo_path column to payment_methods...');
    db.prepare('ALTER TABLE payment_methods ADD COLUMN logo_path TEXT DEFAULT NULL').run();
    console.log('[DB] Migration complete.');
  }
}
function migrateMenuItemsTable(): void {
  const cols = db.prepare("PRAGMA table_info(menu_items)").all() as { name: string }[];
  if (!cols.some(c => c.name === 'is_featured')) {
    console.log('[DB] Adding is_featured column to menu_items...');
    db.prepare('ALTER TABLE menu_items ADD COLUMN is_featured INTEGER DEFAULT 0').run();
    console.log('[DB] Migration complete.');
  }
  if (!cols.some(c => c.name === 'promo_price')) {
    console.log('[DB] Adding promo_price column to menu_items...');
    db.prepare('ALTER TABLE menu_items ADD COLUMN promo_price REAL DEFAULT NULL').run();
    console.log('[DB] Migration complete.');
  }
  if (!cols.some(c => c.name === 'promo_label')) {
    console.log('[DB] Adding promo_label column to menu_items...');
    db.prepare('ALTER TABLE menu_items ADD COLUMN promo_label TEXT DEFAULT NULL').run();
    console.log('[DB] Migration complete.');
  }
}

// Migration: normalize payment_method casing in orders and payment_methods tables
function migrateNormalizePaymentCasing(): void {
  db.prepare('UPDATE orders SET payment_method = LOWER(payment_method) WHERE payment_method != LOWER(payment_method)').run();
  db.prepare('UPDATE payment_methods SET name = LOWER(name) WHERE name != LOWER(name)').run();
}

// Migration: create performance indexes if missing
function migrateIndexes(): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category  ON menu_items(category_id);
  `);
}

// Migration: add notes column to order_items if missing
function migrateOrderItemsNotes(): void {
  const cols = db.prepare('PRAGMA table_info(order_items)').all() as { name: string }[];
  if (!cols.some(c => c.name === 'notes')) {
    console.log('[DB] Adding notes column to order_items...');
    db.prepare('ALTER TABLE order_items ADD COLUMN notes TEXT DEFAULT NULL').run();
    console.log('[DB] Migration complete.');
  }
}

// Migration: create audit_logs table if missing (safe — schema handles IF NOT EXISTS)
function migrateAuditLogs(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER,
      username    TEXT    NOT NULL,
      action      TEXT    NOT NULL,
      entity_type TEXT,
      entity_id   TEXT,
      details     TEXT,
      created_at  TEXT    DEFAULT (datetime('now','localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_username   ON audit_logs(username);
    CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_logs(action);
  `);
}

// Migration: create cash_drawer table if missing
function migrateCashDrawer(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cash_drawer (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      date             TEXT    NOT NULL UNIQUE,
      opening_amount   REAL    DEFAULT 0,
      expected_amount  REAL    DEFAULT 0,
      actual_amount    REAL    DEFAULT NULL,
      discrepancy      REAL    DEFAULT NULL,
      notes            TEXT    DEFAULT NULL,
      closed_at        TEXT    DEFAULT NULL,
      created_at       TEXT    DEFAULT (datetime('now','localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_cash_drawer_date ON cash_drawer(date);
  `);
}

// Migration: create expenses table if missing
function migrateExpenses(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT    NOT NULL,
      amount      REAL    NOT NULL,
      category    TEXT    DEFAULT 'Other',
      date        TEXT    DEFAULT (date('now','localtime')),
      created_by  INTEGER,
      created_at  TEXT    DEFAULT (datetime('now','localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  `);
}

// Initialize schema and seed data
runSchema(db);
migrateOrdersTable();
migrateOrdersColumns();
migrateUsersTable();
migrateMenuItemsTable();
migrateDefaultSettings();
migratePaymentMethods();
migratePaymentMethodsColor();
migrateNormalizePaymentCasing();
migrateIndexes();
migrateOrderItemsNotes();
migrateAuditLogs();
migrateCashDrawer();
migrateExpenses();
runSeed(db);

export default db;
