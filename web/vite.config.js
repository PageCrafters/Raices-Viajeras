import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: '/',
    proxy: {
      '/Raices-Viajeras': {
        target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
