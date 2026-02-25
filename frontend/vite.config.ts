import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/systems': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api/attacks': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
      '/api/logs': {
        target: 'http://localhost:8003',
        changeOrigin: true,
      },
    },
  },
})
