import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, '../index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@main': path.resolve(__dirname, '../src/main'),
      '@renderer': path.resolve(__dirname, '../src/renderer'),
      '@preload': path.resolve(__dirname, '../src/preload'),
    },
  },
  server: {
    port: 3000,
  },
});
