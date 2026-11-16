import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
  base: '/Wordfolio/',
  plugins: [react()],
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
