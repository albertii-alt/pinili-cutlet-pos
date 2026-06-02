import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { getSettings } from '../api/settings.api';
import { useAuthStore } from '../store/useAuthStore';
import socket from '../socket/socket';

export function useWindowTitle(): void {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    function applyTitle(name: string) {
      if (!name) return;
      getCurrentWindow()
        .setTitle(name)
        .catch(() => { /* not in Tauri context */ });
    }

    getSettings()
      .then(s => { if (s.stall_name) applyTitle(s.stall_name); })
      .catch(() => {});

    function handleSettingsUpdated({ key, value }: { key: string; value: string }) {
      if (key === 'stall_name') applyTitle(value);
    }

    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, [isAuthenticated]);
}
