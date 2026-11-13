# AIKOBI (Akal Imitasi Konsultan Bisnis)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Railway-2563EB?style=for-the-badge&logo=railway&logoColor=white)](https://datascrapperweb-production.up.railway.app/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm_workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

> **"Mitra Strategis AI Cerdas, Taktis, dan Terpercaya untuk Kemenangan Produk Anda di Pasar Digital."**

**AIKOBI (Akal Imitasi Konsultan Bisnis)** adalah platform riset pasar, audit etalase, dan rekomendasi penetapan harga cerdas (*competitive intelligence & price optimization*) khusus marketplace Tokopedia. Berbeda dari sekadar alat pengikis (*scraper*) harga mentah, AIKOBI bertindak layaknya konsultan bisnis profesional bagi pelaku UMKM dan pedagang online Indonesia—menjelaskan *mengapa* harga kompetitor berbeda, *bagaimana* pola ulasan pembeli, serta *apa* rencana aksi operasional toko untuk memaksimalkan omzet dan margin keuntungan.

---

## 🌐 Tautan Demo Aplikasi Web

Coba langsung platform AIKOBI pada tautan berikut:

🔗 **[https://datascrapperweb-production.up.railway.app/](https://datascrapperweb-production.up.railway.app/)**

---

## 🎨 Paradigma Desain: Modern Flat x Liquid Glassmorphism

Antarmuka AIKOBI dirancang menggunakan formula **Modern Flat (80%) x Liquid Glassmorphism (20%)** yang terdokumentasi lengkap di [DESIGN.md](DESIGN.md) dan [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md):

* **80% Modern Flat Foundation**: Kanvas solid berkontras tinggi (*Clean Alabaster* `#F8FAFC` pada mode terang dan *Deep Space Obsidian* `#0B0F17` pada mode gelap), struktur data tabular presisi, dan nol beban berlebih pada GPU.
* **20% Liquid Glass Accents**: Efek kaca pembiasan lembut (*refraction hairline border* semi-transparan `1px solid rgba(255, 255, 255, 0.12)`, *specular highlight*, dan kelengkungan organik *squircle*) pada elemen navigasi melayang (*floating topbar*), formulir pencarian hero, dan visualizer harga.
* **Dukungan Dark & Light Mode Adaptif**: Varian gelap Tailwind CSS v4 didekopel dari *media query* OS via `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *, .dark, .dark *))` untuk menjamin kontras tipografi tajam tanpa *invisible text*.

---

## 🌟 Fitur Utama AIKOBI

### 1. Sensor Pasar Tokopedia Real-Time (*Live Ingestion Engine*)
* Mengekstrak data etalase publik Tokopedia secara instan: judul produk, harga toko, varian multi-ukuran (S/M/L) serta eceran vs grosir, rating bintang, total transaksi, topik kepuasan ulasan pembeli, dan kota asal pengiriman (*shipping origin*).
* Menjamin keamanan privasi pedagang: 100% tanpa membutuhkan login akun atau kredensial toko.

### 2. Live Pipeline Progress HUD
* Menghilangkan ketidakpastian pengguna saat proses ekstraksi berlangsung (2–4 detik) dengan *dynamic progress bar* 4 tahapan terstruktur:
  1. `25%` — Menghubungkan ke Tokopedia Live Engine & Parsing Metadata Etalase.
  2. `50%` — Menambang Varian Produk & Distribusi Harga Kompetitor.
  3. `75%` — Mengekstrak Topik Ulasan Pembeli & Klaster Wilayah Pengiriman.
  4. `100%` — Model Kuantil Selesai: Menyusun Sintesis Strategi Konsultan AIKOBI.
* Dilengkapi *elapsed timer* detik real-time.

### 3. Visualizer Spektrum Harga Wajar (*Sweet-Spot Range Spectrum*)
* Spektrum visual interaktif yang memetakan batas harga terendah pasar, rata-rata konsensus pasar, harga toko pengguna, dan zona harga wajar (*Sweet-Spot Demand Zone*).
* Dilengkapi sistem pin vertikal anti-tabrakan (*anti-collision label positioning*) agar teks harga toko dan rata-rata pasar tidak tumpang-tindih.

### 4. Kartu Sintesis Konsultan Bisnis (*Asymmetric 60/40 Advisory Layout*)
* **Kolom Kiri (60% Lebar)**:
  * Status evaluasi margin (*Sweet-Spot*, *Underpriced*, atau *Overpriced*).
  * Dekonstruksi penyebab selisih harga kompetitor (grade bahan, reputasi toko, paket bundling, garansi).
  * Rencana aksi operasional 30 hari (*Action Plan*) yang siap dieksekusi hari ini.
* **Kolom Kanan (40% Lebar)**:
  * Pemetaan sentimen ulasan pembeli: daftar poin pujian utama vs celah komplain yang perlu diantisipasi.

### 5. Matriks Keunggulan Ongkir & Kompetitor Lokal (*Courier & Geolocation Advantage*)
* Membandingkan produk pengguna dengan kompetitor sejenis sesama wilayah pengiriman untuk memenangkan persaingan ongkos kirim lokal vs pengiriman antarpulau.
* Disertai tautan langsung (*direct link*) ke etalase kompetitor di Tokopedia untuk verifikasi manual.

### 6. Format Cetak Laporan Eksekutif (*Print-to-PDF Ready*)
* Mengoptimalkan tampilan cetak (`Cmd+P` / `Ctrl+P`) dengan aturan `@media print` otomatis: menyembunyikan navigasi melayang dan tombol interaktif, mengubah latar menjadi putih bersih, serta menjaga agar kartu evaluasi tidak terpotong antarhalaman (*page-break-inside: avoid*).

---

## 🗺️ Peta Rute & Halaman Aplikasi

| Rute URL | Nama Halaman | Fungsi & Pengalaman Pengguna |
| :--- | :--- | :--- |
| `/` | **Beranda** | Showcase proposisi nilai AIKOBI, ringkasan alur kerja 3 langkah, dan navigasi cepat. |
| `/konsultasi` | **Konsultasi Bisnis AI** | Ruang audit utama: hero capsule input Tokopedia, sampel cepat 1-klik, live HUD, visualizer sweet-spot, dan kartu advisory. |
| `/pasar` | **Radar Dinamika Pasar** | Monitoring agregat harga komoditas UMKM, sebaran kota seller, dan filter kategori pasar. |
| `/tentang` | **Tentang Platform & Misi** | Misi AIKOBI, komitmen bagi UMKM Indonesia, dan 3 pilar teknologi inti. |
| `/tokens-test`| **Sandbox Sistem Desain** | Arena verifikasi token desain, palet semantik bisnis, kelengkungan squircle, dan showcase konfigurasi logo resmi. |

---

## 📁 Struktur Direktori Monorepo

```text
AIKOBI/
├── Assets/                                 # Berkas logo master resolusi tinggi dari Brand Guidelines
│   ├── Logo_Only.jpg                       # Standalone Mark (A Mark warna resmi)
│   ├── Logo_Only_BnW_Darkmode.jpg          # Standalone Mark monokrom putih
│   ├── Logo_Only_BnW_Lightmode.jpg         # Standalone Mark monokrom hitam
│   ├── Master_Logo.jpg                     # Primary Horizontal Lockup (Simbol + Wordmark)
│   ├── Master_Logo_BnW_Darkmode.jpg        # Master Logo monokrom putih
│   └── Master_Logo_BnW_Lightmode.jpg       # Master Logo monokrom hitam
├── BRAND_GUIDELINES.md                     # Pedoman identitas visual resmi AIKOBI
├── DESIGN.md                               # Cetak biru arsitektur desain, UI/UX, & token Tailwind v4
├── apps/
│   └── web/                                # Aplikasi Next.js 16 (App Router)
│       ├── app/
│       │   ├── ai/                         # Komponen ruang konsultasi (kompatibilitas rute)
│       │   ├── api/scrape/                 # Endpoint scraping Tokopedia & kalkulasi kuantil
│       │   ├── konsultasi/                 # Rute resmi Konsultasi Bisnis AI
│       │   ├── pasar/                      # Rute Radar Dinamika Pasar UMKM
│       │   ├── tentang/                    # Halaman Misi & Transparansi Platform
│       │   ├── tokens-test/                # Sandbox pengujian token desain & aset logo
│       │   ├── favicon.ico                 # Favicon resmi AIKOBI
│       │   ├── globals.css                 # Token CSS native, Tailwind v4, & @custom-variant dark
│       │   └── layout.tsx                  # Root shell layout, anti-FOUC script, & metadata SEO
│       ├── components/
│       │   ├── aikobi-advisory-cards.tsx    # Kartu evaluasi asimetris 60/40
│       │   ├── aikobi-competitor-matrix.tsx # Matriks kompetitor & ongkir lokal
│       │   ├── aikobi-empty-state.tsx      # Tampilan awal ramah dengan logo mark
│       │   ├── aikobi-error-alert.tsx      # Alert kesalahan berbahasa manusia
│       │   ├── aikobi-footer.tsx           # Footer global modern flat
│       │   ├── aikobi-hero-input.tsx       # Kapsul input Tokopedia + sample chips
│       │   ├── aikobi-pipeline-hud.tsx     # Live pipeline progress HUD
│       │   ├── aikobi-sweet-spot-visualizer.tsx # Spektrum rentang harga sweet-spot
│       │   ├── aikobi-topbar.tsx           # Dynamic floating topbar (Horizontal Compact lockup)
│       │   └── theme-toggle.tsx            # Tombol pengalih tema (Light / Dark)
│       └── public/
│           └── brand/                      # Aset logo web transparan dioptimasi (PNG/ICO)
├── packages/
│   ├── config/                             # Konfigurasi bersama TypeScript & ESLint
│   ├── db/                                 # Prisma ORM client & skema basis data
│   └── shared-types/                       # Tipe data bersama TypeScript
├── package.json                            # Konfigurasi monorepo root
├── pnpm-workspace.yaml                     # Definisi workspace pnpm
└── README.md                               # Dokumentasi resmi proyek AIKOBI
```

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### Prasyarat:
* **Node.js**: Versi `>= 20.0.0`
* **pnpm**: Versi `>= 9.0.0`

### Langkah-langkah:

1. **Clone repositori**:
   ```bash
   git clone https://github.com/Josh682/AIKOBI.git
   cd AIKOBI
   ```

2. **Instal dependensi workspace**:
   ```bash
   pnpm install
   ```
   > *Catatan*: Jika pnpm meminta persetujuan skrip build dependensi asli (*native build scripts*), jalankan:
   > ```bash
   > pnpm approve-builds --all
   > ```

3. **Menjalankan server pengembangan (Dev Mode)**:
   ```bash
   cd apps/web && pnpm dev
   ```
   *Atau dari root monorepo:*
   ```bash
   pnpm --filter @datascrapper/web dev
   ```
   Aplikasi akan aktif dan dapat diakses di **`http://localhost:3000`**.

4. **Memulai Konsultasi Produk**:
   * Buka peramban ke `http://localhost:3000/konsultasi`.
   * Tempel tautan produk Tokopedia Anda atau klik salah satu tombol sampel cepat (*Kemeja Batik Solo*, *TWS Bluetooth*, atau *Kopi Arabika Gayo*) untuk melihat analisis instan.

5. **Kompilasi Produksi (Production Build)**:
   ```bash
   pnpm --filter @datascrapper/web build
   ```

---

## 🛠️ Tumpukan Teknologi (*Tech Stack*)

* **Framework Aplikasi**: Next.js 16 (App Router), React 19 (Server & Client Components)
* **Bahasa Pemrograman**: TypeScript 5 (Strict Mode)
* **Styling & Token**: Tailwind CSS v4 via `@tailwindcss/postcss`, Native CSS Variables
* **Ikonografi**: `lucide-react`
* **Pemrosesan Citra & Aset**: `sharp`
* **Arsitektur Monorepo**: Turborepo & pnpm workspace
* **Data Ingestion**: Node.js HTTPS / Tokopedia GQL Scraper & Quantile Regression Engine

---

## 📄 Lisensi & Hak Cipta

© 2026 **AIKOBI (Akal Imitasi Konsultan Bisnis)**. Hak Cipta Dilindungi Undang-Undang.
