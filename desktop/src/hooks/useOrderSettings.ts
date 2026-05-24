import { useState, useEffect } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';

interface OrderSettings {
  orderPrefix: string;
  showConfirmation: boolean;
}

/**
 * Returns order_prefix and order_confirmation from settings.
 * Re-fetches whenever settings:updated fires.
 */
export function useOrderSettings(): OrderSettings {
  const [orderPrefix, setOrderPrefix]         = useState('PC');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    function applySettings(s: Record<string, string>) {
      if (s.order_prefix) setOrderPrefix(s.order_prefix.trim().toUpperCase());
      setShowConfirmation(s.order_confirmation === 'true');
    }

    getSettings().then(applySettings).catch(() => {});

    function handleSettingsUpdated() {
      getSettings().then(applySettings).catch(() => {});
    }

    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, []);

  return { orderPrefix, showConfirmation };
}
