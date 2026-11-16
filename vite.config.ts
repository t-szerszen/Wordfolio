import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

/** GitHub Pages zwraca 404.html dla nieznanych ścieżek — kopia index.html obsługuje odświeżenie podstron. */
function spaFallback(): Plugin {
  return {
    name: 'wordfolio-spa-fallback',
    apply: 'build',
    closeBundle() {
      copyFileSync('dist/index.html', 'dist/404.html');
    },
  };
}

export default defineConfig({
  base: '/Wordfolio/',
  plugins: [
    react(),
    spaFallback(),
    VitePWA({
      // Nowa wersja aktywuje się przy następnym uruchomieniu — bez przeładowania w trakcie czytania.
      registerType: 'prompt',
      injectRegister: 'script-defer',
      includeAssets: [
        'icons/favicon.svg',
        'icons/favicon-32.png',
        'icons/apple-touch-icon-180.png',
      ],
      manifest: {
        name: 'Wordfolio',
        short_name: 'Wordfolio',
        description:
          'Czytaj książki w PDF w oryginale, stukaj nieznane słowa i ucz się ich z fiszek.',
        lang: 'pl',
        dir: 'ltr',
        id: '/Wordfolio/',
        start_url: '/Wordfolio/',
        scope: '/Wordfolio/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#f5ede0',
        background_color: '#f5ede0',
        categories: ['education', 'books'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Worker pdf.js (.mjs) i Firestore są duże, a muszą działać offline.
        globPatterns: ['**/*.{js,mjs,css,html,woff2,svg,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/Wordfolio\/__\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version.replace(/\.0$/, '')),
  },
  build: {
    // Firestore z trwałym cache to jeden niepodzielny moduł ok. 560 kB (170 kB gzip),
    // ładowany raz i trzymany w cache service workera.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'firestore', test: /node_modules[\\/]@firebase[\\/](firestore|webchannel)/ },
            { name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/ },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
  },
});
