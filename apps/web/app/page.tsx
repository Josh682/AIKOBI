import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, Layers, TrendingUp, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AIKOBI | Akal Imitasi Konsultan Bisnis',
  description: 'AIKOBI (Akal Imitasi Konsultan Bisnis) platform riset pasar & strategi harga Tokopedia real-time berbasis AI untuk UMKM & Penjual Online.',
};

export default function HomePage() {
  return (
    <div className="space-y-16 py-6">
      <section className="hero max-w-4xl mx-auto text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Platform Riset Pasar & Konsultan Harga Tokopedia Real-time
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Optimalkan Margin & Kuasai Pasar Tokopedia bersama <span className="text-blue-600 dark:text-blue-400">AIKOBI</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AIKOBI (Akal Imitasi Konsultan Bisnis) mengekstrak data persaingan etalase, menganalisis harga pasar real-time, ulasan pembeli, hingga kompetitor lokal sesama wilayah pengiriman untuk memberikan strategi penetapan harga paling menguntungkan bagi toko Anda.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
            href="/konsultasi"
          >
            Mulai Konsultasi Bisnis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            href="/tanya"
          >
            Tanya KOBI (Chatbot AI)
          </Link>
        </div>
      </section>

      <section className="how-it-works max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-4" id="cara-kerja">
        <div className="flat-surface p-6 space-y-3 border-t-4 border-t-emerald-500">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Real-time Live Scraping</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Tempel link produk Tokopedia untuk mengekstrak data etalase, varian produk, harga toko, rating, dan ulasan pembeli secara instan.
          </p>
        </div>

        <div className="flat-surface p-6 space-y-3 border-t-4 border-t-blue-600">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Analisis Pasar & Filter Lokal</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            AIKOBI membandingkan harga produk Anda vs kompetitor sejenis dan kompetitor lokal sesama wilayah pengiriman untuk optimasi ongkir.
          </p>
        </div>

        <div className="flat-surface p-6 space-y-3 border-t-4 border-t-amber-500">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Rekomendasi AI Konsultan</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Dapatkan zona harga wajar pasar (Sweet-Spot), sintetis ulasan pembeli, penyebab selisih harga, dan action plan operasional toko.
          </p>
        </div>
      </section>
    </div>
  );
}
