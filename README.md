# 🕷️ DataScrapper BaaS (Backend-as-a-Service)

> **High-Performance E-Commerce Scraping & Price Tracking Engine** untuk marketplace Indonesia (Tokopedia & Shopee) dengan arsitektur modern berbasis Playwright, Fastify, BullMQ, Redis, PostgreSQL, dan Next.js.

---

## 📑 Daftar Isi

- [Arsitektur & Struktur Monorepo](#-arsitektur--struktur-monorepo)
- [Fitur Utama](#-fitur-utama)
- [Status Dukungan Marketplace](#-status-dukungan-marketplace)
- [Prerequisites](#-prerequisites)
- [Cara Menjalankan (Quick Start)](#-cara-menjalankan-quick-start)
- [Panduan Lengkap Scraping via Terminal (CLI Guide)](#-panduan-lengkap-scraping-via-terminal-cli-guide)
  - [1. Health Check](#1-health-check)
  - [2. Search Produk (On-Demand Scraping)](#2-search-produk-on-demand-scraping)
  - [3. Polling Status Task Asinkron](#3-polling-status-task-asinkron)
  - [4. Scraping Detail Produk & Varian](#4-scraping-detail-produk--varian)
  - [5. Skrip Otomatisasi PowerShell (Search + Auto-Poll Table)](#5-skrip-otomatisasi-powershell-search--auto-poll-table)
  - [6. Autentikasi & Manajemen API Key via Terminal](#6-autentikasi--manajemen-api-key-via-terminal)
- [Engine Scheduled Collection & Price Optimizer](#-engine-scheduled-collection--price-optimizer)
- [Konfigurasi Stealth & Anti-Bot](#-konfigurasi-stealth--anti-bot)
- [Manajemen Database & Cache](#-manajemen-database--cache)
- [Daftar URL & Port Service](#-daftar-url--port-service)
- [Cheatsheet Perintah pnpm](#-cheatsheet-perintah-pnpm)

---

## 📁 Arsitektur & Struktur Monorepo

Project ini menggunakan arsitektur **Turborepo Monorepo** dengan pembagian tanggung jawab yang jelas:

```
Data-Scrapper/
├── apps/
│   ├── api/             → Fastify API Gateway & OpenAPI/Swagger Docs (Port 3001)
│   ├── web/             → Next.js 14 Dashboard & User Management UI (Port 3000)
│   └── worker/          → Playwright Scraper Worker & Collection Scheduler
├── packages/
│   ├── db/              → Prisma ORM Client & PostgreSQL Schema / Migrations
│   ├── config/          → Shared Environment & App Config
│   └── shared-types/    → TypeScript Types (Payloads, Normalized Product, API Responses)
└── docker/
    └── docker-compose.yml → PostgreSQL (5432), Redis (6379), Redis Commander (8081)
```

---

## ⚡ Fitur Utama

- 🚀 **Dual Scraping Modes:**
  - **On-Demand API**: Scrape keyword atau URL spesifik secara asinkron dengan polling task ID.
  - **Scheduled Collection (Price Optimizer)**: Cron scheduler otomatis untuk tracking harga periodik dan deteksi delta harga (`PriceHistory`).
- 🛡️ **Anti-Bot & Stealth Engine:**
  - `playwright-extra` + `puppeteer-extra-plugin-stealth`
  - Rotasi User-Agent, isolasi browser context per request, dan humanisasi delay.
  - Fast extraction via Next.js `__NEXT_DATA__` & API XHR interceptor dengan fallback DOM scraping.
  - Dev-mode auto-fallback ke mock data jika terkena CAPTCHA/anti-bot saat testing lokal.
- ⚡ **High Concurrency & Queue:**
  - Didukung Redis + BullMQ dengan rate limiting adaptif per worker.
  - 24-Hour automatic search cache (`SearchCache`) untuk menghemat resource dan response super cepat.
- 📊 **Normalized Data Structure:**
  - Output standar untuk semua marketplace: Nama produk, harga normal, harga diskon, persentase diskon, stok varian, rating, total penjualan, info penjual (Official Store badge), spesifikasi, dan ulasan.
- 🔐 **Security & Quota Management:**
  - API Key authentication (`X-API-Key`) untuk scraping endpoints.
  - JWT Bearer Authentication untuk dashboard pengguna dan manajemen key.
  - Audit logging dan quota deduction per request.

---

## 🛒 Status Dukungan Marketplace

| Marketplace | Search Scraping | Detail & Varian | Ulasan (Reviews) | Scheduled Tracking | Metode Ekstraksi |
|-------------|:---------------:|:---------------:|:----------------:|:------------------:|-------------------|
| **TOKOPEDIA** | ✅ Aktif | ✅ Aktif | ✅ Aktif | ✅ Aktif | `__NEXT_DATA__` + DOM Fallback |
| **SHOPEE** | ✅ Aktif | ✅ Aktif | ✅ Aktif | ✅ Aktif | Internal API Intercept + DOM Fallback |
| **BUKALAPAK** | ⏳ Roadmap | ⏳ Roadmap | ⏳ Roadmap | ⏳ Roadmap | - |
| **LAZADA** | ⏳ Roadmap | ⏳ Roadmap | ⏳ Roadmap | ⏳ Roadmap | - |
| **BLIBLI** | ⏳ Roadmap | ⏳ Roadmap | ⏳ Roadmap | ⏳ Roadmap | - |

> ⚠️ Parameter `marketplace` pada request API wajib menggunakan **HURUF KAPITAL** (contoh: `TOKOPEDIA`, `SHOPEE`).

---

## ⚙️ Prerequisites

Pastikan di komputer kamu sudah terpasang:
- **Node.js** v20.0.0 atau lebih baru (`node -v`)
- **pnpm** v9.0.0 atau lebih baru (`pnpm -v`) — Install: `npm install -g pnpm`
- **Docker & Docker Desktop** (untuk database PostgreSQL dan Redis)
- **PowerShell / Terminal / cURL**

---

## 🚀 Cara Menjalankan (Quick Start)

### 1. Salin Environment Variables
Pastikan file `.env` sudah tersedia di root direktori (salin dari `.env.example` jika belum):
```powershell
cp .env.example .env
```

### 2. Jalankan Container Docker (PostgreSQL + Redis)
```powershell
docker compose -f docker/docker-compose.yml up -d
```

### 3. Install Dependencies
```powershell
pnpm install
```

### 4. Setup Database & Jalankan Seed
Jalankan migrasi Prisma dan seed akun test serta API Key default:
```powershell
pnpm db:migrate
pnpm --filter @datascrapper/db db:seed
```

Output terminal akan menampilkan kredensial test dan API Key siap pakai:
```text
✅ Test user siap:
   Email   : test@datascrapper.dev
   Password: Test1234!

🔑 Default Test API Key: 
   dsk_60f3411c83dafa07ae2099a8622ccdd9d7ef84d45aaca4827d3170a4a3ad923d
```

### 5. Jalankan Service

Kamu bisa memilih salah satu cara di bawah:

#### Opsi A: Jalankan Semua Service Sekaligus (1 Terminal)
```powershell
pnpm dev
```
*(Turborepo akan menjalankan API, Worker, dan Web Frontend secara paralel dalam satu terminal).*

#### Opsi B: Jalankan Modular (Terminal Terpisah)
Buka terminal terpisah untuk masing-masing service yang kamu perlukan:

- **Terminal 1 — API Server (Port 3001):**
  ```powershell
  pnpm dev:api
  ```
- **Terminal 2 — Scraping Worker & Scheduler:**
  ```powershell
  pnpm dev:worker
  ```
- **Terminal 3 — Web Frontend Dashboard (Port 3000):**
  ```powershell
  pnpm dev:web
  ```

---

## 🧪 Panduan Lengkap Scraping via Terminal (CLI Guide)

Di bawah ini adalah panduan lengkap cara melakukan scraping data marketplace langsung menggunakan terminal (`curl.exe` atau PowerShell `Invoke-RestMethod`).

### 1. Health Check
Cek status kesiapan API server, database PostgreSQL, dan Redis:

**PowerShell / CMD / Bash:**
```powershell
curl.exe http://localhost:3001/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 45.2,
    "timestamp": "2026-08-08T08:50:00.000Z",
    "services": {
      "database": "ok",
      "redis": "ok"
    }
  }
}
```

---

### 2. Search Produk (On-Demand Scraping)

Endpoint `GET /api/v1/search` digunakan untuk mencari produk berdasarkan keyword, filter harga, dan pagination.

#### Parameter Query:
| Parameter | Tipe | Wajib | Keterangan | Contoh |
|-----------|------|:-----:|------------|--------|
| `marketplace` | String | Ya | `TOKOPEDIA` atau `SHOPEE` | `TOKOPEDIA` |
| `q` | String | Ya | Kata kunci pencarian | `laptop` |
| `min_price` | Number | Tidak | Filter harga minimum (IDR) | `5000000` |
| `max_price` | Number | Tidak | Filter harga maksimum (IDR) | `15000000` |
| `page` | Number | Tidak | Nomor halaman (default: `1`) | `1` |
| `per_page` | Number | Tidak | Jumlah produk per halaman (default: `20`, max: `50`) | `20` |

#### Header Wajib:
- `X-API-Key`: `dsk_60f3411c83dafa07ae2099a8622ccdd9d7ef84d45aaca4827d3170a4a3ad923d`

#### Contoh Request Tokopedia (cURL Siap Copy-Paste):
```powershell
curl.exe -s -G "http://localhost:3001/api/v1/search" `
  --data-urlencode "marketplace=TOKOPEDIA" `
  --data-urlencode "q=laptop" `
  -H "X-API-Key: dsk_60f3411c83dafa07ae2099a8622ccdd9d7ef84d45aaca4827d3170a4a3ad923d"
```

#### Contoh Request Shopee (PowerShell):
```powershell
$headers = @{ "X-API-Key" = "dsk_60f3411c83dafa07ae2099a8622ccdd9d7ef84d45aaca4827d3170a4a3ad923d" }
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/search?marketplace=SHOPEE&q=sepatu+running&page=1" -Headers $headers
$response | ConvertTo-Json -Depth 5
```

#### Response Skenario 1: Job Baru Dimasukkan ke Queue (`202 Accepted` - Cache Miss)
Jika data belum ada di cache, job scraping akan di-enqueue ke worker dan mengembalikan `taskId`:
```json
{
  "success": true,
  "data": {
    "taskId": "e14bfaf6-b0d4-48c6-a83c-1dff0d65111e",
    "status": "PENDING",
    "message": "Scraping job enqueued. Poll /api/v1/task/status/:taskId for results."
  },
  "meta": {
    "cached": false,
    "responseTimeMs": 48,
    "quotaRemaining": 99
  }
}
```
> 👉 *Lanjutkan dengan polling status task menggunakan `taskId` tersebut (lihat Bagian 3).*

---

### 3. Polling Status Task Asinkron

Gunakan endpoint `GET /api/v1/task/status/:taskId` untuk memantau proses scraping worker. Ketika selesai (`COMPLETED`), data produk langsung disertakan pada properti `data`.

#### Contoh Polling Request (cURL):
```powershell
curl.exe -s "http://localhost:3001/api/v1/task/status/e14bfaf6-b0d4-48c6-a83c-1dff0d65111e" `
  -H "X-API-Key: dsk_60f3411c83dafa07ae2099a8622ccdd9d7ef84d45aaca4827d3170a4a3ad923d"
```

#### Response Saat COMPLETED (Disertai Data Produk):
```json
{
  "success": true,
  "data": {
    "taskId": "e14bfaf6-b0d4-48c6-a83c-1dff0d65111e",
    "type": "SEARCH",
    "status": "COMPLETED",
    "marketplace": "TOKOPEDIA",
    "startedAt": "2026-08-08T09:49:58.002Z",
    "completedAt": "2026-08-08T09:50:10.155Z",
    "errorMessage": null,
    "retryCount": 0,
    "data": {
      "keyword": "laptop",
      "marketplace": "TOKOPEDIA",
      "totalFound": 20,
      "page": 1,
      "items": [
        {
          "externalId": "toped-dom-1-0",
          "marketplace": "TOKOPEDIA",
          "name": "Laptop ASUS Vivobook 14 FHD IPS Core i5",
          "price": 8499000,
          "originalPrice": 9999000,
          "discountPercent": 15,
          "imageUrl": "https://images.tokopedia.net/...",
          "url": "https://www.tokopedia.com/asus-official/vivobook-14",
          "rating": 4.9,
          "totalSold": 340,
          "seller": { "name": "ASUS Official Store", "location": "Jakarta Pusat" },
          "location": "Jakarta Pusat"
        }
      ]
    }
  }
}
```

---

### 4. Scraping Detail Produk & Varian

Endpoint `GET /api/v1/product/details` digunakan untuk mengambil informasi lengkap dari URL spesifik (varian, harga per SKU, stok, ulasan pembeli, dan spesifikasi).

#### Parameter Query:
| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|:-----:|------------|
| `marketplace` | String | Ya | `TOKOPEDIA` atau `SHOPEE` |
| `url` | String | Ya | URL lengkap halaman produk |
| `include_reviews` | Boolean | Tidak | Set `true` untuk menyertakan ulasan pembeli (default: `false`) |

#### Contoh Request Tokopedia Detail (cURL):
```powershell
curl.exe -s -G "http://localhost:3001/api/v1/product/details" `
  --data-urlencode "marketplace=TOKOPEDIA" `
  --data-urlencode "url=https://www.tokopedia.com/asus-official/vivobook-14" `
  --data-urlencode "include_reviews=true" `
  -H "X-API-Key: dsk_60f3411c83dafa07ae2099a8622ccdd9d7ef84d45aaca4827d3170a4a3ad923d"
```

---

### 5. Cara Melihat Data yang Sudah Tersimpan di Database

Semua produk yang berhasil discrape akan otomatis disimpan ke database PostgreSQL. Ada **3 cara** untuk melihat datanya:

#### 📊 Opsi A: Tampilkan Tabel Langsung di Terminal (Paling Praktis)
Jalankan perintah ini di root folder:
```powershell
pnpm --filter @datascrapper/db db:view
```
Output tabel langsung tampil rapi dengan kolom: `name`, `marketplace`, `rating`, `totalSold`, `seller`, `location`, dan `SearchCache`.

#### 🌐 Opsi B: Tampilan GUI Visual di Browser (Prisma Studio)
1. Buka browser di: **[http://localhost:5555](http://localhost:5555)**
2. Klik tabel:
   - **`Product`**: Menampilkan semua produk yang tersimpan (nama, gambar, harga, ulasan, seller, rating).
   - **`SearchCache`**: Riwayat pencarian keyword & JSON lengkap.
   - **`PriceHistory`**: Riwayat naik/turunnya harga produk.

#### 🖥️ Opsi C: Web Dashboard (Next.js)
1. Buka: **[http://localhost:3000/login](http://localhost:3000/login)**
2. Login: `test@datascrapper.dev` / `Test1234!`
3. Buka halaman **Overview** untuk melihat sisa kuota, jumlah request, dan log aktivitas.

---

### 6. Skrip Otomatisasi 1-Klik PowerShell (Search + Auto-Wait + Tampilkan Tabel)

Salin fungsi PowerShell di bawah ini ke terminal untuk melakukan pencarian, otomatis menunggu worker selesai, dan langsung menampilkan tabel hasilnya:

```powershell
function Scrape-Product {
    param(
        [Parameter(Mandatory=$true)] [string]$Query,
        [Parameter(Mandatory=$false)] [string]$Marketplace = "TOKOPEDIA",
        [Parameter(Mandatory=$false)] [string]$ApiKey = "dsk_60f3411c83dafa07ae2099a8622ccdd9d7ef84d45aaca4827d3170a4a3ad923d",
        [Parameter(Mandatory=$false)] [int]$MinPrice = 0,
        [Parameter(Mandatory=$false)] [int]$MaxPrice = 0
    )

    $baseUrl = "http://localhost:3001/api/v1"
    $headers = @{ "X-API-Key" = $ApiKey }
    
    $uri = "$baseUrl/search?marketplace=$Marketplace&q=$([System.Web.HttpUtility]::UrlEncode($Query))&page=1"
    if ($MinPrice -gt 0) { $uri += "&min_price=$MinPrice" }
    if ($MaxPrice -gt 0) { $uri += "&max_price=$MaxPrice" }

    Write-Host "🔍 Memulai scraping [$Marketplace] untuk query: '$Query'..." -ForegroundColor Cyan
    $res = Invoke-RestMethod -Uri $uri -Headers $headers -Method GET

    # Jika langsung dari cache
    if ($res.meta.cached -eq $true) {
        Write-Host "⚡ Cache Hit! Data ditemukan langsung dari database." -ForegroundColor Green
        $res.data.items | Select-Object name, @{N='Harga (Rp)'; E={"{0:N0}" -f $_.price}}, rating, totalSold, location | Format-Table -AutoSize
        return
    }

    # Jika job di-enqueue (asinkron)
    $taskId = $res.data.taskId
    Write-Host "⏳ Job di-queue dengan Task ID: $taskId" -ForegroundColor Yellow
    Write-Host "🔄 Sedang memproses scraping di worker..." -NoNewline

    $isDone = $false
    while (-not $isDone) {
        Start-Sleep -Seconds 3
        Write-Host "." -NoNewline
        
        $taskRes = Invoke-RestMethod -Uri "$baseUrl/task/status/$taskId" -Headers $headers -Method GET
        $status = $taskRes.data.status

        if ($status -eq "COMPLETED") {
            Write-Host "`n✅ Scraping Selesai!" -ForegroundColor Green
            $items = $taskRes.data.data.items
            if ($items -and $items.Count -gt 0) {
                $items | Select-Object name, @{N='Harga (Rp)'; E={"{0:N0}" -f $_.price}}, rating, totalSold, location | Format-Table -AutoSize
            } else {
                Write-Host "⚠️ Data tersimpan di database." -ForegroundColor Yellow
            }
            $isDone = $true
        }
        elseif ($status -eq "FAILED") {
            Write-Host "`n❌ Scraping Gagal: $($taskRes.data.errorMessage)" -ForegroundColor Red
            $isDone = $true
        }
    }
}
```

#### Cara Pakai:
```powershell
# Cari produk laptop di Tokopedia
Scrape-Product -Query "macbook pro"

# Cari sepatu di Shopee dengan filter harga
Scrape-Product -Query "sepatu running" -Marketplace "SHOPEE" -MinPrice 200000 -MaxPrice 600000
```

Selain endpoint scraping, kamu dapat mengelola akun dan API Key langsung melalui terminal:

#### A. Login untuk Mendapatkan JWT Bearer Token:
```powershell
curl.exe -X POST "http://localhost:3001/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@datascrapper.dev","password":"Test1234!"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "test@datascrapper.dev", "plan": "FREE" },
    "tokens": { "accessToken": "eyJhbGciOi...", "refreshToken": "..." }
  }
}
```

#### B. Cek Statistik & Sisa Kuota Pengguna:
```powershell
curl.exe "http://localhost:3001/api/v1/stats/usage" `
  -H "Authorization: Bearer eyJhbGciOi..."
```

#### C. List Semua API Key Milik Akun:
```powershell
curl.exe "http://localhost:3001/api/v1/keys" `
  -H "Authorization: Bearer eyJhbGciOi..."
```

#### D. Buat API Key Baru:
```powershell
curl.exe -X POST "http://localhost:3001/api/v1/keys" `
  -H "Authorization: Bearer eyJhbGciOi..." `
  -H "Content-Type: application/json" `
  -d '{"name":"Scraper Server Produksi"}'
```

#### E. Rotate API Key (Revoke Key Lama, Buat Key Baru):
```powershell
curl.exe -X POST "http://localhost:3001/api/v1/keys/KEY_ID_KAMU/rotate" `
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## ⏰ Engine Scheduled Collection & Price Optimizer

Sistem ini dilengkapi dengan **Scheduled Collection & Price Tracking Engine** untuk memantau perubahan harga e-commerce secara otomatis tanpa intervensi manual:

```
                  ┌────────────────────────┐
                  │   CollectionPlan DB    │ (cronExpr: "0 */6 * * *")
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │  CollectionScheduler   │ (node-cron)
                  └───────────┬────────────┘
                              │ Trigger
                              ▼
                  ┌────────────────────────┐
                  │   CollectionManager    │
                  └─────┬────────────┬─────┘
                        │            │
             Enqueue    ▼            ▼ Enqueue
         ┌──────────────────┐    ┌────────────────────┐
         │ collection-search│    │ collection-product │
         └────────┬─────────┘    └─────────┬──────────┘
                  │                        │
                  ▼                        ▼
         ┌──────────────────┐    ┌────────────────────┐
         │ Bulk Scrape Page │    │ Product & Variants │
         └────────┬─────────┘    └─────────┬──────────┘
                  │                        │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │  trackProductPrice()   │
                  │   - Calculate Delta    │
                  │   - % Price Change     │
                  │   - Save PriceHistory  │
                  │   - Log CollectionLog  │
                  └────────────────────────┘
```

### Cara Kerja:
1. Data plan disimpan di tabel `CollectionPlan` dengan tipe `KEYWORD_SEARCH` atau `PRODUCT_TRACK` dan jadwal `cronExpr`.
2. Saat worker dijalankan (`pnpm dev:worker`), `CollectionScheduler` otomatis mendaftarkan cron jobs ke memory.
3. Saat jadwal tiba, plan membuat `CollectionSession`, lalu membagi pekerjaan ke queue `collection-search` dan `collection-product`.
4. Utility `trackProductPrice` membandingkan harga saat ini dengan snapshot terakhir di `PriceHistory`, mencatat nominal delta (`priceChange`), persentase perubahan (`changePercent`), dan mencatat log di `CollectionLog`.
5. Semua riwayat harga tersimpan dan siap dikonsumsi oleh modul analisis tren maupun AI optimizer.

---

## 🛡️ Konfigurasi Stealth & Anti-Bot

Konfigurasi scraper dapat disesuaikan pada file `.env`:

```env
# Proxy rotasi (format: host:port atau user:pass@host:port, pisahkan dengan koma jika multiple)
PROXY_LIST=

# Set false jika ingin melihat visual browser saat scraping (sangat membantu saat debugging)
BROWSER_HEADLESS=true

# Maksimal browser context konkuren
MAX_CONCURRENT_JOBS=3

# Cache time-to-live pencarian dalam jam
CACHE_TTL_HOURS=24
```

> 💡 **Tips Debugging:** Ubah `BROWSER_HEADLESS=false` di `.env` lalu restart worker (`pnpm dev:worker`). Browser Chromium akan muncul di layar secara visual sehingga kamu bisa melihat interaksi halaman secara langsung.

---

## 🗄️ Manajemen Database & Cache

### Buka Prisma Studio (GUI Database Browser)
Untuk melihat data produk, varian, riwayat harga, audit log, dan session collection secara visual:
```powershell
pnpm db:studio
```
Akses di browser: `http://localhost:5555`

### Reset & Seed Ulang Database
Jika ingin mengosongkan database dan mengulang seed awal:
```powershell
pnpm --filter @datascrapper/db db:reset
pnpm --filter @datascrapper/db db:seed
```

### Monitoring Antrian Redis & BullMQ
Buka **Redis Commander** di browser: `http://localhost:8081`  
Kamu bisa melihat status antrian queue: `search`, `product`, `collection-search`, dan `collection-product`.

---

## 🌐 Daftar URL & Port Service

| Service / Halaman | URL | Keterangan |
|-------------------|-----|------------|
| **Web Dashboard** | `http://localhost:3000` | Landing page & UI antarmuka pengguna |
| **Login Dashboard** | `http://localhost:3000/login` | Halaman login web |
| **Kelola API Keys** | `http://localhost:3000/dashboard/api-keys` | Dashboard manajemen API Key |
| **API Server Base** | `http://localhost:3001` | Fastify backend API root |
| **Swagger API Docs** | `http://localhost:3001/documentation` | Dokumentasi interaktif OpenAPI / Swagger UI |
| **API Health Check** | `http://localhost:3001/health` | Health check endpoint |
| **Prisma Studio GUI**| `http://localhost:5555` | Database GUI viewer (`pnpm db:studio`) |
| **Redis Commander** | `http://localhost:8081` | Monitoring Redis & BullMQ Queue |

---

## 📦 Cheatsheet Perintah pnpm

| Perintah | Fungsi |
|----------|--------|
| `pnpm install` | Install semua dependencies monorepo |
| `pnpm dev` | Jalankan **SEMUA** service (API + Web + Worker) dalam 1 terminal |
| `pnpm dev:api` | Jalankan hanya Fastify API Server |
| `pnpm dev:worker` | Jalankan hanya Scraping Worker & Collection Scheduler |
| `pnpm dev:web` | Jalankan hanya Next.js Web Frontend |
| `pnpm build` | Build seluruh workspace package & app |
| `pnpm db:migrate` | Terapkan migrasi schema Prisma terbaru ke PostgreSQL |
| `pnpm db:seed` | Seed user test dan API key default |
| `pnpm db:studio` | Buka Prisma Studio GUI di port 5555 |
| `pnpm docker:up` | Jalankan container PostgreSQL & Redis di background |
| `pnpm docker:down` | Hentikan container Docker |
| `pnpm docker:logs` | Lihat streaming log container Docker |

---

<div align="center">
  <sub>Built with ❤️ by Google DeepMind Advanced Agentic Coding Pair Programmer</sub>
</div>

