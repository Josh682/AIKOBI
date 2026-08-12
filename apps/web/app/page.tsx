import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIMA — AI Market Analyzer',
  description: 'AIMA (AI Market Analyzer) platform riset pasar & strategi harga Tokopedia real-time berbasis AI untuk UMKM & Penjual Online.',
};

export default function HomePage() {
  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div
            className="brand-mark"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            AI
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' }}>AIMA</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>AI Market Analyzer</span>
          </div>
        </div>
        <nav>
          <Link href="/" className="active">Beranda</Link>
          <Link href="/ai">Analisis AI</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-badge">
          <span className="dot"></span> Platform Riset & Analisis Pasar Tokopedia Real-time
        </div>
        <h1>Optimalkan Harga & Kuasai Pasar Tokopedia dengan <span>AIMA</span></h1>
        <p>
          AIMA (AI Market Analyzer) mengekstrak data persaingan etalase, menganalisis harga pasar real-time, ulasan pembeli, hingga kompetitor lokal sesama wilayah pengiriman untuk memberikan strategi penetapan harga paling menguntungkan bagi toko Anda.
        </p>
        <Link className="btn-primary" href="/ai">
          Mulai Analisis Pasar
        </Link>
      </section>

      <section className="how-it-works" id="cara-kerja">
        <div className="how-card">
          <div className="how-num">1</div>
          <h3>Real-time Live Scraping</h3>
          <p>
            Tempel link produk Tokopedia untuk mengekstrak data etalase, varian produk, harga toko, rating, dan ulasan pembeli secara instan.
          </p>
        </div>
        <div className="how-card">
          <div className="how-num">2</div>
          <h3>Analisis Pasar & Filter Lokal</h3>
          <p>
            AIMA membandingkan harga produk Anda vs kompetitor sejenis dan kompetitor lokal sesama wilayah pengiriman untuk optimasi ongkir.
          </p>
        </div>
        <div className="how-card">
          <div className="how-num">3</div>
          <h3>Rekomendasi AI Konsultan</h3>
          <p>
            Dapatkan zona harga wajar pasar (Sweet-Spot), sintetis ulasan pembeli, penyebab selisih harga, dan action plan operasional toko.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        © 2026 AIMA (AI Market Analyzer) — Platform Riset & Strategi Harga Tokopedia Terdepan.
      </footer>
    </div>
  );
}
