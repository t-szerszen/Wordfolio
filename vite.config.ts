import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Wordfolio/',
  plugins: [react()],
  build: {
    // Firestore z trwałym cache to jeden niepodzielny moduł ok. 560 kB (170 kB gzip),
    // ładowany raz i trzymany w cache service workera.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        advancedChunks: {
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
