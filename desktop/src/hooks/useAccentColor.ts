import { useEffect } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';
import { applyAccentColor } from '../utils/applyAccentColor';

/**
 * Fetches accent_color on mount and whenever settings:updated fires,
 * then writes --accent-color, --accent-color-dark, --accent-color-light on <html>.
 * These are consumed by Tailwind's primary / primaryDark / primaryLight color tokens.
 */
export function useAccentColor(): void {
  useEffect(() => {
    getSettings()
      .then(s => { if (s.accent_color) applyAccentColor(s.accent_color); })
      .catch(() => {});

    function handleSettingsUpdated() {
      getSettings()
        .then(s => { if (s.accent_color) applyAccentColor(s.accent_color); })
        .catch(() => {});
    }

    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, []);
}
