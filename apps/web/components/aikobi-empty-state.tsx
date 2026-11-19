import React from 'react';
import Image from 'next/image';
import { TrendingUp, MessageSquareHeart, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export function AikobiEmptyState() {
  const pillars = [
    {
      title: 'Batas Harga Paling Pas',
      desc: 'Tentukan harga wajar agar toko tetap untung tanpa membuat calon pembeli kabur.',
      icon: TrendingUp,
      accent: 'emerald',
    },
    {
      title: 'Rangkuman Ulasan Pembeli',
      desc: 'Merangkum otomatis hal yang disukai pembeli dan kekurangan pesaing sejenis.',
      icon: MessageSquareHeart,
      accent: 'blue',
    },
    {
      title: 'Unggul Ongkir Sekota',
      desc: 'Cari pesaing di kota pengiriman yang sama supaya strategi ongkir lebih hemat dari toko luar pulau.',
      icon: Truck,
      accent: 'amber',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flat-surface p-8 sm:p-10 space-y-8 text-center">
      {/* KOBI Menyapa Emblem */}
      <div className="space-y-3">
        <div className="w-24 h-24 mx-auto relative">
          <Image
            src="/brand/mascot/mascot-greeting.png"
            alt="KOBI Menyapa"
            width={96}
            height={96}
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Siap Mengecek Produk Tokopedia Anda
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Tempel tautan produk Tokopedia atau klik salah satu contoh cepat di atas. AIKOBI akan langsung membaca harga, variasi ukuran, dan ulasan pembeli.
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
        <span>Hanya membaca halaman etalase publik Tokopedia tanpa membutuhkan password atau login akun</span>
      </div>
    </div>
  );
}
