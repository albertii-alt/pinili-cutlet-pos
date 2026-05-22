import { useState, useEffect } from 'react';
import { getActiveOrders } from '../api/order.api';
import { Order } from '../types';
import socket from '../socket/socket';

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
