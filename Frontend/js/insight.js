const rupiah = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");

function barList(el, data, key, valKey, formatter) {
  const max = Math.max(...data.map((d) => d[valKey]));
  el.innerHTML = data
    .map((d) => {
      const pct = (d[valKey] / max) * 100;
      return `
      <div class="hbar-row">
        <div class="hbar-label">${d[key]}</div>
        <div class="hbar-track"><div class="hbar-fill" style="width:${pct}%"></div></div>
        <div class="hbar-value">${formatter(d[valKey])}</div>
      </div>`;
    })
    .join("");
}

function starChart(el, data) {
  el.innerHTML = data
    .map(
      (d) => `
      <div class="star-row">
        <div class="star-label">${d.bintang}★</div>
        <div class="star-track"><div class="star-fill" style="width:${d.persen}%"></div></div>
        <div class="hbar-value">${d.persen}%</div>
      </div>`
    )
    .join("");
}

async function init() {
  const data = await Api.getInsight();
  barList(document.getElementById("kota-chart"), data.harga_per_kota, "kota", "harga_rata_rata", rupiah);
  barList(document.getElementById("kategori-chart"), data.harga_per_kategori, "kategori", "harga_rata_rata", rupiah);
  barList(document.getElementById("umkm-chart"), data.jumlah_umkm_per_kategori, "kategori", "jumlah", (n) => n + " toko");
  starChart(document.getElementById("rating-chart"), data.distribusi_rating);
}

init();
