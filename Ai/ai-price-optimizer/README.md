# AI Price Optimizer — Modul AI (Bagian Saya)

Modul AI yang mengubah data hasil scraping (repo `price-optimizer` / DataScrapper BaaS)
menjadi rekomendasi harga untuk UMKM: harga pasar wajar, rentang harga, confidence,
status (Murah/Wajar/Mahal), rekomendasi teks, dan bobot faktor — sesuai kontrak UI
dashboard (`ANALISIS AI` card).

## Struktur

```
ai-price-optimizer/
├── 01_PROBLEM_DEFINITION.md        # Definisi problem AI + justifikasi algoritma (kedua fitur)
├── data/
│   ├── dummy_products.csv          # Dataset dummy Price Optimizer
│   └── dummy_catalog.json          # Dataset dummy Local Alternative Engine
├── src/
│   ├── generate_dummy_data.py      # Generator dataset dummy Price Optimizer
│   ├── preprocessing.py            # Cleaning + feature engineering Price Optimizer
│   ├── train.py                    # Training Price Optimizer
│   ├── inference.py                # CORE INFERENCE Price Optimizer — statis
│   ├── generate_dummy_catalog.py   # Generator dataset dummy Local Alternative Engine
│   └── local_alternative_engine.py # CORE INFERENCE Local Alternative Engine — statis
├── notebooks/
│   ├── price_optimizer_training.ipynb      # Notebook Price Optimizer (cleaning→FE→training→evaluasi)
│   └── local_alternative_engine.ipynb      # Notebook Local Alternative Engine (spec matching + ABSA)
├── models/
│   └── price_optimizer_models.joblib    # Artefak model terlatih (3 pipeline: lower/median/upper)
└── build_notebook*.py                # Script pembangun notebook (opsional, untuk regenerasi)
```

Ada **dua fitur AI** dalam project ini:

1. **Price Optimizer** — regresi kuantil, prediksi harga pasar wajar + rentang untuk
   produk UMKM dibanding kompetitor (`src/inference.py`).
2. **Smart Downsize / Local Alternative Engine** — content-based matching, cari
   alternatif produk UMKM lokal untuk brand internasional/mahal, dilengkapi
   Aspect-Based Sentiment Analysis dari ulasan (`src/local_alternative_engine.py`).

## Cara pakai

```bash
pip install -r requirements.txt

# 1. (opsional) generate ulang dataset dummy
python3 src/generate_dummy_data.py

# 2. jalankan notebook training (cleaning, feature engineering, training, evaluasi)
#    buka notebooks/price_optimizer_training.ipynb di Jupyter, atau jalankan headless:
jupyter nbconvert --to notebook --execute notebooks/price_optimizer_training.ipynb

# 3. pakai model terlatih untuk inferensi
python3 -c "
import sys; sys.path.insert(0, 'src')
from inference import analyze_price
print(analyze_price(
    product_name='Laptop ASUS Vivobook 14',
    category='Elektronik',
    user_price=8_200_000,
    rating=4.8, total_reviews=210, total_sold=340,
    discount_percent=0, is_official_store=True, location='Jakarta',
    competitor_prices=[8_150_000, 8_400_000, 8_550_000, 7_950_000, 8_050_000],
    scraped_month=8,
))"

# 4. (fitur ke-2) generate katalog dummy & coba Local Alternative Engine
python3 src/generate_dummy_catalog.py
python3 -c "
import sys; sys.path.insert(0, 'src')
import pandas as pd
from local_alternative_engine import LocalAlternativeEngine

df = pd.read_json('data/dummy_catalog.json')
engine = LocalAlternativeEngine().fit(df)
source = df[df.brand_tier == 'International'].iloc[0]
alts = engine.find_alternatives(
    source_name=source['name'], source_category=source['category'],
    source_specifications_text=source['specifications_text'],
    source_price=source['price'], top_k=3,
)
for a in alts:
    print(a)"
```

## Ringkasan pendekatan

Lihat `01_PROBLEM_DEFINITION.md` untuk detail lengkap. Ringkas:

- **Problem AI**: regresi kuantil (bukan klasifikasi) untuk memprediksi *harga pasar
  wajar* (titik + rentang [Q0.1, Q0.9]) dari atribut produk + konteks kompetitor hasil
  scraping. Status "Murah/Wajar/Mahal" adalah aturan deterministik yang membandingkan
  harga jual UMKM terhadap rentang hasil prediksi — bukan model terpisah.
- **Algoritma**: `GradientBoostingRegressor(loss="quantile")`, 3 model statis
  (α = 0.1 / 0.5 / 0.9), hyperparameter tetap (tidak ada `GridSearchCV`/auto-tuning).
- **Fitur**: kategori, rating, total ulasan/terjual, diskon, official store, kota,
  musim, dan **statistik harga kompetitor dari sampel kecil** (4-12 listing, meniru
  jumlah "Produk Serupa" yang realistis tersedia saat inference — lihat catatan
  penting di bawah).
- **Hasil di dataset dummy** (lihat notebook Bagian 6): MAE, RMSE, MAPE ±10%, coverage
  interval quantile mendekati 80% (sesuai target).

### Catatan desain penting: ukuran sampel kompetitor saat training vs inference

Awalnya statistik kompetitor dihitung leave-one-out dari **seluruh** listing per
cluster (ratusan baris) — hasilnya nyaris konstan per cluster (variansnya sangat
kecil). Padahal saat inference nyata, sistem cuma akan punya segelintir "Produk
Serupa" (mis. 5 item, seperti di UI). Kombinasi fitur seperti itu tidak pernah dilihat
model saat training → prediksi jadi jauh meleset (sempat diuji dan menghasilkan error
besar). **Perbaikan**: `engineer_features()` sekarang mensimulasikan ukuran sampel
kompetitor kecil (4-12 listing) sejak training, supaya distribusi fitur konsisten
dengan kondisi nyata saat inference. Ini adalah pelajaran penting yang sebaiknya
diteruskan ke rekan yang memakai/memperluas model ini.

## Menghubungkan ke data scraping asli

Ganti pemanggilan `generate_dummy_dataset()` di notebook dengan query ke tabel
`products` (Postgres, lihat `packages/db/prisma/schema.prisma` di repo scraper).
Pemetaan kolom:

| Kolom dummy | Kolom `products` (Prisma) |
|---|---|
| `category` | `category` |
| `price` | `price` (dari `ProductVariant.price` atau harga utama) |
| `rating` | `rating` |
| `total_reviews` | `totalReviews` |
| `total_sold` | `totalSold` |
| `discount_percent` | `ProductVariant.discountPercent` |
| `is_official_store` | `isOfficialStore` |
| `location` | `location` |
| `scraped_at` | `lastScrapedAt` |
| `keyword_cluster` | keyword pencarian yang menghasilkan produk itu (`SearchCache.keyword` + `category`) |

Untuk "konteks kompetitor" saat inference nyata, ambil hasil `GET /api/v1/search`
(field `items`, biasanya 5-20 produk serupa) sebagai `competitor_prices` di
`analyze_price(...)`.

## Batasan sesuai ketentuan lomba

- `src/inference.py` dan `src/local_alternative_engine.py` hanya melakukan
  **forward pass** dari model/vectorizer yang sudah statis. Tidak ada
  retraining/tuning di jalur ini.
- Tidak ada skrip *bulk testing* atau *auto-tuning* (`GridSearchCV`, dll.) di repo ini.
- Tidak ada mekanisme *feedback loop* otomatis (mis. retrain otomatis dari data baru).
  Training/fit ulang dilakukan manual lewat notebook saat data scraping bertambah banyak.
