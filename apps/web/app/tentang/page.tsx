import type { Metadata } from 'next';
import { Sparkles, BarChart3, Truck, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang AIKOBI | Akal Imitasi Konsultan Bisnis',
  description: 'Misi, dedikasi, dan teknologi di balik pengembangan AIKOBI (Akal Imitasi Konsultan Bisnis).',
};

export default function TentangPage() {
  return (
    <div className="py-6 space-y-12 max-w-4xl mx-auto">
      {/* Header Hero Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Misi & Dedikasi untuk UMKM Indonesia
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Tentang AIKOBI (Akal Imitasi Konsultan Bisnis)
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Kami menciptakan AIKOBI untuk membebaskan pelaku UMKM & penjual e-commerce Tokopedia dari tebak-menebak harga jual. Cukup satu tempat untuk menganalisis lanskap persaingan etalase, kompetitor lokal, ulasan pembeli, dan mendapatkan strategi penetapan harga berbasis AI.
        </p>
      </section>

      {/* Misi Kami Card */}
      <section className="flat-surface p-6 sm:p-8 space-y-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          Misi Kami
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
          Banyak pelaku usaha e-commerce menentukan harga hanya berdasarkan insting atau mengikuti kompetitor tanpa data mendalam, akibatnya margin tergerus atau produk kalah saing. AIKOBI hadir menutup celah tersebut dengan mengubah data harga, rating, ulasan pembeli, dan lokasi seller menjadi rekomendasi penetapan harga yang presisi, mudah dipahami, dan langsung siap diterapkan.
        </p>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flat-surface p-6 space-y-3 border-t-4 border-t-emerald-500">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            Real-time Live Scraping
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
            Rekomendasi ditarik langsung dari data persaingan etalase, varian produk, rating, dan ulasan pembeli Tokopedia secara real-time.
          </p>
        </div>

        <div className="flat-surface p-6 space-y-3 border-t-4 border-t-blue-600">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            Analisis Wilayah & Lokal
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
            AIKOBI membandingkan produk Anda dengan kompetitor lokal sesama wilayah pengiriman untuk mengoptimalkan ongkos kirim.
          </p>
        </div>

        <div className="flat-surface p-6 space-y-3 border-t-4 border-t-amber-500">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            Rekomendasi AI Konsultan
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
            Menyajikan zona harga wajar (Sweet-Spot), sintetis ulasan pembeli, penyebab selisih harga, dan action plan toko.
          </p>
        </div>
      </section>
    </div>
  );
}
