import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/Raices-Viajeras': {
        target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
