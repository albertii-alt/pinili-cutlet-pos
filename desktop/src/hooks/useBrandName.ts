import { useState, useEffect } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';

const SERVER_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface BrandInfo {
  stallName: string;
  logoUrl: string | null;
}

export function useBrandName(): BrandInfo {
  const [stallName, setStallName] = useState('Pinili Cutlet');
  const [stallLogo, setStallLogo] = useState('');

  useEffect(() => {
    getSettings()
      .then(s => {
        if (s.stall_name) setStallName(s.stall_name);
        if (s.stall_logo !== undefined) setStallLogo(s.stall_logo);
      })
      .catch(() => {});

    function handleSettingsUpdated({ key, value }: { key: string; value: string }) {
      if (key === 'stall_name') setStallName(value);
      if (key === 'stall_logo') setStallLogo(value);
    }
    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, []);

  return {
    stallName,
    logoUrl: stallLogo ? `${SERVER_BASE}/logos/${stallLogo}` : null,
  };
}
