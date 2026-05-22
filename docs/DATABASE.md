# Database Design
## Pinili Cutlet — LAN-Based POS System

### Engine
- **Technology:** SQLite via better-sqlite3
- **Location:** `server/data/pinili_cutlet.db`
- **Access:** Only the backend server accesses the database directly
- **All clients** (desktop + web) access data via REST API

---

### Tables

#### `categories`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Auto ID |
| name | TEXT | NOT NULL, UNIQUE | Category name |
| created_at | TEXT | DEFAULT datetime('now','localtime') | Timestamp |

**Default seed data:**
- Main Cutlets
- Konbos
- Snacks
- Drinks

---

#### `menu_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Auto ID |
| name | TEXT | NOT NULL | Item name |
| description | TEXT | | Short description |
| price | REAL | NOT NULL | Price in Philippine Peso |
| category_id | INTEGER | FK → categories.id | Category reference |
| image_path | TEXT | | Relative path to image file |
| is_available | INTEGER | DEFAULT 1 | 1=available, 0=unavailable |
| created_at | TEXT | DEFAULT datetime('now','localtime') | Timestamp |

**Default seed data:** 13 Pinili Cutlet menu items

---

#### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Auto ID |
| username | TEXT | NOT NULL, UNIQUE | Login username |
| password | TEXT | NOT NULL | bcrypt hashed password |
| role | TEXT | DEFAULT 'cashier' | owner, cashier, kitchen |
| created_at | TEXT | DEFAULT datetime('now','localtime') | Timestamp |

**Default seed data:**
- username: `admin`, password: `admin123` (hashed), role: `owner`
- username: `cashier`, password: `cashier123` (hashed), role: `cashier`
- username: `kitchen`, password: `kitchen123` (hashed), role: `kitchen`

---

#### `orders`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Auto ID |
| order_number | TEXT | NOT NULL, UNIQUE | e.g. PC-001 |
| total_amount | REAL | NOT NULL | Total in Philippine Peso |
| payment_method | TEXT | NOT NULL | cash, gcash |
| cash_tendered | REAL | | Cash given (cash only) |
| change_amount | REAL | | Change returned (cash only) |
| status | TEXT | DEFAULT 'pending' | pending, completed, cancelled |
| created_by | INTEGER | FK → users.id | Who placed the order |
| created_at | TEXT | DEFAULT datetime('now','localtime') | Timestamp |

---

#### `order_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT | Auto ID |
| order_id | INTEGER | FK → orders.id | Parent order |
| menu_item_id | INTEGER | FK → menu_items.id | Menu item reference |
| item_name | TEXT | NOT NULL | Snapshot of name at order time |
| item_price | REAL | NOT NULL | Snapshot of price at order time |
| quantity | INTEGER | NOT NULL | Quantity ordered |

---

### Relationships
- `menu_items.category_id` → `categories.id` (many-to-one)
- `orders.created_by` → `users.id` (many-to-one)
- `order_items.order_id` → `orders.id` (many-to-one)
- `order_items.menu_item_id` → `menu_items.id` (many-to-one)

---

### REST API Endpoints

#### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/login | Login with username + password | None |
| POST | /api/auth/logout | Logout current session | JWT |

#### Categories
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/categories | Get all categories | JWT |
| POST | /api/categories | Add new category | Owner |
| DELETE | /api/categories/:id | Delete category | Owner |

#### Menu
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/menu | Get all menu items | JWT |
| GET | /api/menu/:id | Get single item | JWT |
| POST | /api/menu | Add menu item | Owner |
| PUT | /api/menu/:id | Update menu item | Owner |
| DELETE | /api/menu/:id | Delete menu item | Owner |
| PATCH | /api/menu/:id/availability | Toggle availability | Owner/Cashier |

#### Orders
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/orders | Get orders (with filter) | JWT |
| GET | /api/orders/active | Get pending orders | JWT |
| POST | /api/orders | Create new order | Cashier |
| PATCH | /api/orders/:id/complete | Mark as done | Cashier/Kitchen |
| PATCH | /api/orders/:id/cancel | Cancel order | Cashier |

#### Analytics
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/analytics/summary | Today's stats | Owner |
| GET | /api/analytics/sales | Daily sales last 7 days | Owner |
| GET | /api/analytics/best-sellers | Best selling items | Owner |
| GET | /api/analytics/revenue | Revenue by payment method | Owner |

---

### Socket.io Events
| Event | Direction | Payload | Description |
|---|---|---|---|
| `order:created` | Server → Clients | order object | New order placed |
| `order:completed` | Server → Clients | order id | Order marked done |
| `order:cancelled` | Server → Clients | order id | Order cancelled |
| `menu:updated` | Server → Clients | menu item | Item edited |
| `item:availability` | Server → Clients | {id, is_available} | Availability toggled |
| `category:added` | Server → Clients | category object | New category added |
| `category:deleted` | Server → Clients | category id | Category removed |

---

### Key Business Rules
1. Only the server touches the database directly
2. All frontend apps communicate via REST API + WebSocket
3. Deleting a category sets `category_id` to NULL on affected items
4. `item_name` and `item_price` in `order_items` are snapshots —
   they never change even if the menu item is later edited
5. Order numbers follow format `PC-XXX` zero-padded to 3 digits
6. `cash_tendered` and `change_amount` are NULL for GCash orders
7. Passwords are always bcrypt hashed — never stored as plain text
8. JWT tokens expire after 24 hours
9. Images are stored as files in `server/public/images/`
   and served as static files via Express