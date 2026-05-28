import { Database } from 'better-sqlite3';

export function runSchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL UNIQUE,
      created_at TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      description  TEXT,
      price        REAL    NOT NULL,
      category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      image_path   TEXT,
      is_available INTEGER DEFAULT 1,
      is_featured  INTEGER DEFAULT 0,
      promo_price  REAL    DEFAULT NULL,
      promo_label  TEXT    DEFAULT NULL,
      created_at   TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    DEFAULT 'cashier',
      is_active  INTEGER DEFAULT 1,
      created_at TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number   TEXT    NOT NULL,
      total_amount   REAL    NOT NULL,
      payment_method TEXT    NOT NULL,
      cash_tendered  REAL,
      change_amount  REAL,
      status         TEXT    DEFAULT 'pending',
      cancel_reason  TEXT    DEFAULT NULL,
      created_by     INTEGER REFERENCES users(id),
      created_at     TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     INTEGER NOT NULL REFERENCES orders(id),
      menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
      item_name    TEXT    NOT NULL,
      item_price   REAL    NOT NULL,
      quantity     INTEGER NOT NULL,
      notes        TEXT    DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL UNIQUE,
      is_active  INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      color      TEXT    DEFAULT NULL,
      created_at TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category  ON menu_items(category_id);

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
