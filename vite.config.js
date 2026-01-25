import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(jpg|jpeg|svg|png|webp|gif|webm|mp4)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Confirmación 2026 - Sistema de Gestión',
        short_name: 'Confirmación',
        description: 'Sistema de gestión para Confirmación 2026 - Recordatorios de asistencia, pagos y documentos',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        shortcuts: [
          {
            name: 'Asistencia',
            short_name: 'Asistencia',
            description: 'Registrar asistencia',
            url: '/?module=attendance',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Documentos',
            short_name: 'Documentos',
            description: 'Gestionar documentos',
            url: '/?module=documents',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Pagos',
            short_name: 'Pagos',
            description: 'Control de pagos',
            url: '/?module=pagos',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Catequistas',
            short_name: 'Catequistas',
            description: 'Asistencia de catequistas',
            url: '/?module=catequistas',
            icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      }
    })
  ],
})

