/**
 * tailwind.config.js
 * ==================
 * Konfigurasi Tailwind CSS untuk ISReport V2
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Scan semua file JSX/TSX/JS untuk class detection
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // Warna aksen merah dari legacy — dipakai secara elegan (hover, indicator)
      colors: {
        brand: {
          DEFAULT: '#ff0e0e',
          hover:   '#e00b0b',
          muted:   'rgb(239 68 68 / 0.1)',
        },
      },

      // Font monospace untuk jam real-time di Topbar
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
    },
  },

  plugins: [],
};
