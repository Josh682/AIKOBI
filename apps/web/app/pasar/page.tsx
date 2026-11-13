import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Compass,
  TrendingUp,
  MapPin,
  Tag,
  Search,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Radar Pasar UMKM | AIKOBI',
  description: 'Radar Dinamika Pasar Marketplace Tokopedia: Benchmarking harga, sebaran kompetitor lokal, dan tren komoditas UMKM.',
};

export default function PasarPage() {
  const cityBenchmarks = [
    { city: 'Kota Surakarta (Solo)', avgPrice: 'Rp 115.000', marginDelta: '+12.4%', leaderCategory: 'Batik & Fashion', count: '1.420 Listing' },
    { city: 'Kota Bandung', avgPrice: 'Rp 98.000', marginDelta: '-4.2%', leaderCategory: 'Apparel & Outerwear', count: '3.890 Listing' },
    { city: 'Jakarta Selatan', avgPrice: 'Rp 148.000', marginDelta: '+8.1%', leaderCategory: 'Gadget & Lifestyle', count: '5.120 Listing' },
    { city: 'Kota Yogyakarta', avgPrice: 'Rp 88.500', marginDelta: '+15.3%', leaderCategory: 'Kerajinan & Kuliner', count: '980 Listing' },
    { city: 'Kota Surabaya', avgPrice: 'Rp 122.000', marginDelta: '+2.8%', leaderCategory: 'Elektronik Rumah', count: '2.440 Listing' },
  ];

  return (
    <div className="space-y-10 py-4">
      {/* Page Header */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          Radar Dinamika Pasar UMKM
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Lanskap & Radar Pasar E-Commerce
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Pantau harga rata-rata komoditas UMKM, disparitas ongkos kirim antar-wilayah pengiriman, dan tren permintaan etalase Tokopedia secara berkala.
        </p>
      </section>

      {/* Quick Search & Filter */}
      <section className="liquid-glass-hero p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kategori produk pasar (contoh: Kemeja Batik, TWS Bluetooth, Kopi Arabika)..."
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
        <Link
          href="/konsultasi"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Audit Produk Anda
        </Link>
      </section>

      {/* City Benchmark Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            Distribusi Harga Berdasarkan Wilayah Toko Asal (Origin)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Update Tokopedia Live Sensor
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cityBenchmarks.map((item) => (
            <div key={item.city} className="flat-surface p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.city}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.leaderCategory}</p>
                </div>
                <span className="tabular-num text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {item.marginDelta}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">Harga Rata-Rata</span>
                <span className="tabular-num text-lg font-bold text-slate-900 dark:text-white">
                  {item.avgPrice}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Total Listing Terpantau</span>
                <span className="tabular-num font-medium">{item.count}</span>
              </div>
            </div>
          ))}

          {/* Call to action card */}
          <div className="flat-surface p-5 space-y-3 bg-gradient-to-br from-blue-600/5 to-indigo-600/10 border-blue-200 dark:border-blue-900 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                Audit Strategi Toko Anda
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                Ketahui Posisi Harga Anda di Wilayah Sendiri
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Manfaatkan diskon ongkir lokal untuk mengalahkan penjual antarpulau dengan harga setara.
              </p>
            </div>
            <Link
              href="/konsultasi"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all pt-2"
            >
              Mulai Konsultasi Gratis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
