/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Variable', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Geist Mono Variable', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        primary:      'var(--accent-color, #C0392B)',
        primaryDark:  'var(--accent-color-dark, #96281B)',
        primaryLight: 'var(--accent-color-light, #E74C3C)',
        danger:       'var(--accent-color, #C0392B)',
        dark: "#0A0A0A",
        card: "#1A1A1A",
        cardLight: "#242424",
        border: "#2C2C2C",
        success: "#27AE60",
        warning: "#F39C12",
      }
    },
  },
  plugins: [],
}
