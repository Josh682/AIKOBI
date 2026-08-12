import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Price Optimizer',
  description: 'AI Price Optimizer bantu UMKM ngecek harga jual dibanding kompetitor di marketplace, terus kasih rekomendasi harga yang paling untung tanpa bikin produk kalah saing.',
};

export default function HomePage() {
  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">Rp</div>
          Price Optimizer
        </div>
        <nav>
          <Link href="/" className="active">Beranda</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-badge">
          <span className="dot"></span> Dipakai UMKM di seluruh Indonesia
        </div>
        <h1>Harga produkmu udah <span>tepat</span> belum?</h1>
        <p>
          AI Price Optimizer bantu UMKM ngecek harga jual dibanding kompetitor
          di marketplace, terus kasih rekomendasi harga yang paling untung
          tanpa bikin produk kalah saing.
        </p>
        <Link className="btn-primary" href="/ai">
          Mulai Analisis
        </Link>
      </section>

      <section className="how-it-works" id="cara-kerja">
        <div className="how-card">
          <div className="how-num">1</div>
          <h3>Ambil Data</h3>
          <p>
            Sistem ngambil data harga, rating, dan penjualan produk sejenis
            langsung dari marketplace.
          </p>
        </div>
        <div className="how-card">
          <div className="how-num">2</div>
          <h3>Analisis AI</h3>
          <p>
            AI bandingin harga toko kamu sama harga pasar, rating, dan tren
            penjualan buat cari titik harga paling optimal.
          </p>
        </div>
        <div className="how-card">
          <div className="how-num">3</div>
          <h3>Hasil Rekomendasi</h3>
          <p>
            Kamu dapet rekomendasi harga lengkap sama alasannya, tinggal
            terapin ke toko.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        © 2026 Price Optimizer — Bantu UMKM naik kelas lewat harga yang tepat. ·{' '}
        <Link href="/tentang">Tentang kami</Link>
      </footer>
    </div>
  );
}
