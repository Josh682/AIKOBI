# AIMA | AI Market Analyzer 🚀

**AIMA (AI Market Analyzer)** adalah platform riset pasar dan rekomendasi penetapan harga produk e-commerce (*price optimization & competitive intelligence*) khusus marketplace Tokopedia. Platform ini mengekstrak data persaingan etalase real-time, menganalisis ulasan pembeli, hingga menemukan kompetitor lokal sesama wilayah pengiriman untuk membantu penjual online (UMKM & Merchant) menentukan strategi harga terbaik.

---

## 🌟 Fitur Utama AIMA

- **1. Real-time Tokopedia Live Scraper**:
  - Ekstraksi otomatis data etalase Tokopedia (Judul Produk, Harga Toko, Kota Pengiriman/Asal Toko, Rating, Total Ulasan, Topik Ulasan Pembeli, dan Varian Produk).
  - Parser Multi-Varian pintar untuk mendeteksi ukuran standar (S/M/L) serta satuan transaksi eceran vs grosir.

- **2. Sistem Pencarian & Filter Wilayah**:
  - Pencarian produk kompetitor sejenis di Tokopedia.
  - Filter wilayah pengiriman (*shipping origin location*) untuk menemukan kompetitor lokal sesama kota secara akurat.

- **3. Visualizer Rentang Harga Wajar Pasar (Fair Price Zone)**:
  - Grafik skala interaktif yang menampilkan **Harga Terendah Pasar**, **Harga Rata-rata Pasar**, **Target Zona Wajar (Sweet-Spot Demand Zone)**, dan **Harga Toko Anda**.
  - Penanda penyesuaian harga real-time tanpa overlap teks.

- **4. Analisis Bisnis Mendalam (Expert E-Commerce Consultant Synthesis)**:
  - **Posisi Harga Pasar**: Perbandingan persentase dan selisih nominal toko Anda vs Rata-rata, Terendah, dan Tertinggi pasar.
  - **Evaluasi Ulasan Pembeli**: Pemetaan otomatis poin kepuasan pembeli (*Hal yang Dipuji*) dan poin perbaikan operasional toko (*Sarana Perbaikan*).
  - **Analisis Perbedaan Harga**: Menguraikan penyebab spesifik jurang perbedaan harga kompetitor (grade material, paket bundling, badge merchant), elastisitas pembeli, dan korelasi harga vs penjualan.
  - **Rekomendasi Strategis & Action Plan**: Opsi penetapan harga (Penyesuaian Margin / Volume Booster) beserta langkah tindakan operasional toko.

- **5. Pembanding Kompetitor Lokal & Produk Serupa**:
  - Penampilan kartu kompetitor sejenis yang rapi, informatif, dan langsung terhubung (*direct link*) ke etalase Tokopedia.

---

## 📁 Struktur Direktori Proyek

Proyek ini dibangun menggunakan arsitektur **Turborepo Monorepo**:

```text
AI-Price-Optimizer/
├── apps/
│   ├── web/               # Next.js 16 Web Application & Dynamic API Routes (/app/ai, /api/scrape)
│   ├── api/               # Microservice API backend (opsional)
│   └── worker/            # Background scraping worker service (opsional)
├── packages/
│   ├── config/            # Shared environment & ESLint/TypeScript configurations
│   ├── db/                # Shared Prisma ORM Database Client & Schema
│   └── shared-types/      # Shared TypeScript DTOs & Interfaces
├── docker/
│   └── docker-compose.yml # Docker setup untuk PostgreSQL & Redis
├── package.json           # Root workspace configuration & scripts
├── pnpm-workspace.yaml    # Workspace definition
└── README.md              # Dokumentasi proyek AIMA
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### Prasyarat:
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`

### Langkah-langkah:

1. **Clone repositori & install dependensi**:
   ```bash
   pnpm install
   ```

2. **Menjalankan server pengembangan (Dev Mode)**:
   ```bash
   pnpm dev:web
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Membuka Halaman Analisis AIMA**:
   Akses `http://localhost:3000/ai` di browser Anda, lalu tempel link produk Tokopedia (contoh: `https://www.tokopedia.com/store/product-slug`) untuk memulai analisis real-time.

4. **Build untuk Produksi**:
   ```bash
   pnpm --filter @datascrapper/web build
   ```

---

## 🛠️ Teknologi yang Digunakan

- **Frontend & App Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS (Tailored Design Tokens, Glassmorphism, Premium Modern Typography)
- **Monorepo Manager**: Turborepo & pnpm workspace
- **Backend Data Fetching**: Node.js HTTPS / Tokopedia GQL Product Search & Multi-Tier Scraper

---

## 📄 Lisensi

© 2026 AIMA (AI Market Analyzer). Hak Cipta Dilindungi Undang-Undang.
