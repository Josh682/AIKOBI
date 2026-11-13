import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shield, Heart, ArrowUpRight } from 'lucide-react';

export function AikobiFooter() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 backdrop-blur-xs mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-3.5 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <Image
                  src="/brand/logo-mark.png"
                  alt="AIKOBI Symbol"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain dark:hidden"
                />
                <Image
                  src="/brand/logo-mark-dark.png"
                  alt="AIKOBI Symbol"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain hidden dark:block"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  AIKOBI
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
                  Akal Imitasi Konsultan Bisnis
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Platform kecerdasan buatan pendamping strategi penetapan harga, audit ulasan pasar,
              dan keunggulan kompetitor logistik lokal khusus etalase marketplace Tokopedia untuk merchant & UMKM.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Privasi data toko terjamin • Tanpa kredensial login akun</span>
            </div>
          </div>

          {/* Column 2: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Navigasi Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/konsultasi" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Konsultasi Bisnis AI
                </Link>
              </li>
              <li>
                <Link href="/pasar" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Radar Pasar UMKM
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Tentang Platform & Misi
                </Link>
              </li>
              <li>
                <Link href="/tokens-test" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Token Sandbox
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Fitur & Metodologi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Teknologi Sensor
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Tokopedia GQL Scraper
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Sweet-Spot Quantile Regression
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Peta Sentimen Ulasan Pembeli
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Filter Ongkos Kirim Lokal
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © 2026 AIKOBI (Akal Imitasi Konsultan Bisnis). Hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Dibuat dengan <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> untuk UMKM Indonesia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
