import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/main.tsx',
                'resources/js/admin-main.tsx',
            ],
            refresh: true,
            detectTls: 'oshys.test',
        }),
        react({
            jsxImportSource: 'react',
        }),
        tailwindcss(),
        VitePWA({
            registerType: 'prompt',
            injectRegister: 'auto',
            // Allow the SW to control the whole site, not just /build/.
            // Requires the server to send `Service-Worker-Allowed: /` for /build/sw.js,
            // OR a rewrite that serves /sw.js from /build/sw.js (see public/.htaccess).
            scope: '/',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
                navigateFallback: null,
                runtimeCaching: [
                    {
                        urlPattern: /^https?:.*\/locales\/.*\.json/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'locales-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        // Match server-side CachePublicGet TTL (300s) so admin edits
                        // propagate within the same window on both layers, avoiding
                        // a compounded stale-window.
                        urlPattern: /\/api\/(settings|banners|home-data|team-members-featured|footer-links|social-initiatives)/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'api-cache',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /\/static\/.*\.(png|jpg|jpeg|svg|webp|gif)/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'static-images-cache',
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
            manifest: {
                name: 'Corals & Shells Diving — CAS Academy',
                short_name: 'CAS',
                description: 'Corals & Shells Diving — CAS Academy',
                theme_color: '#0891b2',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    // TODO: replace with dedicated 192x192 and 512x512 icons at /static/images/icon-192.png and icon-512.png
                    {
                        src: '/images/logo.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/images/logo.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
                    'motion-vendor': ['framer-motion'],
                    'i18n-vendor': [
                        'i18next',
                        'react-i18next',
                        'i18next-browser-languagedetector',
                        'i18next-http-backend',
                    ],
                    'icons-vendor': ['lucide-react'],
                },
            },
        },
    },
});
