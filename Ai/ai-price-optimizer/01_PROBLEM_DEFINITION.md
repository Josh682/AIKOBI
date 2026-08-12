# AI Price Optimizer — Problem Definition & Algorithm Selection

## 1. Konteks

Scraper (repo `price-optimizer`) menghasilkan data produk marketplace ternormalisasi
(`Product`, `ProductVariant`, `PriceHistory`) dari Tokopedia & Shopee: nama, kategori,
harga, harga asli, diskon, rating, total ulasan, total terjual, seller/official store,
lokasi, dan riwayat perubahan harga per waktu.

Bagian saya adalah lapisan **AI** yang mengubah data mentah hasil scraping tadi menjadi
output di dashboard: *Harga Rata-rata Pasar*, *Rentang Harga Wajar*, *Confidence*, status
*Murah/Wajar/Mahal*, rekomendasi teks, dan bobot *Faktor yang Mempengaruhi*.

## 2. Problem AI yang Diselesaikan

**Bukan klasifikasi langsung "murah/wajar/mahal".** Kalau AI dilatih langsung untuk
mengeluarkan label itu, kita butuh dataset berlabel manusia ("harga ini mahal/tidak")
yang subjektif, mahal untuk dikumpulkan, dan gampang bias. Selain itu label itu berubah
tiap saat harga pasar bergerak — tidak konsisten untuk dijadikan target training.

**Rumusan yang dipakai: Regresi (dengan interval), bukan klasifikasi.**

> Given fitur sebuah produk (kategori, rating, jumlah terjual, status official store,
> lokasi, musim/waktu) **dan konteks kompetitornya** (distribusi harga produk sejenis
> hasil scraping), prediksi **harga pasar yang wajar** untuk produk dengan karakteristik
> tersebut — sebagai satu titik estimasi (median) **dan** sebagai rentang (lower–upper
> bound).

Status *Murah / Wajar / Mahal* lalu dihitung dengan **aturan deterministik** (bukan model
terpisah): bandingkan harga jual UMKM terhadap rentang hasil prediksi. Ini penting secara
desain karena:
- Konsisten by-definition dengan angka "Rentang Harga Wajar" yang ditampilkan di UI (tidak
  mungkin model klasifikasi bilang "Mahal" padahal angkanya masuk rentang wajar).
- Tidak butuh dataset label tambahan.
- Threshold-nya transparan & bisa dijelaskan ke pengguna (explainable).

**Kenapa target training = harga produk itu sendiri (bukan harga UMKM)?**
Model dilatih dari seluruh listing kompetitor hasil scraping: `price` listing itu sendiri
adalah "harga yang market terima" untuk kombinasi atribut tersebut. Fitur **tidak**
menyertakan harga produk UMKM yang sedang dicek — supaya tidak terjadi data leakage /
sirkular (model tidak boleh "menjiplak" harga yang justru mau dinilai).

Di inference: fitur yang sama dihitung untuk produk UMKM (rating, kategori, total
terjual, statistik harga kompetitor di sekitarnya, musim) → model memprediksi harga
wajar → baru dibandingkan dengan harga jual UMKM yang sebenarnya.

### Output yang dihasilkan AI (kontrak sesuai UI)
| Field UI | Sumber |
|---|---|
| Harga Rata-rata Pasar | prediksi quantile 0.5 (median) |
| Rentang Harga Wajar (bar min–max) | prediksi quantile 0.1 dan 0.9 |
| Confidence AI (%) | dihitung dari lebar interval relatif terhadap harga median (interval sempit → confidence tinggi) |
| Status (Murah/Wajar/Mahal) | aturan: harga UMKM dibanding [Q0.1, Q0.9] |
| Faktor yang Mempengaruhi (%) | `feature_importances_` model, dikelompokkan per kategori fitur & dinormalisasi ke 100% |
| Rekomendasi teks | template berbasis status + posisi harga dalam rentang |

## 3. Algoritma yang Dipilih

