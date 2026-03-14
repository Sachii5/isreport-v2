/**
 * DashboardLayout.jsx — v2 Executive Light Theme
 * ================================================
 * Fix Bug & Redesign:
 *
 * BUG FIX — Sidebar Scroll:
 *   Sidebar sekarang memiliki h-screen miliknya sendiri (dihandle internal di Sidebar.jsx).
 *   DashboardLayout cukup menjaga flex container-nya overflow-hidden.
 *
 * BUG FIX — Hamburger Toggle:
 *   - Desktop (lg+): sidebar selalu visible, tombol hamburger toggle lebar (w-64 ↔ w-0)
 *     dengan transisi CSS width yang mulus.
 *   - Mobile (< lg): sidebar jadi overlay di atas konten (fixed, z-40),
 *     dilengkapi backdrop hitam semi-transparan yang bisa diklik untuk tutup.
 *   - Tidak ada lagi race condition antara lg:static dan fixed.
 *
 * REDESIGN:
 *   - Background utama bg-gray-50 (light, bersih)
 *   - Topbar bg-white dengan shadow tipis di bawah
 *   - Hamburger button menyesuaikan warna light theme
 */

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  // true = sidebar terbuka (default desktop)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    /*
      Root container: full viewport, no overflow.
      Semua scroll dikelola di dalam masing-masing panel.
    */
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ══════════════════════════════════════════════════════
          MOBILE OVERLAY — backdrop gelap di belakang sidebar
          Hanya muncul di layar < lg saat sidebar terbuka
      ══════════════════════════════════════════════════════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════════════════
          SIDEBAR WRAPPER
          - Mobile: fixed overlay (z-40, translate-x slide in/out)
          - Desktop: kolom kiri, transisi width (w-64 ↔ w-0)
      ══════════════════════════════════════════════════════ */}

      {/* Mobile sidebar (overlay) */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>

      {/*
        Desktop sidebar (inline — tidak perlu fixed/absolute).
        Memakai CSS width transition (bukan translate) agar konten
        di kanan langsung bergeser, bukan tertindih.
        overflow-hidden pada wrapper penting agar saat w-0,
        konten Sidebar benar-benar tersembunyi.
      */}
      <div
        className={`
          hidden lg:block
          flex-shrink-0 overflow-hidden
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-0'}
        `}
      >
        <Sidebar />
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN AREA — Topbar + konten
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Header row: Hamburger + Topbar ───────────────── */}
        <header className="flex items-center bg-white border-b border-gray-200 flex-shrink-0 h-16 px-2 shadow-sm">

          {/* Tombol Hamburger — toggle sidebar */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            className="
              p-2.5 rounded-lg mr-2 flex-shrink-0
              text-slate-500 hover:bg-gray-100 hover:text-slate-800
              transition-colors duration-150
            "
          >
            {/* Animasi ikon: ganti antara Menu dan X */}
            <span className={`block transition-transform duration-200 ${sidebarOpen ? 'rotate-0' : 'rotate-90'}`}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>

          {/* Topbar mengisi sisa lebar header */}
          <div className="flex-1 min-w-0">
            <Topbar />
          </div>
        </header>

        {/* ── Konten Halaman ───────────────────────────────── */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6 bg-gray-50">
          {children ?? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Pilih menu untuk menampilkan konten
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
