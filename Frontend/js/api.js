// lapisan fetch, semua page manggil lewat sini biar gampang kalo mau ganti ke API asli
// kalo backend udah jadi, tinggal ganti USE_DUMMY jadi false + isi BASE_URL

const USE_DUMMY = true;
const BASE_URL = "http://localhost:8000"; // sesuaikan sama url backend

async function apiGet(dummyPath, realPath) {
  const url = USE_DUMMY ? dummyPath : BASE_URL + realPath;
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch gagal: " + url);
  return res.json();
}

const Api = {
  getDashboardSummary: () => apiGet("data/dashboard.json", "/dashboard"),
  getProducts: () => apiGet("data/products.json", "/products"),
  predictPrice: (q) => apiGet("data/predict.json", "/predict?q=" + encodeURIComponent(q)),
  getInsight: () => apiGet("data/insight.json", "/insight"),
  getProductDetail: (id) => apiGet("data/detail_produk.json", "/products/" + id),
  getUmkmDetail: (id) => apiGet("data/detail_umkm.json", "/umkm/" + id),
};
