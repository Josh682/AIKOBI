const rupiah = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");

function renderPriceHistory(data) {
  const max = Math.max(...data.map((d) => d.harga));
  const min = Math.min(...data.map((d) => d.harga));
  const range = max - min || 1;
  document.getElementById("history-bars").innerHTML = data
    .map((d) => {
      const h = 20 + ((d.harga - min) / range) * 110;
      return `
      <div class="bar-col">
        <div class="bar" style="height:${h}px" title="${rupiah(d.harga)}"></div>
        <div class="bar-label">${d.tanggal}</div>
      </div>`;
    })
    .join("");
}

async function init() {
  const p = await Api.getProductDetail("p001");

  document.getElementById("d-nama").textContent = p.nama;
  document.getElementById("d-toko").textContent = p.toko;
  document.getElementById("d-kategori").textContent = p.kategori;
  document.getElementById("d-lokasi").textContent = p.lokasi;
  document.getElementById("d-rating").textContent = "★ " + p.rating.toFixed(1) + " (" + p.jumlah_review + " ulasan)";
  document.getElementById("d-terjual").textContent = p.terjual.toLocaleString("id-ID") + " terjual";
  document.getElementById("d-harga").textContent = rupiah(p.harga);
  document.getElementById("d-harga-pasar").textContent = "Pasar: " + rupiah(p.harga_pasar);
  document.getElementById("d-rekomendasi").textContent = p.rekomendasi_ai;

  renderPriceHistory(p.riwayat_harga);

  document.getElementById("d-review").innerHTML = p.review
    .map(
      (r) => `
      <div class="review-item">
        <div class="review-user">${r.user}</div>
        <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <div class="review-text">${r.komentar}</div>
      </div>`
    )
    .join("");

  document.getElementById("d-serupa").innerHTML = p.produk_serupa
    .map(
      (s) => `
      <div class="similar-row">
        <div>
          <div class="similar-name">${s.nama}</div>
          <div class="similar-shop">${s.toko}</div>
        </div>
        <div class="similar-right">
          <div class="similar-price">${rupiah(s.harga)}</div>
          <div class="similar-shop">★ ${s.rating.toFixed(1)}</div>
        </div>
      </div>`
    )
    .join("");
}

init();
