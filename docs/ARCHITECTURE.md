# Architecture
## Pinili Cutlet — LAN-Based POS System

### System Architecture
┌─────────────────────────────────────────────┐
│              LAPTOP (Static IP)              │
│                                              │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │  Tauri Desktop  │  │  Node.js Server  │  │
│  │  (Owner/Admin)  │◄─►  (Port 3000)    │  │
│  └─────────────────┘  └────────┬─────────┘  │
│                                │             │
│                         ┌──────┴──────┐      │
│                         │   SQLite DB  │      │
│                         └─────────────┘      │
└────────────────────────────────┬────────────┘
│ LAN (Wi-Fi)
┌──────────────────┼──────────────────┐
│                  │                  │
┌─────────┴──────┐  ┌────────┴───────┐  ┌──────┴───────┐
│ Cashier Tablet │  │ Kitchen Phone  │  │  Other Device │
│ (Client Web)   │  │ (Client Web)   │  │  (Client Web) │
└────────────────┘  └────────────────┘  └──────────────┘

### Folder Structure
pinili-cutlet/
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── index.ts                 # Entry point, Express + Socket.io setup
│   │   ├── database/
│   │   │   ├── db.ts                # SQLite connection + initialization
│   │   │   ├── schema.ts            # CREATE TABLE statements
│   │   │   └── seed.ts              # Default seed data
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # POST /api/auth/login, /logout
│   │   │   ├── menu.routes.ts       # CRUD /api/menu
│   │   │   ├── category.routes.ts   # CRUD /api/categories
│   │   │   ├── order.routes.ts      # CRUD /api/orders
│   │   │   └── analytics.routes.ts  # GET /api/analytics
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── menu.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   └── analytics.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   └── error.middleware.ts  # Global error handler
│   │   ├── socket/
│   │   │   └── events.ts            # Socket.io event handlers
│   │   └── types/
│   │       └── index.ts             # Shared TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── desktop/                         # Tauri + React desktop app
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx              # Root component, router
│   │   │   └── routes.tsx           # Route definitions
│   │   ├── pages/
│   │   │   ├── cashier/
│   │   │   │   ├── OrderPage.tsx    # Main ordering screen
│   │   │   │   └── QueuePage.tsx    # Active orders queue
│   │   │   ├── owner/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── MenuPage.tsx
│   │   │   │   ├── HistoryPage.tsx
│   │   │   │   └── AnalyticsPage.tsx
│   │   │   └── auth/
│   │   │       └── LoginPage.tsx
│   │   ├── components/
│   │   │   ├── cashier/
│   │   │   │   ├── MenuGrid.tsx
│   │   │   │   ├── MenuItemCard.tsx
│   │   │   │   ├── CategoryTabs.tsx
│   │   │   │   ├── OrderPanel.tsx
│   │   │   │   └── OrderItem.tsx
│   │   │   ├── owner/
│   │   │   │   ├── SalesCard.tsx
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   ├── BestSellerList.tsx
│   │   │   │   ├── MenuTable.tsx
│   │   │   │   ├── MenuItemModal.tsx
│   │   │   │   └── CategoryManager.tsx
│   │   │   └── shared/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Topbar.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── ConfirmDialog.tsx
│   │   │       └── EmptyState.tsx
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance with base URL
│   │   │   ├── menu.api.ts          # Menu API calls
│   │   │   ├── category.api.ts      # Category API calls
│   │   │   ├── order.api.ts         # Order API calls
│   │   │   └── analytics.api.ts     # Analytics API calls
│   │   ├── socket/
│   │   │   └── socket.ts            # Socket.io client setup
│   │   ├── store/
│   │   │   ├── useOrderStore.ts     # Cart state
│   │   │   ├── useAuthStore.ts      # Auth session
│   │   │   └── useMenuStore.ts      # Menu + category state
│   │   ├── hooks/
│   │   │   ├── useMenu.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useOrders.ts
│   │   │   └── useAnalytics.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   └── typography.ts
│   │   └── utils/
│   │       ├── formatCurrency.ts
│   │       ├── formatDate.ts
│   │       └── generateOrderNumber.ts
│   ├── src-tauri/
│   │   ├── src/
│   │   │   └── lib.rs
│   │   └── tauri.conf.json
│   ├── package.json
│   └── tsconfig.json
│
└── client/                          # React PWA for phones/tablets
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── pages/
│   │   ├── cashier/
│   │   │   ├── OrderPage.tsx    # Mobile-optimized ordering
│   │   │   └── QueuePage.tsx    # Kitchen display / queue
│   │   └── auth/
│   │       └── LoginPage.tsx
│   ├── components/
│   │   ├── cashier/
│   │   │   ├── MenuGrid.tsx
│   │   │   ├── MenuItemCard.tsx
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── OrderPanel.tsx
│   │   │   └── OrderItem.tsx
│   │   └── shared/
│   │       ├── Badge.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── EmptyState.tsx
│   ├── api/
│   │   ├── client.ts
│   │   ├── menu.api.ts
│   │   └── order.api.ts
│   ├── socket/
│   │   └── socket.ts
│   ├── store/
│   │   ├── useOrderStore.ts
│   │   └── useAuthStore.ts
│   ├── hooks/
│   │   ├── useMenu.ts
│   │   └── useOrders.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── formatCurrency.ts
│       └── formatDate.ts
├── package.json
└── tsconfig.json

### Layer Responsibilities
| Layer | Responsibility |
|---|---|
| Server routes | Receive HTTP requests, validate input, call controllers |
| Controllers | Business logic, call DB queries, return responses |
| Database | Raw SQL queries, returns typed results |
| Socket events | Broadcast real-time events to connected clients |
| API (frontend) | Axios calls to server REST endpoints |
| Socket (frontend) | Listen for real-time events, update UI state |
| Store | In-memory reactive state (cart, auth, menu cache) |
| Hooks | Bridge between API/socket and UI components |
| Pages | Screen-level layout, orchestrate hooks and components |
| Components | Reusable UI pieces, receive props, emit events |

### Real-time Event Flow
Cashier places order
│
▼
Client POST /api/orders
│
▼
Server saves to SQLite
│
▼
Server emits order:created via Socket.io
│
├──► Kitchen display updates queue
├──► Owner dashboard updates stats
└──► All connected clients notified

### Navigation Flow
Desktop App Launch
└── CashierView (default)
├── OrderPage
└── QueuePage
└── [Owner button] → LoginPage
└── [Valid credentials] → OwnerView
├── DashboardPage
├── MenuPage
├── HistoryPage
└── AnalyticsPage
Client Web App (phone/tablet)
└── LoginPage
└── [Valid credentials] → CashierView
├── OrderPage (cashier role)
└── QueuePage (kitchen role)

