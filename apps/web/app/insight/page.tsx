import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insight — AI Price Optimizer',
  description: 'Gambaran umum pasar UMKM, statistik harga per kota, kategori, dan rating.',
};

export default function InsightPage() {
  const kotaData = [
    { label: 'Jakarta', val: 'Rp 210.000', pct: 85 },
    { label: 'Surabaya', val: 'Rp 195.000', pct: 75 },
    { label: 'Bandung', val: 'Rp 180.000', pct: 68 },
    { label: 'Semarang', val: 'Rp 165.000', pct: 58 },
    { label: 'Yogyakarta', val: 'Rp 150.000', pct: 50 },
  ];

  const katData = [
    { label: 'Elektronik', val: 'Rp 320.000', pct: 90 },
    { label: 'Fashion', val: 'Rp 175.000', pct: 65 },
    { label: 'Makanan', val: 'Rp 85.000', pct: 40 },
    { label: 'Kerajinan', val: 'Rp 125.000', pct: 50 },
  ];

  const ratingData = [
    { star: '5 ★', pct: 78 },
    { star: '4 ★', pct: 18 },
    { star: '3 ★', pct: 3 },
    { star: '2 ★', pct: 1 },
  ];

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">Rp</div>
          Price Optimizer
        </div>
        <nav>
          <Link href="/">Beranda</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/ai">Analisis AI</Link>
          <Link href="/insight" className="active">Insight</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>
      </header>

      <main className="page">
        <div className="page-head">
          <div>
            <p className="eyebrow">Insight</p>
            <h1>Gambaran pasar UMKM</h1>
          </div>
        </div>

        <section className="insight-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Harga Rata-rata per Kota</h2>
            </div>
            <div>
              {kotaData.map((k, i) => (
                <div key={i} className="hbar-row">
                  <span className="hbar-label">{k.label}</span>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${k.pct}%` }}></div>
                  </div>
                  <span className="hbar-value">{k.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Harga Rata-rata per Kategori</h2>
            </div>
            <div>
              {katData.map((k, i) => (
                <div key={i} className="hbar-row">
                  <span className="hbar-label">{k.label}</span>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${k.pct}%` }}></div>
                  </div>
                  <span className="hbar-value">{k.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Jumlah UMKM per Kategori</h2>
            </div>
            <div className="dist-list">
              <div className="dist-row">
                <span className="dist-name">Fashion</span>
                <div className="dist-track"><div className="dist-fill" style={{ width: '38%' }}></div></div>
                <span className="dist-pct">38%</span>
              </div>
              <div className="dist-row">
                <span className="dist-name">Makanan</span>
                <div className="dist-track"><div className="dist-fill" style={{ width: '28%' }}></div></div>
                <span className="dist-pct">28%</span>
              </div>
              <div className="dist-row">
                <span className="dist-name">Elektronik</span>
                <div className="dist-track"><div className="dist-fill" style={{ width: '18%' }}></div></div>
                <span className="dist-pct">18%</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Distribusi Rating</h2>
            </div>
            <div>
              {ratingData.map((r, i) => (
                <div key={i} className="star-row">
                  <span className="star-label">{r.star}</span>
                  <div className="star-track">
                    <div className="star-fill" style={{ width: `${r.pct}%` }}></div>
                  </div>
                  <span className="hbar-value">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
