import { useState, useEffect } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';

interface DisplaySettings {
  accentColor: string;
  showDescription: boolean;
}

/**
 * Returns accent_color and show_item_description from settings.
 * Re-fetches whenever settings:updated fires.
 */
export function useDisplaySettings(): DisplaySettings {
  const [accentColor, setAccentColor] = useState('#C0392B');
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    function applySettings(s: Record<string, string>) {
      if (s.accent_color) setAccentColor(s.accent_color);
      setShowDescription(s.show_item_description === 'true');
    }

    getSettings().then(applySettings).catch(() => {});

    function handleSettingsUpdated() {
      getSettings().then(applySettings).catch(() => {});
    }

    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, []);

  return { accentColor, showDescription };
}
