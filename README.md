# ISReport V2 — Dashboard Operasional BDG 7 | 2K Kuningan

Dashboard internal berbasis web untuk monitoring dan pelaporan operasional toko.  
Dibangun menggunakan **React 19 + Vite + Tailwind CSS**, dengan backend **Express.js + Prisma ORM**.

---

## ✨ Fitur Utama

- **Navigasi Accordion** — Menu vertikal expand/collapse, diekstrak dari sistem legacy (`nav-bar.php`)
- **Real-Time Clock** — Jam live di topbar (konversi dari `showTime()` vanilla JS → React hooks)
- **Executive Light Theme** — Desain bersih untuk level manajemen senior
- **Responsive** — Sidebar overlay di mobile, inline collapse di desktop
- **Modular** — Komponen layout terpisah: `Sidebar`, `Topbar`, `DashboardLayout`

### 🆕 Informasi Produk (Ekspansi Vertikal — Porting dari `my-inq`)

Halaman `Informasi Produk` merupakan replika penuh dari sistem lama `my-inq/index.php`. Fitur unggulan:

| Panel / Fitur | Deskripsi |
|---|---|
| **Master Produk** | Deskripsi, kode PLU, Divisi, Dept, Kategori |
| **Informasi Stok** | Saldo awal, In/Out Transfer, Penjualan, Saldo Akhir per Lokasi |
| **Satuan Jual & Harga** | Unit/Frac, Harga Jual, Avg Cost, Minimum Jual |
| **🗂️ Lokasi Rak** *(Modal)* | Kode Rak, Sub-Rak, Tipe, Shelving, Urutan, Qty Limit |
| **🚛 History Penerimaan** *(Modal)* | Top 15 transaksi terakhir dari supplier |
| **📅 Penjualan 12 Bulan** *(Modal Crosstab)* | Qty, Rupiah (x1000), Margin (x1000), Margin (%), Jml Member — breakdown per Group (Biru, Merah, OMI, IDM) dan per Bulan |
| **Promo Cashback** | Daftar promo cashback aktif |
| **Promo Gift** | Daftar promo hadiah aktif |
| **Instore Promo** | Daftar promo in-store aktif |
| **Harga Jual Khusus (HJK)** | Daftar harga khusus per tanggal |
| **Pembatasan / Alokasi** | Batasan qty & alokasi promo per tipe member |
| **Trend Sales Bulanan** | Data mentah trend penjualan per bulan |

**UX Pattern:** Layout **2-kolom seimbang (5:7)** dengan 4 Tab navigasi (`Ringkasan`, `Promosi Aktif`, `History Transaksi`, `Aturan & Batasan`). Data padat (Rak, Penerimaan, Penjualan 12 Bln) dibuka via **Modal Popup** dari panel kiri.

---

## 🗂️ Struktur Folder

```
isreport-v2/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                    ← variabel environment (tidak di-commit)
├── .gitignore
├── nav-bar.php             ← referensi legacy menu navigasi
├── my-inq/                 ← referensi legacy PHP (analisis query, bukan dieksekusi)
│   ├── tabel-stock.php
│   ├── tabel-lokasi.php
│   ├── tabel-satuan-jual.php
│   ├── tabel-cashback.php
│   ├── tabel-gift.php
│   ├── tabel-instore.php
│   ├── tabel-hjk.php
│   ├── tabel-penjualan.php
│   ├── tabel-penerimaan.php
│   ├── tabel-pembatasan.php
│   └── tabel-trend-sales.php
│
├── prisma/
│   └── schema.prisma
│
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx
    │   │   ├── Topbar.jsx
    │   │   └── DashboardLayout.jsx
    │   └── universalTables.jsx  ← komponen tabel reusable
    │
    ├── pages/
    │   └── productInfo.jsx      ← halaman Informasi Produk (tab + modal)
    │
    └── routes/
        └── product.js           ← API endpoint /api/products/:plu
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** >= 18
- **npm** >= 9

### Install dependencies

```bash
npm install
```

### Setup environment

Salin `.env.example` (jika ada) atau buat file `.env` di root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/isreport"
PORT=3000
```

### Jalankan frontend (dev server)

```bash
npm run dev
```

Buka browser di **http://localhost:5173**

### Jalankan backend (Express API)

```bash
npm run server
```

### Build produksi

```bash
npm run build
npm run preview
```

---

## 🧱 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 3 |
| Icons | lucide-react |
| Backend | Express.js 5, Node.js 18+ |
| Database ORM | Prisma ORM (Raw Query Mode) + PostgreSQL |
| Dev Tools | Nodemon, PostCSS, Autoprefixer |

---

## 🔌 API Endpoint

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/products/:plu` | Mengambil data produk lengkap beserta stock, lokasi rak, satuan jual, semua promo aktif, history penerimaan, penjualan 12 bulan, trend sales, dan pembatasan. |

**Contoh Response:**

```json
{
  "product": { "prd_prdcd": "1666510", "prd_deskripsipanjang": "NAMA PRODUK", ... },
  "stock": [...],
  "locations": [...],
  "salesUnits": [...],
  "cashback": [...],
  "gift": [...],
  "instore": [...],
  "hjk": [...],
  "penjualan": [...],
  "penerimaan": [...],
  "trendSales": [...],
  "pembatasan": [...]
}
```

---

## ⚠️ Aturan Database (Legacy Schema — Hard Rule)

> Database yang digunakan adalah skema **legacy** yang tidak memiliki Primary Key valid.
> **SEMUA** interaksi database di backend WAJIB menggunakan:
> ```js
> // ✅ BENAR — Parametrized Raw Query
> const result = await prisma.$queryRaw`SELECT ... WHERE prd_prdcd LIKE ${plu + '%'}`;
> 
> // ❌ DILARANG — Prisma Model Methods
> // await prisma.tbmaster_prodmast.findMany({ ... })
> ```
> Alasan: Prisma membutuhkan unique identifier / PK yang valid untuk metode ORM bawaannya.

---

## 📦 Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server frontend (Vite) di port 5173 |
| `npm run server` | Backend Express dengan Nodemon |
| `npm run build` | Build produksi ke folder `dist/` |
| `npm run preview` | Preview build produksi lokal |

---

## 🧩 Penggunaan Komponen Layout

```jsx
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HalamanSaya() {
  return (
    <DashboardLayout>
      <h2>Konten halaman di sini</h2>
    </DashboardLayout>
  );
}
```

---

## 📝 Catatan

- Folder `my-inq/` berisi file PHP legacy (sistem 2012) yang digunakan **hanya sebagai referensi analisis query SQL**. File-file ini **tidak dieksekusi** oleh aplikasi.
- File `nav-bar.php` digunakan sebagai referensi ekstraksi struktur navigasi. **Tidak dieksekusi** oleh aplikasi.
- Seluruh styling menggunakan **Tailwind CSS murni** — tidak ada Bootstrap.
- Backend menggunakan **100% `prisma.$queryRaw`** untuk semua query — lihat bagian Aturan Database di atas.

---

*ISReport &copy; BDG 7 | 2K Kuningan*
