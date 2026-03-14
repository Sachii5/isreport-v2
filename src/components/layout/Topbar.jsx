/**
 * Topbar.jsx — v2 Executive Light Theme
 * ======================================
 * - bg-white (transparan, karena sudah ada wrapper white di DashboardLayout)
 * - Teks slate-800 gelap, terbaca jelas
 * - Jam real-time tetap pakai useEffect + useState (konversi dari nav-bar.php showTime())
 * - Clock pill: bg-gray-100 dengan border gray tipis
 * - Notifikasi + avatar menyesuaikan light theme
 */

import { useState, useEffect } from 'react';
import { Clock, Bell, User } from 'lucide-react';

// ─── Hook: Real-Time Clock ────────────────────────────────────────────────────
// Terjemahan 1:1 dari showTime() + checkTime() di nav-bar.php lama

function useRealTimeClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function computeTime() {
      const now    = new Date();
      let hour     = now.getHours();
      let minute   = now.getMinutes();
      let second   = now.getSeconds();

      const period = hour < 12 ? 'AM' : 'PM';
      if (hour === 0) hour = 12;
      if (hour > 12)  hour = hour - 12;

      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(hour)}:${pad(minute)}:${pad(second)} ${period}`;
    }

    setTime(computeTime());

    // Interval 500ms — sama dengan setInterval(showTime, 500) aslinya
    const id = setInterval(() => setTime(computeTime()), 500);
    return () => clearInterval(id);
  }, []);

  return time;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function Topbar() {
  const currentTime = useRealTimeClock();

  return (
    /*
      Topbar tidak punya background sendiri — background & border
      sudah dihandle oleh header wrapper di DashboardLayout.
      Ini membuat komposisi lebih flexibility.
    */
    <div className="flex items-center justify-between h-full px-4">

      {/* ── Kiri: Judul Sistem ────────────── */}
      <div className="flex items-center gap-3">
        {/* Garis aksen merah vertikal — dekoratif, tipis tapi kentara */}
        <span className="hidden sm:block w-[3px] h-6 rounded-full bg-red-600" />
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">
            ISReport BDG 7
          </h1>
          <p className="text-xs text-slate-400 leading-tight font-medium">
            2K Kuningan
          </p>
        </div>
      </div>

      {/* ── Kanan: Clock + Aksi ───────────── */}
      <div className="flex items-center gap-3">

        {/* Jam Real-Time — konversi dari showTime() vanilla JS */}
        <div className="
          flex items-center gap-2
          bg-gray-100 border border-gray-200
          rounded-lg px-3 py-2
        ">
          <Clock size={14} className="text-slate-400 flex-shrink-0" />
          <span
            id="clock"
            className="text-sm font-mono font-semibold text-slate-700 tabular-nums min-w-[84px]"
          >
            {currentTime || '--:--:-- --'}
          </span>
        </div>

        {/* Notifikasi */}
        <button
          aria-label="Notifikasi"
          className="
            relative p-2.5 rounded-lg
            text-slate-500 hover:bg-gray-100 hover:text-slate-700
            transition-colors duration-150
          "
        >
          <Bell size={18} />
          {/* Dot indikator merah — aksen minimal */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Avatar user */}
        <button
          aria-label="Profil pengguna"
          className="
            flex items-center gap-2.5 pl-1 pr-3 py-1.5
            rounded-xl border border-gray-200
            hover:bg-gray-50 transition-colors duration-150
          "
        >
          <div className="
            w-8 h-8 rounded-lg
            bg-red-600
            flex items-center justify-center flex-shrink-0
          ">
            <User size={15} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700 hidden md:block">
            Admin
          </span>
        </button>
      </div>
    </div>
  );
}
