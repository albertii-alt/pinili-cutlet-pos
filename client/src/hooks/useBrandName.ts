import { useState, useEffect } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';

export function useBrandName(): string {
  const [stallName, setStallName] = useState('Pinili Cutlet');

  useEffect(() => {
    getSettings()
      .then(s => { if (s.stall_name) setStallName(s.stall_name); })
      .catch(() => {/* no token on login page — keep default */});

    function handleSettingsUpdated({ key, value }: { key: string; value: string }) {
      if (key === 'stall_name') setStallName(value);
    }
    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, []);

  return stallName;
}
