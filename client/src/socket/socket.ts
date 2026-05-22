import { io, Socket } from 'socket.io-client';
import type { Order, MenuItem, Category } from '../types';

function getSocketURL(): string {
  const ip   = localStorage.getItem('server_ip')   ?? '127.0.0.1';
  const port = localStorage.getItem('server_port') ?? '3001';
  return `https://${ip}:${port}`;
}

let socket: Socket = io(getSocketURL(), {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});

export function connectSocket(): void {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket(): void {
  socket.disconnect();
}

export function reconnectSocket(ip: string, port: string): void {
  socket.disconnect();
  socket = io(`https://${ip}:${port}`, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });
}

export function onOrderCreated(cb: (order: Order) => void): void {
  socket.on('order:created', cb);
}

export function onOrderCompleted(cb: (id: number) => void): void {
  socket.on('order:completed', cb);
}

export function onOrderCancelled(cb: (id: number) => void): void {
  socket.on('order:cancelled', cb);
}

export function onMenuUpdated(cb: (item: MenuItem) => void): void {
  socket.on('menu:updated', cb);
}

export function onItemAvailability(cb: (payload: { id: number; is_available: number }) => void): void {
  socket.on('item:availability', cb);
}

export function onCategoryAdded(cb: (category: Category) => void): void {
  socket.on('category:added', cb);
}

export function onCategoryDeleted(cb: (id: number) => void): void {
  socket.on('category:deleted', cb);
}

export function offAll(): void {
  socket.removeAllListeners();
}

export default socket;
