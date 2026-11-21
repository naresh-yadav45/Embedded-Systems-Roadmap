import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          flow: ['@xyflow/react'],
          pdf: ['jspdf', 'html-to-image'],
        },
      },
    },
  },
});
