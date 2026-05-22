/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#C0392B",
        primaryDark: "#96281B",
        primaryLight: "#E74C3C",
        dark: "#0A0A0A",
        card: "#1A1A1A",
        cardLight: "#242424",
        border: "#2C2C2C",
        success: "#27AE60",
        warning: "#F39C12",
        danger: "#C0392B",
      }
    },
  },
  plugins: [],
}