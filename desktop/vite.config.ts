import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { resolve } from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// Read version from package.json — single source of truth
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf-8")
);

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Inject app version as a global constant — accessible via __APP_VERSION__
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
