import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const API_BASE = "https://papeer-backend.onrender.com";
// const API_BASE = "http://127.0.0.1:8000";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: `${API_BASE}`,
        changeOrigin: true,
      },
    },
  },
});
