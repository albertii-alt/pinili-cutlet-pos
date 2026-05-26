import { useState, useEffect } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';

export function useBrandName(): string {
  const [stallName, setStallName] = useState('');

  useEffect(() => {
    getSettings().then(s => setStallName(s.stall_name ?? '')).catch(() => {});

    function handleUpdate() {
      getSettings().then(s => setStallName(s.stall_name ?? '')).catch(() => {});
    }

    socket.on('settings:updated', handleUpdate);
    return () => { socket.off('settings:updated', handleUpdate); };
  }, []);

  return stallName;
}
