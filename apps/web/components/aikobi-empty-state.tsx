import React from 'react';
import Image from 'next/image';
import { TrendingUp, MessageSquareHeart, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export function AikobiEmptyState() {
  const pillars = [
    {
      title: 'Zona Wajar Sweet-Spot',
      desc: 'Deteksi batas harga wajar kuantil demand agar margin toko terlindungi tanpa kehilangan pembeli.',
      icon: TrendingUp,
      accent: 'emerald',
    },
    {
      title: 'Sintesis Ulasan Pembeli',
      desc: 'Pemetaan otomatis poin kepuasan pembeli dan kelemahan operasional kompetitor sejenis.',
      icon: MessageSquareHeart,
      accent: 'blue',
    },
    {
      title: 'Keunggulan Ongkir Lokal',
      desc: 'Identifikasi kompetitor sesama kota pengiriman untuk strategi harga bersaing vs seller antarpulau.',
      icon: Truck,
      accent: 'amber',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flat-surface p-8 sm:p-10 space-y-8 text-center">
      {/* Emblem */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 p-2 flex items-center justify-center mx-auto shadow-md shadow-blue-500/10">
          <Image
            src="/brand/logo-mark.png"
            alt="AIKOBI Mark"
            width={52}
            height={52}
            className="w-full h-full object-contain dark:hidden"
          />
          <Image
            src="/brand/logo-mark-dark.png"
            alt="AIKOBI Mark"
            width={52}
            height={52}
            className="w-full h-full object-contain hidden dark:block"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Siap Mengaudit Produk Tokopedia Anda
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Tempel tautan produk Tokopedia atau klik salah satu sampel cepat di atas. AIKOBI akan mengekstrak etalase, varian, dan ulasan secara real-time.
        </p>
      </div>

      {/* 3 Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-2.5 hover:shadow-sm transition-shadow"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  p.accent === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : p.accent === 'blue'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Trust Badge */}
      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Ekstraksi data etalase publik Tokopedia tanpa membutuhkan password atau login akun</span>
      </div>
    </div>
  );
}
