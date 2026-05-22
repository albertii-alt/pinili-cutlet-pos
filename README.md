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

### Step 2 — Start the HTTPS proxy (required for phone camera access)
```powershell
local-ssl-proxy --source 3001 --target 3000
```
Proxy runs on `https://0.0.0.0:3001` and forwards to the server.

### Step 3 — Build and start the client (for phones/tablets)
```powershell
cd client
npm run build
npx vite preview --host --port 4173
```
Client runs on `https://192.168.x.x:4173`

### Step 4 — Start the desktop app
```powershell
cd desktop
npm run tauri dev
```

## First-time Phone Setup
1. Connect phone to the same Wi-Fi as the laptop
2. Open `https://192.168.x.x:4173` in Chrome
3. Accept the security warning (self-signed cert)
4. Also open `https://192.168.x.x:3001/health` and accept the warning there too
5. On the Connect screen — tap **Scan QR Code** or enter the IP manually
6. Login with your staff credentials

## Default Credentials
| Username | Password | Role    |
|----------|----------|---------|
| admin    | admin123 | owner   |
| cashier  | cashier123 | cashier |
| kitchen  | kitchen123 | kitchen |

## Network
- Server: `http://localhost:3000` (laptop only)
- HTTPS Proxy: `https://0.0.0.0:3001` (LAN accessible)
- Client: `https://192.168.x.x:4173`
- Desktop: connects to `http://localhost:3000` directly

## Docs
See `docs/` for full project documentation.
