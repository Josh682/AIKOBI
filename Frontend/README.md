# AI Price Optimizer - Frontend

Frontend buat lomba AIC. Full HTML/CSS/JS biasa, ga pake framework/build
tool biar cepet dikerjain dan gampang di-deploy (tinggal upload folder ini
ke Netlify/Vercel/GitHub Pages juga bisa).

## Halaman yang udah jadi

- `index.html` - landing page
- `dashboard.html` - halaman utama, statistik + tabel produk
- `ai.html` - cek harga produk pake AI (halaman andalan buat demo)
- `insight.html` - grafik-grafik (harga per kota, per kategori, dll)
- `detail_produk.html` - detail 1 produk
- `detail_umkm.html` - detail 1 toko/UMKM

Belum dibikin (opsional kalo waktu masih ada): halaman profil/login.

## Cara buka

Paling gampang, klik kanan `dashboard.html` atau file lain terus "Open
with browser". Kalo ternyata datanya ga muncul (kadang browser nge-block
fetch dari file lokal), jalanin server kecil dari dalem folder ini:

```
python -m http.server 8000
```

terus buka `http://localhost:8000/dashboard.html` di browser. Kalo pake VS
Code juga bisa pake extension **Live Server**, tinggal klik kanan file
html -> Open with Live Server.

## Struktur

```
frontend/
  index.html
  dashboard.html
  ai.html
  insight.html
  detail_produk.html
  detail_umkm.html
  css/style.css       -> semua warna & font, ganti di sini aja
  js/api.js           -> tempat semua fetch data
  js/dashboard.js
  js/ai.js
  js/insight.js
  js/detail_produk.js
  js/detail_umkm.js
  data/*.json         -> data dummy, bentuknya udah dibikin mirip API asli
```

## Data masih dummy

Belum konek ke backend beneran, masih baca dari file JSON di folder
`data/`. Semua fetch lewat `js/api.js`, jadi kalo backend udah jadi:

1. Buka `js/api.js`
2. `USE_DUMMY = true` diganti jadi `false`
3. Isi `BASE_URL` sama alamat API-nya

Halaman lain ga perlu diutak-atik lagi karena manggilnya lewat
`Api.getProducts()`, `Api.predictPrice()`, dst - bukan fetch langsung tiap
halaman.

Endpoint yang dipake (perlu disamain sama tim backend):

- `GET /dashboard`
- `GET /products`
- `GET /predict?q=...`
- `GET /insight`
- `GET /products/:id`
- `GET /umkm/:id`

Contoh bentuk respons masing-masing bisa diliat di file JSON-nya
langsung di folder `data/`.

## Catatan

- Warna & font gampang diganti, semuanya ada di bagian atas `style.css`
- Chart-nya bukan pake library, dibikin manual pake div doang biar ga
  gantung sama library luar pas demo offline
- Kartu statistik bentuknya kayak label harga gantung (ada garis
  putus-putus), itu ciri khas visualnya
