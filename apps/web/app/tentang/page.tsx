import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang — AI Price Optimizer',
  description: 'Informasi tim & misi di balik pengembangan AI Price Optimizer.',
};

export default function TentangPage() {
  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">Rp</div>
          Price Optimizer
        </div>
        <nav>
          <Link href="/">Beranda</Link>
          <Link href="/ai">Analisis AI</Link>
          <Link href="/tentang" className="active">Tentang</Link>
        </nav>
      </header>

      <section className="about-hero">
        <h1>Tentang Price Optimizer</h1>
        <p>
          Kami bikin AI Price Optimizer supaya pelaku UMKM nggak lagi nebak-nebak
          harga jual. Cukup satu tempat buat lihat posisi harga produkmu di
          pasar, dan dapet rekomendasi yang jelas alasannya.
        </p>
      </section>

      <main className="about-wrap">
        <div className="about-mission">
          <h2>Misi kami</h2>
          <p>
            Banyak UMKM nentuin harga cuma modal insting atau ngikutin kompetitor
            tanpa data yang jelas — akibatnya bisa kemahalan sampai kalah saing,
            atau kemurahan sampai untungnya tergerus. Price Optimizer hadir buat
            nutup gap itu: mengubah data harga, rating, dan tren pasar jadi
            rekomendasi harga yang gampang dimengerti dan langsung bisa
            diterapkan.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
            </div>
            <h3>Berbasis Data</h3>
            <p>
              Rekomendasi ditarik dari data harga, rating, dan penjualan produk
              sejenis di marketplace, bukan tebakan.
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>
            </div>
            <h3>Cepat & Praktis</h3>
            <p>
              Hasil analisis disajikan ringkas dengan alasan yang mudah dipahami,
              tinggal terapin ke toko.
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h3>Untuk UMKM</h3>
            <p>
              Dirancang khusus buat kebutuhan UMKM lokal — nggak perlu latar
              belakang teknis buat pakai.
            </p>
          </div>
        </div>

        <div className="about-team">
          <h2>Tim di balik proyek ini</h2>
          <div className="team-row">
            <div className="team-avatar">T</div>
            <div>
              <div className="team-name">Tio</div>
              <div className="team-role">Frontend Developer</div>
            </div>
            <div className="team-avatar">Z</div>
            <div>
              <div className="team-name">Zhafran</div>
              <div className="team-role">Dokumentasi</div>
            </div>
            <div className="team-avatar">F</div>
            <div>
              <div className="team-name">Ferry</div>
              <div className="team-role">AI Developer</div>
            </div>
            <div className="team-avatar">A</div>
            <div>
              <div className="team-name">Azka</div>
              <div className="team-role">Scraping</div>
            </div>
            <div className="team-avatar">J</div>
            <div>
              <div className="team-name">Joshua</div>
              <div className="team-role">Backend Developer</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        © 2026 Price Optimizer — Bantu UMKM naik kelas lewat harga yang tepat.
      </footer>
    </div>
  );
}
