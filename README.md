# Pinili Cutlet POS System

A LAN-based Point of Sale system for Pinili Cutlet food stall.

## Projects
- `server/`  — Node.js + Express backend
- `desktop/` — Tauri + React desktop app (owner dashboard + cashier)
- `client/`  — React PWA for phones and tablets

## Startup Sequence

Run each step in a **separate terminal window**:

### Step 1 — Start the backend server
```powershell
cd server
npm run dev
```
Server runs on `http://localhost:3000`

### Step 2 — Build and start the client (for phones/tablets)
```powershell
cd client
npm run build
npx vite preview --host --port 4173
```
Client runs on `http://192.168.x.x:4173`

### Step 3 — Start the desktop app
```powershell
cd desktop
npm run tauri dev
```

## First-time Phone Setup
1. Connect phone to the same Wi-Fi as the laptop
2. On the desktop cashier view — click the **QR** button in the topbar
3. Scan the QR code with your phone camera
4. Chrome opens the app automatically
5. Login with your staff credentials

## Default Credentials
| Username | Password | Role    |
|----------|----------|---------|
| admin    | admin123 | owner   |
| cashier  | cashier123 | cashier |
| kitchen  | kitchen123 | kitchen |

## Network
- Server: `http://localhost:3000` (laptop only)
- Client: `http://192.168.x.x:4173`
- Desktop: connects to `http://localhost:3000` directly

## Docs
See `docs/` for full project documentation.
