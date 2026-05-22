# Task Breakdown
## Pinili Cutlet — LAN-Based POS System

### Total: 3 Projects, 75 Tasks

---

## PROJECT 1: Backend Server (server/)

### Phase 1 — Project Setup
**Task 1** — Initialize Node.js + TypeScript project
```bash
mkdir server && cd server
npm init -y
npm install express better-sqlite3 socket.io jsonwebtoken bcryptjs cors
npm install -D typescript @types/node @types/express @types/better-sqlite3
npm install -D @types/jsonwebtoken @types/bcryptjs @types/cors ts-node nodemon
npx tsc --init
```

**Task 2** — Configure `tsconfig.json` and `nodemon.json`

**Task 3** — Set up folder structure:
server/src/
├── database/
├── routes/
├── controllers/
├── middleware/
├── socket/
└── types/
---

### Phase 2 — Database
**Task 4** — `server/src/types/index.ts`
- Category, MenuItem, User, Order, OrderItem interfaces
- AuthPayload, OrderFilter, AnalyticsSummary types

**Task 5** — `server/src/database/schema.ts`
- CREATE TABLE for: categories, menu_items, users, orders, order_items

**Task 6** — `server/src/database/seed.ts`
- 4 default categories
- 13 Pinili Cutlet menu items
- 3 default users (owner, cashier, kitchen) with hashed passwords

**Task 7** — `server/src/database/db.ts`
- Open SQLite connection via better-sqlite3
- Run schema on first launch
- Run seed if tables empty
- Export db instance

---

### Phase 3 — Middleware
**Task 8** — `server/src/middleware/auth.middleware.ts`
- Verify JWT token from Authorization header
- Attach user to request object
- Role-based access control helper

**Task 9** — `server/src/middleware/error.middleware.ts`
- Global error handler
- Consistent error response format

---

### Phase 4 — Controllers
**Task 10** — `server/src/controllers/auth.controller.ts`
- login() — verify credentials, return JWT
- logout() — invalidate session

**Task 11** — `server/src/controllers/category.controller.ts`
- getAll(), create(), remove()
- On delete: set category_id to NULL on affected items

**Task 12** — `server/src/controllers/menu.controller.ts`
- getAll(), getById(), create(), update(), remove()
- toggleAvailability()
- Image upload handler

**Task 13** — `server/src/controllers/order.controller.ts`
- getActive(), getHistory(), create()
- complete(), cancel()
- getNextOrderNumber()

**Task 14** — `server/src/controllers/analytics.controller.ts`
- getSummary() — today's totals
- getDailySales() — last 7 days
- getBestSellers()
- getRevenueByPayment()

---

### Phase 5 — Routes
**Task 15** — `server/src/routes/auth.routes.ts`
**Task 16** — `server/src/routes/category.routes.ts`
**Task 17** — `server/src/routes/menu.routes.ts`
**Task 18** — `server/src/routes/order.routes.ts`
**Task 19** — `server/src/routes/analytics.routes.ts`

---

### Phase 6 — Socket.io Events
**Task 20** — `server/src/socket/events.ts`
- Setup Socket.io with Express server
- Emit events: order:created, order:completed, order:cancelled
- Emit events: menu:updated, item:availability
- Emit events: category:added, category:deleted

---

### Phase 7 — Entry Point
**Task 21** — `server/src/index.ts`
- Initialize Express app
- Register all routes with /api prefix
- Setup Socket.io
- Serve static images from /public/images
- Start server on port 3000
- Initialize database on startup

---

## PROJECT 2: Desktop App (desktop/)

### Phase 8 — Project Setup
**Task 22** — Tauri + React + TypeScript project already initialized
- Configure Tailwind CSS with brand colors
- Install all dependencies

**Task 23** — Set up folder structure per ARCHITECTURE.md

---

### Phase 9 — Types & Constants
**Task 24** — `desktop/src/types/index.ts`
- Import/mirror types from server
- Frontend-specific types: CartItem, AuthState

**Task 25** — `desktop/src/constants/colors.ts`
**Task 26** — `desktop/src/constants/typography.ts`

---

### Phase 10 — Utils
**Task 27** — `desktop/src/utils/formatCurrency.ts`
**Task 28** — `desktop/src/utils/formatDate.ts`
**Task 29** — `desktop/src/utils/generateOrderNumber.ts`

---

### Phase 11 — API Layer
**Task 30** — `desktop/src/api/client.ts`
- Axios instance pointing to http://localhost:3000
- JWT token interceptor (attach to every request)
- 401 interceptor (redirect to login)

**Task 31** — `desktop/src/api/auth.api.ts`
- login(username, password)
- logout()

**Task 32** — `desktop/src/api/menu.api.ts`
- getMenuItems(), addMenuItem(), updateMenuItem()
- deleteMenuItem(), toggleAvailability()
- uploadImage()

