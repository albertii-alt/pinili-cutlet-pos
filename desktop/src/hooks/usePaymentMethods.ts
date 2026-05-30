import { useState, useEffect } from 'react';
import { getPaymentMethods, type PaymentMethod } from '../api/settings.api';
import socket from '../socket/socket';

const SERVER_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    getPaymentMethods().then(setPaymentMethods).catch(() => {});

    function handleUpdated(methods: PaymentMethod[]) {
      setPaymentMethods(methods);
    }
    socket.on('payment_methods:updated', handleUpdated);
    return () => { socket.off('payment_methods:updated', handleUpdated); };
  }, []);

  function getMethodColor(name: string): string {
    const method = paymentMethods.find(m => m.name.toLowerCase() === name.toLowerCase());
    return method?.color ?? '#606060';
  }

  function getMethodByName(name: string): PaymentMethod | undefined {
    return paymentMethods.find(m => m.name.toLowerCase() === name.toLowerCase());
  }

  function getMethodLogoUrl(name: string): string | undefined {
    const method = getMethodByName(name);
    if (!method?.logo_path) return undefined;
    return `${SERVER_BASE}/payment-logos/${method.logo_path}`;
  }

  return { paymentMethods, getMethodColor, getMethodByName, getMethodLogoUrl };
}
