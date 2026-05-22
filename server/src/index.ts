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

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT ?? 3000;
// Proxy port — local-ssl-proxy runs on this port (HTTPS) and forwards to PORT
const PROXY_PORT = process.env.PROXY_PORT ?? 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Static image files
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Health check — used by client to test connection
app.get('/health', (req, res) => {
  res.json({ status: 'ok', name: 'Pinili Cutlet Server' });
});

// Network IP — returns LAN IP and HTTPS proxy port for QR code
app.get('/api/network/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let lanIP = '127.0.0.1';

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        lanIP = config.address;
        break;
      }
    }
    if (lanIP !== '127.0.0.1') break;
  }

  res.json({ ip: lanIP, port: Number(PROXY_PORT) });
});

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu',       menuRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/analytics',  analyticsRoutes);

// Global error handler
app.use(errorHandler);

// Initialize Socket.io
initSocket(server);

// Initialize database
console.log(`[DB] Database initialized at: ${db.name}`);

server.listen(PORT, () => {
  console.log(`[Server] Pinili Cutlet server running on http://localhost:${PORT}`);
  console.log(`[Server] HTTPS proxy expected on port ${PROXY_PORT} (run: local-ssl-proxy --source ${PROXY_PORT} --target ${PORT})`);
});
