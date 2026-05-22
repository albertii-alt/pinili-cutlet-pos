import { useState, useEffect } from 'react';
import { getActiveOrders } from '../api/order.api';
import { Order } from '../types';
import { onOrderCreated, onOrderCompleted, onOrderCancelled } from '../socket/socket';

export function useOrders() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));

    onOrderCreated((order) => {
      setOrders(prev => [...prev, order]);
    });

    onOrderCompleted((id) => {
      setOrders(prev => prev.filter(o => o.id !== id));
    });

    onOrderCancelled((id) => {
      setOrders(prev => prev.filter(o => o.id !== id));
    });
  }, []);

  return { orders, loading };
}
