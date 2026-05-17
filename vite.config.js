import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Fuerza una única instancia de React en todo el bundle (evita "Invalid hook call")
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
})
