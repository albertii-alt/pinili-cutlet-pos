import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import os from 'os';

import db from './database/db';
import { initSocket } from './socket/events';
import { errorHandler } from './middleware/error.middleware';

import authRoutes      from './routes/auth.routes';
import categoryRoutes  from './routes/category.routes';
import menuRoutes      from './routes/menu.routes';
import orderRoutes     from './routes/order.routes';
import analyticsRoutes from './routes/analytics.routes';
import settingsRoutes      from './routes/settings.routes';
import paymentMethodRoutes from './routes/paymentMethods.routes';

const app    = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT ?? '3000', 10) || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Static image files
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Static sound files
app.use('/sounds', express.static(path.resolve(process.cwd(), '../server/public/sounds')));

// Serve client PWA from /app — built output of client/dist
// __dirname at runtime = server/dist/ → ../../client/dist = client/dist
const clientDist = path.resolve(process.cwd(), '../client/dist');
// Serve client PWA from /app — single middleware handles both assets and SPA routes
app.use('/app', (req, res) => {
  const filePath = path.join(clientDist, req.path);
  const ext = path.extname(req.path);
  if (ext) {
    // Has extension — serve the actual file (JS, CSS, PNG, etc.)
    res.sendFile(filePath, (err) => {
      if (err) res.status(404).send('File not found');
    });
  } else {
    // No extension — SPA route, serve index.html
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', name: 'Pinili Cutlet Server' });
});

// Network IP — returns LAN IP for QR code generation
app.get('/api/network/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let lanIP = '127.0.0.1';

  // Collect all non-loopback IPv4 addresses
  const candidates: string[] = [];
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        candidates.push(config.address);
      }
    }
  }

  // Prefer private LAN ranges in order: 192.168.x.x → 10.x.x.x → 172.16-31.x.x
  const preferred =
    candidates.find(ip => ip.startsWith('192.168.')) ??
    candidates.find(ip => ip.startsWith('10.'))      ??
    candidates.find(ip => /^172\.(1[6-9]|2\d|3[01])\./.test(ip)) ??
    candidates[0];

  if (preferred) lanIP = preferred;

  res.json({ ip: lanIP, serverPort: PORT, clientUrl: `http://${lanIP}:${PORT}/app` });
});

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu',       menuRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/settings',         settingsRoutes);
app.use('/api/payment-methods',  paymentMethodRoutes);

// Global error handler
app.use(errorHandler);

// Initialize Socket.io
initSocket(server);

// Initialize database
console.log(`[DB] Database initialized at: ${db.name}`);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Pinili Cutlet server running on http://0.0.0.0:${PORT}`);
});
