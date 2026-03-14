# ISReport V2 — Dashboard Operasional BDG 7 | 2K Kuningan

Dashboard internal berbasis web untuk monitoring dan pelaporan operasional toko.  
Dibangun menggunakan **React 19 + Vite + Tailwind CSS**, dengan backend **Express.js + Prisma ORM**.

---

## ✨ Fitur Utama

- **Navigasi Accordion** — Menu vertikal yang bisa di-expand/collapse, diekstrak dari sistem legacy (nav-bar.php)
- **Real-Time Clock** — Jam live di topbar (konversi dari `showTime()` vanilla JS → React hooks)
- **Executive Light Theme** — Desain bersih dan mudah dibaca untuk level manajemen senior
- **Responsive** — Sidebar overlay di mobile, inline collapse di desktop
- **Modular** — Komponen layout terpisah: `Sidebar`, `Topbar`, `DashboardLayout`

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
├── nav-bar.php             ← file legacy sebagai referensi ekstraksi menu
│
├── prisma/                 ← schema & migrasi database
│   └── schema.prisma
│
└── src/
    ├── main.jsx            ← entry point React
    ├── App.jsx             ← root component
    ├── index.css           ← Tailwind directives + custom scrollbar
    │
    └── components/
        └── layout/
            ├── Sidebar.jsx       ← navigasi accordion + lucide icons
            ├── Topbar.jsx        ← header + real-time clock
            └── DashboardLayout.jsx  ← wrapper utama
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
| Backend | Express.js 5, Node.js |
| Database | Prisma ORM + PostgreSQL |
| Dev Tools | Nodemon, PostCSS, Autoprefixer |

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

- File `nav-bar.php` adalah sumber referensi legacy (sistem 2012) yang digunakan sebagai dasar ekstraksi struktur menu navigasi. File ini tidak dieksekusi oleh aplikasi.
- Seluruh styling menggunakan **Tailwind CSS murni** — tidak ada Bootstrap.

---

*ISReport &copy; BDG 7 | 2K Kuningan*