**Gradient Boosting Regression Trees dengan *quantile loss*** (`sklearn.ensemble.GradientBoostingRegressor`,
`loss="quantile"`), tiga model statis untuk α = 0.1 (lower), 0.5 (median), 0.9 (upper).

Alasan pemilihan (dibanding alternatif):

| Alternatif | Kenapa tidak dipilih |
|---|---|
| Regresi linier / Ridge | Hubungan harga vs rating/terjual/kompetitor bersifat non-linear dan ada interaksi antar fitur (mis. efek rating berbeda per kategori). Linear model underfit. |
| Neural network (MLP/Deep Learning) | Butuh data jauh lebih banyak untuk stabil; sulit dijelaskan (butuh SHAP tambahan); untuk tabular data skala UMKM (ratusan–ribuan baris per kategori) performanya biasanya kalah dari tree ensemble. |
| Random Forest biasa | Bagus untuk point estimate, tapi *quantile* prediction butuh implementasi tambahan (quantile forest) atau library ekstra. GBR dengan `loss="quantile"` sudah native mendukung interval tanpa dependency tambahan. |
| KNN regression | Sensitif terhadap skala & jumlah tetangga, tidak stabil dengan campuran fitur numerik+kategorikal, feature importance tidak natural. |

**Gradient Boosting Trees** dipilih karena:
1. Native mendukung *quantile loss* → langsung menghasilkan lower/median/upper bound tanpa model tambahan (pas untuk "Rentang Harga Wajar").
2. `feature_importances_` bawaan → langsung memetakan ke "Faktor yang Mempengaruhi" di UI tanpa perlu SHAP/LIME tambahan (menjaga scope tetap ke *core inference*).
3. Robust terhadap fitur campuran (numerik + kategorikal via one-hot) dan tidak butuh scaling.
4. Ringan untuk di-*deploy* sebagai artefak statis (`.joblib`) — cocok untuk syarat lomba: inferensi murni, parameter statis saat demo, tanpa auto-tuning.

Sesuai ketentuan lomba, hyperparameter di-set **statis** (bukan hasil `GridSearchCV`/
`RandomizedSearchCV`) dan tidak ada skrip *bulk testing* atau *feedback loop* otomatis di
repo tahap ini — hanya notebook training + modul inferensi.

## 4. Ringkasan Fitur (lihat `src/preprocessing.py`)

- **Atribut produk**: kategori, rating, total ulasan, total terjual, is_official_store, diskon%, lokasi (tier kota).
- **Konteks kompetitor** (dihitung per cluster kategori+keyword, *excluding* produk itu sendiri): mean/median/std/min/max harga, jumlah kompetitor dalam cluster.
- **Musim/waktu**: bulan, flag musim belanja (Ramadan/Lebaran, Harbolnas 11.11 & 12.12, Gajian akhir bulan).

## 6. Fitur Tambahan: Smart Downsize / Local Alternative Engine

### Konteks & Motivasi
Daya beli kelas menengah melemah (*frugal living*) sementara ada dorongan nasional
mendukung produk UMKM lokal. Fitur ini menyasar momen itu: saat pengguna melihat
produk brand internasional/mahal, sistem menawarkan **alternatif UMKM lokal** dengan
spesifikasi yang sepadan tapi harga jauh lebih terjangkau.

### Problem AI (berbeda dari Price Optimizer di atas)
Ini **bukan** regresi/klasifikasi — tidak ada label historis "produk A adalah
alternatif sah untuk produk B" untuk dilatih secara supervised. Problem-nya adalah
**content-based matching / ranking** (mirip information retrieval):

> Diberikan produk sumber (nama, kategori, teks spesifikasi, harga), cari & rangking
> kandidat produk UMKM lokal di kategori yang sama yang (a) kemiripan spesifikasinya
> tinggi, (b) harganya jauh lebih murah (target 40-50%), dan (c) kualitasnya
> terjamin (rating + sentimen ulasan positif).

### Algoritma yang dipilih & alasannya

