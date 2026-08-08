import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DataScrapper — BaaS E-commerce Scraping API',
  description: 'API platform untuk ekstraksi data produk real-time dari Tokopedia & Shopee. Dapatkan harga, stok, ulasan, dan data marketplace lainnya dalam hitungan detik.',
};

const features = [
  {
    icon: '🛒',
    title: 'Tokopedia & Shopee',
    desc: 'Scraping langsung dari dua marketplace terbesar Indonesia dengan data akurat dan real-time.',
  },
  {
    icon: '⚡',
    title: 'Async Job Queue',
    desc: 'BullMQ + Redis untuk job queue yang handal. Track status scraping via taskId secara real-time.',
  },
  {
    icon: '🔑',
    title: 'API Key Management',
    desc: 'Buat dan kelola multiple API key dengan kontrol penuh — rotate, aktif/nonaktif, dan monitor usage.',
  },
  {
    icon: '📦',
    title: 'Data Terstruktur',
    desc: 'Hasil scraping diformat sebagai JSON bersih: nama, harga, stok, rating, penjual, dan variasi produk.',
  },
  {
    icon: '🛡️',
    title: 'Anti-Detection',
    desc: 'Playwright + stealth mode + fingerprint spoofing + proxy rotation untuk scraping yang aman.',
  },
  {
    icon: '📊',
    title: 'Usage Dashboard',
    desc: 'Pantau quota API, riwayat request, dan performa scraping langsung dari dashboard interaktif.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Daftar & Dapatkan API Key',
    desc: 'Buat akun gratis dan generate API key pertama Anda dalam hitungan detik.',
  },
  {
    num: '02',
    title: 'Kirim Request',
    desc: 'Panggil endpoint search atau product detail dengan API key Anda di header X-API-Key.',
  },
  {
    num: '03',
    title: 'Terima Data JSON',
    desc: 'Data produk yang bersih, terstruktur, dan siap diproses langsung dari marketplace.',
  },
];

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    price: 'Gratis',
    priceNote: 'Selamanya',
    quota: '100 request/bulan',
    features: ['Tokopedia & Shopee', '1 API Key', 'Basic dashboard', 'Community support'],
    cta: 'Mulai Gratis',
    href: '/register',
    highlighted: false,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: 'Rp 99.000',
    priceNote: '/bulan',
    quota: '5.000 request/bulan',
    features: ['Semua fitur Free', '5 API Key', 'Priority queue', 'Email support', 'Export CSV'],
    cta: 'Pilih Starter',
    href: '/register',
    highlighted: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 'Rp 299.000',
    priceNote: '/bulan',
    quota: '25.000 request/bulan',
    features: ['Semua fitur Starter', '20 API Key', 'Webhook notifikasi', 'Dedicated support', 'Custom rate limit'],
    cta: 'Pilih Pro',
    href: '/register',
    highlighted: false,
  },
];

const codeExample = `// Cari produk di Tokopedia
const res = await fetch(
  'https://api.datascrapper.dev/v1/search' +
  '?marketplace=tokopedia&q=laptop+gaming&page=1',
  {
    headers: { 'X-API-Key': 'dsk_your_api_key' }
  }
);

const { data } = await res.json();
console.log(data.products[0]);
// {
//   name: "ASUS ROG Strix G15",
//   price: 18500000,
//   originalPrice: 22000000,
//   discount: 16,
//   rating: 4.8,
//   sold: 1240,
//   ...
// }`;

export default function HomePage() {
  return (
    <div className="landing-page">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span className="logo-icon">⚡</span>
            <span>DataScrapper</span>
          </Link>
          <div className="nav-links">
            <a href="#features">Fitur</a>
            <a href="#pricing">Harga</a>
            <a href="#how-it-works">Cara Kerja</a>
            <Link href="/login" className="nav-btn-ghost">Masuk</Link>
            <Link href="/register" className="nav-btn-primary">Mulai Gratis →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="badge-dot" />
            API Platform · Marketplace Indonesia
          </div>
          <h1 className="hero-title">
            Scraping Data E-commerce<br />
            <span className="gradient-text">Tanpa Batas, Tanpa Ribet</span>
          </h1>
          <p className="hero-desc">
            Akses data produk real-time dari Tokopedia & Shopee melalui satu API yang simpel.
            Harga, stok, ulasan, dan lebih banyak lagi — semuanya dalam format JSON yang bersih.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn-hero-primary">
              🚀 Mulai Gratis Sekarang
            </Link>
            <Link href="/dashboard/docs" className="btn-hero-ghost">
              Lihat Dokumentasi →
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">2</span>
              <span className="stat-label">Marketplace</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">&lt;2s</span>
              <span className="stat-label">Response time</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">99%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>

        {/* Code preview */}
        <div className="code-preview">
          <div className="code-header">
            <div className="code-dots">
              <span style={{background: '#ff5f57'}} />
              <span style={{background: '#ffbd2e'}} />
              <span style={{background: '#28c840'}} />
            </div>
            <span className="code-title">example.ts</span>
          </div>
          <pre className="code-body mono">{codeExample}</pre>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="features-section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Fitur Utama</p>
            <h2 className="section-title">Semua yang Kamu Butuhkan</h2>
            <p className="section-desc">
              Dibangun untuk developer yang ingin fokus pada produk, bukan urusan scraping.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section id="how-it-works" className="how-section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Cara Kerja</p>
            <h2 className="section-title">Integrasi dalam 3 Langkah</h2>
          </div>
          <div className="steps-row">
            {steps.map((s, i) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                {i < steps.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="pricing-section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Harga</p>
            <h2 className="section-title">Mulai Gratis, Scale Sesuai Kebutuhan</h2>
            <p className="section-desc">Tanpa kartu kredit untuk paket Free. Upgrade kapan saja.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <div key={plan.id} className={`pricing-card ${plan.highlighted ? 'pricing-card--highlight' : ''}`}>
                {plan.highlighted && <div className="pricing-badge">Paling Populer</div>}
                <div className="pricing-top">
                  <h3 className="pricing-name">{plan.name}</h3>
                  <div className="pricing-price">
                    <span className="price-amount">{plan.price}</span>
                    <span className="price-note">{plan.priceNote}</span>
                  </div>
                  <p className="pricing-quota">{plan.quota}</p>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span className="check-icon">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`pricing-cta ${plan.highlighted ? 'pricing-cta--primary' : 'pricing-cta--ghost'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="section-inner">
          <h2 className="cta-title">Siap Mulai Scraping?</h2>
          <p className="cta-desc">
            Daftar gratis hari ini dan dapatkan 100 request pertama tanpa biaya.
            Tidak perlu kartu kredit.
          </p>
          <Link href="/register" className="btn-hero-primary">
            Buat Akun Gratis →
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">⚡</span>
            <span className="footer-name">DataScrapper</span>
            <p className="footer-tagline">API Scraping Marketplace Indonesia</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <span className="footer-col-title">Product</span>
              <a href="#features">Fitur</a>
              <a href="#pricing">Harga</a>
              <Link href="/dashboard/docs">Dokumentasi</Link>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Account</span>
              <Link href="/login">Masuk</Link>
              <Link href="/register">Daftar</Link>
              <Link href="/dashboard/overview">Dashboard</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 DataScrapper. Dibuat dengan ❤️ di Indonesia.</span>
        </div>
      </footer>
    </div>
  );
}