**Task 33** — `desktop/src/api/category.api.ts`
- getCategories(), addCategory(), deleteCategory()

**Task 34** — `desktop/src/api/order.api.ts`
- getActiveOrders(), createOrder()
- completeOrder(), cancelOrder()
- getOrderHistory()

**Task 35** — `desktop/src/api/analytics.api.ts`
- getSummary(), getDailySales()
- getBestSellers(), getRevenueByPayment()

---

### Phase 12 — Socket Client
**Task 36** — `desktop/src/socket/socket.ts`
- Initialize Socket.io client to localhost:3000
- Export typed event listeners
- Auto-reconnect on disconnect

---

### Phase 13 — State Management
**Task 37** — `desktop/src/store/useAuthStore.ts`
- isAuthenticated, currentUser, token
- login(), logout()

**Task 38** — `desktop/src/store/useOrderStore.ts`
- cartItems, totalAmount
- addItem(), incrementItem(), decrementItem()
- removeItem(), clearCart()

**Task 39** — `desktop/src/store/useMenuStore.ts`
- menuItems, categories
- setMenuItems(), setCategories()

---

### Phase 14 — Hooks
**Task 40** — `desktop/src/hooks/useMenu.ts`
**Task 41** — `desktop/src/hooks/useCategories.ts`
**Task 42** — `desktop/src/hooks/useOrders.ts`
**Task 43** — `desktop/src/hooks/useAnalytics.ts`

---

### Phase 15 — Shared Components
**Task 44** — `Topbar.tsx` — brand, role label, logout
**Task 45** — `Sidebar.tsx` — nav items, active state
**Task 46** — `Badge.tsx` — availability, payment variants
**Task 47** — `ConfirmDialog.tsx` — destructive variant
**Task 48** — `EmptyState.tsx` — icon, message, subtitle

---

### Phase 16 — Cashier Components
**Task 49** — `CategoryTabs.tsx` — dynamic, horizontal scroll
**Task 50** — `MenuItemCard.tsx` — photo, name, price, add button
**Task 51** — `MenuGrid.tsx` — 4-column grid
**Task 52** — `OrderItem.tsx` — qty controls, remove button
**Task 53** — `OrderPanel.tsx` — order list, payment, confirm

---

### Phase 17 — Owner Components
**Task 54** — `SalesCard.tsx` — label, value, accent variant
**Task 55** — `SalesChart.tsx` — Recharts bar chart
**Task 56** — `BestSellerList.tsx` — ranked, gold #1
**Task 57** — `MenuTable.tsx` — table with actions
**Task 58** — `MenuItemModal.tsx` — add/edit form, image upload
**Task 59** — `CategoryManager.tsx` — add/remove inline

---

### Phase 18 — Pages
**Task 60** — `auth/LoginPage.tsx`
**Task 61** — `cashier/OrderPage.tsx`
**Task 62** — `cashier/QueuePage.tsx`
**Task 63** — `owner/DashboardPage.tsx`
**Task 64** — `owner/MenuPage.tsx`
**Task 65** — `owner/HistoryPage.tsx`
**Task 66** — `owner/AnalyticsPage.tsx`

---

### Phase 19 — App Shell
**Task 67** — `app/routes.tsx` — React Router setup
**Task 68** — `app/App.tsx` — root, socket init, auth guard

---

## PROJECT 3: Client Web App (client/)

### Phase 20 — Setup & Shared
**Task 69** — Initialize Vite + React + TypeScript + Tailwind
**Task 70** — Copy shared types, utils, constants from desktop
**Task 71** — `client/src/api/client.ts`
- Axios pointing to `http://{SERVER_IP}:3000`
- Read SERVER_IP from environment variable

**Task 72** — `client/src/socket/socket.ts`

---

### Phase 21 — Client Pages
**Task 73** — `auth/LoginPage.tsx` — mobile-optimized
**Task 74** — `cashier/OrderPage.tsx` — touch-friendly
**Task 75** — `cashier/QueuePage.tsx` — kitchen display view

---

## Build Order Summary
| Order | Project | Phase | Tasks |
|---|---|---|---|
| 1st | Server | Setup + DB + Middleware | 1-9 |
| 2nd | Server | Controllers + Routes + Socket | 10-21 |
| 3rd | Desktop | Setup + Types + Utils | 22-29 |
| 4th | Desktop | API + Socket + Store + Hooks | 30-43 |
| 5th | Desktop | Components + Pages + Shell | 44-68 |
| 6th | Client | All | 69-75 |

### Key Rules for Amazon Q
1. Always build server first — desktop and client depend on it
2. Test each API endpoint before building the frontend that uses it
3. Socket events must be emitted from server controllers, not routes
4. Never hardcode the server IP — use environment variables
5. All passwords must be bcrypt hashed — never plain text
6. JWT must be included in every authenticated API request
7. Follow UI_GUIDELINES.md strictly for all components
8. Images served from server/public/images/ as static files