| Komponen | Algoritma | Kenapa |
|---|---|---|
| **Spec matching** | TF-IDF vectorization + cosine similarity | Ringan (tak perlu GPU/model besar), transparan, cukup untuk teks pendek terstruktur (nama+spesifikasi) dengan keyword overlap jelas. Vectorizer di-*fit* sekali dari katalog (statis) — bukan model yang perlu label untuk dilatih. |
| **Kualitas produk** | Aspect-Based Sentiment Analysis berbasis **leksikon** (rule-based) | Tidak butuh dataset ulasan berlabel sentimen (mahal dikumpulkan). Leksikon Indonesia dikurasi manual untuk 5 aspek: Kualitas, Keawetan, Pengiriman, Pelayanan, Harga. Deterministik → cocok untuk *core inference* statis sesuai ketentuan lomba (bukan model ML yang di-training). |
| **Ranking akhir** | Skor gabungan berbobot statis: `0.55×spec_similarity + 0.25×rating_ternormalisasi + 0.20×sentimen_ternormalisasi` | Bobot ditentukan manual saat desain (bukan hasil grid-search), transparan & bisa dijelaskan ke pengguna. |

**Kenapa bukan model deep learning (embedding/BERT) untuk spec matching atau ABSA
berbasis transformer?** Untuk tahap penyisihan ini, model besar butuh infrastruktur
inferensi lebih berat & data training berlabel yang belum ada. TF-IDF + leksikon
memberi baseline yang *explainable*, cepat, dan sepenuhnya statis saat demo — tapi
didesain modular: `LocalAlternativeEngine.vectorizer` bisa diganti sentence-embedding
model di iterasi berikutnya tanpa mengubah struktur pipeline.

### Dua metrik "kecocokan" yang dipakai (dan kenapa dipisah)
- **TF-IDF cosine similarity** → dipakai untuk *retrieval/ranking* (menemukan &
  mengurutkan kandidat), lebih toleran terhadap variasi kata.
- **Overlap kata kunci literal** (`spec_overlap_pct`) → dipakai untuk *angka yang
  ditampilkan ke pengguna* ("Kecocokan Spesifikasi: X%"), karena lebih intuitif:
  menjawab langsung "berapa persen spesifikasi produk asli yang juga dimiliki produk
  lokal ini?".

> **Catatan jujur soal kalibrasi**: di dataset dummy, angka kecocokan spesifikasi yang
> terukur ada di kisaran 40-65% (bukan persis 80-90% seperti target ideal), karena
> pengukuran token-level cukup ketat (variasi penulisan kata dianggap tidak cocok).
> Ini metrik proxy yang wajar dikalibrasi ulang begitu ada data spesifikasi riil hasil
> scraping — threshold filter (`min_spec_similarity`, `min_price_savings_pct`) sengaja
> dibuat sebagai parameter statis yang mudah disesuaikan, bukan angka hardcode di
> tengah logika.

### Alur (mapping ke tugas)
1. **Dataset dummy** (`src/generate_dummy_catalog.py`): 5 "archetype" produk (charger,
   TWS earphone, sepatu, tas ransel, smartwatch) × listing brand internasional (harga
   tinggi, official store) & UMKM lokal (harga 40-60% lebih murah, spesifikasi
   sebagian sama) + ulasan sintetis per aspek.
2. **Preprocessing**: gabungkan nama+kategori+spesifikasi jadi satu teks
   (`build_catalog_text`), fit `TfidfVectorizer`.
3. **"Training"**: untuk pipeline ini, "training" = fit vectorizer ke korpus katalog
   (unsupervised, tidak ada target label) — statis, dilakukan sekali, dipakai berulang
   saat inference.
4. **Evaluasi**: uji manual di notebook `local_alternative_engine.ipynb` — cek apakah
   alternatif yang direkomendasikan masuk akal (kategori sama, hemat 40-55%, rating
   bagus, sentimen positif) untuk beberapa produk sumber contoh.
5. **Inference**: `LocalAlternativeEngine.find_alternatives(...)` — murni forward
   pass (transform + cosine similarity + scoring), tanpa retrain/tuning saat runtime.

