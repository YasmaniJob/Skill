import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',

    includeAssets: [
      'favicon.svg',
      'logo.png',
      'icons/icon-192.png',
      'icons/icon-512.png',
      'icons/icon-512-maskable.png',
    ],

    manifest: {
      short_name: 'Skill',
      name: 'Skill - Gestión de Acompañamiento',
      description: 'Gestión Pedagógica y Monitoreo Docente',
      icons: [
        {
          src: '/icons/icon-192.png',
          type: 'image/png',
          sizes: '192x192',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512.png',
          type: 'image/png',
          sizes: '512x512',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512-maskable.png',
          type: 'image/png',
          sizes: '512x512',
          purpose: 'maskable',
        },
      ],
      start_url: '/',
      background_color: '#FFFFFF',
      theme_color: '#4F46E5',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

      // Subir límite a 4 MB para acomodar chunks grandes
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,

      runtimeCaching: [
        {
          // Rutas de navegación SPA — Network-First con timeout de 4s
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'skill-navigation',
            networkTimeoutSeconds: 4,
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Assets estáticos propios — Cache-First
          urlPattern: ({ url }) =>
            url.origin === self.location.origin &&
            /\.(png|svg|ico|woff2|woff|ttf)$/.test(url.pathname),
          handler: 'CacheFirst',
          options: {
            cacheName: 'skill-assets',
            expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Supabase API — NetworkOnly (nunca cachear)
          urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
          handler: 'NetworkOnly',
        },
      ],
    },

    devOptions: {
      enabled: false,
    },
  }), cloudflare()],

  build: {
    rollupOptions: {
      output: {
        // Code splitting manual para reducir el chunk principal
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Gráficos (Recharts es pesado)
          'vendor-charts': ['recharts'],
          // PDF y exportación
          'vendor-pdf': ['jspdf', 'jspdf-autotable', '@react-pdf/renderer'],
          // Animaciones
          'vendor-motion': ['framer-motion'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Utilidades
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'xlsx'],
        },
      },
    },
  },

  resolve: {
    // Fuerza una única instancia de React en todo el bundle (evita "Invalid hook call")
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
})