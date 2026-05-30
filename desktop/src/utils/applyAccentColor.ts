/**
 * Sets --accent-color, --accent-color-dark, and --accent-color-light
 * on document.documentElement so Tailwind's primary/primaryDark/primaryLight
 * tokens update in real time.
 */

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

export function applyAccentColor(color: string): void {
  const root = document.documentElement;
  root.style.setProperty('--accent-color', color);
  root.style.setProperty('--accent-color-dark', darken(color));
  root.style.setProperty('--accent-color-light', lighten(color));
  const rgb = hexToRgb(color);
  if (rgb) root.style.setProperty('--accent-color-rgb', rgb.join(','));
}
