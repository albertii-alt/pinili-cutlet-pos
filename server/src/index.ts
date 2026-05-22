import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';

import db from './database/db';
import { initSocket } from './socket/events';
import { errorHandler } from './middleware/error.middleware';

import authRoutes     from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import menuRoutes     from './routes/menu.routes';
import orderRoutes    from './routes/order.routes';
import analyticsRoutes from './routes/analytics.routes';

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT ?? 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static image files
app.use('/images', express.static(path.join(__dirname, '../public/images')));

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

// Initialize database (schema + seed run inside db.ts on import)
console.log(`[DB] Database initialized at: ${db.name}`);

server.listen(PORT, () => {
  console.log(`[Server] Pinili Cutlet server running on http://localhost:${PORT}`);
});
