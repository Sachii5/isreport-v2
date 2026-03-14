/**
 * vite.config.js
 * ==============
 * Konfigurasi Vite untuk React project ISReport V2
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  // Alias @/ → src/ agar import lebih bersih
  // Contoh: import Sidebar from '@/components/layout/Sidebar'
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Dev server
  server: {
    port: 5173,
    open: true,         // buka browser otomatis saat npm run dev
  },
});
