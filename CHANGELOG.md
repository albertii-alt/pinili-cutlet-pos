# Changelog

All notable changes to Pinili Cutlet will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-01

### Added

#### Cashier
- Order screen with resizable menu grid and order panel
- Category tabs for filtering menu items
- Featured items appear first in the menu grid with a star indicator
- Add items to order by clicking menu cards; adjust quantity with +/− controls
- Per-item notes support (e.g. "no onions", "extra sauce")
- Hold order feature — save current cart with a label and resume later
- Multiple held orders supported simultaneously
- Payment method selection with cash tendered and automatic change calculation
- Order confirmation dialog (configurable in settings)
- QR code modal for cashier to share the client PWA URL

#### Queue
- Active orders queue page showing all pending orders in real time
- Order age indicator — turns orange after 5 minutes, red after 10 minutes
- Mark order as done button on each queue card
- Real-time order sync across all connected devices via Socket.IO

#### Dashboard
- Period filter: Today, This Week, This Month, Last Month, All, Custom
- Year selector for the All filter — scopes data to a specific year
- Stat cards: Total Sales, Total Orders, per-payment-method breakdown, Est. Net Profit
- Daily sales target with progress bar and automatic notifications at 80% and 100%
- Cash drawer management — set opening amount, close drawer, track discrepancy
- Sales area chart showing last 7 days of revenue
- Best sellers list
- End of Day report modal with full daily summary, payment breakdown, and top items

#### Menu Management
- Menu management page with item list, categories tab, and search
- Add, edit, and delete menu items with name, description, price, category, and image
- Toggle item availability instantly from the menu list
- Promo price and promo label per item
- Featured item toggle
- Category management — add, rename, and delete categories
- Menu item image upload with server-side storage

#### Order History
- Order history page with pagination (25 orders per page)
- Filter by period and payment method
- Order details modal with full item breakdown and cancel option
- Cancel completed orders with mandatory reason (minimum 5 characters)
- Export order history as CSV

#### Analytics
- Period filter with year selector for All
- Total Revenue, Average Order Value, Top Category, and Total Orders stat cards
- Sales area chart (last 7 days)
- Category sales donut chart
- Peak hours bar chart showing order count and revenue by hour
- Best sellers ranked list with quantity and revenue
- Monthly sales distribution radar chart — shows all 12 months for the selected year

#### Expenses
- Add, edit, and delete expense entries
- Expense categories: Ingredients, Utilities, Staff Meals, Packaging, Transport, Maintenance, Other
- Total expenses summary card with category breakdown bar chart
- Period filter with year selector for All; paginated expense list

#### Shift Reports
- Per-staff performance cards for any period
- Staff cards with total orders, total sales, average order value, and shift time range
- Sales share progress bar showing each staff member's percentage of total sales
- Period filter with year selector for All

#### Settings
- Card grid picker UI — click a card to enter a section, back button to return
- Account Security — change password with strength indicator, change username, upload/remove profile picture
- Staff Management — add cashier and kitchen accounts, edit, toggle active/disabled, delete
- System Settings — stall name and brand logo upload
- Display & Appearance — accent color presets (Red, Blue, Green, Purple, Orange, Slate), show item descriptions toggle
- Order Settings — order number prefix (1–4 letters), order confirmation dialog toggle
- Payment Methods — add, remove, set default, toggle active, assign color and logo per method
- Notifications — enable/disable order arrival sound, upload custom sound file, preview sound
- Data Management — manual backup, auto daily backup with configurable time, backup history, restore from .db file

#### Audit Logs
- Full history of all owner and staff actions
- Logged actions: order created/completed/cancelled, menu changes, staff changes, settings updates, backups, expenses

#### Utility Pages
- System Status — server uptime, database size, last backup time, connected devices, memory and CPU usage (auto-refresh every 10s)
- Help & User Guide — cashier guide, owner guide, FAQ, keyboard shortcuts, how-to walkthroughs
- Support & Feedback — contact developer form, bug report form, feature request form
- About — app name, version, description, developer info, tech stack, contact, MIT license
- Changelog — full version history

#### Infrastructure
- Offline-capable — all data stored locally in SQLite via better-sqlite3
- Multi-device support — cashier and kitchen devices connect over LAN via Socket.IO
- Client PWA served from the server at /app
- JWT-based authentication with role-based access control (owner, cashier, kitchen)
- Accent color applied globally and persisted — synced across all connected clients via socket
- In-app notification system for daily target milestones, cash drawer warnings, order cancellations, and auto backups
- WAL mode enabled on SQLite for better concurrent read performance
- Performance indexes on orders, order_items, menu_items, expenses, audit_logs, and notifications tables

---

<!-- Add new versions above this line, keeping newest first -->
