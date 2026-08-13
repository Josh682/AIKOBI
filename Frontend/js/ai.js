const rupiah = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");

function statusLabel(status) {
  return status === "murah" ? "Murah" : status === "mahal" ? "Mahal" : "Wajar";
}

function renderResult(data) {
  document.getElementById("ai-empty").style.display = "none";
  const card = document.getElementById("rec-card");
  card.style.display = "block";

  document.getElementById("rec-product").textContent = data.produk;
  document.getElementById("rec-kategori").textContent = data.kategori;

  document.getElementById("rec-harga-toko").textContent = rupiah(data.harga_toko);
  document.getElementById("rec-harga-pasar").textContent = rupiah(data.harga_pasar);

  const badge = document.getElementById("rec-status");
  badge.textContent = statusLabel(data.status);
  badge.className = "badge " + data.status;

  document.getElementById("gauge-fill").style.width = data.confidence + "%";
  document.getElementById("gauge-pct").textContent = data.confidence + "% confidence";

  document.getElementById("rec-note").textContent = data.rekomendasi;

  // rentang harga wajar
  const { min, max } = data.rentang_harga_wajar;
  const span = max - min;
  const pos = Math.min(100, Math.max(0, ((data.harga_toko - min) / span) * 100));
  document.getElementById("range-fill").style.width = "100%";
  document.getElementById("range-marker").style.left = pos + "%";
  document.getElementById("range-min").textContent = rupiah(min);
  document.getElementById("range-max").textContent = rupiah(max);

  // faktor
  document.getElementById("factor-list").innerHTML = data.faktor
    .map(
      (f) => `
      <div class="factor-row">
        <div class="factor-name">${f.nama}</div>
        <div class="factor-track"><div class="factor-fill" style="width:${f.pengaruh}%"></div></div>
        <div class="factor-pct">${f.pengaruh}%</div>
      </div>`
    )
    .join("");

  // produk serupa
  document.getElementById("similar-list").innerHTML = data.produk_serupa
    .map(
      (p) => `
      <div class="similar-row">
        <div>
          <div class="similar-name">${p.nama}</div>
          <div class="similar-shop">${p.toko}</div>
        </div>
        <div class="similar-right">
          <div class="similar-price">${rupiah(p.harga)}</div>
          <div class="similar-shop">★ ${p.rating.toFixed(1)}</div>
        </div>
      </div>`
    )
    .join("");
}

function renderLokal(alternatif) {
  const section = document.getElementById("lokal-section");
  const produk = alternatif && alternatif.produk ? alternatif.produk : [];

  if (!produk.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  document.getElementById("lokal-desc").textContent = alternatif.insight;
  document.getElementById("lokal-count").textContent = produk.length;

  document.getElementById("lokal-grid").innerHTML = produk
    .map(
      (p) => `
      <div class="lokal-card">
        <div class="lokal-card-top">
          <div>
            <div class="lokal-card-name">${p.nama}</div>
            <div class="lokal-card-shop">${p.toko}</div>
          </div>
          <div class="lokal-badge-hemat">Hemat ${p.hemat_persen}%</div>
        </div>
        <div class="lokal-card-price">${rupiah(p.harga)}</div>
        <div class="lokal-meters">
          <div class="lokal-meter">
            <div class="lokal-meter-label"><span>Kecocokan Spesifikasi</span><span>${p.kecocokan_spek}%</span></div>
            <div class="lokal-meter-track"><div class="lokal-meter-fill spek" style="width:${p.kecocokan_spek}%"></div></div>
          </div>
          <div class="lokal-meter">
            <div class="lokal-meter-label"><span>Sentimen Ulasan Positif</span><span>${p.sentimen_positif}%</span></div>
            <div class="lokal-meter-track"><div class="lokal-meter-fill sentimen" style="width:${p.sentimen_positif}%"></div></div>
          </div>
        </div>
        <div class="lokal-highlight">${p.highlight}</div>
      </div>`
    )
    .join("");
}

async function runAnalysis(query) {
  const card = document.getElementById("rec-card");
  card.style.display = "none";
  document.getElementById("lokal-section").style.display = "none";
  document.getElementById("ai-empty").style.display = "block";
  document.getElementById("ai-empty").textContent = "Menganalisis…";

  try {
    const data = await Api.predictPrice(query);
    renderResult(data);
    renderLokal(data.alternatif_lokal);
  } catch (err) {
    console.error(err);
    document.getElementById("ai-empty").textContent = "Gagal menganalisis: " + err.message;
  }
}

document.getElementById("ai-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("ai-input").value.trim();
  if (q) runAnalysis(q);
});

// tampilkan contoh hasil begitu halaman dibuka
runAnalysis(document.getElementById("ai-input").value.trim());
