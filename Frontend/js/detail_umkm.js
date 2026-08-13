const rupiah = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");

async function init() {
  const u = await Api.getUmkmDetail("u001");

  document.getElementById("u-nama").textContent = u.nama;
  document.getElementById("u-alamat").textContent = u.alamat;
  document.getElementById("u-kategori").textContent = u.kategori;
  document.getElementById("u-jumlah").textContent = u.jumlah_produk + " produk";
  document.getElementById("u-harga").textContent = "Rata-rata " + rupiah(u.harga_rata_rata);
  document.getElementById("u-rating").textContent = "★ " + u.rating.toFixed(1);
  document.getElementById("u-sejak").textContent = "Sejak " + u.bergabung_sejak;

  const max = Math.max(...u.tren_penjualan.map((d) => d.unit));
  document.getElementById("u-tren").innerHTML = u.tren_penjualan
    .map((d) => {
      const h = Math.max(10, (d.unit / max) * 140);
      return `
      <div class="bar-col">
        <div class="bar" style="height:${h}px" title="${d.unit} unit"></div>
        <div class="bar-label">${d.bulan}</div>
      </div>`;
    })
    .join("");

  document.getElementById("u-produk").innerHTML = u.produk
    .map(
      (p) => `
      <tr>
        <td><div class="prod-name">${p.nama}</div></td>
        <td class="price-cell tabular">${rupiah(p.harga)}</td>
        <td><span class="rating">★ ${p.rating.toFixed(1)}</span></td>
        <td class="tabular" style="color:var(--ink-faint)">${p.terjual.toLocaleString("id-ID")}</td>
      </tr>`
    )
    .join("");
}

init();
