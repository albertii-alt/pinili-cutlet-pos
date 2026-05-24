import { useEffect } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return null;
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

function clamp(v: number) { return Math.max(0, Math.min(255, v)); }

function darken(hex: string, amount = 30): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `#${rgb.map(c => clamp(c - amount).toString(16).padStart(2, '0')).join('')}`;
}

function lighten(hex: string, amount = 20): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `#${rgb.map(c => clamp(c + amount).toString(16).padStart(2, '0')).join('')}`;
}

function applyAccentColor(color: string): void {
  const root = document.documentElement;
  root.style.setProperty('--accent-color', color);
  root.style.setProperty('--accent-color-dark', darken(color));
  root.style.setProperty('--accent-color-light', lighten(color));
}

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
