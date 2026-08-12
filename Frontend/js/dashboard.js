const rupiah = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");

function deltaHtml(pct) {
  const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "—";
  return `<span class="ticket-delta ${dir}">${arrow} ${Math.abs(pct).toFixed(1)}% vs minggu lalu</span>`;
}

function renderSummary(summary) {
  document.getElementById("stat-produk").textContent = summary.total_produk.toLocaleString("id-ID");
  document.getElementById("stat-produk-delta").innerHTML = deltaHtml(summary.delta_produk_pct);

  document.getElementById("stat-umkm").textContent = summary.total_umkm.toLocaleString("id-ID");
  document.getElementById("stat-umkm-delta").innerHTML = deltaHtml(summary.delta_umkm_pct);

  document.getElementById("stat-harga").textContent = rupiah(summary.harga_rata_rata);
  document.getElementById("stat-harga-delta").innerHTML = deltaHtml(summary.delta_harga_pct);
}

function renderBarChart(data) {
  const max = Math.max(...data.map((d) => d.harga_rata_rata));
  const el = document.getElementById("chart-bars");
  el.innerHTML = data
    .map((d, i) => {
      const h = Math.max(8, Math.round((d.harga_rata_rata / max) * 140));
      const highlight = i === data.length - 1 - data.indexOf(d) ? "" : "";
      return `
        <div class="bar-col ${d.harga_rata_rata === max ? "highlight" : ""}">
          <div class="bar" style="height:${h}px" title="${rupiah(d.harga_rata_rata)}"></div>
          <div class="bar-label">${d.kategori}</div>
        </div>`;
    })
    .join("");
}

function renderDistribution(data) {
  const el = document.getElementById("dist-list");
  el.innerHTML = data
    .map(
      (d) => `
      <div class="dist-row">
        <div class="dist-name">${d.kategori}</div>
        <div class="dist-track"><div class="dist-fill" style="width:${d.persen}%"></div></div>
        <div class="dist-pct">${d.persen}%</div>
      </div>`
    )
    .join("");
}

function renderProducts(products) {
  const tbody = document.getElementById("product-rows");
  tbody.innerHTML = products
    .map((p) => {
      const badgeLabel = p.status === "murah" ? "Murah" : p.status === "mahal" ? "Mahal" : "Wajar";
      return `
      <tr>
        <td>
          <a href="detail_produk.html" style="text-decoration:none; color:inherit;">
            <div class="prod-name">${p.nama}</div>
          </a>
          <div class="prod-shop">${p.toko} · ${p.kategori}</div>
        </td>
        <td class="price-cell tabular">${rupiah(p.harga)}</td>
        <td class="tabular" style="color:var(--ink-faint)">${rupiah(p.harga_pasar)}</td>
        <td><span class="badge ${p.status}">${badgeLabel}</span></td>
        <td><span class="rating">★ ${p.rating.toFixed(1)}</span></td>
        <td class="tabular" style="color:var(--ink-faint)">${p.terjual.toLocaleString("id-ID")}</td>
      </tr>`;
    })
    .join("");
}

async function init() {
  try {
    const [summaryData, products] = await Promise.all([
      Api.getDashboardSummary(),
      Api.getProducts(),
    ]);

    renderSummary(summaryData.summary);
    renderBarChart(summaryData.harga_per_kategori);
    renderDistribution(summaryData.distribusi_umkm);
    renderProducts(products);
  } catch (err) {
    console.error(err);
    document.getElementById("product-rows").innerHTML =
      `<tr><td colspan="6" style="color:var(--red); padding:20px;">Gagal memuat data: ${err.message}</td></tr>`;
  }
}

init();
