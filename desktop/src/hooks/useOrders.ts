import { useState, useEffect } from 'react';
import { getActiveOrders, getOrderHistory } from '../api/order.api';
import { Order } from '../types';
import socket from '../socket/socket';

// Hook for the live active orders queue (cashier / kitchen view)
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));

    function handleCreated(order: Order) {
      setOrders(prev => [...prev, order]);
    }
    function handleCompleted(id: number) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
    function handleCancelled(id: number) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }

    socket.on('order:created', handleCreated);
    socket.on('order:completed', handleCompleted);
    socket.on('order:cancelled', handleCancelled);

    return () => {
      socket.off('order:created', handleCreated);
      socket.off('order:completed', handleCompleted);
      socket.off('order:cancelled', handleCancelled);
    };
  }, []);

  return { orders, loading };
}

export interface OrderHistoryParams {
  status?: string;
  date?: string;
  payment_method?: string;
  startDate?: string;
  endDate?: string;
}

// Hook for fetching order history with optional date range support
export function useOrderHistory(params: OrderHistoryParams) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if custom range is implied but dates are missing
    if (params.startDate !== undefined && !params.endDate) return;
    if (params.endDate !== undefined && !params.startDate) return;

    setLoading(true);
    getOrderHistory(params)
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.status, params.date, params.payment_method, params.startDate, params.endDate]);

  return { orders, loading };
}
