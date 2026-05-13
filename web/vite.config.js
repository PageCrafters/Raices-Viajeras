import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/php': {
        target: 'http://localhost/Raices-Viajeras/web',
        changeOrigin: true,
      }
    }
  }
})