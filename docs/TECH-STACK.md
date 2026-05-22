# Tech Stack
## Pinili Cutlet — LAN-Based POS System

### System Overview
The system is split into three parts:
1. **Backend Server** — Node.js + Express, runs on laptop
2. **Desktop App** — Tauri + React, runs on laptop (owner dashboard)
3. **Client Web App** — React PWA, runs on phones/tablets via browser

---

### 1. Backend Server
| Layer | Technology | Version | Reason |
|---|---|---|---|
| Runtime | Node.js | 20.x LTS | Fast, familiar JS ecosystem |
| Framework | Express | 4.x | Simple REST API setup |
| Database | SQLite via better-sqlite3 | latest | Local, offline, fast, no setup |
| Real-time | Socket.io | 4.x | WebSocket for live order updates |
| Auth | JSON Web Tokens (JWT) | latest | Stateless auth for API |
| Password Hashing | bcryptjs | latest | Secure password storage |
| Language | TypeScript | 5.x | Type safety across the stack |

### 2. Desktop App (Tauri)
| Layer | Technology | Version | Reason |
|---|---|---|---|
| Desktop Shell | Tauri | v2 | Lightweight, native Windows app |
| Frontend | React + TypeScript | 18.x / 5.x | Component-based UI |
| Styling | Tailwind CSS | 3.x | Utility-first, rapid UI |
| State | Zustand | 5.x | Lightweight state management |
| Charts | Recharts | 2.x | React charts for analytics |
| Icons | @tabler/icons-react | latest | Clean, consistent icon set |
| HTTP Client | Axios | latest | API calls to backend server |
| Real-time | Socket.io-client | 4.x | Live updates from server |

### 3. Client Web App
| Layer | Technology | Version | Reason |
|---|---|---|---|
| Framework | React + TypeScript | 18.x / 5.x | Same stack as desktop app |
| Build Tool | Vite | 5.x | Fast dev server and build |
| Styling | Tailwind CSS | 3.x | Shared design system |
| State | Zustand | 5.x | Consistent with desktop app |
| HTTP Client | Axios | latest | API calls to backend server |
| Real-time | Socket.io-client | 4.x | Live order updates |

---

### API Communication
- REST API for CRUD operations (menu, orders, analytics)
- WebSocket (Socket.io) for real-time events:
  - `order:created` — new order placed
  - `order:completed` — order marked as done
  - `menu:updated` — menu item changed
  - `item:availability` — item toggled available/unavailable

### Network
- Backend runs on `http://192.168.1.100:3000` (static LAN IP)
- Desktop Tauri app connects to `http://localhost:3000`
- Client devices connect to `http://192.168.1.100:3000`

---

### Project Structure
pinili-cutlet/
├── server/          # Node.js + Express backend
├── desktop/         # Tauri + React desktop app
└── client/          # React PWA for phones/tablets
### Setup Commands
```bash
# Backend
cd server
npm install

# Desktop App
cd desktop
npm install
npm install zustand recharts @tabler/icons-react axios socket.io-client
npm install -D tailwindcss@3.4.0 postcss autoprefixer

# Client Web App
cd client
npm create vite@latest . -- --template react-ts
npm install zustand axios socket.io-client @tabler/icons-react
npm install -D tailwindcss@3.4.0 postcss autoprefixer
```