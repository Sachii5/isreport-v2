/**
 * Sidebar.jsx — Executive Light Theme
 * =====================================
 * Navigasi vertikal accordion untuk ISReport Dashboard.
 *
 * Fix & Perubahan v2:
 * - h-screen + overflow-y-auto → scroll berfungsi pada menu panjang
 * - Light theme: bg-white, border-r border-gray-200
 * - Teks lebih besar (text-sm → text-[15px]) untuk keterbacaan senior
 * - Active indicator: garis merah vertikal tebal + bg-red-50
 * - Sub-menu link ukuran text-[13px], warna abu gelap (slate-700)
 * - Icon w-5 h-5 proporsional dengan teks
 */

import { useState } from 'react';
import {
  Store,
  Settings,
  Boxes,
  Server,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
  BarChart2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Data Struktur Menu (diekstrak dari nav-bar.php)
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: 'store',
    label: 'Store',
    icon: Store,
    sections: [
      {
        header: 'Produk',
        items: [{ label: 'Informasi Produk', href: '../my-inq' }],
      },
      {
        header: 'Sales',
        items: [
          { label: 'Sales Today', href: '../sales-today' },
          { label: 'Sales Today New', href: '../Sales-today-new' },
          { label: 'Sales Yesterday', href: '../sales-yesterday' },
          { label: 'Sales Per Jam Per Bulan', href: '../Sales-Perjam-Perbulan' },
          { label: 'Evaluasi Sales', href: '../evaluasi-sales' },
          { label: 'Evaluasi Sales Promo', href: '../evaluasi-sales-promo' },
          { label: 'Evaluasi Sales Diluar Item Larangan', href: '../evaluasi-sales-nonpromo' },
          { label: 'Evaluasi IGR ke OMI', href: '../evaluasi-sales-igr-ke-omi' },
          { label: 'Evaluasi Sales Per Bulan', href: '../evaluasi-sales-per-bulan' },
          { label: 'Evaluasi Sales by MR', href: '../mr' },
        ],
      },
      {
        header: 'Kasir',
        items: [
          { label: 'Item Distribusi', href: '../item-distribusi' },
          { label: 'Prime Bread Today', href: '../prime-bread' },
          { label: 'Monitoring Checker', href: '../monit-checker' },
          { label: 'Struk Item Fokus', href: '../item-fokus' },
          { label: 'Actual Lap310', href: '../actual-lap310' },
          { label: 'Pembatasan Promo', href: '../pembatasan' },
        ],
      },
      {
        header: 'Member',
        items: [
          { label: 'Master Member', href: '../Master-Member' },
          { label: 'Cek Data Member', href: '../cek_data_member' },
          { label: 'Belum Aktivasi Kartu', href: '../belum-aktivasi-kartu' },
          { label: 'History Transaksi Member', href: '../transaksimember/menu.php' },
          { label: 'MM Koordinat', href: '../mm-koordinat' },
          { label: 'Poin Member', href: '../poin' },
        ],
      },
      {
        header: 'Hadiah',
        items: [
          { label: 'History Gift', href: '../history-gift-ms' },
          { label: 'Monitoring Gift', href: '../monitoring_gift' },
          { label: 'Monitoring Hadiah', href: '../hdh' },
        ],
      },
      {
        header: 'Problem',
        items: [
          { label: 'Barcode Double', href: '../barcode-double' },
          { label: 'Master Lokasi Belum Ada', href: '../informasi-produk/report.php?lokasiTidakAda=on' },
          { label: 'Master Lokasi Double', href: '../master-lokasi-double' },
          { label: 'Lokasi Rak Qty Minus', href: '../lokasi-qty-minus' },
        ],
      },
      {
        header: 'Harga',
        items: [
          { label: 'Perubahan Harga Pagi Hari', href: '../Perubahan-Harga' },
          { label: 'Harga Jual Belum Ada', href: '../informasi-produk/report.php?hargaJualNol=on' },
          { label: 'Harga Promo Lebih Mahal', href: '../informasi-produk/report.php?promoMahal=on' },
          { label: 'Harga Margin Negatif', href: '../Margin-Minus' },
          { label: 'Harga Nett All Satuan Jual', href: '../Harga-nett-All-Satuan' },
          { label: 'Harga Nett Satuan Jual Nol', href: '../Harga-nett-Satuan-Nol' },
        ],
      },
      {
        header: 'Information',
        items: [
          { label: 'Kode PLU Timbangan', href: '../Plu-timbangan' },
          { label: 'Master Lokasi', href: '../Master-Lokasi' },
          { label: 'Item Non Promo', href: '../plu-non-promo' },
        ],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Boxes,
    sections: [
      {
        header: 'LPP',
        items: [
          { label: 'Informasi Produk', href: '../informasi-produk' },
          { label: 'Informasi Produk All', href: '../Informas-produk-all' },
          { label: 'Stock All', href: '../stock-all-v2' },
          { label: 'LPP vs Plano', href: '../lpp vs plano2' },
          { label: 'LPP Saat Ini', href: '../lpp-saat-ini' },
          { label: 'Plano > LPP', href: '../Ljm-Plano-besar' },
          { label: 'LPP Bulan Lalu', href: '../lpp-bulan-lalu' },
        ],
      },
      {
        header: 'Stock',
        items: [
          { label: 'Stock Harian', href: '../stock-harian' },
          { label: 'Stock Item Tag N,X Masih Ada', href: '../stock-tag-nx' },
          { label: 'SO IC', href: '../soic' },
          { label: 'Monitoring SO IC', href: '../ic' },
          { label: 'So Harian', href: '../Log-so-harian' },
          { label: 'SO Per Produk', href: '../Soharian' },
          { label: 'Intransit, DSP dan BPB', href: '../cek-ffo' },
        ],
      },
      {
        header: 'Transaksi',
        items: [
          { label: 'History Back Office', href: '../transaksi-bo' },
          { label: 'PB Out vs BTB', href: '../Pb_out' },
          { label: 'Sortir vs Perubahan Status', href: '../sortir-vs-perubahan-status' },
        ],
      },
      {
        header: 'Monitoring',
        items: [
          { label: 'Service Level', href: '../service-level' },
          { label: 'Service Level V2', href: '../adams/sl bpb po.php' },
          { label: 'Kinerja Picker', href: '../kinerja3' },
          { label: 'Monitoring PB', href: '../cek-pb' },
          { label: 'Berita Acara Stock Opname', href: '../sonas-baso' },
          { label: 'Monitoring Sosis', href: '../monitoring-sosis' },
        ],
      },
      {
        header: 'Monitoring PO / BPB',
        items: [
          { label: 'BPB Barang Baru', href: '../evaluasi-barang-baru' },
          { label: 'PO dari BPB Terakhir', href: '../Ljm-PO' },
          { label: 'Informasi PO', href: '../po' },
          { label: 'Cek PB vs PO', href: '../Ljm-PO2' },
          { label: 'Antrian BPB', href: '../antrian_penerimaan_barang' },
          { label: 'SLP H-1', href: '../Ljm-Slp-H1' },
          { label: 'SLP vs BTB H-1', href: '../Ljm-Slp-btb' },
          { label: 'PO vs BPB', href: '../Ljm-po-bpb' },
          { label: 'PO vs BPB (BPB 0)', href: '../Ljm-po-bpb(0)' },
        ],
      },
      {
        header: 'Admin',
        items: [
          { label: 'DSI All Product', href: '../dsiallproduk' },
          { label: 'History BKL', href: '../Historybkl' },
        ],
      },
      {
        header: 'Problem',
        items: [{ label: 'TAG HANOX', href: '../tag_hanox' }],
      },
    ],
  },
  {
    id: 'program',
    label: 'Program',
    icon: Settings,
    sections: [
      {
        header: 'IAS Backoffice',
        items: [
          { label: 'IAS IGR BDG', href: 'http://192.168.222.190:81/login', external: true },
          { label: 'IAS SPI 2K', href: 'http://172.31.147.158:80/login', external: true },
        ],
      },
      {
        header: 'TSM',
        items: [
          { label: 'TSM', href: 'http://172.20.30.6/tsm/Login.aspx', external: true },
        ],
      },
      {
        header: 'ISReport',
        items: [
          { label: 'ISReport SPI 2P', href: 'http://172.26.15.2:8080/spibdg2p/isreport/', external: true },
          { label: 'ISReport SPI 1Y', href: 'http://192.168.152.2:8080/spibdg5/isreport/', external: true },
        ],
      },
      {
        header: 'EDP / IT',
        items: [{ label: 'ALBER', href: 'https://www.instagram.com/albrgalh_', external: true }],
      },
    ],
  },
  {
    id: 'edp',
    label: 'EDP',
    icon: Server,
    sections: [
      {
        header: 'Pengecekan',
        items: [
          { label: 'Cek Pagi', href: 'http://172.26.11.12:8080/report/cek_harian', external: true },
          { label: 'Cek IP', href: 'http://172.26.11.12:8080/report/adams/monitor.php', external: true },
          { label: 'Cek Sertim IPP', href: 'http://172.26.11.12:8080/report/adams/monitoring ipp.php', external: true },
          { label: 'Cek Monthend', href: 'http://172.26.11.12:8080/report/adams/monitoring ME.php', external: true },
          { label: 'Cek Ping', href: 'http://172.26.11.12:8080/report/adams/tes_ping.php', external: true },
        ],
      },
    ],
  },
  {
    id: 'web-report',
    label: 'Web Report',
    icon: FileText,
    sections: [
      {
        header: 'Report',
        items: [
          { label: 'Home', href: 'http://172.26.11.12:8080/report/', external: true },
          { label: 'Member Relation', href: 'http://172.26.11.12:8080/report/adams/monitoring%20MR.php', external: true },
          { label: 'Todays PB', href: 'http://172.26.11.12:8080/report/adams/monitoring%20pb%20today.php', external: true },
          { label: 'Monitoring Item Orders', href: 'http://172.26.11.12:8080/report/adams/monitoringitem.php', external: true },
          { label: 'Monitoring SPI 2K', href: 'http://172.26.11.12:8080/spi2k/spikng2k', external: true },
        ],
      },
    ],
  },
];

const QUICK_LINKS = [
  { label: 'Cek Sonas', href: '../sonas-cek', icon: Zap },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-komponen: NavAccordion
// ─────────────────────────────────────────────────────────────────────────────

function NavFlyout({ item, isOpen, onToggle }) {
  const Icon = item.icon;

  return (
    <div className="relative">
      {/* ── Tombol trigger utama ── */}
      <button
        onClick={onToggle}
        className={`
          relative w-full flex items-center justify-between
          px-4 py-3 text-[15px] font-semibold
          transition-colors duration-150 select-none
          text-slate-700 hover:bg-gray-100 hover:text-slate-900
          ${isOpen ? 'bg-red-50 text-red-700' : ''}
        `}
      >
        <span className={`
          absolute left-0 top-0 h-full w-[3px] rounded-r bg-red-600 transition-opacity
          opacity-0 
          ${isOpen ? 'opacity-100' : ''}
        `} />

        <span className="flex items-center gap-3">
          <Icon
            size={20}
            className={`
              transition-colors text-slate-400
              ${isOpen ? 'text-red-600' : ''}
            `}
          />
          {item.label}
        </span>

        {/* Menggunakan ChevronRight untuk indikator menu flyout */}
        <ChevronRight
          size={16}
          className={`
            transition-transform duration-200 flex-shrink-0
            text-slate-400
            ${isOpen ? 'rotate-90 text-red-500' : ''}
          `}
        />
      </button>

      {/* ── Panel Sub-menu ── */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'}
        bg-gray-50 border-b border-gray-100
        
        lg:absolute lg:left-full lg:-top-2 lg:ml-1 lg:w-72
        lg:bg-white lg:border lg:border-gray-200 lg:shadow-2xl lg:rounded-xl lg:z-[100]
        lg:max-h-[85vh] lg:overflow-y-auto scrollbar-thin
      `}>
        <div className="py-2">
          {item.sections.map((section) => (
            <div key={section.header} className="px-4 py-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {section.header}
              </p>
              <ul className="space-y-1">
                {section.items.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="
                        group/link flex items-center justify-between
                        px-3 py-2 rounded-lg
                        text-[13px] font-medium text-slate-600
                        hover:bg-red-50 hover:text-red-700
                        transition-colors duration-150
                      "
                    >
                      <span className="leading-snug">{link.label}</span>
                      {link.external && (
                        <ExternalLink
                          size={12}
                          className="flex-shrink-0 ml-2 opacity-0 group-hover/link:opacity-50 transition-opacity"
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Komponen Utama: Sidebar
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const handleToggle = (id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  return (
    /*
      FIX BUG SCROLL:
      - h-screen   → agar tinggi persis viewport, tidak overflow ke bawah
      - overflow-hidden pada flex container luar
      - overflow-y-auto hanya pada <nav> (area scrollable)
      Hasilnya: Brand + footer tetap sticky, tengah bisa scroll
    */
    <aside className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 flex-shrink-0">

      {/* ── Brand / Logo ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-200">
          <BarChart2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">ISReport</p>
          <p className="text-[11px] text-slate-400 leading-tight font-medium">BDG 7 | 2K Kuningan</p>
        </div>
      </div>

      {/* ── Navigasi ─────────────────────────── */}
      <nav className="flex-1 overflow-visible relative">
        <p className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Menu Utama
        </p>

        {/* Divider atas */}
        <div className="border-t border-gray-100" />

        {NAV_ITEMS.map((item) => (
          <NavFlyout
            key={item.id}
            item={item}
            isOpen={openMenu === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        ))}

        {/* ── Quick Links ────────────────────────────────── */}
        <div className="border-t border-gray-100 mt-2">
          <p className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Quick Access
          </p>
          {QUICK_LINKS.map(({ label, href, icon: LinkIcon }) => (
            <a
              key={label}
              href={href}
              className="
                flex items-center gap-3 px-4 py-3
                text-[15px] font-medium text-slate-700
                hover:bg-gray-100 hover:text-slate-900
                transition-colors duration-150
              "
            >
              <LinkIcon size={20} className="text-slate-400" />
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Footer (sticky di bawah) ─────────────────────── */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-[11px] text-slate-400 text-center">
          ISReport &copy; 2K Kuningan
        </p>
      </div>
    </aside>
  );
}
