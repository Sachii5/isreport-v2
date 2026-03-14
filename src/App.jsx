/**
 * App.jsx — v2 Executive Light Theme
 * ====================================
 * Root component. DashboardLayout membungkus seluruh konten halaman.
 */

import DashboardLayout from './components/layout/DashboardLayout';

// ─── Data dummy untuk preview tabel ──────────────────────────────────────────

const SAMPLE_DATA = [
  { id: 1, nama: 'Sales Today',        status: 'Aktif',   nilai: 'Rp 24.500.000' },
  { id: 2, nama: 'Stock All',          status: 'Aktif',   nilai: 'Rp 91.200.000' },
  { id: 3, nama: 'Evaluasi Sales',     status: 'Pending', nilai: 'Rp 12.750.000' },
  { id: 4, nama: 'Monitoring SO IC',   status: 'Aktif',   nilai: 'Rp 6.300.000'  },
  { id: 5, nama: 'Service Level',      status: 'Idle',    nilai: 'Rp 3.100.000'  },
];

const STATUS_STYLE = {
  Aktif:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Pending: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
  Idle:    'bg-gray-100   text-gray-500    ring-1 ring-gray-200',
};

// ─── Contoh konten halaman ────────────────────────────────────────────────────

function PreviewTable() {
  return (
    <div className="space-y-6">

      {/* ── Page Title ─────────────────── */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Ringkasan data operasional — ISReport BDG 7 | 2K Kuningan
        </p>
      </div>

      {/* ── Stats Cards ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Sales Hari Ini', value: 'Rp 24,5 Jt', delta: '+12%',  up: true  },
          { label: 'Item Stock Active',    value: '1.842 SKU',   delta: '+3%',   up: true  },
          { label: 'Service Level',        value: '97.4%',       delta: '-0.6%', up: false },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1.5">{card.value}</p>
            <p className={`text-xs mt-1.5 font-semibold ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>
              {card.delta} vs kemarin
            </p>
          </div>
        ))}
      </div>

      {/* ── Data Table ──────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header tabel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-slate-800">Data Laporan</h3>
          <span className="text-xs text-slate-400 font-medium">{SAMPLE_DATA.length} entri</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 w-12">#</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">Nama Laporan</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {SAMPLE_DATA.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors duration-100"
                >
                  <td className="px-6 py-4 text-sm text-slate-400">{row.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.nama}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-medium text-slate-600">
                    {row.nilai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-slate-400">
            Data contoh — hubungkan ke API/database untuk data real
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <DashboardLayout>
      <PreviewTable />
    </DashboardLayout>
  );
}
